import { BrandLogo } from "@/components/BrandLogo";
import { developerCredit, navItems, services, siteConfig } from "@/lib/site";

const currentYear = new Date().getFullYear();

const footerNavItems = navItems.filter((item) => item.label !== "Home");

export function Footer() {
  const hasPhone = Boolean(siteConfig.phone);
  const hasEmail = Boolean(siteConfig.email);

  return (
    <footer className="footer premium-footer" aria-labelledby="footer-heading">
      <div className="footer-orb footer-orb-one" aria-hidden="true" />
      <div className="footer-orb footer-orb-two" aria-hidden="true" />
      <div className="footer-texture" aria-hidden="true" />

      <div className="footer-shell">
        <div className="footer-cta-panel">
          <div className="footer-cta-copy">
            <p className="footer-kicker">Massage Therapy • Calgary • Okotoks</p>
            <h2 id="footer-heading">Ready when the new space comes together.</h2>
            <p>
              A calm, professional website built to support existing clients,
              the upcoming Okotoks location, and a smooth ClinicSense booking
              experience.
            </p>
          </div>

          <a
            className="footer-primary-action"
            href={siteConfig.bookingUrl}
            aria-label="Book a massage session through ClinicSense"
          >
            Book a Session
          </a>
        </div>

        <div className="footer-main">
          <div className="footer-brand-block">
            <BrandLogo variant="footer" />

            <p className="footer-brand-description">
              Personalized massage therapy with clear communication,
              professional care, and convenient online booking.
            </p>

            <div className="footer-status">
              <span aria-hidden="true" />
              Preparing for the Okotoks launch
            </div>
          </div>

          <div className="footer-column">
            <strong>Explore</strong>
            <nav aria-label="Footer site navigation">
              {footerNavItems.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="footer-column">
            <strong>Services</strong>
            <nav aria-label="Footer service navigation">
              {services.map((service) => (
                <a key={service.slug} href={`/services/${service.slug}`}>
                  {service.name}
                </a>
              ))}
            </nav>
          </div>

          <address className="footer-column footer-contact">
            <strong>Booking</strong>

            <p>{siteConfig.location}</p>
            <p>Online booking through ClinicSense</p>

            {hasPhone ? (
              <a href={`tel:${siteConfig.phone.replace(/[^\d+]/g, "")}`}>
                {siteConfig.phone}
              </a>
            ) : null}

            {hasEmail ? (
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            ) : null}

            <a
              className="footer-booking-link"
              href={siteConfig.bookingUrl}
              aria-label="Open McKenzie House Massage booking"
            >
              Open Booking
            </a>
          </address>
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
                rel="noopener noreferrer"
                aria-label={`Visit ${developerCredit.name}`}
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