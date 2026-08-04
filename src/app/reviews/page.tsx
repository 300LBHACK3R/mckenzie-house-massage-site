import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionProvider } from "@/components/MotionProvider";
import {
  clientReflections,
  siteConfig,
  trustSignals,
} from "@/lib/site";

const REVIEWS_PATH = "/reviews";

const DEFAULT_SITE_ORIGIN =
  "https://www.mckenziehousemassage.ca";

const pageTitle = "Client Reviews & Stories";

const pageDescription =
  "Explore approved client feedback, consent-based client stories, treatment guidance, and booking support from McKenzie House Massage in Prestwick, Calgary.";

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

type ApprovedReview = {
  id: string;
  quote: string;
  attribution: string;
  source: string;
  sourceUrl?: string;
};

type ClientStoryPreview = {
  id: string;
  label: string;
  title: string;
  text: string;
  initials: string;
};

type ReviewPlaceholder = {
  id: string;
  number: string;
  title: string;
  text: string;
};

type UnknownRecord = Record<
  string,
  unknown
>;

const clientStoryPreviews:
  readonly ClientStoryPreview[] = [
    {
      id: "athletic-recovery",
      label: "Active Clients",
      title: "Training and recovery",
      text:
        "Reserved for an approved adult client story about movement, training, recovery, and ongoing body care.",
      initials: "AR",
    },

    {
      id: "working-bodies",
      label: "Working Bodies",
      title: "Physical and creative work",
      text:
        "A future consent-based feature about the demands placed on the hands, arms, neck, shoulders, back, and the rest of a working body.",
      initials: "WB",
    },

    {
      id: "life-stages",
      label: "Life Stages",
      title: "Pregnancy and postpartum",
      text:
        "A respectful future story about comfort, changing needs, positioning, and care during pregnancy or postpartum life.",
      initials: "LS",
    },

    {
      id: "ongoing-care",
      label: "Regular Care",
      title: "Consistency and wellbeing",
      text:
        "Reserved for an approved story about incorporating massage into a practical, sustainable personal-care routine.",
      initials: "OC",
    },
  ];

const futureStoryDirections = [
  "Athletes, runners, rowers, gym clients, and active adults",
  "Musicians, tradespeople, desk workers, caregivers, and working bodies",
  "Pregnancy, postpartum, parenthood, and long-term wellness clients",
] as const;

const reviewPlaceholders:
  readonly ReviewPlaceholder[] = [
    {
      id: "communication",
      number: "01",
      title: "Communication and comfort",
      text:
        "This space is reserved for an approved client reflection about feeling heard, understood, and comfortable throughout an appointment.",
    },

    {
      id: "customization",
      number: "02",
      title: "Customized treatment",
      text:
        "An approved reflection about Heather adjusting pressure, positioning, pace, and treatment focus will appear here.",
    },

    {
      id: "professional-care",
      number: "03",
      title: "Professional care",
      text:
        "An approved reflection about Heather’s professionalism, treatment environment, and overall client experience will appear here.",
    },
  ];

function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function readString(
  record: UnknownRecord,
  keys: readonly string[],
): string | undefined {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === "string" &&
      value.trim().length > 0
    ) {
      return value.trim();
    }
  }

  return undefined;
}

function isApprovedReflection(
  record: UnknownRecord,
): boolean {
  if (
    record.isApproved === true ||
    record.approved === true
  ) {
    return true;
  }

  const status = readString(
    record,
    ["status"],
  );

  return (
    status?.toLowerCase() === "approved"
  );
}

function readSafeExternalUrl(
  value: unknown,
): string | undefined {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return undefined;
  }

  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}

function normalizeApprovedReviews(
  values: readonly unknown[],
): ApprovedReview[] {
  return values.flatMap(
    (value, index) => {
      if (
        !isRecord(value) ||
        !isApprovedReflection(value)
      ) {
        return [];
      }

      const quote = readString(
        value,
        [
          "quote",
          "text",
          "review",
          "reflection",
        ],
      );

      if (!quote) {
        return [];
      }

      const id =
        readString(value, ["id"]) ||
        `approved-review-${index + 1}`;

      const attribution =
        readString(value, [
          "attribution",
          "clientName",
          "name",
        ]) || "Approved client";

      const source =
        readString(value, ["source"]) ||
        "Direct";

      const sourceUrl =
        readSafeExternalUrl(
          value.sourceUrl,
        ) ||
        readSafeExternalUrl(value.url);

      return [
        {
          id,
          quote,
          attribution,
          source,
          sourceUrl,
        },
      ];
    },
  );
}

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

