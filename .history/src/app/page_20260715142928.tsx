import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
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

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <section id="home" className="organic-hero">
          <div className="hero-media" aria-hidden="true">
            {siteConfig.heroVideo ? (
              <video autoPlay muted loop playsInline preload="metadata">
                <source src={siteConfig.heroVideo} type="video/mp4" />
              </video>
            ) : (
              <div className="hero-media-placeholder" />
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

            <h1 className="reveal-up delay-1">
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

          <aside
            className="hero-side-card reveal-soft"
            aria-label="Okotoks move note"
          >
            <strong>Preparing for Okotoks</strong>
            <span>
              Built now with room to update the final treatment-space photos
              once the new location is ready.
            </span>
          </aside>
        </section>

        <section id="about" className="section split section-lift">
          <div>
            <p className="eyebrow">Meet Heather</p>
            <h2>Experienced care with a calm, personalized approach.</h2>
          </div>

          <div className="copy-stack premium-copy-card">
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

        <section id="services" className="section services-section">
          <div className="section-heading">
            <p className="eyebrow">Signature Services</p>
            <h2>Clear treatment options clients can understand.</h2>
            <p>
              Each service will be written in plain, calming language so clients
              know what to book and what to expect.
            </p>
          </div>

          <div className="service-grid">
            {services.map((service, index) => (
              <article className="service-card" key={service.name}>
                <div className="service-image">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>

                <div className="service-content">
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>

                  <div className="chip-row" aria-label={`Best for ${service.name}`}>
                    {service.bestFor.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>

                  <small>{service.pressure}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="expect" className="section expect-section">
          <div className="section-heading centered">
            <p className="eyebrow">What to Expect</p>
            <h2>A clear, comfortable experience from start to finish.</h2>
            <p>
              This section helps new and returning clients understand the
              treatment experience before they book.
            </p>
          </div>

          <div className="expect-grid">
            {whatToExpect.map((item, index) => (
              <article className="expect-card" key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="comfort" className="section comfort-section">
          <div className="comfort-inner">
            <p className="eyebrow">A Comfortable Space for Every Body</p>
            <h2>Welcoming care without pressure, judgment, or intimidation.</h2>
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

        <section id="experience" className="section experience-section">
          <div className="experience-card">
            <p className="eyebrow">The Experience</p>
            <h2>Comfort, clarity, and care from the moment you book.</h2>
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

        <section id="pricing" className="section soft">
          <div className="section-heading">
            <p className="eyebrow">Pricing</p>
            <h2>Simple, transparent pricing.</h2>
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

        <section id="reviews" className="section reviews-section">
          <div className="section-heading centered">
            <p className="eyebrow">Client Reflections</p>
            <h2>Word-of-mouth trust, carried into the website.</h2>
            <p>
              Approved review highlights can be added here later to support the
              trust Heather has already built with clients.
            </p>
          </div>

          <div className="review-grid">
            {clientReflections.map((review) => (
              <article className="review-card" key={review.label}>
                <div className="stars" aria-label="Review highlight">
                  ★★★★★
                </div>
                <p>“{review.quote}”</p>
                <small>{review.label}</small>
              </article>
            ))}
          </div>
        </section>

        <section id="booking" className="section booking-section">
          <div className="booking-card">
            <p className="eyebrow">Online Booking</p>
            <h2>Book through ClinicSense.</h2>
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

        <section id="faq" className="section faq-section">
          <div className="section-heading">
            <p className="eyebrow">Questions</p>
            <h2>Helpful answers before clients book.</h2>
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

        <section id="contact" className="section split section-lift">
          <div>
            <p className="eyebrow">Okotoks Launch</p>
            <h2>Built now. Ready to evolve with the new space.</h2>
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