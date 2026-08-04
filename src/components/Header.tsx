"use client";

import type {
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { navItems, siteConfig } from "@/lib/site";

const HOME_PATH = "/";
const HEADER_SELECTOR = ".site-header";
const MOBILE_NAVIGATION_ID = "mobile-navigation";

const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type AriaCurrentValue =
  | "page"
  | "location"
  | undefined;

type ParsedNavigationTarget = {
  pathname: string;
  hash: string;
  isExternal: boolean;
};

type SmartNavigationLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  ariaCurrent?: AriaCurrentValue;
  tabIndex?: number;
  onClick?: () => void;
  openExternalInNewTab?: boolean;
};

type OptionalWaitlistConfig = {
  enabled?: boolean;
  href?: string;
  buttonLabel?: string;
};

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === HOME_PATH) {
    return HOME_PATH;
  }

  return pathname.replace(/\/+$/, "") || HOME_PATH;
}

function normalizeHash(hash: string): string {
  return hash.replace(/^#/, "").trim();
}

function parseNavigationTarget(
  href: string,
): ParsedNavigationTarget {
  try {
    const destination = new URL(
      href,
      `${siteConfig.domain.replace(/\/+$/, "")}/`,
    );

    const siteOrigin = new URL(siteConfig.domain).origin;

    return {
      pathname: normalizePathname(destination.pathname),
      hash: normalizeHash(destination.hash),
      isExternal: destination.origin !== siteOrigin,
    };
  } catch {
    return {
      pathname: HOME_PATH,
      hash: normalizeHash(href),
      isExternal: false,
    };
  }
}

function isNativeProtocol(href: string): boolean {
  const normalizedHref = href.trim().toLowerCase();

  return (
    normalizedHref.startsWith("mailto:") ||
    normalizedHref.startsWith("tel:") ||
    normalizedHref.startsWith("sms:")
  );
}

function getAriaCurrent(
  href: string,
  pathname: string,
  activeSectionId: string,
): AriaCurrentValue {
  if (isNativeProtocol(href)) {
    return undefined;
  }

  const destination = parseNavigationTarget(href);
  const currentPathname = normalizePathname(pathname);

  if (
    destination.pathname !== currentPathname ||
    destination.isExternal
  ) {
    return undefined;
  }

  if (destination.hash) {
    return destination.hash === activeSectionId
      ? "location"
      : undefined;
  }

  return "page";
}

function getFocusableElements(
  container: HTMLElement,
): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTOR,
    ),
  ).filter((element) => {
    const styles = window.getComputedStyle(element);

    return (
      styles.visibility !== "hidden" &&
      styles.display !== "none" &&
      !element.hasAttribute("disabled")
    );
  });
}

function getWaitlistConfig(): Required<OptionalWaitlistConfig> {
  const configuration = (
    siteConfig as typeof siteConfig & {
      waitlist?: OptionalWaitlistConfig;
    }
  ).waitlist;

  const fallbackPhone =
    "phoneE164" in siteConfig &&
    typeof siteConfig.phoneE164 === "string"
      ? siteConfig.phoneE164
      : siteConfig.phone.replace(/[^\d+]/g, "");

  return {
    enabled: configuration?.enabled !== false,

    href:
      configuration?.href?.trim() ||
      `sms:${fallbackPhone}`,

    buttonLabel:
      configuration?.buttonLabel?.trim() ||
      "Request an Earlier Opening",
  };
}

