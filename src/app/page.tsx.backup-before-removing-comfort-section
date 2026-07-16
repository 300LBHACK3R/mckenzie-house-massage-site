import Image from "next/image";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionProvider } from "@/components/MotionProvider";
import {
  clientReflections,
  experiencePillars,
  faqs,
  pricingPreview,
  services,
  serviceTags,
  siteConfig,
  whatToExpect,
} from "@/lib/site";

const siteImages = {
  hero: "/images/heather-room-01.jpg",
  detail: "/images/heather-detail-01.jpg",
};

const homePageStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: `${siteConfig.businessName} | Massage Therapy in Okotoks`,
  url: siteConfig.domain,
  description: siteConfig.description,
  about: {
    "@type": "HealthAndBeautyBusiness",
    name: siteConfig.businessName,
    founder: {
      "@type": "Person",
      name: siteConfig.legalName,
    },
    areaServed: ["Okotoks, Alberta", "Calgary, Alberta"],
  },
  mainEntity: services.map((service) => ({
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "HealthAndBeautyBusiness",
      name: siteConfig.businessName,
    },
    areaServed: ["Okotoks, Alberta", "Calgary, Alberta"],
  })),
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
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

export default function Home() {
  return (
    <>
      <JsonLd data={homePageStructuredData} />
      <JsonLd data={faqStructuredData} />

      <MotionProvider />
      <Header />

      <main id="main-content">
        <section
          id="home"
          className="organic-hero"
          aria-labelledby="home-heading"
        >
          <div className="hero-media" aria-hidden="true">
            {siteConfig.assets.heroVideo ? (
              <video autoPlay muted loop playsInline preload="metadata">
                <source src={siteConfig.assets.heroVideo} type="video/mp4" />
              </video>
            ) : (
              <>
                <Image
                  className="hero-media-image"
                  src={siteImages.hero}
                  alt=""
                  fill
                  priority
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
              <span />
              Massage therapy · Calgary · Okotoks
            </p>

            <h1 id="home-heading" className="reveal-up delay-1">
              Calm, skilled massage therapy designed around your body.
            </h1>

            <p className="hero-copy reveal-up delay-2">
              A warm, professional treatment experience focused on comfort,
              communication, and personalized care.
            </p>

            <div className="hero-actions reveal-up delay-3">
              <a className="button primary" href={siteConfig.bookingUrl}>
                Book a Session
              </a>
              <a className="button secondary" href="#services">
                Explore Services
              </a>
            </div>

            <div
              className="hero-tags reveal-up delay-4"
              aria-label="Service highlights"
            >
              {serviceTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <div className="hero-stat-row reveal-up delay-5">
              <div>
                <strong>Personalized</strong>
                <span>Every session is adjusted to the client.</span>
              </div>
              <div>
                <strong>Professional</strong>
                <span>Clear booking, calm presentation, thoughtful care.</span>
              </div>
              <div>
                <strong>Okotoks-ready</strong>
                <span>Built now and ready to evolve with the new space.</span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="about"
          className="section split section-lift scroll-reveal"
          aria-labelledby="about-heading"
        >
          <div>
            <p className="eyebrow">Meet Heather</p>
            <h2 id="about-heading">
              Experienced care with a calm, personalized approach.
            </h2>
          </div>

          <div className="copy-stack premium-copy-card">
            <div className="inline-image-card" aria-hidden="true">
              <Image
                src={siteImages.detail}
                alt=""
                width={900}
                height={650}
                sizes="(max-width: 980px) 100vw, 48vw"
              />
            </div>

            <p>
              Heather’s treatments are designed to feel clear, comfortable, and
              never rushed. Each session is adapted to the client’s needs,
              pressure preference, and treatment goals.
            </p>
            <p>
              The final copy here will be shaped from Heather’s own background,
              training, treatment style, and client philosophy.
            </p>
          </div>
        </section>

        <section
          id="services"
          className="section services-section scroll-reveal"
          aria-labelledby="services-heading"
        >
          <div className="section-heading">
            <p className="eyebrow">Signature Services</p>
            <h2 id="services-heading">
              Clear treatment options clients can understand.
            </h2>
            <p>
              Each service opens into a dedicated page with room for treatment
              photos, short video, service background, technique notes, and
              booking guidance.
            </p>
          </div>

          <div className="service-grid">
            {services.map((service, index) => (
              <a
                className="service-card service-card-link"
                href={`/services/${service.slug}`}
                key={service.name}
                aria-label={`View ${service.name}`}
              >
                <div className="service-image">
                  {service.image ? (
                    <Image
                      className="service-card-image"
                      src={service.image}
                      alt=""
                      fill
                      sizes="(max-width: 980px) 100vw, 33vw"
                    />
                  ) : null}
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>

                <div className="service-content">
                  <p className="mini-eyebrow">View treatment</p>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>

                  <div
                    className="chip-row"
                    aria-label={`Best for ${service.name}`}
                  >
                    {service.bestFor.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>

                  <small>{service.pressure}</small>

                  <span className="service-link-text">Explore service →</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section
          id="expect"
          className="section expect-section scroll-reveal"
          aria-labelledby="expect-heading"
        >
          <div className="section-heading centered">
            <p className="eyebrow">What to Expect</p>
            <h2 id="expect-heading">
              A clear, comfortable experience from start to finish.
            </h2>
            <p>
              This section helps new and returning clients understand the
              treatment experience before they book.
            </p>
          </div>

          <div className="expect-grid">
            {whatToExpect.map((item, index) => (
              <article
                className="expect-card sheet-card"
                key={item.title}
                tabIndex={0}
              >
                <div className="expect-sheet" aria-hidden="true">
                  <h3>{item.title}</h3>
                  <span className="sheet-hint">Reveal details</span>
                </div>

                <div className="expect-reveal">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="comfort"
          className="section comfort-section scroll-reveal"
          aria-labelledby="comfort-heading"
        >
          <div className="comfort-inner">
            <p className="eyebrow">A Comfortable Space for Every Body</p>
            <h2 id="comfort-heading">
              Welcoming care without pressure, judgment, or intimidation.
            </h2>
            <p>
              Massage should feel approachable. Whether someone books regularly
              or is returning to bodywork after a long time away, the experience
              should feel respectful, clear, and comfortable.
            </p>
            <p>
              The photography and service copy will be created with that same
              intention: real, calming, inclusive, and professional.
            </p>
          </div>
        </section>

        <section
          id="experience"
          className="section experience-section scroll-reveal"
          aria-labelledby="experience-heading"
        >
          <div className="experience-card">
            <p className="eyebrow">The Experience</p>
            <h2 id="experience-heading">
              Comfort, clarity, and care from the moment you book.
            </h2>
            <p>
              The website will help clients understand each treatment before
              they book, see the treatment space, meet Heather, and feel
              confident choosing the service that fits their body best.
            </p>
          </div>

          <div className="experience-list">
            {experiencePillars.map((item) => (
              <div key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          id="pricing"
          className="section soft scroll-reveal"
          aria-labelledby="pricing-heading"
        >
          <div className="section-heading">
            <p className="eyebrow">Pricing</p>
            <h2 id="pricing-heading">Simple, transparent pricing.</h2>
            <p>
              Pricing will be added once Heather confirms final services,
              durations, and rates.
            </p>
          </div>

          <div className="pricing-grid">
            {pricingPreview.map((item) => (
              <div key={item.duration}>
                <strong>{item.duration}</strong>
                <span>{item.price}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          id="booking"
          className="section booking-section scroll-reveal"
          aria-labelledby="booking-heading"
        >
          <div className="booking-card">
            <p className="eyebrow">Online Booking</p>
            <h2 id="booking-heading">Book through ClinicSense.</h2>
            <p>
              Clients will be directed into Heather’s existing ClinicSense
              booking system, where availability, services, intake, and
              scheduling remain securely managed.
            </p>
            <a className="button primary" href={siteConfig.bookingUrl}>
              Open Booking
            </a>
          </div>
        </section>

        <section
          id="faq"
          className="section faq-section scroll-reveal"
          aria-labelledby="faq-heading"
        >
          <div className="section-heading">
            <p className="eyebrow">Questions</p>
            <h2 id="faq-heading">Helpful answers before clients book.</h2>
            <p>
              These FAQs will be refined once Heather confirms policies,
              booking details, location wording, and service information.
            </p>
          </div>

          <div className="faq-list">
            {faqs.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section
          id="contact"
          className="section split section-lift scroll-reveal"
          aria-labelledby="contact-heading"
        >
          <div>
            <p className="eyebrow">Okotoks Launch</p>
            <h2 id="contact-heading">
              Built now. Ready to evolve with the new space.
            </h2>
          </div>

          <div className="copy-stack premium-copy-card">
            <p>
              Current treatment footage can show Heather’s work, technique, and
              care while the final Okotoks room imagery can be added once the
              new space is ready.
            </p>
            <p>
              The website and Google Business Profile will be kept consistent
              through the transition.
            </p>
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
