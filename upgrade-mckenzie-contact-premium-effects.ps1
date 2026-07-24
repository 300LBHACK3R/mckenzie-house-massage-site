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

function Replace-MarkedBlock {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$StartMarker,

        [Parameter(Mandatory = $true)]
        [string]$EndMarker,

        [Parameter(Mandatory = $true)]
        [string]$Replacement
    )

    $content = Get-Content $Path -Raw
    $startIndex = $content.IndexOf($StartMarker)
    $endIndex = $content.IndexOf($EndMarker)

    if ($startIndex -ge 0 -and $endIndex -ge $startIndex) {
        $endIndex += $EndMarker.Length

        $content =
            $content.Substring(0, $startIndex).TrimEnd() +
            "`r`n`r`n" +
            $Replacement.Trim() +
            "`r`n"

        if ($endIndex -lt (Get-Content $Path -Raw).Length) {
            $original = Get-Content $Path -Raw
            $content += "`r`n" + $original.Substring($endIndex).TrimStart()
        }
    }
    else {
        $content = $content.TrimEnd() + "`r`n`r`n" + $Replacement.Trim() + "`r`n"
    }

    Write-Utf8NoBom -Path $Path -Content $content
}

Write-Host ""
Write-Host "Installing premium contact-page animation and effects..." -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------------------------
# 1. COMPLETE CONTACT PAGE
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
                Tuesday–Friday · 10:00 AM–4:30 PM
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
            <p>10:00 AM–4:30 PM. Flexible by text when available.</p>
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
'@

Write-Utf8NoBom `
    -Path "src/app/contact/page.tsx" `
    -Content $contactPage

# ---------------------------------------------------------------------------
# 2. COMPLETE CONTACT FORM COMPONENT
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

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.sendIcon}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="m4 5 16 7-16 7 3-7-3-7Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 12h13"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
      id="contact-form"
      className={`${styles.section} scroll-reveal`}
      aria-labelledby="contact-form-heading"
    >
      <div className={styles.ambientOrb} aria-hidden="true" />

      <div className={styles.intro}>
        <div className={styles.introGlow} aria-hidden="true" />
        <div className={styles.introMark} aria-hidden="true" />

        <p className={styles.eyebrow}>
          <span />
          Send a Message
        </p>

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

      <form
        className={styles.form}
        onSubmit={handleSubmit}
        data-state={submissionState}
      >
        <div className={styles.formGlow} aria-hidden="true" />

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
            className={`button primary ${styles.submitButton}`}
            type="submit"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? "Sending…" : "Send Message"}</span>
            <SendIcon />
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
# 3. COMPLETE CONTACT FORM CSS MODULE
# ---------------------------------------------------------------------------

$contactFormStyles = @'
.section {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.15fr);
  gap: clamp(1rem, 3vw, 2rem);
  width: min(calc(100% - 2rem), 1240px);
  margin: 0 auto;
  padding: clamp(5rem, 8vw, 8rem) 0;
  scroll-margin-top: 7rem;
}

.ambientOrb {
  position: absolute;
  top: 5%;
  right: -8%;
  z-index: -1;
  width: clamp(18rem, 38vw, 38rem);
  aspect-ratio: 1;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    rgba(201, 167, 90, 0.18),
    rgba(201, 167, 90, 0.04) 46%,
    transparent 72%
  );
  filter: blur(20px);
  animation: formAmbientFloat 12s ease-in-out infinite alternate;
  pointer-events: none;
}

.intro,
.form {
  position: relative;
  overflow: hidden;
  border-radius: clamp(1.4rem, 2vw, 1.9rem);
  box-shadow:
    0 30px 100px rgba(35, 31, 24, 0.13),
    0 1px 0 rgba(255, 255, 255, 0.2) inset;
  transition:
    transform 450ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 450ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 450ms ease;
}

.intro:hover,
.form:hover {
  transform: translateY(-5px);
  box-shadow:
    0 42px 120px rgba(35, 31, 24, 0.17),
    0 1px 0 rgba(255, 255, 255, 0.24) inset;
}

