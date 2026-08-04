import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import {
  developerCredit,
  navItems,
  services,
  siteConfig,
} from "@/lib/site";

const currentYear = new Date().getFullYear();

type SmartLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  openExternalInNewTab?: boolean;
};

type OptionalSiteFeatures = {
  phoneE164?: string;

  bookingProvider?: string;

  waitlist?: {
    enabled?: boolean;
    heading?: string;
    description?: string;
    buttonLabel?: string;
    href?: string;
  };

  directBilling?: {
    enabled?: boolean;
    summary?: string;
    disclaimer?: string;
    placeholder?: string;
    providers?: string[];
  };

  tippingPolicy?: {
    acceptsTips?: boolean;
    heading?: string;
    statement?: string;
  };
};

const extendedSiteConfig = siteConfig as typeof siteConfig &
  OptionalSiteFeatures;

const footerNavItems = navItems.filter(
  (item) => item.label !== "Home",
);

const activeServices = services.filter((service) => {
  if ("status" in service) {
    return service.status === "active";
  }

  return true;
});

const socialLinks = [
  {
    label: "Facebook",
    href: siteConfig.social.facebook,
  },
  {
    label: "Instagram",
    href: siteConfig.social.instagram,
  },
  {
    label: "Google",
    href: siteConfig.social.google,
  },
].filter(
  (
    item,
  ): item is {
    label: string;
    href: string;
  } => item.href.trim().length > 0,
);

function isInternalHref(href: string): boolean {
  return href.startsWith("/") || href.startsWith("#");
}

function isNativeProtocol(href: string): boolean {
  const normalizedHref = href.trim().toLowerCase();

  return (
    normalizedHref.startsWith("mailto:") ||
    normalizedHref.startsWith("tel:") ||
    normalizedHref.startsWith("sms:")
  );
}

function SmartLink({
  href,
  children,
  className,
  ariaLabel,
  openExternalInNewTab = false,
}: SmartLinkProps) {
  if (isInternalHref(href)) {
    return (
      <Link
        className={className}
        href={href}
        aria-label={ariaLabel}
        prefetch
      >
        {children}
      </Link>
    );
  }

  const shouldOpenNewTab =
    openExternalInNewTab && !isNativeProtocol(href);

  return (
    <a
      className={className}
      href={href}
      aria-label={ariaLabel}
      {...(shouldOpenNewTab
        ? {
            target: "_blank",
            rel: "noopener noreferrer",
            referrerPolicy: "strict-origin-when-cross-origin" as const,
          }
        : {})}
    >
      {children}
    </a>
  );
}

function getCleanPhone(): string {
  return (
    extendedSiteConfig.phoneE164?.trim() ||
    siteConfig.phone.replace(/[^\d+]/g, "")
  );
}

function getWaitlistDetails() {
  const waitlist = extendedSiteConfig.waitlist;

  return {
    enabled: waitlist?.enabled !== false,

    heading:
      waitlist?.heading?.trim() ||
      "Can’t find a time that works?",

    description:
      waitlist?.description?.trim() ||
      "Request an earlier opening and Heather can contact you if a cancellation becomes available or additional appointment times are opened.",

    buttonLabel:
      waitlist?.buttonLabel?.trim() ||
      "Request an Earlier Opening",

    href:
      waitlist?.href?.trim() ||
      `sms:${getCleanPhone()}`,
  };
}

function getDirectBillingDetails() {
  const directBilling =
    extendedSiteConfig.directBilling;

  const providers =
    directBilling?.providers?.filter(
      (provider) => provider.trim().length > 0,
    ) ?? [];

  const providerText =
    providers.length > 0
      ? `Confirmed providers include ${providers.join(", ")}.`
      : directBilling?.placeholder?.trim() ||
        "The confirmed insurance-provider list will be added before launch.";

  return {
    enabled: directBilling?.enabled !== false,

    summary:
      directBilling?.summary?.trim() ||
      "Direct billing is available for many major insurance providers.",

    disclaimer:
      directBilling?.disclaimer?.trim() ||
      "Coverage and approval depend on each client’s individual insurance plan.",

    providerText,
  };
}

function getTippingPolicy() {
  const tippingPolicy =
    extendedSiteConfig.tippingPolicy;

  return {
    heading:
      tippingPolicy?.heading?.trim() ||
      "No Tipping Expected",

    statement:
      tippingPolicy?.statement?.trim() ||
      "No tipping is expected or accepted. The listed treatment price is the full price of your appointment.",
  };
}

