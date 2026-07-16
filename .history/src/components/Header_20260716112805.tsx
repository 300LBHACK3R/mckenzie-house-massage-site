import { BrandLogo } from "@/components/BrandLogo";
import { navItems, siteConfig } from "@/lib/site";

export function Header() {
  return (
    <header className="site-header">
      <BrandLogo variant="header" />

      <nav className="nav" aria-label="Main navigation">
        {navItems.map((item) => (
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