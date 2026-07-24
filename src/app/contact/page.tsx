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

      <main id="main-content" className="contact-page">
        <section
          className="contact-page-hero"
          aria-labelledby="contact-page-heading"
        >
          <div className="contact-page-hero__inner">
            <div className="contact-page-hero__copy">
              <p className="eyebrow">Contact Heather</p>

              <h1 id="contact-page-heading">
                Ask a question, confirm comfort, or book with confidence.
              </h1>

              <p>
                New and returning clients are welcome to reach out before
                booking. Heather can help with service fit, direct-billing
                questions, pressure preferences, pregnancy or postpartum care,
                youth appointments, and general appointment details.
              </p>

              <div className="contact-page-hero__actions">
                <a className="button primary" href={`sms:${cleanPhone}`}>
                  Text Heather
                </a>

                <a className="button secondary" href={`tel:${cleanPhone}`}>
                  Call Heather
                </a>

                <a
                  className="button secondary"
                  href={`mailto:${siteConfig.email}`}
                >
                  Email
                </a>
              </div>
            </div>

            <aside className="contact-page-hero__card">
              <span>Best first step</span>
              <h2>Text Heather directly.</h2>
              <p>
                Texting is usually the easiest way to ask a quick question,
                confirm details, or feel more comfortable before booking.
              </p>
            </aside>
          </div>
        </section>

        <section
          className="section contact-page-details scroll-reveal"
          aria-label="Contact details"
        >
          <article>
            <span>Phone</span>
            <a href={`tel:${cleanPhone}`}>{siteConfig.phone}</a>
            <p>Text or call with questions before booking.</p>
          </article>

          <article>
            <span>Email</span>
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            <p>Best for longer questions or appointment details.</p>
          </article>

          <article>
            <span>Location</span>
            <strong>Prestwick, Calgary</strong>
            <p>
              Near Prestwick Pond. Exact appointment details are shared through
              booking.
            </p>
          </article>

          <article>
            <span>Hours</span>
            <strong>Tuesday to Friday</strong>
            <p>10:00 AMâ€“4:30 PM. Flexible by text when available.</p>
          </article>
        </section>

        <ContactForm />

        <section
          className="section contact-page-note scroll-reveal"
          aria-labelledby="contact-note-heading"
        >
          <div className="contact-page-note__inner">
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
              <a className="button primary" href={`sms:${cleanPhone}`}>
                Text Heather
              </a>

              <a className="button secondary" href={siteConfig.bookingUrl}>
                Book Now
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