import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionProvider } from "@/components/MotionProvider";
import { clientReflections, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Client Reviews | " + siteConfig.businessName,
  description:
    "Client reviews, Google review highlights, and future client story features for McKenzie House Massage in Prestwick, Calgary.",
  alternates: {
    canonical: siteConfig.domain + "/reviews",
  },
  openGraph: {
    title: "Client Reviews | " + siteConfig.businessName,
    description:
      "Client trust, Google review highlights, and future client story features for McKenzie House Massage.",
    url: siteConfig.domain + "/reviews",
    type: "website",
    images: [
      {
        url: siteConfig.assets.openGraphImage,
        width: 1200,
        height: 630,
        alt: siteConfig.businessName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Client Reviews | " + siteConfig.businessName,
    description:
      "Client trust, Google review highlights, and future client story features for McKenzie House Massage.",
    images: [siteConfig.assets.openGraphImage],
  },
};

const trustPoints = [
  {
    label: "Google reviews",
    title: "Easy to find",
    text:
      "Approved Google review highlights can live directly on the website while still linking clients back to Google.",
  },
  {
    label: "Client stories",
    title: "Human proof",
    text:
      "Future features can pair short client blurbs with approved photos, lifestyle shots, or action images.",
  },
  {
    label: "Comfort first",
    title: "Trust before booking",
    text:
      "Massage is personal. Reviews help clients feel safer, more familiar, and more confident before they book.",
  },
];

const clientPhotoPlaceholders = [
  {
    label: "Team Canada rower",
    title: "Athletic recovery story",
    text:
      "Placeholder for an approved rowing, training, or competition photo paired with a client blurb.",
    initials: "RC",
  },
  {
    label: "Ultra runner",
    title: "Movement and endurance",
    text:
      "Placeholder for a marathon, trail, or running photo that shows the client in their own element.",
    initials: "UR",
  },
  {
    label: "Drummer",
    title: "Creative working body",
    text:
      "Placeholder for a musician or performance photo showing how hands, arms, neck, and shoulders matter.",
    initials: "DR",
  },
  {
    label: "Motherhood",
    title: "Pregnancy to postpartum",
    text:
      "Placeholder for an approved family, outdoor, or motherhood photo connected to a long-term care story.",
    initials: "FM",
  },
];

const futureStoryDirections = [
  "Athletes, runners, rowers, and active bodies",
  "Musicians, tradespeople, desk workers, and working bodies",
  "Pregnancy, postpartum, motherhood, and long-term clients",
];

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default function ReviewsPage() {
  const googleUrl =
    siteConfig.social.google ||
    "https://www.google.com/search?q=McKenzie+House+Massage";

  const pageStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Client Reviews",
    description:
      "Client reviews, Google review highlights, and future client story features for McKenzie House Massage.",
    url: siteConfig.domain + "/reviews",
    publisher: {
      "@type": "HealthAndBeautyBusiness",
      name: siteConfig.businessName,
      telephone: siteConfig.phone,
      email: siteConfig.email,
      address: {
        "@type": "PostalAddress",
        addressLocality: siteConfig.primaryCity,
        addressRegion: siteConfig.region,
        addressCountry: siteConfig.country,
      },
    },
  };

  return (
    <>
      <JsonLd data={pageStructuredData} />

      <MotionProvider />
      <Header />

      <main id="main-content" className="reviews-page-premium">
        <section
          className="reviews-premium-hero"
          aria-labelledby="reviews-heading"
        >
          <div className="reviews-premium-hero__inner">
            <div className="reviews-premium-hero__copy">
              <p className="eyebrow">Client Trust</p>

              <h1 id="reviews-heading">
                Real reviews, real people, and proof clients can feel.
              </h1>

              <p>
                This page is designed to bring Heather’s best approved Google
                reviews and future client stories into one warm, trustworthy
                place on the website.
              </p>

              <div className="reviews-premium-hero__actions">
                <a
                  className="button primary"
                  href={googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Google
                </a>

                <a
                  className="button secondary"
                  href={"sms:" + siteConfig.phone.replace(/[^\d+]/g, "")}
                >
                  Text Heather
                </a>

                <a className="button secondary" href="/#services">
                  Explore Services
                </a>
              </div>
            </div>

            <aside className="reviews-premium-hero__panel">
              <span>Why it matters</span>

              <h2>Massage is personal. Trust needs to be visible.</h2>

              <p>
                Reviews help new clients understand Heather’s care style before
                they book — especially when they are choosing a service, asking
                about pressure, pregnancy, postpartum, youth appointments, or
                comfort needs.
              </p>

              <div className="reviews-premium-hero__mini-grid">
                <div>
                  <small>Current source</small>
                  <strong>Google reviews</strong>
                </div>

                <div>
                  <small>Future feature</small>
                  <strong>Client stories</strong>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section
          className="section reviews-trust-strip scroll-reveal"
          aria-label="Review strategy"
        >
          {trustPoints.map((item) => (
            <article key={item.title}>
              <span>{item.label}</span>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </article>
          ))}
        </section>

        <section
          className="section reviews-photo-showcase scroll-reveal"
          aria-labelledby="client-photo-heading"
        >
          <div className="reviews-photo-showcase__intro">
            <p className="eyebrow">Client Photo Placeholders</p>

            <h2 id="client-photo-heading">
              A future gallery that feels real, grounded, and human.
            </h2>

            <p>
              These placeholders are ready for approved client photos later.
              Faces are optional. Action shots, lifestyle photos, family photos,
              sports photos, or creative/work photos can all help people feel
              the practice is real and welcoming.
            </p>
          </div>

          <div className="reviews-photo-showcase__grid">
            {clientPhotoPlaceholders.map((client) => (
              <article className="client-photo-card" key={client.title}>
                <div className="client-photo-card__image">
                  <div aria-hidden="true">{client.initials}</div>
                  <span>Photo placeholder</span>
                </div>

                <div className="client-photo-card__copy">
                  <span>{client.label}</span>
                  <h3>{client.title}</h3>
                  <p>{client.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="section reviews-proof-menu scroll-reveal"
          aria-labelledby="review-highlights-heading"
        >
          <div className="reviews-proof-menu__intro">
            <p className="eyebrow">Review Highlights</p>

            <h2 id="review-highlights-heading">
              Approved words from real clients.
            </h2>

            <p>
              These cards are ready for approved Google review excerpts. Once
              Heather confirms which reviews can be used publicly, the
              placeholders can be replaced with real client wording.
            </p>
          </div>

          <div className="reviews-proof-menu__grid">
            {clientReflections.map((reflection, index) => (
              <article className="review-proof-card" key={reflection.quote}>
                <div className="review-proof-card__number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <blockquote>“{reflection.quote}”</blockquote>

                <footer>
                  <span>{reflection.label}</span>

                  <a
                    href={googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Google →
                  </a>
                </footer>
              </article>
            ))}
          </div>
        </section>

        <section
          className="section reviews-story-panel scroll-reveal"
          aria-labelledby="story-heading"
        >
          <div className="reviews-story-panel__card">
            <div>
              <p className="eyebrow">Future Client Stories</p>

              <h2 id="story-heading">
                A gallery of real clients, real lives, and real trust.
              </h2>

              <p>
                Heather’s idea of pairing reviews with approved client photos is
                strong. It can show the range of people who trust her practice
                and help new clients see themselves here before they book.
              </p>
            </div>

            <div className="reviews-story-panel__list">
              {futureStoryDirections.map((item) => (
                <article key={item}>
                  <span>Story direction</span>
                  <strong>{item}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="section reviews-consent-note scroll-reveal"
          aria-labelledby="consent-heading"
        >
          <div className="reviews-consent-note__inner">
            <p className="eyebrow">Consent First</p>

            <h2 id="consent-heading">
              Every client feature should feel respectful.
            </h2>

            <p>
              Client photos, names, stories, or review excerpts should only be
              used with clear approval. Faces are optional — action shots,
              lifestyle photos, athletic photos, family moments, or hands-at-work
              images can all work beautifully.
            </p>

            <div className="reviews-consent-note__actions">
              <a
                className="button primary"
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Google
              </a>

              <a className="button secondary" href="/#booking">
                Book a Session
              </a>
            </div>
          </div>
        </section>
      </main>

      <a className="mobile-sticky-book" href={siteConfig.bookingUrl}>
        Book Now
      </a>

      <Footer />
    </>
  );
}
