import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { services, siteConfig } from "@/lib/site";

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <section id="home" className="hero">
          <div className="hero-content">
            <p className="eyebrow">Massage therapy in Calgary & Okotoks</p>
            <h1>Calm, skilled massage therapy designed around your body.</h1>
            <p className="hero-copy">
              A premium, client-centered treatment experience focused on
              comfort, communication, and restorative care.
            </p>

            <div className="hero-actions">
              <a className="button primary" href={siteConfig.bookingUrl}>
                Book Now
              </a>
              <a className="button secondary" href="#services">
                View Services
              </a>
            </div>
          </div>

          <div className="hero-card">
            <div className="image-placeholder">
              Homepage video / treatment-room photo
            </div>
            <div className="hero-note">
              <strong>Moving to Okotoks</strong>
              <span>Website and Google profile will be prepared for launch.</span>
            </div>
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
            <p className="eyebrow">Services</p>
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
            <p className="eyebrow">Contact</p>
            <h2>Current location details and Okotoks updates.</h2>
          </div>
          <div>
            <p>
              Current and future location wording will be finalized after
              Heather confirms what should be public.
            </p>
            <p>
              The Google Business Profile and website will be kept consistent
              for the Okotoks move.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
