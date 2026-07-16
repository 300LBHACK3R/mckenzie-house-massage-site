"use client";

import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { navItems, siteConfig } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const visibleNavItems = isHomePage
    ? navItems.filter((item) => item.label !== "Home")
    : navItems;

  return (
    <header className="site-header">
      <BrandLogo variant="header" />

      <nav className="nav" aria-label="Main navigation">
        {visibleNavItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <a className="nav-cta" href={siteConfig.bookingUrl}>
        Book Now
      </a>
    </header>
  );
}