function SmartNavigationLink({
  href,
  className,
  children,
  ariaLabel,
  ariaCurrent,
  tabIndex,
  onClick,
  openExternalInNewTab = false,
}: SmartNavigationLinkProps) {
  const target = parseNavigationTarget(href);

  if (isNativeProtocol(href) || target.isExternal) {
    return (
      <a
        className={className}
        href={href}
        aria-label={ariaLabel}
        aria-current={ariaCurrent}
        tabIndex={tabIndex}
        onClick={onClick}
        {...(target.isExternal && openExternalInNewTab
          ? {
              target: "_blank",
              rel: "noopener noreferrer",
            }
          : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      className={className}
      href={href}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      tabIndex={tabIndex}
      onClick={onClick}
      prefetch
    >
      {children}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();

  const menuToggleRef =
    useRef<HTMLButtonElement | null>(null);

  const mobileNavigationRef =
    useRef<HTMLElement | null>(null);

  const scrollFrameRef =
    useRef<number | null>(null);

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [activeSectionId, setActiveSectionId] =
    useState("");

  const isHomePage =
    normalizePathname(pathname) === HOME_PATH;

  const visibleNavItems = useMemo(
    () =>
      isHomePage
        ? navItems.filter(
            (item) => item.label !== "Home",
          )
        : navItems,
    [isHomePage],
  );

  const homepageSectionIds = useMemo(
    () =>
      navItems
        .map((item) =>
          parseNavigationTarget(item.href),
        )
        .filter(
          (item) =>
            item.pathname === HOME_PATH &&
            item.hash.length > 0,
        )
        .map((item) => item.hash),
    [],
  );

  const waitlist = useMemo(
    () => getWaitlistConfig(),
    [],
  );

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((current) => !current);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  /*
   * Homepage scroll spy.
   *
   * This highlights Services, Experience, Pricing, Contact, About,
   * and FAQ according to the section currently beneath the fixed
   * header.
   */
  useEffect(() => {
    if (!isHomePage) {
      setActiveSectionId("");
      return;
    }

    const updateActiveSection = () => {
      scrollFrameRef.current = null;

      const header =
        document.querySelector<HTMLElement>(
          HEADER_SELECTOR,
        );

      const headerHeight =
        header?.getBoundingClientRect().height ?? 0;

      const activationLine =
        headerHeight + Math.min(150, window.innerHeight * 0.2);

      const availableSections =
        homepageSectionIds
          .map((id) => document.getElementById(id))
          .filter(
            (
              section,
            ): section is HTMLElement =>
              section instanceof HTMLElement,
          );

      if (availableSections.length === 0) {
        setActiveSectionId("");
        return;
      }

      let currentSectionId = "";

      for (const section of availableSections) {
        const rectangle =
          section.getBoundingClientRect();

        if (rectangle.top <= activationLine) {
          currentSectionId = section.id;
        }
      }

      const isNearPageBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 12;

      if (isNearPageBottom) {
        currentSectionId =
          availableSections[
            availableSections.length - 1
          ]?.id ?? currentSectionId;
      }

      setActiveSectionId(currentSectionId);
    };

    const scheduleUpdate = () => {
      if (scrollFrameRef.current !== null) {
        return;
      }

      scrollFrameRef.current =
        window.requestAnimationFrame(
          updateActiveSection,
        );
    };

    scheduleUpdate();

    window.addEventListener(
      "scroll",
      scheduleUpdate,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      scheduleUpdate,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "hashchange",
      scheduleUpdate,
    );

    return () => {
      window.removeEventListener(
        "scroll",
        scheduleUpdate,
      );

      window.removeEventListener(
        "resize",
        scheduleUpdate,
      );

      window.removeEventListener(
        "hashchange",
        scheduleUpdate,
      );

      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(
          scrollFrameRef.current,
        );

        scrollFrameRef.current = null;
      }
    };
  }, [homepageSectionIds, isHomePage]);

  /*
   * Accessible mobile navigation:
   *
   * - locks background scrolling
   * - sends focus into the open menu
   * - traps Tab navigation inside the menu
   * - closes with Escape
   * - restores focus to the menu button
   */
  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const navigation =
      mobileNavigationRef.current;

    if (!navigation) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    const previousPaddingRight =
      document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth -
      document.documentElement.clientWidth;

    document.body.classList.add(
      "mobile-navigation-open",
    );

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight =
        `${scrollbarWidth}px`;
    }

    const focusMenu = () => {
      const focusableElements =
        getFocusableElements(navigation);

      const currentPageLink =
        navigation.querySelector<HTMLElement>(
          '[aria-current="page"], [aria-current="location"]',
        );

      const firstTarget =
        currentPageLink ??
        focusableElements[0] ??
        navigation;

      if (!navigation.hasAttribute("tabindex")) {
        navigation.tabIndex = -1;
      }

      firstTarget.focus({
        preventScroll: true,
      });
    };

    const focusFrame =
      window.requestAnimationFrame(focusMenu);

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();

        window.requestAnimationFrame(() => {
          menuToggleRef.current?.focus();
        });

        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements =
        getFocusableElements(navigation);

      if (focusableElements.length === 0) {
        event.preventDefault();
        navigation.focus();
        return;
      }

      const firstElement =
        focusableElements[0];

      const lastElement =
        focusableElements[
          focusableElements.length - 1
        ];

      const activeElement =
        document.activeElement;

      if (
        event.shiftKey &&
        activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (
        !event.shiftKey &&
        activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.cancelAnimationFrame(focusFrame);

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.classList.remove(
        "mobile-navigation-open",
      );

      document.body.style.overflow =
        previousOverflow;

      document.body.style.paddingRight =
        previousPaddingRight;
    };
  }, [closeMenu, isMenuOpen]);

  const handleMobileLinkClick = useCallback(
    (
      event?: ReactMouseEvent<
        HTMLAnchorElement
      >,
    ) => {
      if (
        event?.defaultPrevented ||
        event?.button !== 0
      ) {
        return;
      }

      closeMenu();
    },
    [closeMenu],
  );

  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
      >
        Skip to main content
      </a>

      <header
        className="site-header"
        data-menu-open={
          isMenuOpen ? "true" : "false"
        }
      >
        <BrandLogo variant="header" />

        <nav
          className="nav desktop-nav"
          aria-label="Primary navigation"
        >
          {visibleNavItems.map((item) => {
            const ariaCurrent =
              getAriaCurrent(
                item.href,
                pathname,
                activeSectionId,
              );

            return (
              <SmartNavigationLink
                key={item.href}
                href={item.href}
                ariaCurrent={ariaCurrent}
                ariaLabel={
                  ariaCurrent
                    ? `${item.label}, current location`
                    : undefined
                }
              >
                {item.label}
              </SmartNavigationLink>
            );
          })}
        </nav>

        <button
          ref={menuToggleRef}
          className="mobile-menu-toggle"
          type="button"
          aria-label={
            isMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={isMenuOpen}
          aria-controls={
            MOBILE_NAVIGATION_ID
          }
          onClick={toggleMenu}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        <SmartNavigationLink
          className="nav-cta"
          href={siteConfig.bookingUrl}
          ariaLabel="Book a massage appointment through ClinicSense"
          openExternalInNewTab
        >
          Book Now
        </SmartNavigationLink>
      </header>

      <button
        className="mobile-nav-backdrop"
        type="button"
        aria-label="Close navigation menu"
        aria-hidden="true"
        tabIndex={-1}
        data-open={
          isMenuOpen ? "true" : "false"
        }
        onClick={closeMenu}
      />

      <nav
        ref={mobileNavigationRef}
        id={MOBILE_NAVIGATION_ID}
        className="mobile-nav-panel"
        aria-label="Mobile navigation"
        aria-hidden={!isMenuOpen}
        data-open={
          isMenuOpen ? "true" : "false"
        }
      >
        {visibleNavItems.map((item) => {
          const ariaCurrent =
            getAriaCurrent(
              item.href,
              pathname,
              activeSectionId,
            );

          return (
            <SmartNavigationLink
              key={item.href}
              href={item.href}
              ariaCurrent={ariaCurrent}
              ariaLabel={
                ariaCurrent
                  ? `${item.label}, current location`
                  : undefined
              }
              tabIndex={
                isMenuOpen ? undefined : -1
              }
              onClick={handleMobileLinkClick}
            >
              {item.label}
            </SmartNavigationLink>
          );
        })}

        <SmartNavigationLink
          className="mobile-nav-book"
          href={siteConfig.bookingUrl}
          ariaLabel="Book a massage appointment through ClinicSense"
          tabIndex={
            isMenuOpen ? undefined : -1
          }
          onClick={handleMobileLinkClick}
          openExternalInNewTab
        >
          Book a Session
        </SmartNavigationLink>

        {waitlist.enabled ? (
          <SmartNavigationLink
            className="mobile-nav-book mobile-nav-waitlist"
            href={waitlist.href}
            ariaLabel={
              waitlist.buttonLabel
            }
            tabIndex={
              isMenuOpen ? undefined : -1
            }
            onClick={handleMobileLinkClick}
          >
            {waitlist.buttonLabel}
          </SmartNavigationLink>
        ) : null}
      </nav>
    </>
  );
}