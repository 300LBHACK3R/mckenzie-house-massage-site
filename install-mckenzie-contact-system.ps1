$ErrorActionPreference = "Stop"

$ProjectRoot = "C:\Users\techn\heather-massage-site"

if (-not (Test-Path $ProjectRoot)) {
    throw "Project folder not found: $ProjectRoot"
}

Set-Location $ProjectRoot

function Write-Utf8NoBom {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Content
    )

    $directory = Split-Path -Parent $Path

    if ($directory -and -not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

Write-Host ""
Write-Host "Installing the complete McKenzie House Massage contact system..." -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------------------------
# 1. HOMEPAGE CONTACT PREVIEW COMPONENT
# ---------------------------------------------------------------------------

$contactPreview = @'
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
            <p>10:00 AM–4:30 PM. Flexible by text when available.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
'@

Write-Utf8NoBom `
    -Path "src/components/ContactPreviewSection.tsx" `
    -Content $contactPreview

# ---------------------------------------------------------------------------
# 2. WORKING CONTACT FORM
# ---------------------------------------------------------------------------

$contactForm = @'
"use client";

import { FormEvent, useState } from "react";
import styles from "./ContactForm.module.css";

type SubmissionState = "idle" | "submitting" | "success" | "error";

type ContactApiResponse = {
  ok?: boolean;
  message?: string;
};

export function ContactForm() {
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmissionState("submitting");
    setStatusMessage("Sending your message…");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          service: formData.get("service"),
          preferredContact: formData.get("preferredContact"),
          message: formData.get("message"),
          website: formData.get("website"),
        }),
      });

      let result: ContactApiResponse = {};

      try {
        result = (await response.json()) as ContactApiResponse;
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Your message could not be sent. Please text or email Heather directly.",
        );
      }

      form.reset();
      setSubmissionState("success");
      setStatusMessage(
        result.message ||
          "Thank you. Your message has been sent to Heather successfully.",
      );
    } catch (error) {
      setSubmissionState("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Your message could not be sent. Please text or email Heather directly.",
      );
    }
  }

  const isSubmitting = submissionState === "submitting";

  return (
    <section
      className={styles.section}
      aria-labelledby="contact-form-heading"
    >
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Send a Message</p>

        <h2 id="contact-form-heading">
          Tell Heather what you need help with.
        </h2>

        <p>
          Use this form for service questions, direct-billing questions,
          appointment details, pressure preferences, or help choosing the right
          booking length.
        </p>

        <div className={styles.trustList}>
          <div>
            <span>Response</span>
            <strong>Heather replies directly</strong>
          </div>

          <div>
            <span>Privacy</span>
            <strong>Your message is sent privately</strong>
          </div>

          <div>
            <span>Booking</span>
            <strong>No appointment is created by this form</strong>
          </div>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.twoColumn}>
          <label className={styles.field}>
            <span>Name *</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              maxLength={80}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Email *</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              maxLength={160}
              required
            />
          </label>
        </div>

        <div className={styles.twoColumn}>
          <label className={styles.field}>
            <span>Phone</span>
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              maxLength={40}
            />
          </label>

          <label className={styles.field}>
            <span>Preferred reply</span>
            <select name="preferredContact" defaultValue="Email">
              <option value="Email">Email</option>
              <option value="Text">Text</option>
              <option value="Phone call">Phone call</option>
            </select>
          </label>
        </div>

        <label className={styles.field}>
          <span>What can Heather help with?</span>
          <select name="service" defaultValue="General question">
            <option value="General question">General question</option>
            <option value="Massage">Massage</option>
            <option value="Seasonal Body Scrub">
              Seasonal Body Scrub, Rinse &amp; Moisturizing
            </option>
            <option value="Hair Play & Back Scratches">
              Hair Play &amp; Back Scratches
            </option>
            <option value="Cup & Buff">Cup &amp; Buff</option>
            <option value="Direct billing">Direct billing</option>
            <option value="Booking help">Booking help</option>
          </select>
        </label>

        <label className={styles.field}>
          <span>Message *</span>
          <textarea
            name="message"
            rows={7}
            minLength={10}
            maxLength={2500}
            placeholder="Share your question, preferred appointment details, or anything Heather should know before replying."
            required
          />
        </label>

        <label className={styles.honeypot} aria-hidden="true">
          <span>Website</span>
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>

        <div className={styles.footer}>
          <button
            className="button primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending…" : "Send Message"}
          </button>

          <p>
            For urgent scheduling questions, texting Heather is usually the
            fastest option.
          </p>
        </div>

        <p
          className={[
            styles.status,
            submissionState === "success" ? styles.success : "",
            submissionState === "error" ? styles.error : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-live="polite"
          role="status"
        >
          {statusMessage}
        </p>
      </form>
    </section>
  );
}
'@

