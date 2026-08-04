"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const HEADER_SELECTOR = ".site-header";
const SCROLL_OFFSET_PX = 16;
const MAX_SCROLL_ATTEMPTS = 90;

const DOWNLOADABLE_FILE_PATTERN =
  /\.(?:avif|csv|doc|docx|gif|jpe?g|json|mov|mp3|mp4|pdf|png|ppt|pptx|svg|txt|wav|webm|webp|xls|xlsx|zip)$/i;

type ScrollOptions = {
  focusTarget: boolean;
  minimumReadyFrames: number;
};

function isModifiedClick(event: MouseEvent): boolean {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function getAnchorFromEvent(
  event: Event,
): HTMLAnchorElement | null {
  const target = event.target;

  if (target instanceof Element) {
    return target.closest<HTMLAnchorElement>("a[href]");
  }

  if (target instanceof Node) {
    return target.parentElement?.closest<HTMLAnchorElement>(
      "a[href]",
    ) ?? null;
  }

  return null;
}

function isSupportedWebProtocol(url: URL): boolean {
  return url.protocol === "http:" || url.protocol === "https:";
}

function hasExternalRelationship(
  anchor: HTMLAnchorElement,
): boolean {
  return anchor.rel
    .split(/\s+/)
    .some((value) => value.toLowerCase() === "external");
}

function shouldUseNativeNavigation(
  anchor: HTMLAnchorElement,
  rawHref: string,
): boolean {
  const normalizedHref = rawHref.trim().toLowerCase();

  if (!normalizedHref) {
    return true;
  }

  if (
    normalizedHref.startsWith("mailto:") ||
    normalizedHref.startsWith("tel:") ||
    normalizedHref.startsWith("sms:") ||
    normalizedHref.startsWith("javascript:") ||
    normalizedHref.startsWith("data:") ||
    normalizedHref.startsWith("blob:")
  ) {
    return true;
  }

  if (
    anchor.hasAttribute("download") ||
    anchor.hasAttribute("data-native-navigation") ||
    anchor.hasAttribute("data-no-persistent-navigation")
  ) {
    return true;
  }

  if (
    anchor.getAttribute("aria-disabled") === "true" ||
    anchor.closest('[contenteditable="true"]')
  ) {
    return true;
  }

  if (
    anchor.target &&
    anchor.target.toLowerCase() !== "_self"
  ) {
    return true;
  }

  if (hasExternalRelationship(anchor)) {
    return true;
  }

  return false;
}

function isDownloadableResource(url: URL): boolean {
  return DOWNLOADABLE_FILE_PATTERN.test(url.pathname);
}

function getDestinationUrl(
  anchor: HTMLAnchorElement,
): URL | null {
  try {
    const destination = new URL(
      anchor.href,
      window.location.href,
    );

    if (!isSupportedWebProtocol(destination)) {
      return null;
    }

    return destination;
  } catch {
    return null;
  }
}

function getRelativeHref(url: URL): string {
  return `${url.pathname}${url.search}${url.hash}`;
}

function isSameDocument(
  currentUrl: URL,
  destinationUrl: URL,
): boolean {
  return (
    destinationUrl.pathname === currentUrl.pathname &&
    destinationUrl.search === currentUrl.search
  );
}

function prefersReducedMotion(): boolean {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
}

function decodeHash(hash: string): string {
  const rawId = hash.replace(/^#/, "");

  if (!rawId) {
    return "";
  }

  try {
    return decodeURIComponent(rawId);
  } catch {
    return rawId;
  }
}

function findHashTarget(
  hash: string,
): HTMLElement | null {
  const decodedId = decodeHash(hash);

  if (!decodedId) {
    return null;
  }

  const idTarget = document.getElementById(decodedId);

  if (idTarget) {
    return idTarget;
  }

  const namedTargets = document.getElementsByName(decodedId);

  for (const target of namedTargets) {
    if (target instanceof HTMLElement) {
      return target;
    }
  }

  return null;
}

function getHeaderOffset(): number {
  const header =
    document.querySelector<HTMLElement>(HEADER_SELECTOR);

  if (!header) {
    return SCROLL_OFFSET_PX;
  }

  return (
    Math.max(0, header.getBoundingClientRect().height) +
    SCROLL_OFFSET_PX
  );
}

function focusNavigationTarget(
  target: HTMLElement,
): void {
  const isNaturallyFocusable = target.matches(
    [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(","),
  );

  const hadTabIndex = target.hasAttribute("tabindex");

  if (!isNaturallyFocusable && !hadTabIndex) {
    target.setAttribute("tabindex", "-1");
    target.dataset.navigationFocusTarget = "true";
  }

  try {
    target.focus({
      preventScroll: true,
    });
  } catch {
    target.focus();
  }

  if (
    target.dataset.navigationFocusTarget === "true"
  ) {
    target.addEventListener(
      "blur",
      () => {
        if (
          target.dataset.navigationFocusTarget === "true"
        ) {
          delete target.dataset.navigationFocusTarget;
          target.removeAttribute("tabindex");
        }
      },
      {
        once: true,
      },
    );
  }
}

function scrollToPageTop(): void {
  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion()
      ? "auto"
      : "smooth",
  });
}

function scrollToElement(
  target: HTMLElement,
  focusTarget: boolean,
): void {
  const targetTop =
    target.getBoundingClientRect().top +
    window.scrollY -
    getHeaderOffset();

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: prefersReducedMotion()
      ? "auto"
      : "smooth",
  });

  if (focusTarget) {
    window.requestAnimationFrame(() => {
      focusNavigationTarget(target);
    });
  }
}