.intro {
  display: grid;
  align-content: center;
  gap: 1.15rem;
  padding: clamp(1.5rem, 4vw, 3.2rem);
  border: 1px solid rgba(236, 213, 151, 0.17);
  background:
    radial-gradient(circle at 15% 15%, rgba(220, 185, 100, 0.18), transparent 24rem),
    linear-gradient(145deg, #08130b, #16301a);
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

.intro::after {
  position: absolute;
  inset: -60%;
  content: "";
  pointer-events: none;
  background: conic-gradient(
    from 180deg,
    transparent,
    rgba(230, 205, 136, 0.08),
    transparent 28%
  );
  animation: introSweep 14s linear infinite;
}

.introGlow,
.formGlow {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

.introGlow {
  top: -20%;
  left: -16%;
  width: 20rem;
  aspect-ratio: 1;
  background: rgba(221, 190, 109, 0.12);
  filter: blur(65px);
  animation: introGlowPulse 7s ease-in-out infinite alternate;
}

.introMark {
  position: absolute;
  right: -3rem;
  bottom: -4rem;
  width: 14rem;
  aspect-ratio: 1;
  background: url("/brand/mckenzie-house-mark.png") center / contain no-repeat;
  opacity: 0.05;
  transform: rotate(-12deg);
  transition:
    opacity 450ms ease,
    transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.intro:hover .introMark {
  opacity: 0.085;
  transform: rotate(-4deg) scale(1.06);
}

.formGlow {
  top: -8rem;
  right: -7rem;
  width: 22rem;
  aspect-ratio: 1;
  background: rgba(183, 142, 57, 0.11);
  filter: blur(58px);
  transition:
    transform 650ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 450ms ease;
}

.form:hover .formGlow {
  transform: translate(-2rem, 2rem) scale(1.08);
}

.intro > *,
.form > * {
  position: relative;
  z-index: 1;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin: 0;
  color: #dfc47d;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.eyebrow span {
  width: 2.6rem;
  height: 1px;
  background: linear-gradient(90deg, rgba(223, 196, 125, 0.2), #dfc47d);
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
  transition:
    transform 350ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 350ms ease,
    background 350ms ease;
}

.trustList div:hover {
  transform: translateX(6px);
  border-color: rgba(239, 220, 168, 0.22);
  background: rgba(255, 255, 255, 0.055);
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
  position: relative;
  display: grid;
  gap: 0.48rem;
}

.field span {
  color: #263724;
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color 180ms ease;
}

.field:focus-within span {
  color: #8a6724;
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
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
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

.field input:hover,
.field select:hover,
.field textarea:hover {
  border-color: rgba(68, 92, 61, 0.32);
  background: rgba(255, 254, 250, 0.94);
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  transform: translateY(-1px);
  border-color: rgba(147, 110, 35, 0.75);
  background: #fffdf8;
  box-shadow:
    0 0 0 4px rgba(147, 110, 35, 0.1),
    0 12px 30px rgba(65, 50, 29, 0.08);
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

.submitButton {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
}

.submitButton::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: "";
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgba(255, 255, 255, 0.24) 48%,
    transparent 66%
  );
  transform: translateX(-120%);
  transition: transform 650ms cubic-bezier(0.22, 1, 0.36, 1);
}

.submitButton:hover::before {
  transform: translateX(120%);
}

.submitButton:disabled {
  cursor: wait;
  opacity: 0.68;
}

.sendIcon {
  width: 1.05rem;
  height: 1.05rem;
  transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.submitButton:hover .sendIcon {
  transform: translate(3px, -2px);
}

.form[data-state="submitting"] .sendIcon {
  animation: sendIconFloat 1s ease-in-out infinite alternate;
}

.form[data-state="success"] {
  border-color: rgba(53, 124, 61, 0.38);
  box-shadow:
    0 30px 100px rgba(35, 31, 24, 0.13),
    0 0 0 4px rgba(53, 124, 61, 0.05);
}

.form[data-state="error"] {
  border-color: rgba(151, 60, 60, 0.35);
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
  transition:
    color 180ms ease,
    transform 180ms ease,
    opacity 180ms ease;
}

.success {
  color: #245629;
  animation: statusReveal 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.error {
  color: #8b2f2f;
  animation: statusReveal 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes formAmbientFloat {
  from {
    transform: translate3d(0, -1rem, 0) scale(0.96);
  }

  to {
    transform: translate3d(-3rem, 3rem, 0) scale(1.06);
  }
}

@keyframes introSweep {
  to {
    transform: rotate(360deg);
  }
}

@keyframes introGlowPulse {
  from {
    transform: scale(0.9);
    opacity: 0.65;
  }

  to {
    transform: scale(1.15);
    opacity: 1;
  }
}

@keyframes sendIconFloat {
  from {
    transform: translate(0, 0);
  }

  to {
    transform: translate(4px, -3px);
  }
}

@keyframes statusReveal {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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

@media (prefers-reduced-motion: reduce) {
  .ambientOrb,
  .intro::after,
  .introGlow,
  .form[data-state="submitting"] .sendIcon {
    animation: none !important;
  }

  .intro,
  .form,
  .trustList div,
  .field input,
  .field select,
  .field textarea,
  .submitButton::before,
  .sendIcon {
    transition: none !important;
  }
}
'@

Write-Utf8NoBom `
    -Path "src/components/ContactForm.module.css" `
    -Content $contactFormStyles

# ---------------------------------------------------------------------------
# 4. PREMIUM GLOBAL CONTACT ANIMATION CSS
# ---------------------------------------------------------------------------

$globalContactEffects = @'
/* PREMIUM_CONTACT_ANIMATION_V2_START */

.premium-contact-page {
  overflow: clip;
}

.premium-contact-hero {
  position: relative;
  isolation: isolate;
  min-height: min(900px, 94vh);
  display: grid;
  align-items: center;
  overflow: hidden;
}

.premium-contact-hero__inner {
  position: relative;
  z-index: 3;
}

.premium-contact-hero__grid {
  position: absolute;
  inset: 0;
  z-index: -3;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(241, 220, 155, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(241, 220, 155, 0.035) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(to bottom, black, transparent 88%);
  animation: premiumContactGridDrift 24s linear infinite;
}

.premium-contact-hero__orb {
  position: absolute;
  z-index: -2;
  border-radius: 999px;
  filter: blur(4px);
  pointer-events: none;
}

.premium-contact-hero__orb--one {
  top: -16rem;
  right: -12rem;
  width: clamp(26rem, 52vw, 54rem);
  aspect-ratio: 1;
  background:
    radial-gradient(
      circle,
      rgba(209, 173, 84, 0.2),
      rgba(209, 173, 84, 0.04) 48%,
      transparent 70%
    );
  animation: premiumContactOrbOne 13s ease-in-out infinite alternate;
}

.premium-contact-hero__orb--two {
  left: -14rem;
  bottom: -18rem;
  width: clamp(28rem, 48vw, 50rem);
  aspect-ratio: 1;
  background:
    radial-gradient(
      circle,
      rgba(92, 132, 86, 0.22),
      rgba(92, 132, 86, 0.035) 50%,
      transparent 72%
    );
  animation: premiumContactOrbTwo 16s ease-in-out infinite alternate;
}

.premium-contact-hero__mark {
  position: absolute;
  right: clamp(-7rem, -4vw, -2rem);
  bottom: clamp(-8rem, -8vw, -3rem);
  z-index: -1;
  width: clamp(22rem, 45vw, 48rem);
  aspect-ratio: 1;
  background: url("/brand/mckenzie-house-mark.png") center / contain no-repeat;
  opacity: 0.028;
  transform: rotate(-10deg);
  animation: premiumContactMarkFloat 18s ease-in-out infinite alternate;
  pointer-events: none;
}

.premium-contact-hero__copy {
  position: relative;
}

.premium-contact-hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #dbc079;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.premium-contact-hero__eyebrow span {
  width: 3rem;
  height: 1px;
  background: linear-gradient(90deg, rgba(219, 192, 121, 0.15), #dbc079);
}

.premium-contact-hero__copy h1 span {
  display: block;
  color: rgba(255, 250, 240, 0.52);
  font-style: italic;
  font-weight: 400;
}

.hero-contact-reveal {
  opacity: 0;
  transform: translateY(24px);
  animation: premiumContactReveal 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.hero-contact-delay-1 {
  animation-delay: 120ms;
}

.hero-contact-delay-2 {
  animation-delay: 240ms;
}

.hero-contact-delay-3 {
  animation-delay: 380ms;
}

.hero-contact-delay-4 {
  animation-delay: 520ms;
}

.hero-contact-delay-5 {
  animation-delay: 680ms;
}

.premium-contact-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1.7rem;
}

.premium-contact-button {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
}

.premium-contact-button::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: "";
  background: linear-gradient(
    105deg,
    transparent 28%,
    rgba(255, 255, 255, 0.22) 50%,
    transparent 72%
  );
  transform: translateX(-130%);
  transition: transform 650ms cubic-bezier(0.22, 1, 0.36, 1);
}

.premium-contact-button:hover::before {
  transform: translateX(130%);
}

.contact-page-arrow {
  width: 1rem;
  height: 1rem;
  transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.premium-contact-button:hover .contact-page-arrow,
.premium-contact-card__link:hover .contact-page-arrow {
  transform: translate(3px, -3px);
}

.premium-contact-hero__proof {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
  max-width: 780px;
  margin-top: clamp(2rem, 4vw, 3rem);
}

.premium-contact-hero__proof > div {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.7rem;
  align-items: start;
  padding: 0.9rem;
  border: 1px solid rgba(233, 214, 156, 0.1);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.025);
  backdrop-filter: blur(12px);
  transition:
    transform 380ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 380ms ease,
    background 380ms ease;
}

.premium-contact-hero__proof > div:hover {
  transform: translateY(-5px);
  border-color: rgba(233, 214, 156, 0.2);
  background: rgba(255, 255, 255, 0.045);
}

.premium-contact-hero__proof span {
  color: #d8bd76;
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.premium-contact-hero__proof p {
  display: grid;
  gap: 0.18rem;
  margin: 0;
  color: rgba(255, 250, 240, 0.56);
  font-size: 0.78rem;
  line-height: 1.45;
}

.premium-contact-hero__proof strong {
  color: #fffaf0;
  font-size: 0.84rem;
}

.premium-contact-card {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-color: rgba(232, 208, 142, 0.2) !important;
  background:
    linear-gradient(155deg, rgba(255, 252, 243, 0.98), rgba(231, 216, 183, 0.93)) !important;
  box-shadow:
    0 38px 120px rgba(2, 10, 5, 0.34),
    0 1px 0 rgba(255, 255, 255, 0.72) inset !important;
  transform: perspective(1200px) rotateY(-2deg) rotateX(1deg);
  transition:
    transform 550ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 550ms cubic-bezier(0.22, 1, 0.36, 1);
}

.premium-contact-card:hover {
  transform: perspective(1200px) rotateY(0deg) rotateX(0deg) translateY(-8px);
  box-shadow:
    0 52px 150px rgba(2, 10, 5, 0.42),
    0 1px 0 rgba(255, 255, 255, 0.78) inset !important;
}

.premium-contact-card__glow {
  position: absolute;
  top: -9rem;
  right: -8rem;
  z-index: -1;
  width: 20rem;
  aspect-ratio: 1;
  border-radius: 999px;
  background: rgba(192, 149, 57, 0.2);
  filter: blur(55px);
  transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
}

.premium-contact-card:hover .premium-contact-card__glow {
  transform: translate(-3rem, 3rem) scale(1.15);
}

.premium-contact-card__label {
  color: #82631f !important;
}

.premium-contact-card__link {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.2rem;
  padding: 1rem 1.1rem;
  border: 1px solid rgba(40, 60, 35, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.42);
  color: #172517;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.2rem, 2vw, 1.55rem);
  text-decoration: none;
  transition:
    transform 350ms cubic-bezier(0.22, 1, 0.36, 1),
    background 350ms ease,
    border-color 350ms ease;
}

.premium-contact-card__link:hover {
  transform: translateX(5px);
  border-color: rgba(119, 88, 25, 0.25);
  background: rgba(255, 255, 255, 0.66);
}

.premium-contact-card__availability {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-top: 1rem;
  color: rgba(37, 48, 34, 0.62);
  font-size: 0.76rem;
  font-weight: 700;
}

.premium-contact-card__pulse {
  width: 0.58rem;
  height: 0.58rem;
  border-radius: 999px;
  background: #5f8f57;
  box-shadow: 0 0 0 0 rgba(95, 143, 87, 0.42);
  animation: premiumContactPulse 2s ease-out infinite;
}

.premium-contact-details {
  position: relative;
  z-index: 4;
  margin-top: clamp(-3.8rem, -5vw, -2.2rem);
}

.premium-contact-details article {
  position: relative;
  overflow: hidden;
  min-height: 220px;
  transition:
    transform 450ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 450ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 450ms ease;
}

.premium-contact-details article::after {
  position: absolute;
  right: -3rem;
  bottom: -3rem;
  width: 8rem;
  aspect-ratio: 1;
  content: "";
  border-radius: 999px;
  background: rgba(198, 161, 79, 0.08);
  transform: scale(0.6);
  transition: transform 550ms cubic-bezier(0.22, 1, 0.36, 1);
}

.premium-contact-details article:hover {
  transform: translateY(-9px);
  border-color: rgba(132, 98, 31, 0.22);
  box-shadow: 0 34px 90px rgba(62, 48, 29, 0.16);
}

.premium-contact-details article:hover::after {
  transform: scale(1.4);
}

.premium-contact-detail__icon {
  display: grid;
  place-items: center;
  width: 2.85rem;
  height: 2.85rem;
  margin-bottom: 0.4rem;
  border: 1px solid rgba(112, 82, 27, 0.14);
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.5);
  color: #7d5b1d;
  transition:
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
    background 420ms ease,
    color 420ms ease;
}

.premium-contact-detail__icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.premium-contact-details article:hover .premium-contact-detail__icon {
  transform: translateY(-4px) rotate(-4deg);
  background: #1c321d;
  color: #ecd18a;
}

.premium-contact-note {
  position: relative;
  overflow: hidden;
}

.premium-contact-note__inner {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  transition:
    transform 500ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 500ms cubic-bezier(0.22, 1, 0.36, 1);
}

.premium-contact-note__inner:hover {
  transform: translateY(-6px);
  box-shadow: 0 44px 120px rgba(35, 31, 24, 0.17);
}

.premium-contact-note__mark {
  position: absolute;
  right: -5rem;
  bottom: -7rem;
  z-index: -1;
  width: 22rem;
  aspect-ratio: 1;
  background: url("/brand/mckenzie-house-mark.png") center / contain no-repeat;
  opacity: 0.04;
  transform: rotate(-14deg);
  transition:
    opacity 550ms ease,
    transform 750ms cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.premium-contact-note__inner:hover .premium-contact-note__mark {
  opacity: 0.075;
  transform: rotate(-4deg) scale(1.05);
}

@keyframes premiumContactReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes premiumContactGridDrift {
  from {
    background-position: 0 0, 0 0;
  }

  to {
    background-position: 72px 72px, 72px 72px;
  }
}

@keyframes premiumContactOrbOne {
  from {
    transform: translate3d(0, -1rem, 0) scale(0.95);
  }

  to {
    transform: translate3d(-4rem, 4rem, 0) scale(1.08);
  }
}

@keyframes premiumContactOrbTwo {
  from {
    transform: translate3d(-1rem, 1rem, 0) scale(0.96);
  }

  to {
    transform: translate3d(4rem, -3rem, 0) scale(1.1);
  }
}

@keyframes premiumContactMarkFloat {
  from {
    transform: translate3d(0, 1rem, 0) rotate(-12deg) scale(0.98);
  }

  to {
    transform: translate3d(-2rem, -2rem, 0) rotate(-4deg) scale(1.05);
  }
}

@keyframes premiumContactPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(95, 143, 87, 0.44);
  }

  70% {
    box-shadow: 0 0 0 0.7rem rgba(95, 143, 87, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(95, 143, 87, 0);
  }
}

@media (max-width: 980px) {
  .premium-contact-hero {
    min-height: auto;
  }

  .premium-contact-card {
    transform: none;
  }

  .premium-contact-hero__proof {
    grid-template-columns: 1fr;
  }

  .premium-contact-details {
    margin-top: -1rem;
  }
}

@media (max-width: 640px) {
  .premium-contact-hero__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .premium-contact-button {
    width: 100%;
  }

  .premium-contact-hero__proof {
    margin-top: 1.5rem;
  }

  .premium-contact-hero__mark {
    right: -12rem;
    width: 30rem;
  }

  .premium-contact-details {
    margin-top: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .premium-contact-hero__grid,
  .premium-contact-hero__orb,
  .premium-contact-hero__mark,
  .premium-contact-card__pulse,
  .hero-contact-reveal {
    animation: none !important;
  }

  .hero-contact-reveal {
    opacity: 1;
    transform: none;
  }

  .premium-contact-button,
  .contact-page-arrow,
  .premium-contact-card,
  .premium-contact-card__glow,
  .premium-contact-card__link,
  .premium-contact-details article,
  .premium-contact-detail__icon,
  .premium-contact-note__inner,
  .premium-contact-note__mark {
    transition: none !important;
  }
}

/* PREMIUM_CONTACT_ANIMATION_V2_END */
'@

Replace-MarkedBlock `
    -Path "src/app/globals.css" `
    -StartMarker "/* PREMIUM_CONTACT_ANIMATION_V2_START */" `
    -EndMarker "/* PREMIUM_CONTACT_ANIMATION_V2_END */" `
    -Replacement $globalContactEffects

# ---------------------------------------------------------------------------
# 5. VERIFY
# ---------------------------------------------------------------------------

Write-Host "Premium contact effects installed." -ForegroundColor Green
Write-Host ""
Write-Host "Running TypeScript validation..." -ForegroundColor Cyan
npm run typecheck

Write-Host ""
Write-Host "TypeScript passed. Running production build..." -ForegroundColor Cyan
npm run build

Write-Host ""
Write-Host "Contact page premium animation upgrade complete." -ForegroundColor Green
Write-Host ""
Write-Host "Start the development server with:" -ForegroundColor Yellow
Write-Host "  npm run dev"
Write-Host ""
Write-Host "Then open:" -ForegroundColor Yellow
Write-Host "  http://localhost:3000/contact"
Write-Host ""
Write-Host "Current Git changes:" -ForegroundColor Cyan
git status --short
