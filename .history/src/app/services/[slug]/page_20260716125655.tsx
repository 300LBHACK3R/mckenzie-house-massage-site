import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionProvider } from "@/components/MotionProvider";
import { getServiceBySlug, services, siteConfig } from "@/lib/site";

type ServicePageProps = {
  params: Promise<{
    slug: string;
  }>;
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

function getServiceUrl(slug: string) {
  return `${siteConfig.domain}/services/${slug}`;
}

export function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return {
      title: `Service Not Found | ${siteConfig.businessName}`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${service.name} in Okotoks | ${siteConfig.businessName}`;
  const description = `${service.description} Book personalized care with ${siteConfig.businessName} through ClinicSense.`;
  const canonicalUrl = `/services/${service.slug}`;
  const ogImage = service.image || siteConfig.assets.openGraphImage;

  return {
    title,
    description,
    keywords: [
      service.name,
      `${service.name} Okotoks`,
      `${service.name} Calgary`,
      "Okotoks massage therapy",
      "massage therapy Okotoks",
      "McKenzie House Massage",
      "Heather Knorr massage",
      ...service.bestFor,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.businessName,
      type: "website",
      locale: "en_CA",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${service.name} at ${siteConfig.businessName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
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
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const serviceUrl = getServiceUrl(service.slug);
  const serviceStructuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.longDescription,
    url: serviceUrl,
    image: service.image ? `${siteConfig.domain}${service.image}` : undefined,
    serviceType: service.name,
    areaServed: [
      {
        "@type": "City",
        name: siteConfig.primaryCity,
        addressRegion: siteConfig.region,
        addressCountry: "CA",
      },
      {
        "@type": "City",
        name: siteConfig.secondaryCity,
        addressRegion: siteConfig.region,
        addressCountry: "CA",
      },
    ],
    provider: {
      "@type": "HealthAndBeautyBusiness",
      name: siteConfig.businessName,
      url: siteConfig.domain,
      founder: {
        "@type": "Person",
        name: siteConfig.legalName,
      },
    },
    potentialAction: {
      "@type": "ReserveAction",
      target: siteConfig.bookingUrl,
      name: `Book ${service.name}`,
    },
  };

  return (
    <>
      <JsonLd data={serviceStructuredData} />

      <MotionProvider />
      <Header />

      <main id="main-content">
        <section
          className="service-detail-hero"
          aria-labelledby="service-heading"
        >
          <div className="detail-hero-bg" aria-hidden="true">
            <div className="botanical-pattern" />
            <div className="ambient-orb orb-one" />
            <div className="ambient-orb orb-two" />
          </div>

          <div className="service-detail-copy reveal-up">
            <a className="back-link" href="/#services">
              ← Back to services
            </a>

            <p className="hero-pill">
              <span />
              Signature treatment
            </p>

            <h1 id="service-heading">{service.name}</h1>
            <p className="hero-copy">{service.eyebrow}</p>

            <div className="hero-actions">
              <a
                className="button primary"
                href={siteConfig.bookingUrl}
                aria-label={`Book ${service.name} through ClinicSense`}
              >
                Book This Treatment
              </a>

              <a className="button secondary" href="#service-story">
                Learn More
              </a>
            </div>
          </div>

          <div className="service-detail-media reveal-soft">
            {service.video ? (
              <video controls playsInline preload="metadata">
                <source src={service.video} type="video/mp4" />
              </video>
            ) : service.image ? (
              <Image
                src={service.image}
                alt={service.mediaLabel}
                width={1100}
                height={1300}
                sizes="(max-width: 980px) 100vw, 48vw"
                priority
              />
            ) : (
              <div className="detail-media-placeholder">
                <span>{service.name}</span>
                <small>Photo or short treatment video coming soon</small>
              </div>
            )}
          </div>
        </section>

        <section
          id="service-story"
          className="section service-story-grid scroll-reveal"
          aria-labelledby="service-story-heading"
        >
          <article className="premium-copy-card">
            <p className="eyebrow">Treatment Overview</p>
            <h2 id="service-story-heading">
              What this service is designed for.
            </h2>
            <p>{service.longDescription}</p>
          </article>

          <article className="premium-copy-card">
            <p className="eyebrow">Technique Background</p>
            <h2>How the service is shaped.</h2>
            <p>{service.originStory}</p>
          </article>
        </section>

        <section
          className="section detail-breakout scroll-reveal"
          aria-labelledby="approach-heading"
        >
          <div className="detail-breakout-inner">
            <p className="eyebrow">Heather’s Approach</p>
            <h2 id="approach-heading">
              Personalized care, pressure control, and clear communication.
            </h2>
            <p>{service.heatherApproach}</p>
          </div>
        </section>

        <section
          className="section detail-info-section scroll-reveal"
          aria-labelledby="session-flow-heading"
        >
          <div className="section-heading">
            <p className="eyebrow">Session Flow</p>
            <h2 id="session-flow-heading">
              What clients can expect during this treatment.
            </h2>
            <p>
              This section gives clients confidence before booking by explaining
              how the appointment may feel and how the service is guided.
            </p>
          </div>

          <div className="detail-flow-grid">
            {service.sessionFlow.map((item, index) => (
              <article className="expect-card detail-flow-card" key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="section detail-fit-section scroll-reveal"
          aria-labelledby="best-fit-heading"
        >
          <div className="detail-fit-card">
            <div>
              <p className="eyebrow">Best Fit</p>
              <h2 id="best-fit-heading">Who this treatment is ideal for.</h2>
              <p>{service.clientFit}</p>
            </div>

            <div className="detail-chip-panel">
              <strong>Common reasons clients book:</strong>

              <div className="chip-row">
                {service.bestFor.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>

              <small>{service.pressure}</small>
            </div>
          </div>
        </section>

        <section
          id="booking"
          className="section booking-section scroll-reveal"
          aria-labelledby="service-booking-heading"
        >
          <div className="booking-card">
            <p className="eyebrow">Ready to Book?</p>
            <h2 id="service-booking-heading">Continue through ClinicSense.</h2>
            <p>
              Booking will open Heather’s ClinicSense system for current
              availability, service selection, and appointment details.
            </p>

            <a
              className="button primary"
              href={siteConfig.bookingUrl}
              aria-label={`Book ${service.name} through ClinicSense`}
            >
              Book {service.name}
            </a>
          </div>
        </section>
      </main>

      <a
        className="mobile-sticky-book"
        href={siteConfig.bookingUrl}
        aria-label="Book a massage session through ClinicSense"
      >
        Book Now
      </a>

      <Footer />
    </>
  );
}