import Image from "next/image";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionProvider } from "@/components/MotionProvider";
import {
  faqs,
  pricingPreview,
  services,
  serviceTags,
  siteConfig,
  whatToExpect,
} from "@/lib/site";

const siteImages = {
  hero: siteConfig.assets.heroImage,
  detail: siteConfig.assets.detailImage,
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
        </section>        <section
          id="about"
          className="section meet-heather-luxury scroll-reveal"
          aria-labelledby="about-heading"
        >
          <div className="meet-heather-luxury__media">
            <div className="meet-heather-luxury__image-frame">
              <Image
                src={siteImages.detail}
                alt="Heather from McKenzie House Massage"
                width={980}
                height={720}
                sizes="(max-width: 980px) 100vw, 48vw"
              />
            </div>

            <div className="meet-heather-luxury__badge">
              <span>Personalized</span>
              <strong>Client-led care</strong>
            </div>
          </div>

          <div className="meet-heather-luxury__copy">
            <p className="eyebrow">Meet Heather</p>

            <h2 id="about-heading">
              Calm, thoughtful massage therapy shaped around each client.
            </h2>

            <p className="meet-heather-luxury__lead">
              Heather’s treatments are designed to feel clear, comfortable, and
              never rushed. Each session is adapted to the client’s needs,
              pressure preference, comfort level, and treatment goals.
            </p>

            <div className="meet-heather-luxury__quote">
              <p>
                “The goal is a treatment experience that feels professional,
                grounded, and easy to understand from the moment a client books.”
              </p>
            </div>

            <div className="meet-heather-luxury__details">
              <div>
                <span>Approach</span>
                <strong>Calm, personalized care</strong>
              </div>
              <div>
                <span>Focus</span>
                <strong>Comfort, pressure, communication</strong>
              </div>
              <div>
                <span>Booking</span>
                <strong>Connected through ClinicSense</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>Calgary / Okotoks</strong>
              </div>
            </div>
          </div>
        </section>

        <section
          id="experience"
          className="section expect-section scroll-reveal"
          aria-labelledby="experience-heading"
        >
          <div className="section-heading centered">
            <p className="eyebrow">The Experience</p>
            <h2 id="experience-heading">
              A clear, comfortable experience from start to finish.
            </h2>
            <p>
              A simple look at how the appointment flows, how pressure is guided, and how comfort is handled from start to finish.
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
        </section>        <section
          id="pricing"
          className="section pricing-luxury scroll-reveal"
          aria-labelledby="pricing-heading"
        >
          <div className="pricing-luxury__intro">
            <p className="eyebrow">Pricing</p>

            <h2 id="pricing-heading">
              Simple, transparent pricing before clients book.
            </h2>

            <p>
              Final rates will be added once Heather confirms her service menu,
              treatment durations, and ClinicSense booking setup.
            </p>
          </div>

          <div className="pricing-luxury__panel">
            <div className="pricing-luxury__note">
              <span>Clear booking experience</span>
              <p>
                Clients should be able to understand session length, service
                options, and pricing before they continue into online booking.
              </p>
            </div>

            <div className="pricing-luxury__grid">
              {pricingPreview.map((item) => (
                <article className="pricing-luxury__card" key={item.duration}>
                  <span>{item.duration}</span>
                  <strong>{item.price}</strong>
                  <p>
                    {item.price === "Price to confirm"
                      ? "Final rate to be confirmed before launch."
                      : "Available through online booking once connected."}
                  </p>
                </article>
              ))}
            </div>
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
      </main>

      <a className="mobile-sticky-book" href={siteConfig.bookingUrl}>
        Book Now
      </a>

      <Footer />
    </>
  );
}








