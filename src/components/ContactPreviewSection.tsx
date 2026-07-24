import { siteConfig } from "@/lib/site";

export function ContactPreviewSection() {
  const cleanPhone = siteConfig.phone.replace(/[^\d+]/g, "");

  return (
    <section
      id="contact"
      className="section contact-luxury scroll-reveal"
      aria-labelledby="contact-heading"
    >
      <div className="contact-luxury__shell">
        <div className="contact-luxury__copy">
          <p className="eyebrow">Contact Heather</p>

          <h2 id="contact-heading">
            Questions before booking? Reach out directly.
          </h2>

          <p>
            Ask about service fit, direct billing, appointment lengths,
            pressure preferences, pregnancy or postpartum care, youth
            appointments, or anything else that would help you feel comfortable
            before booking.
          </p>

          <div className="contact-luxury__actions">
            <a className="button primary" href="/contact">
              Contact Heather
            </a>

            <a className="button secondary" href={`sms:${cleanPhone}`}>
              Text Heather
            </a>

            <a className="button secondary" href={`mailto:${siteConfig.email}`}>
              Email
            </a>
          </div>
        </div>

        <div className="contact-luxury__panel" aria-label="Contact details">
          <article>
            <span>Phone</span>
            <a href={`tel:${cleanPhone}`}>{siteConfig.phone}</a>
            <p>Texting is usually the easiest way to ask a quick question.</p>
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
              Near Prestwick Pond. Exact appointment details are provided
              through the booking process.
            </p>
          </article>

          <article>
            <span>Hours</span>
            <strong>Tuesday to Friday</strong>
            <p>10:00 AMâ€“4:30 PM. Flexible by text when available.</p>
          </article>
        </div>
      </div>
    </section>
  );
}