Write-Utf8NoBom `
    -Path "src/components/ContactForm.tsx" `
    -Content $contactForm

# ---------------------------------------------------------------------------
# 3. CONTACT FORM STYLES
# ---------------------------------------------------------------------------

$contactFormStyles = @'
.section {
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.15fr);
  gap: clamp(1rem, 3vw, 2rem);
  width: min(calc(100% - 2rem), 1240px);
  margin: 0 auto;
  padding: clamp(4.5rem, 7vw, 7rem) 0;
}

.intro,
.form {
  position: relative;
  overflow: hidden;
  border-radius: clamp(1.4rem, 2vw, 1.9rem);
  box-shadow: 0 28px 90px rgba(35, 31, 24, 0.13);
}

.intro {
  display: grid;
  align-content: center;
  gap: 1.15rem;
  padding: clamp(1.5rem, 4vw, 3.2rem);
  border: 1px solid rgba(236, 213, 151, 0.17);
  background:
    radial-gradient(circle at 15% 15%, rgba(220, 185, 100, 0.18), transparent 24rem),
    linear-gradient(145deg, #0a170d, #18301b);
  color: #fffaf0;
}

.intro::before,
.form::before {
  position: absolute;
  inset: 0;
  content: "";
  pointer-events: none;
  background: url("/brand/mckenzie-house-mark.png") center / 175px 175px repeat;
  opacity: 0.025;
}

.intro > *,
.form > * {
  position: relative;
  z-index: 1;
}

.eyebrow {
  margin: 0;
  color: #dfc47d;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.intro h2 {
  max-width: 620px;
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2.6rem, 5vw, 5.7rem);
  font-weight: 500;
  line-height: 0.92;
  letter-spacing: -0.07em;
  text-wrap: balance;
}

.intro > p {
  max-width: 620px;
  margin: 0;
  color: rgba(255, 250, 240, 0.72);
  font-size: 1rem;
  line-height: 1.75;
}

.trustList {
  display: grid;
  gap: 0.7rem;
  margin-top: 0.5rem;
}

.trustList div {
  display: grid;
  gap: 0.25rem;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(239, 220, 168, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.035);
}

.trustList span {
  color: #d8bd76;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.trustList strong {
  color: #fffaf0;
  font-size: 0.96rem;
  font-weight: 650;
}

.form {
  display: grid;
  gap: 1rem;
  padding: clamp(1.25rem, 3.5vw, 2.7rem);
  border: 1px solid rgba(42, 58, 36, 0.13);
  background:
    radial-gradient(circle at top right, rgba(205, 172, 99, 0.13), transparent 23rem),
    linear-gradient(145deg, rgba(255, 252, 244, 0.98), rgba(241, 229, 204, 0.95));
}

.twoColumn {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.48rem;
}

.field span {
  color: #263724;
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  min-height: 3.35rem;
  border: 1px solid rgba(45, 64, 40, 0.18);
  border-radius: 0.95rem;
  outline: none;
  background: rgba(255, 253, 247, 0.82);
  color: #251b15;
  font: inherit;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background 160ms ease;
}

