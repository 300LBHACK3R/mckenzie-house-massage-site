"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { navItems, siteConfig } from "@/lib/site";

function getPathFromHref(href: string) {
  if (href.startsWith("#")) return "/";

  if (href.startsWith("/")) {
    const [path] = href.split("#");
    return path || "/";
  }

  try {
    return new URL(href).pathname || "/";
  } catch {
    return href;
  }
}

function isCurrentPage(href: string, pathname: string) {
  const hrefPath = getPathFromHref(href);

  if (href.includes("#")) return false;

  return hrefPath === pathname;
}

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isHomePage = pathname === "/";

  const visibleNavItems = isHomePage
    ? navItems.filter((item) => item.label !== "Home")
    : navItems;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <BrandLogo variant="header" />

        <nav className="nav desktop-nav" aria-label="Main navigation">
          {visibleNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={
                isCurrentPage(item.href, pathname) ? "page" : undefined
              }
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

        <a
          className="nav-cta"
          href={siteConfig.bookingUrl}
          aria-label="Book a massage appointment through ClinicSense"
        >
          Book Now
        </a>
      </header>

      <button
        className="mobile-nav-backdrop"
        type="button"
        aria-label="Close navigation menu"
        data-open={isMenuOpen ? "true" : "false"}
        onClick={() => setIsMenuOpen(false)}
      />

      <nav
        id="mobile-navigation"
        className="mobile-nav-panel"
        aria-label="Mobile navigation"
        data-open={isMenuOpen ? "true" : "false"}
      >
        {visibleNavItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-current={
              isCurrentPage(item.href, pathname) ? "page" : undefined
            }
            onClick={() => setIsMenuOpen(false)}
          >
            {item.label}
          </a>
        ))}

        <a
          className="mobile-nav-book"
          href={siteConfig.bookingUrl}
          onClick={() => setIsMenuOpen(false)}
        >
          Book a Session
        </a>
      </nav>
    </>
  );
}