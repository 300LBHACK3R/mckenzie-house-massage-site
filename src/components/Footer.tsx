import { BrandLogo } from "@/components/BrandLogo";
import { developerCredit, navItems, services, siteConfig } from "@/lib/site";

const currentYear = new Date().getFullYear();

const footerNavItems = navItems.filter((item) => item.label !== "Home");

export function Footer() {
  const hasPhone = Boolean(siteConfig.phone);
  const hasEmail = Boolean(siteConfig.email);

  return (
    <footer
      className="site-footer-final"
      aria-labelledby="site-footer-heading"
    >
      <div className="site-footer-final__inner">
        <div className="site-footer-final__main">
          <section
            className="site-footer-final__brand"
            aria-labelledby="site-footer-heading"
          >
            <BrandLogo variant="footer" />

            <div>
              <p className="site-footer-final__kicker">
                Massage Therapy • Calgary • Okotoks
              </p>
              <h2 id="site-footer-heading">McKenzie House Massage</h2>
            </div>

            <p>
              Personalized massage therapy with clear communication,
              professional care, and convenient online booking.
            </p>
          </section>

          <div className="site-footer-final__navs">
            <div>
              <strong>Explore</strong>
              <nav aria-label="Footer site navigation">
                {footerNavItems.map((item) => (
                  <a key={item.href} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            <div>
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

          <address className="site-footer-final__booking">
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
              className="site-footer-final__button"
              href={siteConfig.bookingUrl}
              aria-label="Open McKenzie House Massage booking"
            >
              Open Booking
            </a>
          </address>
        </div>

        <div className="site-footer-final__bottom">
          <p>
            © {currentYear} {siteConfig.businessName}. All rights reserved.
          </p>

          <p>
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
