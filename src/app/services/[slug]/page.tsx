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
    };
  }

  return {
    title: `${service.name} | ${siteConfig.businessName}`,
    description: service.description,
    alternates: {
      canonical: `/services/${service.slug}`,
    },
    openGraph: {
      title: `${service.name} | ${siteConfig.businessName}`,
      description: service.description,
      type: "website",
    },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      <MotionProvider />
      <Header />

      <main>
        <section className="service-detail-hero">
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
            <h1>{service.name}</h1>
            <p className="hero-copy">{service.eyebrow}</p>

            <div className="hero-actions">
              <a className="button primary" href={siteConfig.bookingUrl}>
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
              <img src={service.image} alt={service.mediaLabel} />
            ) : (
              <div className="detail-media-placeholder">
                <span>{service.name}</span>
                <small>Photo or short treatment video coming soon</small>
              </div>
            )}
          </div>
        </section>

        <section id="service-story" className="section service-story-grid scroll-reveal">
          <article className="premium-copy-card">
            <p className="eyebrow">Treatment Overview</p>
            <h2>What this service is designed for.</h2>
            <p>{service.longDescription}</p>
          </article>

          <article className="premium-copy-card">
            <p className="eyebrow">Technique Background</p>
            <h2>How the service is shaped.</h2>
            <p>{service.originStory}</p>
          </article>
        </section>

        <section className="section detail-breakout scroll-reveal">
          <div className="detail-breakout-inner">
            <p className="eyebrow">Heather’s Approach</p>
            <h2>Personalized care, pressure control, and clear communication.</h2>
            <p>{service.heatherApproach}</p>
          </div>
        </section>

        <section className="section detail-info-section scroll-reveal">
          <div className="section-heading">
            <p className="eyebrow">Session Flow</p>
            <h2>What clients can expect during this treatment.</h2>
            <p>
              This section gives clients confidence before booking by explaining
              how the appointment may feel and how the service is guided.
            </p>
          </div>

          <div className="detail-flow-grid">
            {service.sessionFlow.map((item, index) => (
              <article className="expect-card" key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section detail-fit-section scroll-reveal">
          <div className="detail-fit-card">
            <div>
              <p className="eyebrow">Best Fit</p>
              <h2>Who this treatment is ideal for.</h2>
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

        <section className="section booking-section scroll-reveal">
          <div className="booking-card">
            <p className="eyebrow">Ready to Book?</p>
            <h2>Continue through ClinicSense.</h2>
            <p>
              Booking will open Heather’s secure ClinicSense system for current
              availability, service selection, and appointment details.
            </p>
            <a className="button primary" href={siteConfig.bookingUrl}>
              Book {service.name}
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