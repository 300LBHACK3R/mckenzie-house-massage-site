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
    setStatusMessage("Sending your messageâ€¦");

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
            <span>{isSubmitting ? "Sendingâ€¦" : "Send Message"}</span>
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