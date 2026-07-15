import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  experiencePillars,
  pricingPreview,
  services,
  serviceTags,
  siteConfig,
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
          </div>

          <div className="hero-inner">
            <p className="hero-pill">
              <span />
              Massage therapy · Calgary · Okotoks
            </p>

            <h1>Calm, skilled massage therapy designed around your body.</h1>

            <p className="hero-copy">
              A warm, professional treatment experience focused on comfort,
              communication, and personalized care.
            </p>

            <div className="hero-actions">
              <a className="button primary" href={siteConfig.bookingUrl}>
                Book a Session
              </a>
              <a className="button secondary" href="#services">
                Explore Services
              </a>
            </div>

            <div className="hero-tags" aria-label="Service highlights">
              {serviceTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>

          <aside className="hero-side-card" aria-label="Okotoks move note">
            <strong>Moving to Okotoks</strong>
            <span>
              Built now with room to update the final treatment-space photos
              once the new location is ready.
            </span>
          </aside>
        </section>

        <section id="about" className="section split">
          <div>
            <p className="eyebrow">Meet Heather</p>
            <h2>Experienced care with a calm, personalized approach.</h2>
          </div>

          <div className="copy-stack">
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

        <section id="services" className="section">
          <div className="section-heading">
            <p className="eyebrow">Signature Services</p>
            <h2>Clear treatment options clients can understand.</h2>
            <p>
              Each service will be written in plain, calming language so clients
              know what to book and what to expect.
            </p>
          </div>

          <div className="service-grid">
            {services.map((service) => (
              <article className="service-card" key={service.name}>
                <div className="service-image">
                  <span>Service image</span>
                </div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <small>{service.bestFor}</small>
              </article>
            ))}
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

        <section id="booking" className="section booking">
          <p className="eyebrow">Online Booking</p>
          <h2>Book through ClinicSense.</h2>
          <p>
            Clients will be directed into Heather’s existing ClinicSense booking
            system, where availability, services, intake, and scheduling remain
            securely managed.
          </p>
          <a className="button primary" href={siteConfig.bookingUrl}>
            Open Booking
          </a>
        </section>

        <section id="contact" className="section split">
          <div>
            <p className="eyebrow">Okotoks Launch</p>
            <h2>Built now. Ready to evolve with the new space.</h2>
          </div>

          <div className="copy-stack">
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

      <Footer />
    </>
  );
}