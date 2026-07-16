import { developerCredit, navItems, services, siteConfig } from "@/lib/site";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="footer premium-footer">
      <div className="footer-orb footer-orb-one" aria-hidden="true" />
      <div className="footer-orb footer-orb-two" aria-hidden="true" />
      <div className="footer-texture" aria-hidden="true" />

      <div className="footer-shell">
        <div className="footer-cta-panel">
          <div>
            <p className="footer-kicker">Massage therapy · Calgary · Okotoks</p>
            <h2>Ready when the new space comes together.</h2>
            <p>
              A soft, professional web presence built to support Heather’s
              current clients, future Okotoks launch, and online booking flow.
            </p>
          </div>

          <a className="footer-primary-action" href={siteConfig.bookingUrl}>
            Book a Session
          </a>
        </div>

        <div className="footer-main">
          <div className="footer-brand-block">
            <a
              className="footer-brand"
              href="/#home"
              aria-label="Go to homepage"
            >
              <span className="footer-brand-mark">HK</span>
              <span>
                <strong>{siteConfig.businessName}</strong>
                <small>{siteConfig.currentName}</small>
              </span>
            </a>

            <p>{siteConfig.description}</p>

            <div className="footer-status">
              <span />
              Preparing for the Okotoks launch
            </div>
          </div>

          <div className="footer-column">
            <strong>Explore</strong>
            <nav aria-label="Footer navigation">
              {navItems.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="footer-column">
            <strong>Services</strong>
            <nav aria-label="Footer services navigation">
              {services.map((service) => (
                <a key={service.slug} href={`/services/${service.slug}`}>
                  {service.name}
                </a>
              ))}
            </nav>
          </div>

          <div className="footer-column footer-contact">
            <strong>Booking</strong>
            <p>{siteConfig.location}</p>
            <p>Online booking through ClinicSense</p>

            <a className="footer-booking-link" href={siteConfig.bookingUrl}>
              Open Booking
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {currentYear} {siteConfig.businessName}. All rights reserved.
          </p>

          <p className="developer-signature">
            {developerCredit.label}{" "}
            {developerCredit.url ? (
              <a
                href={developerCredit.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${developerCredit.label} ${developerCredit.name}`}
              >
                {developerCredit.name}
              </a>
            ) : (
              <span>{developerCredit.name}</span>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}