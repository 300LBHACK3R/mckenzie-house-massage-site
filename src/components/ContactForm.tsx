"use client";

import type { FormEvent } from "react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  services,
  siteConfig,
} from "@/lib/site";
import styles from "./ContactForm.module.css";

const SUBMISSION_TIMEOUT_MS = 12_000;
const MAX_MESSAGE_LENGTH = 2_000;
const MAX_API_MESSAGE_LENGTH = 2_500;

const GENERAL_QUESTION = "General question";
const EARLIER_OPENING_TOPIC =
  "Request an earlier opening";
const DIRECT_BILLING_TOPIC =
  "Direct billing";

type SubmissionState =
  | "idle"
  | "submitting"
  | "success"
  | "error";

type PreferredContact =
  | "Email"
  | "Text"
  | "Phone call";

type ContactApiResponse = {
  ok?: boolean;
  message?: string;
};

type OptionalSiteFeatures = {
  phoneE164?: string;

  waitlist?: {
    enabled?: boolean;
    heading?: string;
    description?: string;
    buttonLabel?: string;
    requestPrompt?: string;
  };

  directBilling?: {
    enabled?: boolean;
    heading?: string;
    summary?: string;
    disclaimer?: string;
    placeholder?: string;
    providers?: string[];
  };

  tippingPolicy?: {
    heading?: string;
    statement?: string;
  };
};

const extendedSiteConfig =
  siteConfig as typeof siteConfig &
    OptionalSiteFeatures;

const activeServices = services.filter(
  (service) => {
    if ("status" in service) {
      return service.status === "active";
    }

    return true;
  },
);

