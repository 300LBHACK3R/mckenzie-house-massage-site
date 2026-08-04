import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ContactPreviewSection } from "@/components/ContactPreviewSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionProvider } from "@/components/MotionProvider";
import {
  bookingSupportItems,
  faqs,
  getActiveServices,
  pricingGroups,
  pricingNotices,
  seoKeywords,
  serviceTags,
  siteConfig,
  trustSignals,
  whatToExpect,
} from "@/lib/site";

const HOME_PATH = "/";

const pageTitle =
  "Personalized Massage Therapy in Prestwick, Calgary";

const pageDescription =
  "Discover personalized massage therapy in Prestwick, Calgary with client-led pressure, professional care, direct-billing support, clear pricing, ClinicSense booking, and no tipping expected.";

type JsonLdProps = {
  data: Record<string, unknown>;
};

type SmartLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  openExternalInNewTab?: boolean;
};

function normalizeSiteOrigin(value: string): string {
  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return "https://www.mckenziehousemassage.ca";
    }

    return url.origin;
  } catch {
    return "https://www.mckenziehousemassage.ca";
  }
}

function toAbsoluteUrl(value: string): string {
  try {
    return new URL(
      value,
      `${normalizeSiteOrigin(siteConfig.domain)}/`,
    ).toString();
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

function SmartLink({
  href,
  className,
  children,
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
    openExternalInNewTab &&
    !isNativeProtocol(href);

  return (
    <a
      className={className}
      href={href}
      aria-label={ariaLabel}
      {...(shouldOpenNewTab
        ? {
            target: "_blank",
            rel: "noopener noreferrer",
            referrerPolicy:
              "strict-origin-when-cross-origin" as const,
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
        __html: JSON.stringify(data).replace(
          /</g,
          "\\u003c",
        ),
      }}
    />
  );
}

const siteOrigin = normalizeSiteOrigin(
  siteConfig.domain,
);

const canonicalUrl = `${siteOrigin}/`;

const openGraphImageUrl = toAbsoluteUrl(
  siteConfig.assets.openGraphImage,
);

const activeServices = getActiveServices();

const cleanPhone =
  siteConfig.phoneE164 ||
  siteConfig.phone.replace(/[^\d+]/g, "");

const textMessageHref = `sms:${cleanPhone}`;

const googleUrl =
  siteConfig.social.google.trim() ||
  "https://www.google.com/search?q=McKenzie+House+Massage";

const socialProfiles = [
  siteConfig.social.facebook,
  siteConfig.social.instagram,
  siteConfig.social.google,
].filter(
  (profile) =>
    profile.trim().length > 0 &&
    !profile.includes("google.com/search"),
);

const openingHoursSpecification =
  siteConfig.openingHours.flatMap((entry) => {
    if (!entry.opens || !entry.closes) {
      return [];
    }

    return [
      {
        "@type":
          "OpeningHoursSpecification",

        dayOfWeek:
          `https://schema.org/${entry.day}`,

        opens: entry.opens,
        closes: entry.closes,
      },
    ];
  });

const serviceSchemaItems =
  activeServices.map((service) => ({
    "@type": "Service",

    "@id":
      `${siteOrigin}/services/` +
      `${service.slug}#service`,

    name: service.name,
    description: service.description,

    url:
      `${siteOrigin}/services/` +
      service.slug,

    image: toAbsoluteUrl(service.image),

    provider: {
      "@id": `${siteOrigin}#business`,
    },

    areaServed: {
      "@type": "City",
      name: siteConfig.primaryCity,
      addressRegion: siteConfig.region,
      addressCountry: siteConfig.countryCode,
    },
  }));

const homePageStructuredData = {
  "@context": "https://schema.org",

  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${canonicalUrl}#webpage`,

      url: canonicalUrl,

      name:
        `${pageTitle} | ` +
        siteConfig.businessName,

      description: pageDescription,
      inLanguage: siteConfig.locale,

      isPartOf: {
        "@type": "WebSite",
        "@id": `${siteOrigin}#website`,
        url: canonicalUrl,
        name: siteConfig.businessName,
      },

      about: {
        "@id": `${siteOrigin}#business`,
      },

      primaryImageOfPage: {
        "@type": "ImageObject",
        url: openGraphImageUrl,
      },

      breadcrumb: {
        "@id": `${canonicalUrl}#breadcrumb`,
      },
    },

    {
      "@type":
        "HealthAndBeautyBusiness",

      "@id": `${siteOrigin}#business`,

      name: siteConfig.businessName,
      legalName: siteConfig.legalName,
      url: canonicalUrl,

      description:
        siteConfig.description,

      image: openGraphImageUrl,

      logo: toAbsoluteUrl(
        siteConfig.assets.logo,
      ),

      telephone: siteConfig.phone,
      email: siteConfig.email,

      currenciesAccepted:
        siteConfig.currency,

      address: {
        "@type": "PostalAddress",

        addressLocality:
          siteConfig.primaryCity,

        addressRegion:
          siteConfig.region,

        addressCountry:
          siteConfig.countryCode,
      },

      areaServed: {
        "@type": "City",

        name: siteConfig.primaryCity,

        addressRegion:
          siteConfig.region,

        addressCountry:
          siteConfig.countryCode,
      },

      founder: {
        "@type": "Person",
        name: siteConfig.legalName,
      },

      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: siteConfig.phone,
        email: siteConfig.email,
        availableLanguage: ["English"],
        areaServed: siteConfig.countryCode,
      },

      openingHoursSpecification,

      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Massage Services",

        itemListElement:
          serviceSchemaItems.map(
            (service, index) => ({
              "@type": "OfferCatalog",
              position: index + 1,
              itemListElement: [
                service,
              ],
            }),
          ),
      },

      potentialAction: [
        {
          "@type": "ReserveAction",

          name:
            "Book a massage appointment",

          target: {
            "@type":
              "EntryPoint",

            urlTemplate:
              siteConfig.bookingUrl,

            actionPlatform: [
              "https://schema.org/DesktopWebPlatform",
              "https://schema.org/MobileWebPlatform",
            ],
          },
        },

        {
          "@type":
            "CommunicateAction",

          name:
            siteConfig.waitlist.buttonLabel,

          target:
            siteConfig.waitlist.href,
        },
      ],

      ...(socialProfiles.length > 0
        ? {
            sameAs: socialProfiles,
          }
        : {}),
    },

    {
      "@type": "ItemList",
      "@id": `${canonicalUrl}#services`,

      name:
        `${siteConfig.businessName} services`,

      itemListElement:
        serviceSchemaItems.map(
          (service, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: service,
          }),
        ),
    },

    {
      "@type": "FAQPage",
      "@id": `${canonicalUrl}#faq`,

      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,

        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },

    {
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,

      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: canonicalUrl,
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,

  keywords: seoKeywords,

  alternates: {
    canonical: HOME_PATH,
  },

  openGraph: {
    title:
      `${pageTitle} | ` +
      siteConfig.businessName,

    description: pageDescription,
    url: HOME_PATH,
    siteName: siteConfig.businessName,
    locale: siteConfig.locale,
    type: "website",

    images: [
      {
        url: openGraphImageUrl,

        alt:
          siteConfig.assets
            .openGraphImageAlt,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      `${pageTitle} | ` +
      siteConfig.businessName,

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

  category: "Health and wellness",

  other: {
    "geo.region": "CA-AB",
    "geo.placename":
      "Prestwick, Calgary",
  },
};

export default function Home() {
  return (
    <>
      <JsonLd
        data={homePageStructuredData}
      />

      <MotionProvider />
      <Header />

      <main id="main-content">
        <section
          id="home"
          className="organic-hero"
          aria-labelledby="home-heading"
        >
          <div
            className="hero-media"
            aria-hidden="true"
          >
            {siteConfig.assets.heroVideo ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={
                  siteConfig.assets
                    .heroVideoPoster
                }
                disablePictureInPicture
              >
                <source
                  src={
                    siteConfig.assets
                      .heroVideo
                  }
                  type="video/mp4"
                />
              </video>
            ) : (
              <>
                <Image
                  className="hero-media-image"
                  src={
                    siteConfig.assets
                      .heroImage
                  }
                  alt=""
                  fill
                  priority
                  quality={88}
                  sizes="100vw"
                />

                <div className="hero-media-placeholder" />
              </>
            )}

            <div className="hero-wash" />
            <div className="botanical-pattern" />

            <div className="ambient-orb orb-one" />
            <div className="ambient-orb orb-two" />
          </div>

          <div className="hero-inner">
            <p className="hero-pill reveal-up">
              <span aria-hidden="true" />

              Massage therapy · Prestwick,
              Calgary · Future Okotoks growth
              planned
            </p>

            <h1
              id="home-heading"
              className="reveal-up delay-1"
            >
              Listen. Restore.
              <br />
              Rebalance.
            </h1>

            <p className="hero-copy reveal-up delay-2">
              A calm, client-led massage
              experience shaped around pressure
              preference, comfort,
              communication, and what your body
              needs that day.
            </p>

            <div className="hero-actions reveal-up delay-3">
              <SmartLink
                className="button primary"
                href={siteConfig.bookingUrl}
                ariaLabel="Open McKenzie House Massage booking through ClinicSense"
                openExternalInNewTab
              >
                Book a Session
              </SmartLink>

              <SmartLink
                className="button secondary"
                href="/#services"
              >
                Explore Services
              </SmartLink>
            </div>

            <div
              className="hero-tags reveal-up delay-4"
              aria-label="Practice highlights"
            >
              {serviceTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <div className="hero-stat-row reveal-up delay-5">
              <div>
                <strong>Client-led</strong>

                <span>
                  Pressure, pace, positioning,
                  and focus are adjusted around
                  you.
                </span>
              </div>

              <div>
                <strong>
                  Direct billing
                </strong>

                <span>
                  Available for many major
                  providers, subject to each
                  client’s plan.
                </span>
              </div>

              <div>
                <strong>Simple pricing</strong>

                <span>
                  No tipping is expected or
                  accepted.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="section services-section scroll-reveal"
          aria-labelledby="services-heading"
          data-reveal-stagger="85"
        >
          <div
            className="section-heading"
            data-reveal-item
          >
            <p className="eyebrow">
              Services
            </p>

            <h2 id="services-heading">
              Massage designed around your
              body, comfort, and goals.
            </h2>

            <p>
              Every appointment begins with
              listening. Heather adjusts
              pressure, positioning, pace, and
              focus areas so the treatment
              remains personal, comfortable,
              and genuinely useful.
            </p>
          </div>

          <div className="service-grid">
            {activeServices.length > 0 ? (
              activeServices.map(
                (service, index) => (
                  <Link
                    className="service-card service-card-link"
                    href={`/services/${service.slug}`}
                    key={service.slug}
                    aria-label={`View details for ${service.name}`}
                    data-reveal-item
                    prefetch
                  >
                    <div className="service-image">
                      {service.image ? (
                        <Image
                          className="service-card-image"
                          src={service.image}
                          alt={service.imageAlt}
                          fill
                          quality={84}
                          sizes="
                            (max-width: 680px) 100vw,
                            (max-width: 1080px) 50vw,
                            25vw
                          "
                        />
                      ) : (
                        <div
                          className="hero-media-placeholder"
                          aria-hidden="true"
                        />
                      )}

                      <span aria-hidden="true">
                        {String(index + 1).padStart(
                          2,
                          "0",
                        )}
                      </span>
                    </div>

                    <div className="service-content">
                      <p className="mini-eyebrow">
                        View treatment
                      </p>

                      <h3>{service.name}</h3>

                      <p>
                        {service.description}
                      </p>

                      <div
                        className="chip-row"
                        aria-label={`Best suited for ${service.name}`}
                      >
                        {service.bestFor.map(
                          (item) => (
                            <span key={item}>
                              {item}
                            </span>
                          ),
                        )}
                      </div>

                      <small>
                        {service.pressure}
                      </small>

                      <span className="service-link-text">
                        Explore service
                        <span aria-hidden="true">
                          {" "}
                          →
                        </span>
                      </span>
                    </div>
                  </Link>
                ),
              )
            ) : (
              <article
                className="service-card"
                data-reveal-item
              >
                <div className="service-content">
                  <p className="mini-eyebrow">
                    Services
                  </p>

                  <h3>
                    Final service details are
                    being prepared.
                  </h3>

                  <p>
                    Heather’s confirmed service
                    menu will appear here before
                    launch.
                  </p>
                </div>
              </article>
            )}
          </div>
        </section>

        <section
          id="experience"
          className="section expect-section scroll-reveal"
          aria-labelledby="experience-heading"
          data-reveal-stagger="90"
        >
          <div
            className="section-heading centered"
            data-reveal-item
          >
            <p className="eyebrow">
              The Experience
            </p>

            <h2 id="experience-heading">
              Built around communication,
              consent, and comfort.
            </h2>

            <p>
              A clear look at how Heather
              listens, protects hands-on time,
              adapts pressure, and shapes each
              appointment around the client.
            </p>
          </div>

          <div className="expect-grid">
            {whatToExpect.map(
              (item, index) => (
                <article
                  className="expect-card sheet-card"
                  key={item.title}
                  tabIndex={0}
                  aria-label={`${item.title}. ${item.text}`}
                  data-reveal-item
                >
                  <div
                    className="expect-sheet"
                    aria-hidden="true"
                  >
                    <h3>{item.title}</h3>

                    <span className="sheet-hint">
                      Reveal details
                    </span>
                  </div>

                  <div className="expect-reveal">
                    <span aria-hidden="true">
                      {String(index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ),
            )}
          </div>
        </section>

        <section
          id="pricing"
          className="section pricing-menu-luxury scroll-reveal"
          aria-labelledby="pricing-heading"
          data-reveal-stagger="80"
        >
          <div
            className="pricing-menu-luxury__intro"
            data-reveal-item
          >
            <p className="eyebrow">
              Pricing
            </p>

            <h2 id="pricing-heading">
              Clear rates, simple durations,
              and no guessing.
            </h2>

            <p>
              Choose the treatment and
              appointment length that fit best,
              then continue into Heather’s live
              ClinicSense booking schedule.
            </p>
          </div>

          <div className="pricing-menu-luxury__shell">
            <aside
              className="pricing-menu-luxury__feature"
              data-reveal-item
            >
              <span>Booking clarity</span>

              <h3>
                The listed treatment price is
                the full service price.
              </h3>

              <p>
                Heather keeps pricing
                straightforward. Treatment is
                customized around pressure,
                comfort, positioning, and goals
                without adding a tipping
                expectation.
              </p>

              <div className="pricing-menu-luxury__meta">
                {pricingNotices.map(
                  (notice) => (
                    <div key={notice.id}>
                      <small>
                        {notice.title}
                      </small>

                      <strong>
                        {notice.text}
                      </strong>
                    </div>
                  ),
                )}
              </div>
            </aside>

            <div className="pricing-menu-luxury__cards">
              {pricingGroups.length > 0 ? (
                pricingGroups.map((group) => (
                  <article
                    className="pricing-menu-card"
                    key={group.name}
                    data-reveal-item
                  >
                    <header>
                      <span>Service</span>

                      <h3>
                        {group.serviceSlug ? (
                          <Link
                            href={`/services/${group.serviceSlug}`}
                            prefetch
                          >
                            {group.name}
                          </Link>
                        ) : (
                          group.name
                        )}
                      </h3>

                      {group.note ? (
                        <p>{group.note}</p>
                      ) : null}
                    </header>

                    <div className="pricing-menu-card__rows">
                      {group.prices.map(
                        (item) => (
                          <div
                            className="pricing-menu-card__row"
                            key={
                              group.name +
                              item.duration
                            }
                          >
                            <strong>
                              {item.duration}
                            </strong>

                            <span>
                              {item.price}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <article
                  className="pricing-menu-card"
                  data-reveal-item
                >
                  <header>
                    <span>Pricing</span>

                    <h3>
                      Final pricing is being
                      confirmed.
                    </h3>

                    <p>
                      Heather’s approved rates
                      will appear here before
                      launch.
                    </p>
                  </header>
                </article>
              )}
            </div>
          </div>
        </section>

        {/*
         * PREMIUM UPGRADE 1:
         * Client trust and review discovery.
         */}
        <section
          className="section reviews-story-panel scroll-reveal"
          aria-labelledby="client-trust-heading"
          data-reveal-stagger="90"
        >
          <div className="reviews-story-panel__card">
            <div data-reveal-item>
              <p className="eyebrow">
                Client Trust
              </p>

              <h2 id="client-trust-heading">
                Confidence begins before the
                appointment.
              </h2>

              <p>
                Clear communication, visible
                policies, and consent-based
                client feedback help new
                visitors understand what to
                expect before they book.
              </p>

              <div className="reviews-consent-note__actions">
                <Link
                  className="button primary"
                  href="/reviews"
                  prefetch
                >
                  View Client Reviews
                </Link>

                <Link
                  className="button secondary"
                  href="/contact"
                  prefetch
                >
                  Ask Heather a Question
                </Link>
              </div>
            </div>

            <div
              className="reviews-story-panel__list"
              aria-label="Client trust highlights"
            >
              {trustSignals.map((signal) => (
                <article
                  key={signal.title}
                  data-reveal-item
                >
                  <span>{signal.label}</span>

                  <strong>
                    {signal.title}
                  </strong>

                  <p>{signal.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/*
         * PREMIUM UPGRADE 2:
         * Client essentials and conversion support.
         */}
        <section
          className="section reviews-story-panel scroll-reveal"
          aria-labelledby="client-essentials-heading"
          data-reveal-stagger="95"
        >
          <div className="reviews-story-panel__card">
            <div data-reveal-item>
              <p className="eyebrow">
                Before You Book
              </p>

              <h2 id="client-essentials-heading">
                Important answers without the
                runaround.
              </h2>

              <p>
                Direct billing, clear pricing,
                regular online booking, and
                earlier-opening requests are
                presented in one place so
                clients know exactly what to do.
              </p>

              <div className="reviews-consent-note__actions">
                <SmartLink
                  className="button primary"
                  href={siteConfig.bookingUrl}
                  ariaLabel="Check live appointment availability through ClinicSense"
                  openExternalInNewTab
                >
                  Check Availability
                </SmartLink>

                <Link
                  className="button secondary"
                  href="/contact"
                  prefetch
                >
                  Contact Heather
                </Link>
              </div>
            </div>

            <div
              className="reviews-story-panel__list"
              aria-label="Booking and client information"
            >
              {bookingSupportItems.map(
                (item) => (
                  <article
                    key={item.id}
                    data-reveal-item
                  >
                    <span>
                      {item.eyebrow}
                    </span>

                    <strong>
                      {item.title}
                    </strong>

                    <p>{item.text}</p>

                    {item.href &&
                    item.buttonLabel ? (
                      <SmartLink
                        href={item.href}
                        ariaLabel={
                          item.buttonLabel
                        }
                      >
                        {item.buttonLabel}
                        <span aria-hidden="true">
                          {" "}
                          →
                        </span>
                      </SmartLink>
                    ) : null}
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        <ContactPreviewSection />

        <section
          id="about"
          className="section meet-heather-luxury scroll-reveal"
          aria-labelledby="about-heading"
          data-reveal-stagger="100"
        >
          <div
            className="meet-heather-luxury__media"
            data-reveal-item
          >
            <div className="meet-heather-luxury__image-frame">
              <Image
                src={
                  siteConfig.assets
                    .detailImage
                }
                alt={
                  siteConfig.assets
                    .detailImageAlt
                }
                width={980}
                height={720}
                quality={88}
                sizes="
                  (max-width: 980px) 100vw,
                  48vw
                "
              />
            </div>

            <div className="meet-heather-luxury__badge">
              <span>Client-led care</span>

              <strong>
                {siteConfig.legalName}
              </strong>
            </div>
          </div>

          <div
            className="meet-heather-luxury__copy"
            data-reveal-item
          >
            <p className="eyebrow">
              <strong>Meet Heather</strong>
            </p>

            <h2 id="about-heading">
              Rooted in experience, guided by
              listening, and shaped around real
              client needs.
            </h2>

            <p className="meet-heather-luxury__lead">
              Heather’s work is built around
              one simple thing: helping people
              feel heard, cared for, and more
              at ease in their bodies. She
              takes time to understand what
              brings each client in, then
              adjusts pressure, pace,
              positioning, and focus areas
              without making the appointment
              feel rushed.
            </p>

            <div className="meet-heather-luxury__quote">
              <p>
                Heather’s goal is to help every
                client feel heard, comfortable,
                and genuinely cared for from
                the first message to the end of
                the appointment.
              </p>
            </div>

            <div className="meet-heather-luxury__details">
              <div>
                <span>Approach</span>

                <strong>
                  Calm, Personalized Care
                </strong>
              </div>

              <div>
                <span>Focus</span>

                <strong>
                  Comfort, Pressure,
                  Communication
                </strong>
              </div>

              <div>
                <span>Booking</span>

                <strong>
                  Live ClinicSense Schedule
                </strong>
              </div>

              <div>
                <span>Location</span>

                <strong>
                  Prestwick, Calgary
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section
          id="booking"
          className="section booking-luxury scroll-reveal"
          aria-labelledby="booking-heading"
          data-reveal-stagger="90"
        >
          <div className="booking-luxury__card">
            <div
              className="booking-luxury__copy"
              data-reveal-item
            >
              <p className="eyebrow">
                Online Booking
              </p>

              <h2 id="booking-heading">
                Book through ClinicSense.
              </h2>

              <p>
                View Heather’s live availability,
                select your service and
                appointment length, and complete
                your booking securely through
                ClinicSense.
              </p>

              <div className="booking-luxury__actions">
                <SmartLink
                  className="button primary"
                  href={siteConfig.bookingUrl}
                  ariaLabel="Open Heather’s live ClinicSense booking schedule"
                  openExternalInNewTab
                >
                  Open Booking
                </SmartLink>

                {siteConfig.waitlist.enabled ? (
                  <SmartLink
                    className="button secondary"
                    href={
                      siteConfig.waitlist.href
                    }
                    ariaLabel={
                      siteConfig.waitlist
                        .buttonLabel
                    }
                  >
                    {
                      siteConfig.waitlist
                        .buttonLabel
                    }
                  </SmartLink>
                ) : (
                  <a
                    className="button secondary"
                    href={textMessageHref}
                    aria-label={`Text Heather at ${siteConfig.phone}`}
                  >
                    Text Heather
                  </a>
                )}
              </div>
            </div>

            <div
              className="booking-luxury__details"
              aria-label="Booking details"
            >
              <article data-reveal-item>
                <span>Location</span>

                <strong>
                  {siteConfig.location}
                </strong>

                <p>
                  {siteConfig.addressNote}
                </p>
              </article>

              <article data-reveal-item>
                <span>Regular Hours</span>

                <strong>
                  Tuesday–Friday
                </strong>

                <p>
                  10:00 AM–4:30 PM
                </p>
              </article>

              <article data-reveal-item>
                <span>Booking System</span>

                <strong>
                  ClinicSense
                </strong>

                <p>
                  Availability, intake, and
                  scheduling remain managed
                  through Heather’s secure
                  booking platform.
                </p>
              </article>

              <article data-reveal-item>
                <span>Simple Pricing</span>

                <strong>
                  {
                    siteConfig.tippingPolicy
                      .heading
                  }
                </strong>

                <p>
                  {
                    siteConfig.tippingPolicy
                      .statement
                  }
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="section faq-luxury scroll-reveal"
          aria-labelledby="faq-heading"
          data-reveal-stagger="65"
        >
          <div className="faq-luxury__shell">
            <aside
              className="faq-luxury__intro"
              data-reveal-item
            >
              <p className="eyebrow">
                Questions
              </p>

              <h2 id="faq-heading">
                Helpful answers before you
                book.
              </h2>

              <p>
                Clear answers help clients feel
                more comfortable choosing a
                service, discussing pressure,
                understanding direct billing,
                or arranging an appointment
                around their schedule.
              </p>

              <div className="faq-luxury__support">
                <span>Still unsure?</span>

                <p>
                  Text Heather directly about
                  service fit, flexible times,
                  pregnancy or postpartum care,
                  youth appointments, direct
                  billing, or anything else you
                  would like clarified.
                </p>

                <div className="faq-luxury__support-actions">
                  <a
                    className="button primary"
                    href={textMessageHref}
                    aria-label={`Text Heather at ${siteConfig.phone}`}
                  >
                    Text Heather
                  </a>

                  <a
                    className="button secondary faq-luxury__google-link"
                    href={googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="strict-origin-when-cross-origin"
                    aria-label="Visit McKenzie House Massage on Google"
                  >
                    Visit Google
                  </a>
                </div>
              </div>
            </aside>

            <div
              className="faq-luxury__list"
              aria-label="Frequently asked questions"
            >
              {faqs.map((item) => (
                <details
                  className="faq-luxury__item"
                  key={item.question}
                  data-reveal-item
                >
                  <summary>
                    <span>
                      {item.question}
                    </span>

                    <strong aria-hidden="true">
                      +
                    </strong>
                  </summary>

                  <div>
                    <p>{item.answer}</p>
                  </div>
                </details>
              ))}
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