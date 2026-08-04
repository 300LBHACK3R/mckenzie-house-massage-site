import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionProvider } from "@/components/MotionProvider";
import { siteConfig } from "@/lib/site";

const CONTACT_PATH = "/contact";
const DEFAULT_SITE_ORIGIN = "https://www.mckenziehousemassage.ca";

const pageTitle = "Contact Heather";

const pageDescription =
  "Contact Heather at McKenzie House Massage in Prestwick, Calgary for service guidance, direct-billing questions, pressure preferences, appointment details, earlier-opening requests, and help before booking.";

type ContactIconType = "phone" | "email" | "location" | "clock";

type JsonLdProps = {
  data: Record<string, unknown>;
};

type ContactIconProps = {
  type: ContactIconType;
};

type SmartLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  openExternalInNewTab?: boolean;
};

type ClientEssential = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  href?: string;
  buttonLabel?: string;
  openExternalInNewTab?: boolean;
};

function normalizeSiteOrigin(value: string): string {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return DEFAULT_SITE_ORIGIN;
    }

    return url.origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

function toAbsoluteUrl(value: string, siteOrigin: string): string {
  try {
    return new URL(value, `${siteOrigin}/`).toString();
  } catch {
    return value;
  }
}

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

function isSafeHttpHref(href: string): boolean {
  try {
    const url = new URL(href);

    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function normalizeHref(href: string): string {
  const candidate = href.trim();

  if (
    isInternalHref(candidate) ||
    isNativeProtocol(candidate) ||
    isSafeHttpHref(candidate)
  ) {
    return candidate;
  }

  return "/";
}

function getDirectBillingText(): string {
  const providers = siteConfig.directBilling.providers.filter(
    (provider) => provider.trim().length > 0,
  );

  const providerStatement =
    providers.length > 0
      ? `Confirmed providers include ${providers.join(", ")}.`
      : siteConfig.directBilling.placeholder ||
        "The confirmed insurance-provider list is being finalized. Contact Heather to ask whether your provider may be supported.";

  return [
    siteConfig.directBilling.summary,
    providerStatement,
    siteConfig.directBilling.disclaimer,
  ]
    .filter(Boolean)
    .join(" ");
}

function SmartLink({
  href,
  className,
  children,
  ariaLabel,
  openExternalInNewTab = false,
}: SmartLinkProps) {
  const normalizedHref = normalizeHref(href);

  if (isInternalHref(normalizedHref)) {
    return (
      <Link
        className={className}
        href={normalizedHref}
        aria-label={ariaLabel}
        prefetch
      >
        {children}
      </Link>
    );
  }

  const shouldOpenNewTab =
    openExternalInNewTab && isSafeHttpHref(normalizedHref);

  return (
    <a
      className={className}
      href={normalizedHref}
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

function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
          .replace(/</g, "\\u003c")
          .replace(/\u2028/g, "\\u2028")
          .replace(/\u2029/g, "\\u2029"),
      }}
    />
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="contact-page-arrow"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M7 17 17 7M17 7H8m9 0v9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M7.4 3.8 5.8 5.4c-.9.9-.9 2.4-.2 4 1.4 3.2 5.8 7.6 9 9 .9.4 1.8.7 2.6.7.8 0 1.4-.2 1.9-.7l1.5-1.5c.6-.6.5-1.6-.2-2.1l-3.3-2.4c-.6-.4-1.4-.4-1.9.1l-1.1 1.1c-1.6-.8-3.4-2.6-4.2-4.2L11 8.3c.5-.5.6-1.3.1-1.9L9 3.9c-.4-.6-1.1-.6-1.6-.1Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
    >
      <rect
        x="3.5"
        y="5"
        width="17"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="m5 7 7 5 7-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="10"
        r="2.4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M12 7.5V12l3 2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ContactIcon({ type }: ContactIconProps) {
  switch (type) {
    case "phone":
      return <PhoneIcon />;

    case "email":
      return <EmailIcon />;

    case "location":
      return <LocationIcon />;

    case "clock":
      return <ClockIcon />;

    default: {
      const exhaustiveCheck: never = type;
      return exhaustiveCheck;
    }
  }
}

const siteOrigin = normalizeSiteOrigin(siteConfig.domain);
const canonicalUrl = `${siteOrigin}${CONTACT_PATH}`;

const openGraphImageUrl = toAbsoluteUrl(
  siteConfig.assets.openGraphImage,
  siteOrigin,
);

const cleanPhone =
  siteConfig.phoneE164 ||
  siteConfig.phone.replace(/[^\d+]/g, "");

const telephoneHref = `tel:${cleanPhone}`;
const textMessageHref = `sms:${cleanPhone}`;

const emailSubject = encodeURIComponent(
  `Question for ${siteConfig.businessName}`,
);

const emailHref = `mailto:${siteConfig.email}?subject=${emailSubject}`;

const waitlistHref =
  siteConfig.waitlist.href?.trim() || textMessageHref;

const directBillingText = getDirectBillingText();

const clientEssentials: readonly ClientEssential[] = [
  {
    id: "direct-billing",
    eyebrow: "Direct Billing",
    title: siteConfig.directBilling.heading,
    text: directBillingText,
    href: "#contact-form",
    buttonLabel: "Ask About Direct Billing",
  },
  {
    id: "earlier-opening",
    eyebrow: "Earlier Openings",
    title: siteConfig.waitlist.heading,
    text: siteConfig.waitlist.description,
    href: waitlistHref,
    buttonLabel: siteConfig.waitlist.buttonLabel,
  },
  {
    id: "no-tipping",
    eyebrow: "Simple Pricing",
    title: siteConfig.tippingPolicy.heading,
    text: siteConfig.tippingPolicy.statement,
  },
  {
    id: "online-booking",
    eyebrow: "ClinicSense",
    title: "View Heather’s live availability",
    text:
      "Choose a service and appointment length, review available times, and complete your booking through Heather’s ClinicSense booking platform.",
    href: siteConfig.bookingUrl,
    buttonLabel: "Check Availability",
    openExternalInNewTab: true,
  },
];

const contactActions: Record<string, unknown>[] = [
  {
    "@type": "CommunicateAction",
    name: "Text Heather",
    target: textMessageHref,
  },
  {
    "@type": "CommunicateAction",
    name: "Email Heather",
    target: emailHref,
  },
  {
    "@type": "ReserveAction",
    name: "Book a massage appointment",
    target: {
      "@type": "EntryPoint",
      urlTemplate: siteConfig.bookingUrl,
      actionPlatform: [
        "https://schema.org/DesktopWebPlatform",
        "https://schema.org/MobileWebPlatform",
      ],
    },
  },
];

if (siteConfig.waitlist.enabled) {
  contactActions.push({
    "@type": "CommunicateAction",
    name: siteConfig.waitlist.buttonLabel,
    target: waitlistHref,
  });
}

const structuredData = {
  "@context": "https://schema.org",

  "@graph": [
    {
      "@type": "ContactPage",
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: `${pageTitle} | ${siteConfig.businessName}`,
      description: pageDescription,
      inLanguage: siteConfig.locale,

      isPartOf: {
        "@id": `${siteOrigin}/#website`,
      },

      about: {
        "@id": `${siteOrigin}/#business`,
      },

      mainEntity: {
        "@id": `${canonicalUrl}#contact-point`,
      },

      breadcrumb: {
        "@id": `${canonicalUrl}#breadcrumb`,
      },

      potentialAction: contactActions,
    },

    {
      "@type": "ContactPoint",
      "@id": `${canonicalUrl}#contact-point`,
      contactType: "customer service",
      name: `Contact ${siteConfig.businessName}`,
      telephone: cleanPhone || siteConfig.phone,
      email: siteConfig.email,
      availableLanguage: ["English"],

      areaServed: {
        "@type": "City",
        name: siteConfig.primaryCity,
        addressRegion: siteConfig.region,
        addressCountry: siteConfig.countryCode,
      },
    },

    {
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,

      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteOrigin}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Contact",
          item: canonicalUrl,
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,

  keywords: [
    "contact McKenzie House Massage",
    "contact Heather Knorr",
    "massage questions Calgary",
    "massage direct billing Calgary",
    "massage appointment Prestwick",
    "ClinicSense massage booking",
  ],

  alternates: {
    canonical: CONTACT_PATH,
  },

  openGraph: {
    title: `${pageTitle} | ${siteConfig.businessName}`,
    description: pageDescription,
    url: CONTACT_PATH,
    siteName: siteConfig.businessName,
    type: "website",
    locale: siteConfig.locale.replace("-", "_"),

    images: [
      {
        url: openGraphImageUrl,
        alt:
          siteConfig.assets.openGraphImageAlt ||
          `Contact ${siteConfig.businessName}`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${pageTitle} | ${siteConfig.businessName}`,
    description: pageDescription,
    images: [openGraphImageUrl],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  other: {
    "geo.region": "CA-AB",
    "geo.placename": "Prestwick, Calgary",
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={structuredData} />

      <MotionProvider />
      <Header />

      <main
        id="main-content"
        className="contact-page premium-contact-page"
      >
        <section
          className="contact-page-hero premium-contact-hero"
          aria-labelledby="contact-page-heading"
        >
          <div
            className="premium-contact-hero__grid"
            aria-hidden="true"
          />

          <div
            className="premium-contact-hero__orb premium-contact-hero__orb--one"
            aria-hidden="true"
          />

          <div
            className="premium-contact-hero__orb premium-contact-hero__orb--two"
            aria-hidden="true"
          />

          <div
            className="premium-contact-hero__mark"
            aria-hidden="true"
          />

          <div className="contact-page-hero__inner premium-contact-hero__inner">
            <div className="contact-page-hero__copy premium-contact-hero__copy">
              <div className="premium-contact-hero__eyebrow hero-contact-reveal hero-contact-delay-1">
                <span aria-hidden="true" />
                Contact Heather
              </div>

              <h1
                id="contact-page-heading"
                className="hero-contact-reveal hero-contact-delay-2"
              >
                A calm first step
                <span> before your appointment.</span>
              </h1>

              <p className="hero-contact-reveal hero-contact-delay-3">
                Ask about service fit, direct billing, pressure
                preferences, pregnancy or postpartum care, youth
                appointments, earlier openings, or anything else that
                would help you feel comfortable before booking.
              </p>

              <div className="premium-contact-hero__actions hero-contact-reveal hero-contact-delay-4">
                <SmartLink
                  className="button primary premium-contact-button"
                  href="#contact-form"
                >
                  Send a Message
                  <ArrowIcon />
                </SmartLink>

                <a
                  className="button secondary premium-contact-button"
                  href={textMessageHref}
                  aria-label={`Text Heather at ${siteConfig.phone}`}
                >
                  Text Heather
                  <ArrowIcon />
                </a>

                {siteConfig.waitlist.enabled ? (
                  <SmartLink
                    className="button secondary premium-contact-button"
                    href={waitlistHref}
                    ariaLabel={siteConfig.waitlist.buttonLabel}
                  >
                    {siteConfig.waitlist.buttonLabel}
                    <ArrowIcon />
                  </SmartLink>
                ) : null}
              </div>

              <div
                className="premium-contact-hero__proof hero-contact-reveal hero-contact-delay-5"
                aria-label="What to expect when contacting Heather"
              >
                <div>
                  <span aria-hidden="true">01</span>

                  <p>
                    <strong>Direct response</strong>
                    Heather replies personally.
                  </p>
                </div>

                <div>
                  <span aria-hidden="true">02</span>

                  <p>
                    <strong>Clear guidance</strong>
                    Get help choosing a service or appointment length.
                  </p>
                </div>

                <div>
                  <span aria-hidden="true">03</span>

                  <p>
                    <strong>No booking created</strong>
                    The message form does not reserve an appointment.
                  </p>
                </div>
              </div>
            </div>

            <aside className="contact-page-hero__card premium-contact-card hero-contact-reveal hero-contact-delay-4">
              <div
                className="premium-contact-card__glow"
                aria-hidden="true"
              />

              <span className="premium-contact-card__label">
                Best first step
              </span>

              <h2>Text Heather directly.</h2>

              <p>
                Texting is usually the easiest way to ask a quick
                question, confirm appointment details, or request an
                earlier opening.
              </p>

              <a
                className="premium-contact-card__link"
                href={textMessageHref}
                aria-label={`Text Heather at ${siteConfig.phone}`}
              >
                {siteConfig.phone}
                <ArrowIcon />
              </a>

              <div className="premium-contact-card__availability">
                <span
                  className="premium-contact-card__pulse"
                  aria-hidden="true"
                />

                <span>Tuesday–Friday · 10:00 AM–4:30 PM</span>
              </div>
            </aside>
          </div>
        </section>

        <section
          className="section contact-page-details premium-contact-details scroll-reveal"
          aria-label="McKenzie House Massage contact details"
          data-reveal-stagger="85"
        >
          <article data-reveal-item>
            <div
              className="premium-contact-detail__icon"
              aria-hidden="true"
            >
              <ContactIcon type="phone" />
            </div>

            <span>Phone</span>

            <a
              href={telephoneHref}
              aria-label={`Call Heather at ${siteConfig.phone}`}
            >
              {siteConfig.phone}
            </a>

            <p>Texting is usually best for quick scheduling questions.</p>
          </article>

          <article data-reveal-item>
            <div
              className="premium-contact-detail__icon"
              aria-hidden="true"
            >
              <ContactIcon type="email" />
            </div>

            <span>Email</span>

            <a
              href={emailHref}
              aria-label={`Email Heather at ${siteConfig.email}`}
            >
              {siteConfig.email}
            </a>

            <p>Best for longer questions or detailed appointment requests.</p>
          </article>

          <article data-reveal-item>
            <div
              className="premium-contact-detail__icon"
              aria-hidden="true"
            >
              <ContactIcon type="location" />
            </div>

            <span>Location</span>
            <strong>Prestwick, Calgary</strong>

            <p>
              Near Prestwick Pond. Exact appointment details are shared
              privately through the booking process.
            </p>
          </article>

          <article data-reveal-item>
            <div
              className="premium-contact-detail__icon"
              aria-hidden="true"
            >
              <ContactIcon type="clock" />
            </div>

            <span>Regular Hours</span>
            <strong>Tuesday to Friday</strong>

            <p>
              10:00 AM–4:30 PM. Monday, Saturday, or Sunday may
              occasionally be possible by text.
            </p>
          </article>
        </section>

        <section
          className="section reviews-story-panel scroll-reveal"
          aria-labelledby="contact-essentials-heading"
          data-reveal-stagger="90"
        >
          <div className="reviews-story-panel__card">
            <div data-reveal-item>
              <p className="eyebrow">Client Essentials</p>

              <h2 id="contact-essentials-heading">
                Choose the next step that fits your question.
              </h2>

              <p>
                Direct billing, pricing, online availability, and
                earlier-opening requests are explained before you send a
                message.
              </p>

              <div className="reviews-consent-note__actions">
                <SmartLink
                  className="button primary"
                  href="#contact-form"
                >
                  Send Heather a Message
                </SmartLink>

                <SmartLink
                  className="button secondary"
                  href={siteConfig.bookingUrl}
                  ariaLabel="Open Heather’s live ClinicSense booking schedule"
                  openExternalInNewTab
                >
                  Check Availability
                </SmartLink>
              </div>
            </div>

            <div
              className="reviews-story-panel__list"
              aria-label="Important booking and client information"
            >
              {clientEssentials.map((item) => (
                <article
                  key={item.id}
                  data-reveal-item
                >
                  <span>{item.eyebrow}</span>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>

                  {item.href && item.buttonLabel ? (
                    <SmartLink
                      className="service-link-text"
                      href={item.href}
                      ariaLabel={item.buttonLabel}
                      openExternalInNewTab={item.openExternalInNewTab}
                    >
                      {item.buttonLabel}
                      <span aria-hidden="true"> →</span>
                    </SmartLink>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        <ContactForm />

        <section
          className="section contact-page-note premium-contact-note scroll-reveal"
          aria-labelledby="contact-note-heading"
        >
          <div
            className="contact-page-note__inner premium-contact-note__inner"
            data-reveal-item
          >
            <div
              className="premium-contact-note__mark"
              aria-hidden="true"
            />

            <p className="eyebrow">What Happens Next</p>

            <h2 id="contact-note-heading">
              Your message goes directly to Heather.
            </h2>

            <p>
              Heather can answer general service questions, help with
              appointment length, discuss pressure or comfort
              preferences, and provide general direct-billing guidance.
              Submitting this form does not create or hold an
              appointment.
            </p>

            <p>
              Avoid including insurance policy numbers, member IDs,
              payment information, or detailed private medical records.
              ClinicSense should be used to complete an actual booking
              and any required intake information.
            </p>

            <div className="contact-page-note__actions">
              <a
                className="button primary premium-contact-button"
                href={textMessageHref}
                aria-label={`Text Heather at ${siteConfig.phone}`}
              >
                Text Heather
                <ArrowIcon />
              </a>

              <a
                className="button secondary premium-contact-button"
                href={emailHref}
                aria-label={`Email Heather at ${siteConfig.email}`}
              >
                Email Heather
                <ArrowIcon />
              </a>

              <SmartLink
                className="button secondary premium-contact-button"
                href={siteConfig.bookingUrl}
                ariaLabel="Open Heather’s live ClinicSense booking schedule"
                openExternalInNewTab
              >
                Book Through ClinicSense
                <ArrowIcon />
              </SmartLink>
            </div>
          </div>
        </section>
      </main>

      <SmartLink
        className="mobile-sticky-book"
        href={siteConfig.bookingUrl}
        ariaLabel="Open Heather’s live ClinicSense booking schedule"
        openExternalInNewTab
      >
        Book Now
      </SmartLink>

      <Footer />
    </>
  );
}