.field input,
.field select {
  padding: 0 1rem;
}

.field textarea {
  min-height: 10rem;
  resize: vertical;
  padding: 0.95rem 1rem;
  line-height: 1.6;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: rgba(55, 87, 50, 0.7);
  background: #fffdf8;
  box-shadow: 0 0 0 4px rgba(74, 108, 67, 0.11);
}

.field input::placeholder,
.field textarea::placeholder {
  color: rgba(45, 48, 41, 0.48);
}

.honeypot {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.25rem;
}

.footer button:disabled {
  cursor: wait;
  opacity: 0.68;
}

.footer p {
  max-width: 390px;
  margin: 0;
  color: rgba(44, 51, 38, 0.64);
  font-size: 0.84rem;
  line-height: 1.55;
  text-align: right;
}

.status {
  min-height: 1.5rem;
  margin: 0;
  color: rgba(44, 51, 38, 0.72);
  font-size: 0.92rem;
  font-weight: 700;
}

.success {
  color: #245629;
}

.error {
  color: #8b2f2f;
}

@media (max-width: 960px) {
  .section {
    grid-template-columns: 1fr;
  }

  .intro h2 {
    font-size: clamp(2.8rem, 10vw, 5rem);
  }
}

@media (max-width: 640px) {
  .section {
    width: min(calc(100% - 1rem), 1240px);
    padding: 3.5rem 0;
  }

  .twoColumn {
    grid-template-columns: 1fr;
  }

  .footer {
    align-items: stretch;
    flex-direction: column;
  }

  .footer p {
    text-align: left;
  }
}
'@

Write-Utf8NoBom `
    -Path "src/components/ContactForm.module.css" `
    -Content $contactFormStyles

# ---------------------------------------------------------------------------
# 4. RESEND API ROUTE
# ---------------------------------------------------------------------------

$contactApiRoute = @'
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  service: string;
  preferredContact: string;
  message: string;
  website: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(
  source: Record<string, unknown>,
  key: string,
  maximumLength: number,
) {
  const value = source[key];

  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maximumLength);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createPayload(source: Record<string, unknown>): ContactPayload {
  return {
    name: readString(source, "name", 80),
    email: readString(source, "email", 160),
    phone: readString(source, "phone", 40),
    service: readString(source, "service", 100) || "General question",
    preferredContact:
      readString(source, "preferredContact", 40) || "Email",
    message: readString(source, "message", 2500),
    website: readString(source, "website", 200),
  };
}