function getFormValue(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function createDetailedMessage(
  formData: FormData,
): string {
  const topic =
    getFormValue(formData, "service") ||
    GENERAL_QUESTION;

  const originalMessage =
    getFormValue(formData, "message");

  const additionalDetails: string[] = [];

  if (topic === EARLIER_OPENING_TOPIC) {
    additionalDetails.push(
      `Preferred appointment length: ${
        getFormValue(
          formData,
          "appointmentLength",
        ) || "Not specified"
      }`,
      `Preferred days: ${
        getFormValue(
          formData,
          "preferredDays",
        ) || "Not specified"
      }`,
      `Preferred times: ${
        getFormValue(
          formData,
          "preferredTimes",
        ) || "Not specified"
      }`,
    );
  }

  if (topic === DIRECT_BILLING_TOPIC) {
    additionalDetails.push(
      `Insurance provider: ${
        getFormValue(
          formData,
          "insuranceProvider",
        ) || "Not specified"
      }`,
    );
  }

  if (additionalDetails.length === 0) {
    return originalMessage.slice(
      0,
      MAX_API_MESSAGE_LENGTH,
    );
  }

  return [
    originalMessage,
    "",
    "Additional request details:",
    ...additionalDetails,
  ]
    .join("\n")
    .slice(0, MAX_API_MESSAGE_LENGTH);
}

function getCleanPhone(): string {
  return (
    extendedSiteConfig.phoneE164?.trim() ||
    siteConfig.phone.replace(/[^\d+]/g, "")
  );
}

function getWaitlistDetails() {
  const waitlist =
    extendedSiteConfig.waitlist;

  return {
    enabled: waitlist?.enabled !== false,

    heading:
      waitlist?.heading?.trim() ||
      "Can’t find a time that works?",

    description:
      waitlist?.description?.trim() ||
      "Request an earlier opening and Heather can contact you if a cancellation becomes available or additional appointment times are opened.",

    requestPrompt:
      waitlist?.requestPrompt?.trim() ||
      "Include your preferred days, approximate times, and appointment length.",
  };
}

function getDirectBillingDetails() {
  const directBilling =
    extendedSiteConfig.directBilling;

  const providers =
    directBilling?.providers?.filter(
      (provider) =>
        provider.trim().length > 0,
    ) ?? [];

  return {
    enabled: directBilling?.enabled !== false,

    heading:
      directBilling?.heading?.trim() ||
      "Direct Billing Available",

    summary:
      directBilling?.summary?.trim() ||
      "Direct billing is available for many major insurance providers.",

    providerInformation:
      providers.length > 0
        ? `Currently confirmed providers include ${providers.join(
            ", ",
          )}.`
        : directBilling?.placeholder?.trim() ||
          "The confirmed provider list is being finalized. Heather can help you confirm whether your provider may be supported.",

    disclaimer:
      directBilling?.disclaimer?.trim() ||
      "Coverage and approval depend on each client’s individual insurance plan.",
  };
}

function getTippingPolicy() {
  const tippingPolicy =
    extendedSiteConfig.tippingPolicy;

  return {
    heading:
      tippingPolicy?.heading?.trim() ||
      "No Tipping Expected",

    statement:
      tippingPolicy?.statement?.trim() ||
      "No tipping is expected or accepted. The listed treatment price is the full price of your appointment.",
  };
}

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
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
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const phoneHintId = useId();
  const preferredContactId = useId();
  const serviceId = useId();
  const messageId = useId();
  const messageCounterId = useId();

  const appointmentLengthId = useId();
  const preferredDaysId = useId();
  const preferredTimesId = useId();

  const insuranceProviderId = useId();
  const insuranceProviderHintId = useId();

  const statusRef =
    useRef<HTMLParagraphElement | null>(null);

  const abortControllerRef =
    useRef<AbortController | null>(null);

  const [submissionState, setSubmissionState] =
    useState<SubmissionState>("idle");

  const [statusMessage, setStatusMessage] =
    useState("");

  const [selectedTopic, setSelectedTopic] =
    useState(GENERAL_QUESTION);

  const [
    preferredContact,
    setPreferredContact,
  ] = useState<PreferredContact>("Email");

  const [messageLength, setMessageLength] =
    useState(0);

  const waitlist = useMemo(
    () => getWaitlistDetails(),
    [],
  );

  const directBilling = useMemo(
    () => getDirectBillingDetails(),
    [],
  );

  const tippingPolicy = useMemo(
    () => getTippingPolicy(),
    [],
  );

  const cleanPhone = useMemo(
    () => getCleanPhone(),
    [],
  );

  const textMessageHref =
    `sms:${cleanPhone}`;

  const isEarlierOpeningRequest =
    selectedTopic === EARLIER_OPENING_TOPIC;

  const isDirectBillingRequest =
    selectedTopic === DIRECT_BILLING_TOPIC;

  const phoneIsRequired =
    isEarlierOpeningRequest ||
    preferredContact === "Text" ||
    preferredContact === "Phone call";

  const isSubmitting =
    submissionState === "submitting";

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (
      submissionState !== "success" &&
      submissionState !== "error"
    ) {
      return;
    }

    window.requestAnimationFrame(() => {
      statusRef.current?.focus({
        preventScroll: true,
      });
    });
  }, [submissionState]);

  function clearCompletedStatus() {
    if (
      submissionState === "success" ||
      submissionState === "error"
    ) {
      setSubmissionState("idle");
      setStatusMessage("");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const phone =
      getFormValue(formData, "phone");

    if (phoneIsRequired && !phone) {
      setSubmissionState("error");

      setStatusMessage(
        isEarlierOpeningRequest
          ? "Please provide a phone number so Heather can contact you if an earlier opening becomes available."
          : `Please provide a phone number because your preferred reply method is ${preferredContact.toLowerCase()}.`,
      );

      const phoneInput =
        form.elements.namedItem("phone");

      if (
        phoneInput instanceof HTMLInputElement
      ) {
        phoneInput.focus();
      }

      return;
    }

    abortControllerRef.current?.abort();

    const abortController =
      new AbortController();

    abortControllerRef.current =
      abortController;

    const timeoutId = window.setTimeout(
      () => {
        abortController.abort();
      },
      SUBMISSION_TIMEOUT_MS,
    );

    setSubmissionState("submitting");

    setStatusMessage(
      "Sending your message…",
    );

    try {
      const response = await fetch(
        "/api/contact",
        {
          method: "POST",

          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
          },

          credentials: "same-origin",
          cache: "no-store",
          signal: abortController.signal,

          body: JSON.stringify({
            name: getFormValue(
              formData,
              "name",
            ),

            email: getFormValue(
              formData,
              "email",
            ),

            phone,

            service:
              getFormValue(
                formData,
                "service",
              ) || GENERAL_QUESTION,

            preferredContact:
              getFormValue(
                formData,
                "preferredContact",
              ) || "Email",

            message:
              createDetailedMessage(
                formData,
              ),

            website: getFormValue(
              formData,
              "website",
            ),
          }),
        },
      );

      const contentType =
        response.headers.get(
          "content-type",
        ) ?? "";

      let result: ContactApiResponse = {};

      if (
        contentType.includes(
          "application/json",
        )
      ) {
        try {
          result =
            (await response.json()) as ContactApiResponse;
        } catch {
          result = {};
        }
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Your message could not be sent. Please text or email Heather directly.",
        );
      }

      form.reset();

      setSelectedTopic(
        GENERAL_QUESTION,
      );

      setPreferredContact("Email");
      setMessageLength(0);

      setSubmissionState("success");

      setStatusMessage(
        result.message ||
          "Thank you. Your message has been sent to Heather successfully.",
      );
    } catch (error) {
      const wasAborted =
        error instanceof Error &&
        error.name === "AbortError";

      setSubmissionState("error");

      setStatusMessage(
        wasAborted
          ? "The message service took too long to respond. Please try again, or text Heather directly."
          : error instanceof Error
            ? error.message
            : "Your message could not be sent. Please text or email Heather directly.",
      );
    } finally {
      window.clearTimeout(timeoutId);

      if (
        abortControllerRef.current ===
        abortController
      ) {
        abortControllerRef.current = null;
      }
    }
  }

  return (
    <section
      id="contact-form"
      className={`${styles.section} scroll-reveal`}
      aria-labelledby="contact-form-heading"
      data-reveal-threshold="0.12"
      data-reveal-stagger="110"
    >
      <div
        className={styles.ambientOrb}
        aria-hidden="true"
      />

      <div
        className={styles.intro}
        data-reveal-item
      >
        <div
          className={styles.introGlow}
          aria-hidden="true"
        />

        <div
          className={styles.introMark}
          aria-hidden="true"
        />

        <p className={styles.eyebrow}>
          <span aria-hidden="true" />
          Send a Message
        </p>

        <h2 id="contact-form-heading">
          Tell Heather what you need help with.
        </h2>

        <p>
          Ask about services, direct billing,
          appointment details, pressure
          preferences, or help finding an
          appointment time that works.
        </p>

        <div className={styles.trustList}>
          <div data-reveal-item>
            <span>Response</span>

            <strong>
              Heather replies directly
            </strong>
          </div>

          <div data-reveal-item>
            <span>Privacy</span>

            <strong>
              Your message is sent privately
            </strong>
          </div>

          <div data-reveal-item>
            <span>Booking</span>

            <strong>
              This form does not create an
              appointment
            </strong>
          </div>

          <div data-reveal-item>
            <span>
              {tippingPolicy.heading}
            </span>

            <strong>
              {tippingPolicy.statement}
            </strong>
          </div>
        </div>
      </div>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
        onInput={clearCompletedStatus}
        onChange={clearCompletedStatus}
        data-state={submissionState}
        data-reveal-item
        aria-busy={isSubmitting}
        acceptCharset="UTF-8"
      >
        <div
          className={styles.formGlow}
          aria-hidden="true"
        />

        <div className={styles.twoColumn}>
          <label
            className={styles.field}
            htmlFor={nameId}
          >
            <span>Name *</span>

            <input
              id={nameId}
              type="text"
              name="name"
              autoComplete="name"
              autoCapitalize="words"
              enterKeyHint="next"
              minLength={2}
              maxLength={80}
              required
            />
          </label>

          <label
            className={styles.field}
            htmlFor={emailId}
          >
            <span>Email *</span>

            <input
              id={emailId}
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              enterKeyHint="next"
              maxLength={160}
              spellCheck={false}
              required
            />
          </label>
        </div>

        <div className={styles.twoColumn}>
          <label
            className={styles.field}
            htmlFor={phoneId}
          >
            <span>
              Phone
              {phoneIsRequired
                ? " *"
                : ""}
            </span>

            <input
              id={phoneId}
              type="tel"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              enterKeyHint="next"
              maxLength={40}
              required={phoneIsRequired}
              aria-describedby={
                phoneHintId
              }
            />

            <small id={phoneHintId}>
              Required for text replies, phone
              calls, and earlier-opening
              requests.
            </small>
          </label>

          <label
            className={styles.field}
            htmlFor={preferredContactId}
          >
            <span>Preferred reply</span>

            <select
              id={preferredContactId}
              name="preferredContact"
              value={preferredContact}
              onChange={(event) => {
                setPreferredContact(
                  event.target
                    .value as PreferredContact,
                );
              }}
            >
              <option value="Email">
                Email
              </option>

              <option value="Text">
                Text
              </option>

              <option value="Phone call">
                Phone call
              </option>
            </select>
          </label>
        </div>

        <label
          className={styles.field}
          htmlFor={serviceId}
        >
          <span>
            What can Heather help with?
          </span>

          <select
            id={serviceId}
            name="service"
            value={selectedTopic}
            onChange={(event) => {
              setSelectedTopic(
                event.target.value,
              );
            }}
          >
            <option value={GENERAL_QUESTION}>
              General question
            </option>

            {activeServices.map(
              (service) => (
                <option
                  key={service.slug}
                  value={service.name}
                >
                  {service.name}
                </option>
              ),
            )}

            {directBilling.enabled ? (
              <option
                value={DIRECT_BILLING_TOPIC}
              >
                Direct billing
              </option>
            ) : null}

            <option value="Booking help">
              Booking help
            </option>

            {waitlist.enabled ? (
              <option
                value={
                  EARLIER_OPENING_TOPIC
                }
              >
                Request an earlier opening
              </option>
            ) : null}
          </select>
        </label>

        {isEarlierOpeningRequest ? (
          <>
            <div className={styles.twoColumn}>
              <label
                className={styles.field}
                htmlFor={
                  appointmentLengthId
                }
              >
                <span>
                  Preferred appointment length
                </span>

                <select
                  id={appointmentLengthId}
                  name="appointmentLength"
                  defaultValue=""
                >
                  <option value="">
                    No preference
                  </option>

                  <option value="30 minutes">
                    30 minutes
                  </option>

                  <option value="45 minutes">
                    45 minutes
                  </option>

                  <option value="60 minutes">
                    60 minutes
                  </option>

                  <option value="75 minutes">
                    75 minutes
                  </option>

                  <option value="90 minutes">
                    90 minutes
                  </option>

                  <option value="120 minutes">
                    120 minutes
                  </option>
                </select>
              </label>

              <label
                className={styles.field}
                htmlFor={preferredDaysId}
              >
                <span>Preferred days</span>

                <input
                  id={preferredDaysId}
                  type="text"
                  name="preferredDays"
                  maxLength={120}
                  placeholder="For example: Tuesdays or Thursdays"
                />
              </label>
            </div>

            <label
              className={styles.field}
              htmlFor={preferredTimesId}
            >
              <span>Preferred times</span>

              <input
                id={preferredTimesId}
                type="text"
                name="preferredTimes"
                maxLength={120}
                placeholder="For example: mornings or after 2:00 PM"
              />

              <small>
                {waitlist.requestPrompt}
              </small>
            </label>
          </>
        ) : null}

        {isDirectBillingRequest ? (
          <label
            className={styles.field}
            htmlFor={insuranceProviderId}
          >
            <span>Insurance provider</span>

            <input
              id={insuranceProviderId}
              type="text"
              name="insuranceProvider"
              autoComplete="organization"
              maxLength={120}
              placeholder="For example: Alberta Blue Cross"
              aria-describedby={
                insuranceProviderHintId
              }
            />

            <small
              id={insuranceProviderHintId}
            >
              {directBilling.summary}{" "}
              {directBilling.providerInformation}{" "}
              {directBilling.disclaimer} Do
              not include policy numbers, member
              IDs, or other private insurance
              information in this form.
            </small>
          </label>
        ) : null}

        <label
          className={styles.field}
          htmlFor={messageId}
        >
          <span>Message *</span>

          <textarea
            id={messageId}
            name="message"
            rows={7}
            minLength={10}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder={
              isEarlierOpeningRequest
                ? "Share anything else Heather should know about the appointment you are looking for."
                : "Share your question, preferred appointment details, or anything Heather should know before replying."
            }
            aria-describedby={
              messageCounterId
            }
            onInput={(event) => {
              setMessageLength(
                event.currentTarget
                  .value.length,
              );
            }}
            required
          />

          <small id={messageCounterId}>
            {messageLength.toLocaleString(
              "en-CA",
            )}
            /
            {MAX_MESSAGE_LENGTH.toLocaleString(
              "en-CA",
            )}{" "}
            characters
          </small>
        </label>

        <label
          className={styles.honeypot}
          aria-hidden="true"
        >
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
            aria-disabled={isSubmitting}
          >
            <span>
              {isSubmitting
                ? "Sending…"
                : "Send Message"}
            </span>

            <SendIcon />
          </button>

          <p>
            For urgent scheduling questions,
            texting Heather is usually the
            fastest option.{" "}
            <a href={textMessageHref}>
              Text {siteConfig.phone}
            </a>
          </p>
        </div>

        <p
          ref={statusRef}
          className={[
            styles.status,

            submissionState === "success"
              ? styles.success
              : "",

            submissionState === "error"
              ? styles.error
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-live={
            submissionState === "error"
              ? "assertive"
              : "polite"
          }
          role={
            submissionState === "error"
              ? "alert"
              : "status"
          }
          tabIndex={-1}
        >
          {statusMessage}
        </p>
      </form>
    </section>
  );
}