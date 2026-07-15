import { navItems, siteConfig } from "@/lib/site";

export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Go to homepage">
        <span className="brand-mark">HK</span>
        <span className="brand-text">
          <strong>{siteConfig.businessName}</strong>
          <small>Massage & Wellness</small>
        </span>
      </a>

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