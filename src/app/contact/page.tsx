import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MotionProvider } from "@/components/MotionProvider";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `Contact Heather | ${siteConfig.businessName}`,
  description:
    "Contact Heather at McKenzie House Massage in Prestwick, Calgary for booking questions, direct billing questions, service fit, and appointment details.",
  alternates: {
    canonical: `${siteConfig.domain}/contact`,
  },
  openGraph: {
    title: `Contact Heather | ${siteConfig.businessName}`,
    description:
      "Text, call, email, or send Heather a private website message before booking your massage appointment.",
    url: `${siteConfig.domain}/contact`,
    type: "website",
    images: [
      {
        url: siteConfig.assets.openGraphImage,
        width: 1200,
        height: 630,
        alt: siteConfig.businessName,
      },
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

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="contact-page-arrow"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M7 17 17 7M17 7H8m9 0v9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ContactIcon({ type }: { type: "phone" | "email" | "location" | "clock" }) {
  if (type === "phone") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path
          d="M7.4 3.8 5.8 5.4c-.9.9-.9 2.4-.2 4 1.4 3.2 5.8 7.6 9 9 .9.4 1.8.7 2.6.7.8 0 1.4-.2 1.9-.7l1.5-1.5c.6-.6.5-1.6-.2-2.1l-3.3-2.4c-.6-.4-1.4-.4-1.9.1l-1.1 1.1c-1.6-.8-3.4-2.6-4.2-4.2L11 8.3c.5-.5.6-1.3.1-1.9L9 3.9c-.4-.6-1.1-.6-1.6-.1Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "email") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <rect
          x="3.5"
          y="5"
          width="17"
          height="14"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="m5 7 7 5 7-5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "location") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path
          d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="10"
          r="2.4"
          stroke="currentColor"
          strokeWidth="1.7"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 7.5V12l3 2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ContactPage() {
  const cleanPhone = siteConfig.phone.replace(/[^\d+]/g, "");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${siteConfig.businessName}`,
    url: `${siteConfig.domain}/contact`,
    about: {
      "@type": "HealthAndBeautyBusiness",
      name: siteConfig.businessName,
      telephone: siteConfig.phone,
      email: siteConfig.email,
      address: {
        "@type": "PostalAddress",
        addressLocality: siteConfig.primaryCity,
        addressRegion: siteConfig.region,
        addressCountry: siteConfig.country,
      },
    },
  };

  return (
    <>
      <JsonLd data={structuredData} />

      <MotionProvider />
      <Header />

      <main id="main-content" className="contact-page premium-contact-page">
        <section
          className="contact-page-hero premium-contact-hero"
          aria-labelledby="contact-page-heading"
        >
          <div className="premium-contact-hero__grid" aria-hidden="true" />
          <div
            className="premium-contact-hero__orb premium-contact-hero__orb--one"
            aria-hidden="true"
          />
          <div
            className="premium-contact-hero__orb premium-contact-hero__orb--two"
            aria-hidden="true"
          />
          <div
            className="premium-contact-hero__mark"
            aria-hidden="true"
          />

          <div className="contact-page-hero__inner premium-contact-hero__inner">
            <div className="contact-page-hero__copy premium-contact-hero__copy">
              <div className="premium-contact-hero__eyebrow hero-contact-reveal hero-contact-delay-1">
                <span />
                Contact Heather
              </div>

              <h1
                id="contact-page-heading"
                className="hero-contact-reveal hero-contact-delay-2"
              >
                A calm first step
                <span> before your appointment.</span>
              </h1>

              <p className="hero-contact-reveal hero-contact-delay-3">
                Ask about service fit, direct billing, pressure preferences,
                pregnancy or postpartum care, youth appointments, or anything
                else that would help you feel comfortable before booking.
              </p>

              <div className="premium-contact-hero__actions hero-contact-reveal hero-contact-delay-4">
                <a className="button primary premium-contact-button" href="#contact-form">
                  Send a Message
                  <ArrowIcon />
                </a>

                <a
                  className="button secondary premium-contact-button"
                  href={`sms:${cleanPhone}`}
                >
                  Text Heather
                  <ArrowIcon />
                </a>
              </div>

              <div className="premium-contact-hero__proof hero-contact-reveal hero-contact-delay-5">
                <div>
                  <span>01</span>
                  <p>
                    <strong>Direct response</strong>
                    Heather replies personally.
                  </p>
                </div>

                <div>
                  <span>02</span>
                  <p>
                    <strong>Clear guidance</strong>
                    Get help choosing the right service.
                  </p>
                </div>

                <div>
                  <span>03</span>
                  <p>
                    <strong>No pressure</strong>
                    Ask questions before committing.
                  </p>
                </div>
              </div>
            </div>

            <aside className="contact-page-hero__card premium-contact-card hero-contact-reveal hero-contact-delay-4">
              <div className="premium-contact-card__glow" aria-hidden="true" />

              <span className="premium-contact-card__label">Best first step</span>

              <h2>Text Heather directly.</h2>

              <p>
                Texting is usually the easiest way to ask a quick question,
                confirm details, or feel more comfortable before booking.
              </p>

              <a
                className="premium-contact-card__link"
                href={`sms:${cleanPhone}`}
              >
                {siteConfig.phone}
                <ArrowIcon />
              </a>

              <div className="premium-contact-card__availability">
                <span className="premium-contact-card__pulse" />
                Tuesdayâ€“Friday Â· 10:00 AMâ€“4:30 PM
              </div>
            </aside>
          </div>
        </section>

        <section
          className="section contact-page-details premium-contact-details scroll-reveal"
          aria-label="Contact details"
        >
          <article>
            <div className="premium-contact-detail__icon">
              <ContactIcon type="phone" />
            </div>
            <span>Phone</span>
            <a href={`tel:${cleanPhone}`}>{siteConfig.phone}</a>
            <p>Text or call with questions before booking.</p>
          </article>

          <article>
            <div className="premium-contact-detail__icon">
              <ContactIcon type="email" />
            </div>
            <span>Email</span>
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            <p>Best for longer questions or appointment details.</p>
          </article>

          <article>
            <div className="premium-contact-detail__icon">
              <ContactIcon type="location" />
            </div>
            <span>Location</span>
            <strong>Prestwick, Calgary</strong>
            <p>
              Near Prestwick Pond. Exact details are shared through booking.
            </p>
          </article>

          <article>
            <div className="premium-contact-detail__icon">
              <ContactIcon type="clock" />
            </div>
            <span>Hours</span>
            <strong>Tuesday to Friday</strong>
            <p>10:00 AMâ€“4:30 PM. Flexible by text when available.</p>
          </article>
        </section>

        <ContactForm />

        <section
          className="section contact-page-note premium-contact-note scroll-reveal"
          aria-labelledby="contact-note-heading"
        >
          <div className="contact-page-note__inner premium-contact-note__inner">
            <div className="premium-contact-note__mark" aria-hidden="true" />

            <p className="eyebrow">Before You Book</p>

            <h2 id="contact-note-heading">
              Not sure which service to choose?
            </h2>

            <p>
              Send Heather a quick message. She can help you choose the right
              appointment length, talk through comfort or pressure preferences,
              and answer questions about direct billing before you book.
            </p>

            <div className="contact-page-note__actions">
              <a className="button primary premium-contact-button" href={`sms:${cleanPhone}`}>
                Text Heather
                <ArrowIcon />
              </a>

              <a className="button secondary premium-contact-button" href={siteConfig.bookingUrl}>
                Book Now
                <ArrowIcon />
              </a>
            </div>
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