export function PersistentSiteNavigation() {
  const router = useRouter();

  const scheduledFrameRef = useRef<number | null>(
    null,
  );

  const prefetchedRoutesRef = useRef<Set<string>>(
    new Set(),
  );

  const cancelScheduledScroll = useCallback(() => {
    if (scheduledFrameRef.current === null) {
      return;
    }

    window.cancelAnimationFrame(
      scheduledFrameRef.current,
    );

    scheduledFrameRef.current = null;
  }, []);

  const scheduleScroll = useCallback(
    (
      destination: URL,
      {
        focusTarget,
        minimumReadyFrames,
      }: ScrollOptions,
    ) => {
      cancelScheduledScroll();

      let attempts = 0;
      let matchingRouteFrames = 0;

      const attemptScroll = () => {
        attempts += 1;

        const currentUrl = new URL(
          window.location.href,
        );

        const routeMatches =
          currentUrl.pathname ===
            destination.pathname &&
          currentUrl.search === destination.search;

        if (routeMatches) {
          matchingRouteFrames += 1;
        } else {
          matchingRouteFrames = 0;
        }

        if (
          routeMatches &&
          matchingRouteFrames >= minimumReadyFrames
        ) {
          if (!destination.hash) {
            scrollToPageTop();
            scheduledFrameRef.current = null;
            return;
          }

          const target = findHashTarget(
            destination.hash,
          );

          if (target) {
            scrollToElement(target, focusTarget);
            scheduledFrameRef.current = null;
            return;
          }
        }

        if (attempts >= MAX_SCROLL_ATTEMPTS) {
          scheduledFrameRef.current = null;
          return;
        }

        scheduledFrameRef.current =
          window.requestAnimationFrame(
            attemptScroll,
          );
      };

      scheduledFrameRef.current =
        window.requestAnimationFrame(
          attemptScroll,
        );
    },
    [cancelScheduledScroll],
  );

  const prefetchInternalRoute = useCallback(
    (event: Event) => {
      const anchor = getAnchorFromEvent(event);

      if (!anchor) {
        return;
      }

      const rawHref = anchor.getAttribute("href");

      if (
        !rawHref ||
        shouldUseNativeNavigation(
          anchor,
          rawHref,
        )
      ) {
        return;
      }

      const destination =
        getDestinationUrl(anchor);

      if (
        !destination ||
        destination.origin !==
          window.location.origin ||
        isDownloadableResource(destination)
      ) {
        return;
      }

      const currentUrl = new URL(
        window.location.href,
      );

      if (
        isSameDocument(
          currentUrl,
          destination,
        )
      ) {
        return;
      }

      const routeToPrefetch =
        `${destination.pathname}${destination.search}`;

      if (
        prefetchedRoutesRef.current.has(
          routeToPrefetch,
        )
      ) {
        return;
      }

      prefetchedRoutesRef.current.add(
        routeToPrefetch,
      );

      router.prefetch(routeToPrefetch);
    },
    [router],
  );

  useEffect(() => {
    const handleInternalNavigation = (
      event: MouseEvent,
    ) => {
      if (
        event.defaultPrevented ||
        isModifiedClick(event)
      ) {
        return;
      }

      const anchor = getAnchorFromEvent(event);

      if (!anchor) {
        return;
      }

      const rawHref =
        anchor.getAttribute("href");

      if (
        !rawHref ||
        shouldUseNativeNavigation(
          anchor,
          rawHref,
        )
      ) {
        return;
      }

      const destination =
        getDestinationUrl(anchor);

      if (
        !destination ||
        destination.origin !==
          window.location.origin ||
        isDownloadableResource(destination)
      ) {
        return;
      }

      const currentUrl = new URL(
        window.location.href,
      );

      const sameDocument = isSameDocument(
        currentUrl,
        destination,
      );

      if (sameDocument) {
        event.preventDefault();

        const nextHref =
          getRelativeHref(destination);

        const currentHref =
          getRelativeHref(currentUrl);

        if (nextHref !== currentHref) {
          window.history.pushState(
            window.history.state,
            "",
            nextHref,
          );
        }

        scheduleScroll(destination, {
          focusTarget: Boolean(
            destination.hash,
          ),
          minimumReadyFrames: 1,
        });

        return;
      }

      event.preventDefault();

      scheduleScroll(destination, {
        focusTarget: Boolean(
          destination.hash,
        ),
        /*
         * Waiting for multiple matching frames prevents the old
         * page’s similarly named element from being selected before
         * the new route has rendered.
         */
        minimumReadyFrames: 2,
      });

      router.push(getRelativeHref(destination), {
        scroll: false,
      });
    };

    const handleHistoryNavigation = () => {
      const destination = new URL(
        window.location.href,
      );

      scheduleScroll(destination, {
        focusTarget: Boolean(
          destination.hash,
        ),
        minimumReadyFrames: 2,
      });
    };

    const handleHashChange = () => {
      const destination = new URL(
        window.location.href,
      );

      scheduleScroll(destination, {
        focusTarget: Boolean(
          destination.hash,
        ),
        minimumReadyFrames: 1,
      });
    };

    document.addEventListener(
      "click",
      handleInternalNavigation,
    );

    document.addEventListener(
      "pointerover",
      prefetchInternalRoute,
      {
        passive: true,
      },
    );

    document.addEventListener(
      "focusin",
      prefetchInternalRoute,
    );

    window.addEventListener(
      "popstate",
      handleHistoryNavigation,
    );

    window.addEventListener(
      "hashchange",
      handleHashChange,
    );

    /*
     * Correctly positions an initial page load containing a hash
     * after the app has hydrated and the fixed header is measurable.
     */
    if (window.location.hash) {
      scheduleScroll(
        new URL(window.location.href),
        {
          focusTarget: false,
          minimumReadyFrames: 2,
        },
      );
    }

    return () => {
      cancelScheduledScroll();

      document.removeEventListener(
        "click",
        handleInternalNavigation,
      );

      document.removeEventListener(
        "pointerover",
        prefetchInternalRoute,
      );

      document.removeEventListener(
        "focusin",
        prefetchInternalRoute,
      );

      window.removeEventListener(
        "popstate",
        handleHistoryNavigation,
      );

      window.removeEventListener(
        "hashchange",
        handleHashChange,
      );
    };
  }, [
    router,
    scheduleScroll,
    cancelScheduledScroll,
    prefetchInternalRoute,
  ]);

  return null;
}