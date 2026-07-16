import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionProvider } from "@/components/MotionProvider";
import { clientReflections, siteConfig } from "@/lib/site";

const pageTitle = `Client Reviews | ${siteConfig.businessName}`;
const pageDescription =
  "Client reflections and approved review highlights for McKenzie House Massage, supporting trust for massage therapy clients in Okotoks and Calgary.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/reviews",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/reviews",
    siteName: siteConfig.businessName,
    type: "website",
    locale: "en_CA",
    images: [
      {
        url: siteConfig.assets.openGraphImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.businessName} client reviews`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [siteConfig.assets.openGraphImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const reviewsStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: pageTitle,
  description: pageDescription,
  url: `${siteConfig.domain}/reviews`,
  about: {
    "@type": "HealthAndBeautyBusiness",
    name: siteConfig.businessName,
    url: siteConfig.domain,
    founder: {
      "@type": "Person",
      name: siteConfig.legalName,
    },
    areaServed: [
      `${siteConfig.primaryCity}, ${siteConfig.region}`,
      `${siteConfig.secondaryCity}, ${siteConfig.region}`,
    ],
  },
};

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
  return (
    <>
      <JsonLd data={reviewsStructuredData} />

      <MotionProvider />
      <Header />

      <main id="main-content">
        <section
          className="reviews-page-hero"
          aria-labelledby="reviews-heading"
        >
          <div className="detail-hero-bg" aria-hidden="true">
            <div className="botanical-pattern" />
            <div className="ambient-orb orb-one" />
            <div className="ambient-orb orb-two" />
          </div>

          <div className="reviews-page-hero-inner reveal-up">
            <p className="hero-pill">
              <span />
              Client reflections
            </p>

            <h1 id="reviews-heading">
              Word-of-mouth trust, carried into the website.
            </h1>

            <p className="hero-copy">
              Approved review highlights can live here once Heather confirms
              which client reflections and Google review excerpts should be
              featured publicly.
            </p>

            <div className="hero-actions">
              <a className="button primary" href={siteConfig.bookingUrl}>
                Book a Session
              </a>
              <a className="button secondary" href="/#services">
                Explore Services
              </a>
            </div>
          </div>
        </section>

        <section className="section reviews-section scroll-reveal">
          <div className="section-heading centered">
            <p className="eyebrow">Review Highlights</p>
            <h2>Real client trust, presented clearly and professionally.</h2>
            <p>
              This page is ready for approved testimonials, Google review
              excerpts, and client feedback once Heather chooses what should be
              published.
            </p>
          </div>

          <div className="review-grid reviews-page-grid">
            {clientReflections.map((review) => (
              <article className="review-card" key={review.label}>
                <div className="stars" aria-label="Five-star review highlight">
                  ★★★★★
                </div>
                <p>“{review.quote}”</p>
                <small>{review.label}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="section booking-section scroll-reveal">
          <div className="booking-card">
            <p className="eyebrow">Ready to Book?</p>
            <h2>Continue through ClinicSense.</h2>
            <p>
              Clients can book through Heather’s ClinicSense system once the
              final booking link is connected.
            </p>
            <a className="button primary" href={siteConfig.bookingUrl}>
              Open Booking
            </a>
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