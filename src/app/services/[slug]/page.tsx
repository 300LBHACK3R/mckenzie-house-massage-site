import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionProvider } from "@/components/MotionProvider";
import {
  getServiceBySlug,
  pricingGroups,
  services,
  siteConfig,
} from "@/lib/site";

type ServicePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type Service = (typeof services)[number];

type PricingGroup = (typeof pricingGroups)[number];

type JsonLdProps = {
  data: Record<string, unknown>;
};

type ServiceOfferRow = {
  duration: string;
  price: string;
};

const DEFAULT_SITE_ORIGIN =
  "https://www.mckenziehousemassage.ca";

function normalizeSiteOrigin(
  value: string,
): string {
  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return DEFAULT_SITE_ORIGIN;
    }

    return url.origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

function toAbsoluteUrl(
  value: string,
  siteOrigin: string,
): string {
  try {
    return new URL(
      value,
      `${siteOrigin}/`,
    ).toString();
  } catch {
    return value;
  }
}

function isActiveService(
  service: Service,
): boolean {
  if (!("status" in service)) {
    return true;
  }

  return service.status === "active";
}

function getServicePricingGroup(
  service: Service,
): PricingGroup | undefined {
  return pricingGroups.find((group) => {
    const groupWithSlug =
      group as PricingGroup & {
        serviceSlug?: string;
      };

    return (
      groupWithSlug.serviceSlug ===
        service.slug ||
      group.name === service.name
    );
  });
}

function getRelatedServices(
  currentService: Service,
): Service[] {
  const currentBestFor = new Set(
    currentService.bestFor.map((item) =>
      item.trim().toLowerCase(),
    ),
  );

  return services
    .filter(isActiveService)
    .filter(
      (service) =>
        service.slug !==
        currentService.slug,
    )
    .map((service) => {
      const sharedBestFor =
        service.bestFor.reduce(
          (total, item) =>
            currentBestFor.has(
              item.trim().toLowerCase(),
            )
              ? total + 1
              : total,
          0,
        );

      const samePressure =
        service.pressure ===
        currentService.pressure
          ? 1
          : 0;

      return {
        service,
        score:
          sharedBestFor * 3 +
          samePressure,
      };
    })
    .sort(
      (first, second) =>
        second.score - first.score ||
        first.service.name.localeCompare(
          second.service.name,
          "en-CA",
        ),
    )
    .slice(0, 3)
    .map((item) => item.service);
}

function parseNumericPrice(
  value: string,
): number | undefined {
  const normalizedValue =
    value.replace(/,/g, "");

  const match = normalizedValue.match(
    /(?:CAD\s*|\$)?(\d+(?:\.\d{1,2})?)/i,
  );

  if (!match) {
    return undefined;
  }

  const parsedValue = Number(match[1]);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : undefined;
}

function createOfferRows(
  service: Service,
  pricingGroup:
    | PricingGroup
    | undefined,
): ServiceOfferRow[] {
  if (
    pricingGroup &&
    pricingGroup.prices.length > 0
  ) {
    return pricingGroup.prices.map(
      (item) => ({
        duration: item.duration,
        price: item.price,
      }),
    );
  }

  return [
    {
      duration: service.duration,
      price: service.price,
    },
  ];
}

function createServiceOffers(
  service: Service,
  pricingGroup:
    | PricingGroup
    | undefined,
  canonicalUrl: string,
) {
  return createOfferRows(
    service,
    pricingGroup,
  ).map((item) => {
    const numericPrice =
      parseNumericPrice(item.price);

    return {
      "@type": "Offer",

      name:
        `${service.name} — ` +
        item.duration,

      url: canonicalUrl,

      priceCurrency:
        siteConfig.currency,

      description:
        `${item.duration}: ` +
        item.price,

      ...(numericPrice !== undefined
        ? {
            price: numericPrice,

            priceSpecification: {
              "@type":
                "UnitPriceSpecification",

              price: numericPrice,

              priceCurrency:
                siteConfig.currency,

              valueAddedTaxIncluded:
                false,

              unitText: item.duration,
            },
          }
        : {}),
    };
  });
}

