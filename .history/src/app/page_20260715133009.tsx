import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { services, serviceTags, siteConfig } from "@/lib/site";

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <section id="home" className="luxury-hero">
          <div className="hero-video-layer" aria-hidden="true">
            {siteConfig.heroVideo ? (
              <video autoPlay muted loop playsInline preload="metadata">
                <source src={siteConfig.heroVideo} type="video/mp4" />
              </video>
            ) : (
              <div className="hero-video-placeholder" />
            )}
            <div className="hero-overlay" />
            <div className="hero-pattern" />
          </div>

          <div className="luxury-hero-inner">
            <p className="hero-pill">
              <span />
              Massage therapy · Okotoks · Calgary
            </p>

            <h1>Restore. Release. Return to yourself.</h1>

            <p className="hero-copy">
              A calm, professional massage experience designed around comfort,
              communication, and personalized care.
            </p>

            <div className="hero-actions">
              <a className="button primary" href={siteConfig.bookingUrl}>
                Book a Session
              </a>
              <a className="button glass" href="#services">
                Explore Services
              </a>
            </div>

            <div className="hero-tags" aria-label="Service highlights">
              {serviceTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>

          <div className="scroll-cue" aria-hidden="true">
            <span>Scroll</span>
            <i />
          </div>
        </section>

        <section id="about" className="section split">
          <div>
            <p className="eyebrow">Meet Heather</p>
            <h2>Experienced care with a calm, personalized approach.</h2>
          </div>
          <div>
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
                <div className="service-image">Service image</div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <span>{service.bestFor}</span>
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
            <div>
              <strong>Personalized pressure</strong>
              <span>Each session is adjusted to the client’s comfort level.</span>
            </div>
            <div>
              <strong>Clear service guidance</strong>
              <span>Descriptions will explain what each treatment is for.</span>
            </div>
            <div>
              <strong>Professional presentation</strong>
              <span>Photography and video will show the treatment experience.</span>
            </div>
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
            <div>
              <strong>60 minutes</strong>
              <span>Price to confirm</span>
            </div>
            <div>
              <strong>90 minutes</strong>
              <span>Price to confirm</span>
            </div>
            <div>
              <strong>120 minutes</strong>
              <span>Price to confirm</span>
            </div>
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
          <div>
            <p>
              Current treatment footage can be used to show Heather’s work,
              technique, and care while the final Okotoks room imagery can be
              added once the new space is ready.
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