function isInternalHref(
  href: string,
): boolean {
  return (
    href.startsWith("/") ||
    href.startsWith("#")
  );
}

function isNativeProtocol(
  href: string,
): boolean {
  const normalized =
    href.trim().toLowerCase();

  return (
    normalized.startsWith("mailto:") ||
    normalized.startsWith("tel:") ||
    normalized.startsWith("sms:")
  );
}

function isSafeHttpHref(
  href: string,
): boolean {
  try {
    const url = new URL(href);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}

function normalizeHref(
  href: string,
): string {
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

function SmartLink({
  href,
  className,
  children,
  ariaLabel,
  openExternalInNewTab = false,
}: SmartLinkProps) {
  const normalizedHref =
    normalizeHref(href);

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

  const opensExternally =
    openExternalInNewTab &&
    isSafeHttpHref(normalizedHref);

  return (
    <a
      className={className}
      href={normalizedHref}
      aria-label={ariaLabel}
      {...(opensExternally
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

function JsonLd({
  data,
}: JsonLdProps) {
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

const approvedReviews =
  normalizeApprovedReviews(
    clientReflections,
  );

const reviewsReadyForIndexing =
  approvedReviews.length > 0;

const siteOrigin =
  normalizeSiteOrigin(
    siteConfig.domain,
  );

const canonicalUrl =
  `${siteOrigin}${REVIEWS_PATH}`;

const openGraphImageUrl =
  toAbsoluteUrl(
    siteConfig.assets.openGraphImage,
    siteOrigin,
  );

const cleanPhone =
  siteConfig.phoneE164 ||
  siteConfig.phone.replace(
    /[^\d+]/g,
    "",
  );

const textMessageHref =
  `sms:${cleanPhone}`;

const telephoneHref =
  `tel:${cleanPhone}`;

const waitlistHref =
  siteConfig.waitlist.href?.trim() ||
  textMessageHref;

const configuredGoogleUrl =
  siteConfig.social.google.trim();

const confirmedGoogleProfile =
  isSafeHttpHref(
    configuredGoogleUrl,
  ) &&
  !configuredGoogleUrl.includes(
    "google.com/search",
  );

const googleUrl =
  confirmedGoogleProfile
    ? configuredGoogleUrl
    : `https://www.google.com/search?q=${encodeURIComponent(
        siteConfig.businessName,
      )}`;

const googleButtonLabel =
  confirmedGoogleProfile
    ? "View Google Profile"
    : "Search on Google";

function getDirectBillingSummary():
  string {
  const providers =
    siteConfig.directBilling.providers.filter(
      (provider) =>
        provider.trim().length > 0,
    );

  const providerStatement =
    providers.length > 0
      ? `Confirmed providers include ${providers.join(
          ", ",
        )}.`
      : siteConfig.directBilling
          .placeholder ||
        "The confirmed insurance-provider list is being finalized. Contact Heather to ask about your provider.";

  return [
    siteConfig.directBilling.summary,
    providerStatement,
    siteConfig.directBilling
      .disclaimer,
  ]
    .filter(Boolean)
    .join(" ");
}

const directBillingSummary =
  getDirectBillingSummary();

function createStructuredData():
  Record<string, unknown> {
  const reviewListId =
    `${canonicalUrl}#approved-reviews`;

  const graph:
    Record<string, unknown>[] = [
      {
        "@type": "CollectionPage",

        "@id":
          `${canonicalUrl}#webpage`,

        url: canonicalUrl,

        name:
          `${pageTitle} | ` +
          siteConfig.businessName,

        description: pageDescription,

        inLanguage:
          siteConfig.locale,

        isPartOf: {
          "@id":
            `${siteOrigin}/#website`,
        },

        about: {
          "@id":
            `${siteOrigin}/#business`,
        },

        breadcrumb: {
          "@id":
            `${canonicalUrl}#breadcrumb`,
        },

        ...(approvedReviews.length > 0
          ? {
              mainEntity: {
                "@id": reviewListId,
              },
            }
          : {}),
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
            name: "Client Reviews",
            item: canonicalUrl,
          },
        ],
      },
    ];

  if (approvedReviews.length > 0) {
    graph.push({
      "@type": "ItemList",
      "@id": reviewListId,

      name:
        `Approved reviews for ` +
        siteConfig.businessName,

      itemListElement:
        approvedReviews.map(
          (review, index) => ({
            "@type": "ListItem",
            position: index + 1,

            item: {
              "@type": "Review",

              "@id":
                `${canonicalUrl}#review-` +
                review.id,

              reviewBody:
                review.quote,

              author: {
                "@type": "Person",
                name:
                  review.attribution,
              },

              itemReviewed: {
                "@id":
                  `${siteOrigin}/#business`,
              },

              ...(review.sourceUrl
                ? {
                    url:
                      review.sourceUrl,
                  }
                : {}),
            },
          }),
        ),
    });
  }

  return {
    "@context":
      "https://schema.org",
    "@graph": graph,
  };
}

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,

  alternates: {
    canonical: REVIEWS_PATH,
  },

  openGraph: {
    title:
      `${pageTitle} | ` +
      siteConfig.businessName,

    description: pageDescription,
    url: REVIEWS_PATH,
    siteName:
      siteConfig.businessName,
    type: "website",

    locale:
      siteConfig.locale.replace(
        "-",
        "_",
      ),

    images: [
      {
        url: openGraphImageUrl,

        alt:
          siteConfig.assets
            .openGraphImageAlt ||
          `Client reviews and stories for ${siteConfig.businessName}`,
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
    index: reviewsReadyForIndexing,
    follow: true,

    googleBot: {
      index:
        reviewsReadyForIndexing,
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

export default function ReviewsPage() {
  const pageStructuredData =
    createStructuredData();

  const heroHeading =
    reviewsReadyForIndexing
      ? "Real feedback, real people, and trust you can feel."
      : "A thoughtful home for real, approved client feedback.";

  const heroDescription =
    reviewsReadyForIndexing
      ? "Approved client feedback and consent-based stories help visitors understand Heather’s communication, care style, and treatment experience before booking."
      : "This page is being prepared for genuine client reflections. Nothing is published as a testimonial until Heather has confirmed the source and the client has approved its public use.";

  return (
    <>
      <JsonLd
        data={pageStructuredData}
      />

      <MotionProvider />
      <Header />

      <main
        id="main-content"
        className="reviews-page-premium"
      >
        <section
          className="reviews-premium-hero"
          aria-labelledby="reviews-heading"
        >
          <div className="reviews-premium-hero__inner">
            <div className="reviews-premium-hero__copy">
              <p className="eyebrow">
                Client Trust
              </p>

              <h1 id="reviews-heading">
                {heroHeading}
              </h1>

              <p>
                {heroDescription}
              </p>

              <div className="reviews-premium-hero__actions">
                <SmartLink
                  className="button primary"
                  href={googleUrl}
                  ariaLabel={`${googleButtonLabel} for ${siteConfig.businessName}`}
                  openExternalInNewTab
                >
                  {googleButtonLabel}
                </SmartLink>

                <SmartLink
                  className="button secondary"
                  href={siteConfig.bookingUrl}
                  ariaLabel="Open Heather’s live ClinicSense booking schedule"
                  openExternalInNewTab
                >
                  Check Availability
                </SmartLink>

                <Link
                  className="button secondary"
                  href="/#services"
                  prefetch
                >
                  Explore Services
                </Link>
              </div>
            </div>

            <aside
              className="reviews-premium-hero__panel"
              aria-labelledby="reviews-trust-heading"
            >
              <span>
                Approval first
              </span>

              <h2 id="reviews-trust-heading">
                Massage is personal. Client
                trust deserves care.
              </h2>

              <p>
                Feedback is displayed only
                after its source and public-use
                permission have been confirmed.
                Photos, stories, and names
                remain optional.
              </p>

              <div className="reviews-premium-hero__mini-grid">
                <div>
                  <small>
                    Review status
                  </small>

                  <strong>
                    {reviewsReadyForIndexing
                      ? `${approvedReviews.length} approved`
                      : "Awaiting approval"}
                  </strong>
                </div>

                <div>
                  <small>
                    Story approach
                  </small>

                  <strong>
                    Consent first
                  </strong>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section
          className="section reviews-trust-strip scroll-reveal"
          aria-label="How McKenzie House Massage builds client trust"
          data-reveal-stagger="85"
        >
          {trustSignals.map(
            (item) => (
              <article
                key={item.title}
                data-reveal-item
              >
                <span>
                  {item.label}
                </span>

                <h2>{item.title}</h2>

                <p>{item.text}</p>
              </article>
            ),
          )}
        </section>

        <section
          className="section reviews-proof-menu scroll-reveal"
          aria-labelledby="review-highlights-heading"
          data-reveal-stagger="90"
        >
          <div
            className="reviews-proof-menu__intro"
            data-reveal-item
          >
            <p className="eyebrow">
              Review Highlights
            </p>

            <h2 id="review-highlights-heading">
              Client words presented with
              care.
            </h2>

            <p>
              Only genuine feedback approved
              for public website use appears
              here. Draft wording, private
              messages, and unverified excerpts
              are never presented as reviews.
            </p>
          </div>

          <div className="reviews-proof-menu__grid">
            {approvedReviews.length > 0
              ? approvedReviews.map(
                  (review, index) => (
                    <article
                      className="review-proof-card"
                      key={review.id}
                      data-reveal-item
                    >
                      <div
                        className="review-proof-card__number"
                        aria-hidden="true"
                      >
                        {String(
                          index + 1,
                        ).padStart(2, "0")}
                      </div>

                      <blockquote
                        cite={
                          review.sourceUrl ||
                          canonicalUrl
                        }
                      >
                        <p>
                          “{review.quote}”
                        </p>
                      </blockquote>

                      <footer>
                        <span>
                          {
                            review.attribution
                          }
                        </span>

                        {review.sourceUrl ? (
                          <SmartLink
                            href={
                              review.sourceUrl
                            }
                            ariaLabel={`View the original review from ${review.attribution}`}
                            openExternalInNewTab
                          >
                            View {
                              review.source
                            }
                            <span aria-hidden="true">
                              {" "}
                              →
                            </span>
                          </SmartLink>
                        ) : (
                          <span>
                            {review.source}
                          </span>
                        )}
                      </footer>
                    </article>
                  ),
                )
              : reviewPlaceholders.map(
                  (placeholder) => (
                    <article
                      className="review-proof-card"
                      key={
                        placeholder.id
                      }
                      data-reveal-item
                    >
                      <div
                        className="review-proof-card__number"
                        aria-hidden="true"
                      >
                        {
                          placeholder.number
                        }
                      </div>

                      <div
                        className="review-proof-card__placeholder"
                        role="note"
                        aria-label="Reserved space for an approved client review"
                      >
                        <h3>
                          {
                            placeholder.title
                          }
                        </h3>

                        <p>
                          {
                            placeholder.text
                          }
                        </p>
                      </div>

                      <footer>
                        <span>
                          Awaiting client
                          approval
                        </span>

                        <SmartLink
                          href={googleUrl}
                          ariaLabel={`${googleButtonLabel} for ${siteConfig.businessName}`}
                          openExternalInNewTab
                        >
                          {googleButtonLabel}
                          <span aria-hidden="true">
                            {" "}
                            →
                          </span>
                        </SmartLink>
                      </footer>
                    </article>
                  ),
                )}
          </div>
        </section>

        <section
          className="section reviews-photo-showcase scroll-reveal"
          aria-labelledby="client-photo-heading"
          data-reveal-stagger="80"
        >
          <div
            className="reviews-photo-showcase__intro"
            data-reveal-item
          >
            <p className="eyebrow">
              Client Story Preview
            </p>

            <h2 id="client-photo-heading">
              Real stories can remain grounded,
              human, and private.
            </h2>

            <p>
              Approved lifestyle, activity,
              athletic, family, creative, or
              hands-at-work photography may be
              added after the content sessions.
              Clients never need to show their
              faces for their stories to feel
              meaningful.
            </p>
          </div>

          <div className="reviews-photo-showcase__grid">
            {clientStoryPreviews.map(
              (client) => (
                <article
                  className="client-photo-card"
                  key={client.id}
                  data-reveal-item
                >
                  <div
                    className="client-photo-card__image"
                    role="img"
                    aria-label={`${client.title} client-story photography placeholder`}
                  >
                    <div aria-hidden="true">
                      {client.initials}
                    </div>

                    <span>
                      Approved adult client
                      story placeholder
                    </span>
                  </div>

                  <div className="client-photo-card__copy">
                    <span>
                      {client.label}
                    </span>

                    <h3>
                      {client.title}
                    </h3>

                    <p>
                      {client.text}
                    </p>
                  </div>
                </article>
              ),
            )}
          </div>
        </section>

        <section
          className="section reviews-story-panel scroll-reveal"
          aria-labelledby="story-heading"
          data-reveal-stagger="90"
        >
          <div className="reviews-story-panel__card">
            <div data-reveal-item>
              <p className="eyebrow">
                Client Stories
              </p>

              <h2 id="story-heading">
                Real clients, real lives, and
                thoughtful care.
              </h2>

              <p>
                Approved feedback and
                meaningful photography can show
                the variety of adults who trust
                Heather’s practice while
                respecting each person’s
                privacy and comfort.
              </p>
            </div>

            <div
              className="reviews-story-panel__list"
              aria-label="Potential client-story categories"
            >
              {futureStoryDirections.map(
                (item) => (
                  <article
                    key={item}
                    data-reveal-item
                  >
                    <span>
                      Story direction
                    </span>

                    <strong>
                      {item}
                    </strong>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        <section
          className="section reviews-story-panel scroll-reveal"
          aria-labelledby="client-guidance-heading"
          data-reveal-stagger="90"
        >
          <div className="reviews-story-panel__card">
            <div data-reveal-item>
              <p className="eyebrow">
                Helpful Booking Details
              </p>

              <h2 id="client-guidance-heading">
                Clear answers before you
                schedule.
              </h2>

              <p>
                Pricing, direct billing,
                appointment availability, and
                earlier-opening requests are
                explained upfront.
              </p>

              <div className="reviews-consent-note__actions">
                <SmartLink
                  className="button primary"
                  href={
                    siteConfig.bookingUrl
                  }
                  ariaLabel="Open Heather’s live ClinicSense booking schedule"
                  openExternalInNewTab
                >
                  Check Availability
                </SmartLink>

                <SmartLink
                  className="button secondary"
                  href={waitlistHref}
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
              </div>
            </div>

            <div
              className="reviews-story-panel__list"
              aria-label="Booking, insurance, and payment information"
            >
              <article data-reveal-item>
                <span>
                  Direct Billing
                </span>

                <strong>
                  {
                    siteConfig
                      .directBilling.heading
                  }
                </strong>

                <p>
                  {directBillingSummary}
                </p>
              </article>

              <article data-reveal-item>
                <span>
                  Simple Pricing
                </span>

                <strong>
                  {
                    siteConfig
                      .tippingPolicy.heading
                  }
                </strong>

                <p>
                  {
                    siteConfig
                      .tippingPolicy.statement
                  }
                </p>
              </article>

              <article data-reveal-item>
                <span>
                  Earlier Openings
                </span>

                <strong>
                  {
                    siteConfig.waitlist
                      .heading
                  }
                </strong>

                <p>
                  {
                    siteConfig.waitlist
                      .description
                  }
                </p>
              </article>

              <article data-reveal-item>
                <span>
                  Online Booking
                </span>

                <strong>
                  Live ClinicSense schedule
                </strong>

                <p>
                  View current availability,
                  select a service and
                  appointment length, and
                  complete the booking through
                  Heather’s booking platform.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="section reviews-consent-note scroll-reveal"
          aria-labelledby="consent-heading"
        >
          <div
            className="reviews-consent-note__inner"
            data-reveal-item
          >
            <p className="eyebrow">
              Consent First
            </p>

            <h2 id="consent-heading">
              Every client feature must remain
              respectful.
            </h2>

            <p>
              Reviews, names, photos, and
              personal stories are published
              only with clear approval. Any
              model or featured client must be
              an adult. Faces remain optional,
              and consent can be limited to the
              exact wording and images the
              client has approved.
            </p>

            <div className="reviews-consent-note__actions">
              <SmartLink
                className="button primary"
                href={googleUrl}
                ariaLabel={`${googleButtonLabel} for ${siteConfig.businessName}`}
                openExternalInNewTab
              >
                {googleButtonLabel}
              </SmartLink>

              <SmartLink
                className="button secondary"
                href={
                  siteConfig.bookingUrl
                }
                ariaLabel="Book a massage session through ClinicSense"
                openExternalInNewTab
              >
                Book a Session
              </SmartLink>

              <Link
                className="button secondary"
                href="/contact"
                prefetch
              >
                Contact Heather
              </Link>

              <a
                className="button secondary"
                href={telephoneHref}
                aria-label={`Call Heather at ${siteConfig.phone}`}
              >
                Call Heather
              </a>
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