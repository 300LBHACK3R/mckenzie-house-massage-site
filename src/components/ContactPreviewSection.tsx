import Link from "next/link";
import { siteConfig } from "@/lib/site";

type OptionalSiteFeatures = {
  phoneE164?: string;

  directBilling?: {
    enabled?: boolean;
    heading?: string;
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

  waitlist?: {
    enabled?: boolean;
    heading?: string;
    description?: string;
    buttonLabel?: string;
    href?: string;
  };
};

const extendedSiteConfig = siteConfig as typeof siteConfig &
  OptionalSiteFeatures;

function getCleanPhone(): string {
  return (
    extendedSiteConfig.phoneE164?.trim() ||
    siteConfig.phone.replace(/[^\d+]/g, "")
  );
}

function getDirectBillingDetails() {
  const directBilling = extendedSiteConfig.directBilling;

  const providers =
    directBilling?.providers?.filter(
      (provider) => provider.trim().length > 0,
    ) ?? [];

  const providerText =
    providers.length > 0
      ? `Confirmed providers include ${providers.join(", ")}.`
      : directBilling?.placeholder?.trim() ||
        "The confirmed provider list is being finalized. Contact Heather if you would like to confirm your insurance plan before booking.";

  return {
    enabled: directBilling?.enabled !== false,

    heading:
      directBilling?.heading?.trim() ||
      "Direct Billing Available",

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
  const tippingPolicy = extendedSiteConfig.tippingPolicy;

  return {
    heading:
      tippingPolicy?.heading?.trim() ||
      "No Tipping Expected",

    statement:
      tippingPolicy?.statement?.trim() ||
      "No tipping is expected or accepted. The listed treatment price is the full price of your appointment.",
  };
}

function getWaitlistDetails(cleanPhone: string) {
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
      `sms:${cleanPhone}`,
  };
}

export function ContactPreviewSection() {
  const cleanPhone = getCleanPhone();

  const telephoneHref = `tel:${cleanPhone}`;
  const textMessageHref = `sms:${cleanPhone}`;

  const emailSubject = encodeURIComponent(
    `Question for ${siteConfig.businessName}`,
  );

  const emailHref =
    `mailto:${siteConfig.email}` +
    `?subject=${emailSubject}`;

  const directBilling = getDirectBillingDetails();
  const tippingPolicy = getTippingPolicy();
  const waitlist = getWaitlistDetails(cleanPhone);

  return (
    <section
      id="contact"
      className="section contact-luxury scroll-reveal"
      aria-labelledby="contact-heading"
      data-reveal-threshold="0.12"
      data-reveal-stagger="75"
    >
      <div className="contact-luxury__shell">
        <div
          className="contact-luxury__copy"
          data-reveal-item
        >
          <p className="eyebrow">
            Contact Heather
          </p>

          <h2 id="contact-heading">
            Questions before booking? Reach out directly.
          </h2>

          <p>
            Ask about service fit, direct billing, appointment
            lengths, pressure preferences, pregnancy or postpartum
            care, youth appointments, or anything else that would
            help you feel comfortable before booking.
          </p>

          <div className="contact-luxury__actions">
            <Link
              className="button primary"
              href="/contact"
              prefetch
            >
              Contact Heather
            </Link>

            <a
              className="button secondary"
              href={textMessageHref}
              aria-label={`Text Heather at ${siteConfig.phone}`}
            >
              Text Heather
            </a>

            <a
              className="button secondary"
              href={emailHref}
              aria-label={`Email Heather at ${siteConfig.email}`}
            >
              Email
            </a>
          </div>
        </div>

        <div
          className="contact-luxury__panel"
          aria-label="Contact details and client information"
        >
          <article data-reveal-item>
            <span>Phone</span>

            <a
              href={telephoneHref}
              aria-label={`Call Heather at ${siteConfig.phone}`}
            >
              {siteConfig.phone}
            </a>

            <p>
              Texting is usually the easiest way to ask a quick
              question.
            </p>
          </article>

          <article data-reveal-item>
            <span>Email</span>

            <a
              href={emailHref}
              aria-label={`Email Heather at ${siteConfig.email}`}
            >
              {siteConfig.email}
            </a>

            <p>
              Best for longer questions or appointment details.
            </p>
          </article>

          <article data-reveal-item>
            <span>Location</span>

            <strong>Prestwick, Calgary</strong>

            <p>
              Near Prestwick Pond. Exact appointment details are
              shared privately through the booking process.
            </p>
          </article>

          <article data-reveal-item>
            <span>Hours</span>

            <strong>Tuesday to Friday</strong>

            <p>
              10:00 AM–4:30 PM. Flexible by text when available.
            </p>
          </article>

          {directBilling.enabled ? (
            <article data-reveal-item>
              <span>Direct Billing</span>

              <strong>{directBilling.heading}</strong>

              <p>
                {directBilling.summary}{" "}
                {directBilling.providerText}{" "}
                {directBilling.disclaimer}
              </p>
            </article>
          ) : null}

          <article data-reveal-item>
            <span>Simple Pricing</span>

            <strong>{tippingPolicy.heading}</strong>

            <p>{tippingPolicy.statement}</p>
          </article>

          {waitlist.enabled ? (
            <article data-reveal-item>
              <span>Earlier Openings</span>

              <strong>{waitlist.heading}</strong>

              <p>{waitlist.description}</p>

              <a
                href={waitlist.href}
                aria-label={waitlist.buttonLabel}
              >
                {waitlist.buttonLabel}
              </a>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}