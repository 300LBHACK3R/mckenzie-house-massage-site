import { BrandLogo } from "@/components/BrandLogo";
import { developerCredit, navItems, services, siteConfig } from "@/lib/site";

const currentYear = new Date().getFullYear();

const footerNavItems = navItems.filter((item) => item.label !== "Home");

export function Footer() {
  const hasPhone = Boolean(siteConfig.phone);
  const hasEmail = Boolean(siteConfig.email);

  return (
    <footer className="footer premium-footer clean-footer" aria-labelledby="footer-heading">
      <div className="footer-orb footer-orb-one" aria-hidden="true" />
      <div className="footer-orb footer-orb-two" aria-hidden="true" />
      <div className="footer-texture" aria-hidden="true" />

      <div className="footer-shell clean-footer-shell">
        <div className="clean-footer-main">
          <section className="clean-footer-brand" aria-labelledby="footer-heading">
            <BrandLogo variant="footer" />

            <div>
              <p className="footer-kicker">Massage Therapy • Calgary • Okotoks</p>
              <h2 id="footer-heading">McKenzie House Massage</h2>
            </div>

            <p className="clean-footer-description">
              Personalized massage therapy with clear communication,
              professional care, and convenient online booking.
            </p>

            <div className="clean-footer-status">
              <span aria-hidden="true" />
              Preparing for the Okotoks launch
            </div>
          </section>

          <div className="clean-footer-navs">
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
          </div>

          <address className="clean-footer-booking">
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

        <div className="footer-bottom clean-footer-bottom">
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