export function Footer() {
  const hasPhone =
    siteConfig.phone.trim().length > 0;

  const hasEmail =
    siteConfig.email.trim().length > 0;

  const cleanPhone = getCleanPhone();

  const telephoneHref = `tel:${cleanPhone}`;
  const emailHref = `mailto:${siteConfig.email}`;

  const waitlist = getWaitlistDetails();
  const directBilling = getDirectBillingDetails();
  const tippingPolicy = getTippingPolicy();

  const bookingProvider =
    extendedSiteConfig.bookingProvider?.trim() ||
    "ClinicSense";

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
                Massage Therapy · Calgary · Okotoks
              </p>

              <h2 id="site-footer-heading">
                {siteConfig.businessName}
              </h2>
            </div>

            <p>
              Personalized massage therapy with clear
              communication, client-led care, direct-billing
              support, and convenient online booking.
            </p>

            <p>
              <strong>{tippingPolicy.heading}.</strong>{" "}
              {tippingPolicy.statement}
            </p>
          </section>

          <div className="site-footer-final__navs">
            <div>
              <strong>Explore</strong>

              <nav aria-label="Footer site navigation">
                {footerNavItems.map((item) => (
                  <SmartLink
                    key={item.href}
                    href={item.href}
                  >
                    {item.label}
                  </SmartLink>
                ))}
              </nav>
            </div>

            <div>
              <strong>Services</strong>

              <nav aria-label="Footer service navigation">
                {activeServices.map((service) => (
                  <SmartLink
                    key={service.slug}
                    href={`/services/${service.slug}`}
                  >
                    {service.name}
                  </SmartLink>
                ))}
              </nav>
            </div>

            <div>
              <strong>Client Essentials</strong>

              <nav aria-label="Client information and support">
                {directBilling.enabled ? (
                  <SmartLink href="/#faq">
                    Direct Billing
                  </SmartLink>
                ) : null}

                <SmartLink href="/#pricing">
                  No-Tipping Policy
                </SmartLink>

                {waitlist.enabled ? (
                  <SmartLink
                    href={waitlist.href}
                    ariaLabel={waitlist.buttonLabel}
                  >
                    {waitlist.buttonLabel}
                  </SmartLink>
                ) : null}

                <SmartLink href="/contact">
                  Contact Heather
                </SmartLink>
              </nav>
            </div>

            {socialLinks.length > 0 ? (
              <div>
                <strong>Connect</strong>

                <nav aria-label="Social and review links">
                  {socialLinks.map((item) => (
                    <SmartLink
                      key={item.label}
                      href={item.href}
                      ariaLabel={`Visit ${siteConfig.businessName} on ${item.label}`}
                      openExternalInNewTab
                    >
                      {item.label}
                    </SmartLink>
                  ))}
                </nav>
              </div>
            ) : null}
          </div>

          <address className="site-footer-final__booking">
            <strong>Booking & Contact</strong>

            <p>{siteConfig.location}</p>

            <p>
              Online booking through {bookingProvider}
            </p>

            {hasPhone ? (
              <a
                href={telephoneHref}
                aria-label={`Call Heather at ${siteConfig.phone}`}
              >
                {siteConfig.phone}
              </a>
            ) : null}

            {hasEmail ? (
              <a
                href={emailHref}
                aria-label={`Email Heather at ${siteConfig.email}`}
              >
                {siteConfig.email}
              </a>
            ) : null}

            <SmartLink
              className="site-footer-final__button"
              href={siteConfig.bookingUrl}
              ariaLabel={`Open ${siteConfig.businessName} booking through ${bookingProvider}`}
              openExternalInNewTab
            >
              Check Availability
            </SmartLink>

            {waitlist.enabled ? (
              <SmartLink
                className="site-footer-final__button site-footer-final__button--secondary"
                href={waitlist.href}
                ariaLabel={waitlist.buttonLabel}
              >
                {waitlist.buttonLabel}
              </SmartLink>
            ) : null}
          </address>
        </div>

        <section
          className="site-footer-final__support"
          aria-labelledby="footer-support-heading"
        >
          <div>
            <span>Direct Billing</span>

            <h3 id="footer-support-heading">
              {directBilling.summary}
            </h3>

            <p>
              {directBilling.providerText}{" "}
              {directBilling.disclaimer}
            </p>
          </div>

          <div>
            <span>Flexible Availability</span>

            <h3>{waitlist.heading}</h3>

            <p>{waitlist.description}</p>
          </div>

          <div>
            <span>Simple Pricing</span>

            <h3>{tippingPolicy.heading}</h3>

            <p>{tippingPolicy.statement}</p>
          </div>
        </section>

        <div className="site-footer-final__bottom">
          <p>
            © {currentYear} {siteConfig.businessName}. All
            rights reserved.
          </p>

          <p>
            {developerCredit.label}{" "}
            {developerCredit.url ? (
              <SmartLink
                href={developerCredit.url}
                ariaLabel={`Visit ${developerCredit.name}`}
                openExternalInNewTab
              >
                {developerCredit.name}
              </SmartLink>
            ) : (
              <span>{developerCredit.name}</span>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}