export async function POST(request: Request) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "The contact request was not valid.",
      },
      { status: 400 },
    );
  }

  if (!isRecord(requestBody)) {
    return NextResponse.json(
      {
        ok: false,
        message: "The contact request was not valid.",
      },
      { status: 400 },
    );
  }

  const payload = createPayload(requestBody);

  // Honeypot field. Bots commonly fill this hidden input.
  if (payload.website) {
    return NextResponse.json({
      ok: true,
      message: "Thank you. Your message has been received.",
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    payload.name.length < 2 ||
    !emailPattern.test(payload.email) ||
    payload.message.length < 10
  ) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Please provide your name, a valid email address, and a message of at least 10 characters.",
      },
      { status: 400 },
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const contactToEmail =
    process.env.CONTACT_TO_EMAIL?.trim() || "knorrheather@gmail.com";
  const contactFromEmail = process.env.CONTACT_FROM_EMAIL?.trim();

  if (!resendApiKey || !contactFromEmail) {
    console.error(
      "Contact form configuration is incomplete. RESEND_API_KEY and CONTACT_FROM_EMAIL are required.",
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "Online messaging is temporarily unavailable. Please text or email Heather directly.",
      },
      { status: 503 },
    );
  }

  const safeName = escapeHtml(payload.name);
  const safeEmail = escapeHtml(payload.email);
  const safePhone = escapeHtml(payload.phone || "Not provided");
  const safeService = escapeHtml(payload.service);
  const safePreferredContact = escapeHtml(payload.preferredContact);
  const safeMessage = escapeHtml(payload.message).replaceAll("\n", "<br />");

  const textBody = [
    "New website message",
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || "Not provided"}`,
    `Preferred reply: ${payload.preferredContact}`,
    `Topic/service: ${payload.service}`,
    "",
    "Message:",
    payload.message,
  ].join("\n");

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;line-height:1.65;color:#20251f">
      <h1 style="font-size:24px;margin:0 0 20px">New website message</h1>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Phone:</strong> ${safePhone}</p>
      <p><strong>Preferred reply:</strong> ${safePreferredContact}</p>
      <p><strong>Topic/service:</strong> ${safeService}</p>
      <hr style="border:0;border-top:1px solid #d9ddD5;margin:24px 0" />
      <p><strong>Message:</strong></p>
      <p>${safeMessage}</p>
    </div>
  `;

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: contactFromEmail,
        to: [contactToEmail],
        reply_to: payload.email,
        subject: `Website message from ${payload.name}`,
        text: textBody,
        html: htmlBody,
      }),
      cache: "no-store",
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();

      console.error(
        "Resend rejected the website contact message.",
        resendResponse.status,
        resendError.slice(0, 500),
      );

      return NextResponse.json(
        {
          ok: false,
          message:
            "Your message could not be sent right now. Please text or email Heather directly.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "Thank you. Your message has been sent to Heather successfully.",
    });
  } catch (error) {
    console.error("Unexpected contact form delivery failure.", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          "Your message could not be sent right now. Please text or email Heather directly.",
      },
      { status: 502 },
    );
  }
}
'@

Write-Utf8NoBom `
    -Path "src/app/api/contact/route.ts" `
    -Content $contactApiRoute

# ---------------------------------------------------------------------------
# 5. COMPLETE CONTACT PAGE
# ---------------------------------------------------------------------------

$contactPage = @'
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
            <p>10:00 AM–4:30 PM. Flexible by text when available.</p>
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
'@

Write-Utf8NoBom `
    -Path "src/app/contact/page.tsx" `
    -Content $contactPage

# ---------------------------------------------------------------------------
# 6. PATCH SITE NAVIGATION AND TEMPORARY BOOKING LINK
# ---------------------------------------------------------------------------

$sitePath = "src/lib/site.ts"
$siteContent = Get-Content $sitePath -Raw

$siteContent = $siteContent.Replace(
    'bookingUrl: "#booking",',
    'bookingUrl: "/#booking",'
)

if ($siteContent -notmatch '\{\s*label:\s*"Contact"') {
    $faqNavLine = '  { label: "FAQ", href: "/#faq" },'
    $contactNavLines = @'
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
'@

    if (-not $siteContent.Contains($faqNavLine)) {
        throw "Could not find the FAQ navigation entry in src/lib/site.ts."
    }

    $siteContent = $siteContent.Replace($faqNavLine, $contactNavLines.TrimEnd())
}

Write-Utf8NoBom -Path $sitePath -Content $siteContent

# ---------------------------------------------------------------------------
# 7. GUARANTEE HOMEPAGE CONTACT SECTION IS PRESENT
# ---------------------------------------------------------------------------

$homePath = "src/app/page.tsx"
$homeContent = Get-Content $homePath -Raw

if ($homeContent -notmatch 'from "@/components/ContactPreviewSection"') {
    $imageImport = 'import Image from "next/image";'
    $replacementImport = @'
import Image from "next/image";
import { ContactPreviewSection } from "@/components/ContactPreviewSection";
'@

    if (-not $homeContent.Contains($imageImport)) {
        throw "Could not find the Next.js Image import in src/app/page.tsx."
    }

    $homeContent = $homeContent.Replace(
        $imageImport,
        $replacementImport.TrimEnd()
    )
}

