"use client";

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
  const isHomePage = pathname === "/";

  const visibleNavItems = isHomePage
    ? navItems.filter((item) => item.label !== "Home")
    : navItems;

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <BrandLogo variant="header" />

        <nav className="nav" aria-label="Main navigation">
          {visibleNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={isCurrentPage(item.href, pathname) ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          className="nav-cta"
          href={siteConfig.bookingUrl}
          aria-label="Book a massage appointment through ClinicSense"
        >
          Book Now
        </a>
      </header>
    </>
  );
}