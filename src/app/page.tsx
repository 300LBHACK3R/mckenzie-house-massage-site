import Image from "next/image";
import {
  Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionProvider } from "@/components/MotionProvider";
import {
  faqs,
  pricingGroups,
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
              Massage therapy · Prestwick Calgary · Okotoks-ready
            </p>

            <h1 id="home-heading" className="reveal-up delay-1">
              Massage that adapts to you — not the other way around.
            </h1>

            <p className="hero-copy reveal-up delay-2">
              A calm, client-led massage experience built around pressure preference, comfort, communication, and what your body needs that day.
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
                <span>Every appointment is shaped around the person booking.</span>
              </div>
              <div>
                <strong>Professional</strong>
                <span>A professional space where pressure, comfort, and goals are discussed clearly.</span>
              </div>
              <div>
                <strong>Okotoks-ready</strong>
                <span>Located in Prestwick now, with future Okotoks details to be confirmed.</span>
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
            <p className="eyebrow">Services</p>
            <h2 id="services-heading">
              Choose a treatment style, then Heather customizes the session.
            </h2>
            <p>
              Massage is kept simple and client-led. Instead of forcing every
              person into a rigid category, Heather listens first, adjusts
              pressure, adapts positioning, and builds the appointment around
              what the client actually needs.
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
              A massage experience built around communication, consent, and comfort.
            </h2>
            <p>
              A simple look at how Heather listens, protects hands-on time, adapts pressure, and shapes each appointment around the client.
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
          id="pricing"
          className="section pricing-menu-luxury scroll-reveal"
          aria-labelledby="pricing-heading"
        >
          <div className="pricing-menu-luxury__intro">
            <p className="eyebrow">Pricing</p>

            <h2 id="pricing-heading">
              Clear pricing, simple durations, no guessing.
            </h2>

            <p>
              Clients can choose the treatment style and appointment length that
              fits best before continuing into Heather’s ClinicSense booking
              system.
            </p>
          </div>

          <div className="pricing-menu-luxury__shell">
            <aside className="pricing-menu-luxury__feature">
              <span>Booking clarity</span>

              <h3>Rates are listed by service and duration.</h3>

              <p>
                Massage is kept simple and client-led. The client chooses the
                service and length, then Heather customizes the treatment around
                pressure, comfort, positioning, and goals.
              </p>

              <div className="pricing-menu-luxury__meta">
                <div>
                  <small>Location</small>
                  <strong>{siteConfig.location}</strong>
                </div>

                <div>
                  <small>Hours</small>
                  <strong>Tuesday-Friday · 10:00 AM-4:30 PM</strong>
                </div>

                <div>
                  <small>Flexible</small>
                  <strong>Text for possible Saturday, Sunday, or Monday times</strong>
                </div>
              </div>
            </aside>

            <div className="pricing-menu-luxury__cards">
              {pricingGroups.map((group) => (
                <article className="pricing-menu-card" key={group.name}>
                  <header>
                    <span>Service</span>
                    <h3>{group.name}</h3>
                    {group.note ? <p>{group.note}</p> : null}
                  </header>

                  <div className="pricing-menu-card__rows">
                    {group.prices.map((item) => (
                      <div
                        className="pricing-menu-card__row"
                        key={group.name + item.duration}
                      >
                        <strong>{item.duration}</strong>
                        <span>{item.price}</span>
                      </div>
                    ))}
                  </div>
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
              Clients will be directed into Heather’s ClinicSense booking system once the final booking link is connected. For questions about flexible availability, service fit, or times outside the listed hours, clients can text Heather directly.
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
              These answers help clients understand location, booking, treatment style, pressure, youth appointments, and Heather’s client-led approach before they book.
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