$inlineContactPattern = '(?s)\s*<section\b(?=[^>]*\bid="contact")[^>]*>.*?</section>\s*'
$inlineContactRegex = [regex]::new($inlineContactPattern)

if ($inlineContactRegex.IsMatch($homeContent)) {
    $homeContent = $inlineContactRegex.Replace(
        $homeContent,
        "`r`n`r`n        <ContactPreviewSection />`r`n`r`n",
        1
    )
}
elseif ($homeContent -notmatch '<ContactPreviewSection\s*/>') {
    $bookingIdIndex = $homeContent.IndexOf('id="booking"')

    if ($bookingIdIndex -lt 0) {
        throw "Could not find the booking section in src/app/page.tsx."
    }

    $bookingSectionIndex = $homeContent.LastIndexOf(
        "<section",
        $bookingIdIndex
    )

    if ($bookingSectionIndex -lt 0) {
        throw "Could not locate the opening booking section tag."
    }

    $homeContent = $homeContent.Insert(
        $bookingSectionIndex,
        "        <ContactPreviewSection />`r`n`r`n"
    )
}

Write-Utf8NoBom -Path $homePath -Content $homeContent

# ---------------------------------------------------------------------------
# 8. ADD /contact TO THE SITEMAP
# ---------------------------------------------------------------------------

$sitemapPath = "src/app/sitemap.ts"
$sitemapContent = Get-Content $sitemapPath -Raw

if ($sitemapContent -notmatch 'path:\s*"/contact"') {
    $reviewsRoutePattern = '(?ms)(^\s*\{\s*\r?\n\s*path:\s*"/reviews",\s*\r?\n\s*changeFrequency:\s*"monthly",\s*\r?\n\s*priority:\s*0\.72,\s*\r?\n\s*\},)'

    $reviewsRouteRegex = [regex]::new($reviewsRoutePattern)

    if (-not $reviewsRouteRegex.IsMatch($sitemapContent)) {
        throw "Could not find the reviews route in src/app/sitemap.ts."
    }

    $contactRouteBlock = @'
  {
    path: "/contact",
    changeFrequency: "monthly",
    priority: 0.76,
  },
'@

    $sitemapContent = $reviewsRouteRegex.Replace(
        $sitemapContent,
        ('$1' + "`r`n" + $contactRouteBlock.TrimEnd()),
        1
    )
}

Write-Utf8NoBom -Path $sitemapPath -Content $sitemapContent

# ---------------------------------------------------------------------------
# 9. SAFE ENVIRONMENT VARIABLE TEMPLATE
# ---------------------------------------------------------------------------

$envExample = @'
# Copy this file to .env.local and replace placeholder values.
# Never commit .env.local.

RESEND_API_KEY=re_replace_with_your_real_key
CONTACT_TO_EMAIL=knorrheather@gmail.com
CONTACT_FROM_EMAIL="McKenzie House Massage <hello@mckenziehousemassage.ca>"
'@

Write-Utf8NoBom -Path ".env.local.example" -Content $envExample

# ---------------------------------------------------------------------------
# 10. VERIFY
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "Files installed. Running TypeScript validation..." -ForegroundColor Cyan
npm run typecheck

Write-Host ""
Write-Host "TypeScript passed. Running production build..." -ForegroundColor Cyan
npm run build

Write-Host ""
Write-Host "Contact system installation complete." -ForegroundColor Green
Write-Host ""
Write-Host "Verify these routes:" -ForegroundColor Yellow
Write-Host "  http://localhost:3000/#contact"
Write-Host "  http://localhost:3000/contact"
Write-Host ""
Write-Host "Before testing form delivery:" -ForegroundColor Yellow
Write-Host "  1. Copy .env.local.example to .env.local"
Write-Host "  2. Add the real RESEND_API_KEY"
Write-Host "  3. Set CONTACT_FROM_EMAIL to a sender verified in Resend"
Write-Host ""
Write-Host "Current Git changes:" -ForegroundColor Cyan
git status --short