function getDirectBillingText(): string {
  const providers =
    siteConfig.directBilling.providers.filter(
      (provider) =>
        provider.trim().length > 0,
    );

  if (providers.length > 0) {
    return [
      siteConfig.directBilling.summary,
      `Confirmed providers include ${providers.join(
        ", ",
      )}.`,
      siteConfig.directBilling.disclaimer,
    ].join(" ");
  }

  return [
    siteConfig.directBilling.summary,

    siteConfig.directBilling.placeholder ||
      "The confirmed provider list is being finalized. Contact Heather to ask about your insurance provider.",

    siteConfig.directBilling.disclaimer,
  ].join(" ");
}

function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
          .replace(/</g, "\\u003c")
          .replace(
            /\u2028/g,
            "\\u2028",
          )
          .replace(
            /\u2029/g,
            "\\u2029",
          ),
      }}
    />
  );
}

function BookingLink({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <a
      className={className}
      href={siteConfig.bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      referrerPolicy="strict-origin-when-cross-origin"
      aria-label={`${String(
        children,
      )} through ClinicSense — opens in a new tab`}
    >
      {children}
    </a>
  );
}

const siteOrigin =
  normalizeSiteOrigin(
    siteConfig.domain,
  );

const cleanPhone =
  siteConfig.phoneE164 ||
  siteConfig.phone.replace(
    /[^\d+]/g,
    "",
  );

const textMessageHref =
  `sms:${cleanPhone}`;

const directBillingText =
  getDirectBillingText();

export function generateStaticParams() {
  return services
    .filter(isActiveService)
    .map((service) => ({
      slug: service.slug,
    }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;

  const service =
    getServiceBySlug(slug);

  if (
    !service ||
    !isActiveService(service)
  ) {
    return {
      title: "Service Not Found",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const pagePath =
    `/services/${service.slug}`;

  const pageTitle =
    `${service.name} in Prestwick, Calgary`;

  const description = [
    service.description,

    "View treatment details, current pricing, direct-billing information, and live ClinicSense availability with McKenzie House Massage.",
  ].join(" ");

  const image =
    service.image ||
    siteConfig.assets.openGraphImage;

  const imageAlt =
    service.imageAlt ||
    `${service.name} at ${siteConfig.businessName}`;

  return {
    title: pageTitle,
    description,

    keywords: [
      service.name,

      `${service.name} Calgary`,

      `${service.name} Prestwick`,

      "massage therapy Calgary",

      "McKenzie House Massage",

      "Heather Knorr massage",

      "ClinicSense booking",
    ],

    alternates: {
      canonical: pagePath,
    },

    openGraph: {
      title:
        `${pageTitle} | ` +
        siteConfig.businessName,

      description,
      url: pagePath,
      siteName:
        siteConfig.businessName,
      locale: siteConfig.locale,
      type: "website",

      images: [
        {
          url: toAbsoluteUrl(
            image,
            siteOrigin,
          ),

          alt: imageAlt,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title:
        `${pageTitle} | ` +
        siteConfig.businessName,

      description,

      images: [
        toAbsoluteUrl(
          image,
          siteOrigin,
        ),
      ],
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
      "geo.placename":
        "Prestwick, Calgary",
    },
  };
}

export default async function ServicePage({
  params,
}: ServicePageProps) {
  const { slug } = await params;

  const service =
    getServiceBySlug(slug);

  if (
    !service ||
    !isActiveService(service)
  ) {
    notFound();
  }

  const pagePath =
    `/services/${service.slug}`;

  const canonicalUrl =
    `${siteOrigin}${pagePath}`;

  const pricingGroup =
    getServicePricingGroup(service);

  const relatedServices =
    getRelatedServices(service);

  const serviceOffers =
    createServiceOffers(
      service,
      pricingGroup,
      canonicalUrl,
    );

  const serviceImage =
    service.image ||
    siteConfig.assets.detailImage;

  const serviceImageAlt =
    service.imageAlt ||
    `${service.name} treatment at ${siteConfig.businessName}`;

  const serviceStructuredData = {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "WebPage",

        "@id":
          `${canonicalUrl}#webpage`,

        url: canonicalUrl,

        name:
          `${service.name} | ` +
          siteConfig.businessName,

        description:
          service.description,

        inLanguage:
          siteConfig.locale,

        about: {
          "@id":
            `${canonicalUrl}#service`,
        },

        isPartOf: {
          "@id":
            `${siteOrigin}/#website`,
        },

        primaryImageOfPage: {
          "@type": "ImageObject",

          url: toAbsoluteUrl(
            serviceImage,
            siteOrigin,
          ),
        },

        breadcrumb: {
          "@id":
            `${canonicalUrl}#breadcrumb`,
        },
      },

      {
        "@type": "Service",

        "@id":
          `${canonicalUrl}#service`,

        name: service.name,

        description:
          service.description,

        url: canonicalUrl,

        image: toAbsoluteUrl(
          serviceImage,
          siteOrigin,
        ),

        provider: {
          "@id":
            `${siteOrigin}/#business`,
        },

        areaServed: {
          "@type": "City",

          name:
            siteConfig.primaryCity,

          addressRegion:
            siteConfig.region,

          addressCountry:
            siteConfig.countryCode,
        },

        audience: {
          "@type": "PeopleAudience",

          audienceType:
            service.who,
        },

        serviceType:
          service.name,

        offers:
          serviceOffers.length === 1
            ? serviceOffers[0]
            : {
                "@type":
                  "OfferCatalog",

                name:
                  `${service.name} pricing`,

                itemListElement:
                  serviceOffers,
              },

        potentialAction: {
          "@type": "ReserveAction",

          name:
            `Book ${service.name}`,

          target: {
            "@type": "EntryPoint",

            urlTemplate:
              siteConfig.bookingUrl,

            actionPlatform: [
              "https://schema.org/DesktopWebPlatform",
              "https://schema.org/MobileWebPlatform",
            ],
          },
        },
      },

      {
        "@type":
          "BreadcrumbList",

        "@id":
          `${canonicalUrl}#breadcrumb`,

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
            name: service.name,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd
        data={serviceStructuredData}
      />

      <MotionProvider />
      <Header />

      <main
        id="main-content"
        className="service-detail-page"
      >
        <section
          className="service-detail-hero"
          aria-labelledby="service-heading"
        >
          <div className="service-detail-hero__inner">
            <div className="service-detail-hero__copy">
              <p className="eyebrow">
                McKenzie House Massage
              </p>

              <h1 id="service-heading">
                {service.name}
              </h1>

              <p className="service-detail-hero__lead">
                {service.longDescription}
              </p>

              <div className="service-detail-hero__meta">
                <div>
                  <span>Duration</span>

                  <strong>
                    {service.duration}
                  </strong>
                </div>

                <div>
                  <span>Starting Price</span>

                  <strong>
                    {service.price}
                  </strong>
                </div>
              </div>

              {pricingGroup ? (
                <div
                  className="service-detail-hero__rates"
                  aria-label={`${service.name} pricing`}
                >
                  {pricingGroup.prices.map(
                    (item) => (
                      <div
                        key={`${item.duration}-${item.price}`}
                      >
                        <span>
                          {item.duration}
                        </span>

                        <strong>
                          {item.price}
                        </strong>
                      </div>
                    ),
                  )}
                </div>
              ) : null}

              <div className="hero-actions service-detail-hero__actions">
                <BookingLink className="button primary">
                  Book This Service
                </BookingLink>

                <a
                  className="button secondary"
                  href={textMessageHref}
                  aria-label={`Text Heather at ${siteConfig.phone}`}
                >
                  Text Heather
                </a>

                <Link
                  className="button secondary"
                  href="/#services"
                  prefetch
                >
                  Back to Services
                </Link>
              </div>
            </div>

            <div className="service-detail-hero__media-wrap">
              <div className="service-detail-hero__media">
                <Image
                  src={serviceImage}
                  alt={serviceImageAlt}
                  fill
                  priority
                  quality={88}
                  sizes="
                    (max-width: 1100px) 100vw,
                    46vw
                  "
                />
              </div>

              <div className="service-detail-hero__badge">
                <span>
                  Client-led care
                </span>

                <strong>
                  Pressure, pacing,
                  positioning, and comfort are
                  adjusted throughout the
                  appointment.
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section service-detail-overview scroll-reveal"
          aria-label={`${service.name} overview`}
          data-reveal-stagger="85"
        >
          <article data-reveal-item>
            <span>What It Is</span>

            <h2>{service.what}</h2>
          </article>

          <article data-reveal-item>
            <span>Who It Is For</span>

            <h2>{service.who}</h2>
          </article>

          <article data-reveal-item>
            <span>Pressure / Style</span>

            <h2>{service.style}</h2>
          </article>
        </section>

        <section
          className="section service-detail-breakdown scroll-reveal"
          aria-labelledby="service-includes-heading"
          data-reveal-stagger="100"
        >
          <div
            className="service-detail-panel"
            data-reveal-item
          >
            <p className="eyebrow">
              Treatment Details
            </p>

            <h2 id="service-includes-heading">
              What this service may include.
            </h2>

            <ul>
              {service.includes.map(
                (item) => (
                  <li key={item}>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>

          <aside
            className="service-detail-aside"
            data-reveal-item
          >
            <p className="eyebrow">
              Good Fit For
            </p>

            <div
              className="chip-row"
              aria-label={`Common reasons to choose ${service.name}`}
            >
              {service.bestFor.map(
                (item) => (
                  <span key={item}>
                    {item}
                  </span>
                ),
              )}
            </div>

            <div className="service-detail-quick-facts">
              <div>
                <span>Duration</span>

                <strong>
                  {service.duration}
                </strong>
              </div>

              <div>
                <span>Starting Price</span>

                <strong>
                  {service.price}
                </strong>
              </div>

              <div>
                <span>Pressure</span>

                <strong>
                  {service.pressure}
                </strong>
              </div>
            </div>
          </aside>
        </section>

        {service.notes.length > 0 ? (
          <section
            className="section service-detail-notes scroll-reveal"
            aria-labelledby="service-notes-heading"
            data-reveal-stagger="80"
          >
            <div
              className="section-heading centered"
              data-reveal-item
            >
              <p className="eyebrow">
                Before You Book
              </p>

              <h2 id="service-notes-heading">
                Helpful notes for this
                treatment.
              </h2>
            </div>

            <div className="service-detail-note-grid">
              {service.notes.map(
                (item) => (
                  <article
                    key={item}
                    data-reveal-item
                  >
                    <p>{item}</p>
                  </article>
                ),
              )}
            </div>
          </section>
        ) : null}

        {/*
         * PREMIUM UPGRADE:
         * Important client policies appear on every service page.
         */}
        <section
          className="section service-detail-notes scroll-reveal"
          aria-labelledby="client-essentials-heading"
          data-reveal-stagger="90"
        >
          <div
            className="section-heading centered"
            data-reveal-item
          >
            <p className="eyebrow">
              Client Essentials
            </p>

            <h2 id="client-essentials-heading">
              Clear answers before you book.
            </h2>

            <p>
              Important pricing, insurance,
              and availability information is
              provided upfront so you know what
              to expect.
            </p>
          </div>

          <div className="service-detail-note-grid">
            <article data-reveal-item>
              <p className="mini-eyebrow">
                Direct Billing
              </p>

              <h3>
                {
                  siteConfig.directBilling
                    .heading
                }
              </h3>

              <p>{directBillingText}</p>
            </article>

            <article data-reveal-item>
              <p className="mini-eyebrow">
                Simple Pricing
              </p>

              <h3>
                {
                  siteConfig.tippingPolicy
                    .heading
                }
              </h3>

              <p>
                {
                  siteConfig.tippingPolicy
                    .statement
                }
              </p>
            </article>

            <article data-reveal-item>
              <p className="mini-eyebrow">
                Earlier Openings
              </p>

              <h3>
                {
                  siteConfig.waitlist
                    .heading
                }
              </h3>

              <p>
                {
                  siteConfig.waitlist
                    .description
                }
              </p>

              {siteConfig.waitlist.enabled ? (
                <a
                  className="service-link-text"
                  href={
                    siteConfig.waitlist.href
                  }
                >
                  {
                    siteConfig.waitlist
                      .buttonLabel
                  }
                  <span aria-hidden="true">
                    {" "}
                    →
                  </span>
                </a>
              ) : null}
            </article>
          </div>
        </section>

        <section
          id="booking"
          className="section booking-luxury service-detail-booking scroll-reveal"
          aria-labelledby="booking-heading"
          data-reveal-stagger="85"
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
                View Heather’s live
                availability, select your
                appointment length, and
                complete the booking process
                through ClinicSense. Questions
                about service fit or flexible
                availability can be sent
                directly to Heather.
              </p>

              <div className="booking-luxury__actions">
                <BookingLink className="button primary">
                  Open Live Booking
                </BookingLink>

                {siteConfig.waitlist.enabled ? (
                  <a
                    className="button secondary"
                    href={
                      siteConfig.waitlist.href
                    }
                  >
                    {
                      siteConfig.waitlist
                        .buttonLabel
                    }
                  </a>
                ) : (
                  <a
                    className="button secondary"
                    href={textMessageHref}
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
                <span>Flexible Times</span>

                <strong>
                  Text to ask
                </strong>

                <p>
                  Monday, Saturday, or Sunday
                  appointments may occasionally
                  be possible by request.
                </p>
              </article>

              <article data-reveal-item>
                <span>Booking System</span>

                <strong>
                  ClinicSense
                </strong>

                <p>
                  Availability, intake, and
                  appointment scheduling are
                  managed through Heather’s
                  booking platform.
                </p>
              </article>
            </div>
          </div>
        </section>

        {relatedServices.length > 0 ? (
          <section
            className="section related-services related-services-luxury scroll-reveal"
            aria-labelledby="related-services-heading"
            data-reveal-stagger="85"
          >
            <div
              className="section-heading centered"
              data-reveal-item
            >
              <p className="eyebrow">
                More Services
              </p>

              <h2 id="related-services-heading">
                Explore treatments with a
                similar fit.
              </h2>

              <p>
                These options share related
                treatment goals, pressure
                styles, or client preferences.
              </p>
            </div>

            <div className="service-grid">
              {relatedServices.map(
                (item) => (
                  <Link
                    className="service-card service-card-link"
                    href={`/services/${item.slug}`}
                    key={item.slug}
                    aria-label={`View ${item.name}`}
                    data-reveal-item
                    prefetch
                  >
                    <div className="service-image">
                      {item.image ? (
                        <Image
                          className="service-card-image"
                          src={item.image}
                          alt={
                            item.imageAlt ||
                            `${item.name} at ${siteConfig.businessName}`
                          }
                          fill
                          quality={84}
                          sizes="
                            (max-width: 720px) 100vw,
                            (max-width: 1100px) 50vw,
                            33vw
                          "
                        />
                      ) : null}
                    </div>

                    <div className="service-content">
                      <p className="mini-eyebrow">
                        View treatment
                      </p>

                      <h3>{item.name}</h3>

                      <p>
                        {item.description}
                      </p>

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
              )}
            </div>
          </section>
        ) : null}
      </main>

      <BookingLink className="mobile-sticky-book">
        Book Now
      </BookingLink>

      <Footer />
    </>
  );
}