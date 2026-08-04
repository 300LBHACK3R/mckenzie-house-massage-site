import {
  createHash,
  randomUUID,
} from "node:crypto";
import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 16_384;
const RESEND_TIMEOUT_MS = 10_000;

/*
 * Identical submissions made during this window use the same
 * Resend idempotency key. This protects against double-clicks,
 * browser retries, and uncertain network responses without
 * suppressing the same legitimate question for a full day.
 */
const DUPLICATE_WINDOW_MS =
  30 * 60 * 1_000;

const MAX_LENGTHS = {
  name: 80,
  email: 160,
  phone: 40,
  service: 100,
  preferredContact: 40,
  message: 2_500,
  website: 200,
} as const;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const ALLOWED_PREFERRED_CONTACTS =
  new Set([
    "Email",
    "Text",
    "Phone call",
  ] as const);

const RESPONSE_HEADERS = {
  "Cache-Control":
    "no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options":
    "nosniff",
  "Referrer-Policy": "no-referrer",
  "Cross-Origin-Resource-Policy":
    "same-origin",
  "X-Robots-Tag":
    "noindex, nofollow, noarchive",
  Vary: "Origin",
} as const;

type PreferredContact =
  | "Email"
  | "Text"
  | "Phone call";

type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  service: string;
  preferredContact: PreferredContact;
  message: string;
  website: string;
};

type ParsedRequestBody =
  | {
      ok: true;
      body: Record<string, unknown>;
    }
  | {
      ok: false;
      status: 400 | 413 | 415;
      message: string;
    };

type ValidationResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
    };

type ResendSuccessResponse = {
  id?: string;
};

type ResendErrorResponse = {
  name?: string;
  message?: string;
  statusCode?: number;
};

type EmailConfiguration = {
  apiKey: string;
  fromEmail: string;
  toEmails: string[];
};

class ResendRequestError extends Error {
  readonly status: number;
  readonly providerCode: string;

  constructor(
    status: number,
    providerCode: string,
  ) {
    super("Email provider request failed.");

    this.name = "ResendRequestError";
    this.status = status;
    this.providerCode = providerCode;
  }
}

function createResponseHeaders(
  requestId: string,
  additionalHeaders?: HeadersInit,
): Headers {
  const headers = new Headers(
    RESPONSE_HEADERS,
  );

  headers.set(
    "X-Request-Id",
    requestId,
  );

  if (additionalHeaders) {
    const extras = new Headers(
      additionalHeaders,
    );

    extras.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

function jsonResponse(
  requestId: string,
  body: Record<string, unknown>,
  status = 200,
  additionalHeaders?: HeadersInit,
): NextResponse {
  return NextResponse.json(body, {
    status,

    headers: createResponseHeaders(
      requestId,
      additionalHeaders,
    ),
  });
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function normalizeSingleLine(
  value: string,
  maximumLength: number,
): string {
  return value
    .normalize("NFKC")
    .replace(
      /[\u0000-\u001f\u007f]/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maximumLength);
}

function normalizeMultiline(
  value: string,
  maximumLength: number,
): string {
  return value
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .replace(
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,
      "",
    )
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, maximumLength);
}

function readSingleLine(
  source: Record<string, unknown>,
  key: string,
  maximumLength: number,
): string {
  const value = source[key];

  if (typeof value !== "string") {
    return "";
  }

  return normalizeSingleLine(
    value,
    maximumLength,
  );
}

function readMultiline(
  source: Record<string, unknown>,
  key: string,
  maximumLength: number,
): string {
  const value = source[key];

  if (typeof value !== "string") {
    return "";
  }

  return normalizeMultiline(
    value,
    maximumLength,
  );
}

function normalizePreferredContact(
  value: string,
): PreferredContact {
  if (
    ALLOWED_PREFERRED_CONTACTS.has(
      value as PreferredContact,
    )
  ) {
    return value as PreferredContact;
  }

  return "Email";
}

function createPayload(
  source: Record<string, unknown>,
): ContactPayload {
  const preferredContact =
    normalizePreferredContact(
      readSingleLine(
        source,
        "preferredContact",
        MAX_LENGTHS.preferredContact,
      ),
    );

  return {
    name: readSingleLine(
      source,
      "name",
      MAX_LENGTHS.name,
    ),

    email: readSingleLine(
      source,
      "email",
      MAX_LENGTHS.email,
    ).toLowerCase(),

    phone: readSingleLine(
      source,
      "phone",
      MAX_LENGTHS.phone,
    ),

    service:
      readSingleLine(
        source,
        "service",
        MAX_LENGTHS.service,
      ) || "General question",

    preferredContact,

    message: readMultiline(
      source,
      "message",
      MAX_LENGTHS.message,
    ),

    website: readSingleLine(
      source,
      "website",
      MAX_LENGTHS.website,
    ),
  };
}

function escapeHtml(
  value: string,
): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isValidEmail(
  value: string,
): boolean {
  return (
    value.length >= 5 &&
    value.length <=
      MAX_LENGTHS.email &&
    EMAIL_PATTERN.test(value)
  );
}

function getPhoneDigitCount(
  value: string,
): number {
  return value.replace(/\D/g, "").length;
}

function isValidPhone(
  value: string,
): boolean {
  if (!value) {
    return true;
  }

  const digitCount =
    getPhoneDigitCount(value);

  return (
    digitCount >= 7 &&
    digitCount <= 15
  );
}

function isEarlierOpeningRequest(
  service: string,
): boolean {
  return service
    .toLowerCase()
    .includes("earlier opening");
}

function validatePayload(
  payload: ContactPayload,
): ValidationResult {
  if (payload.name.length < 2) {
    return {
      ok: false,
      message:
        "Please provide your name.",
    };
  }

  if (!isValidEmail(payload.email)) {
    return {
      ok: false,
      message:
        "Please provide a valid email address.",
    };
  }

  if (!isValidPhone(payload.phone)) {
    return {
      ok: false,
      message:
        "Please provide a valid phone number or leave the phone field empty.",
    };
  }

  if (payload.message.length < 10) {
    return {
      ok: false,
      message:
        "Please provide a message of at least 10 characters.",
    };
  }

  const phoneIsRequired =
    payload.preferredContact ===
      "Text" ||
    payload.preferredContact ===
      "Phone call" ||
    isEarlierOpeningRequest(
      payload.service,
    );

  if (
    phoneIsRequired &&
    !payload.phone
  ) {
    return {
      ok: false,

      message:
        isEarlierOpeningRequest(
          payload.service,
        )
          ? "Please provide a phone number so Heather can contact you if an earlier opening becomes available."
          : `Please provide a phone number because your preferred reply method is ${payload.preferredContact.toLowerCase()}.`,
    };
  }

  return {
    ok: true,
  };
}

function isAllowedOrigin(
  request: Request,
): boolean {
  const origin =
    request.headers.get("origin");

  /*
   * Browser fetch requests from the public form normally include
   * Origin. Server tests and certain privacy tools may omit it.
   */
  if (!origin) {
    return true;
  }

  try {
    return (
      new URL(origin).origin ===
      new URL(request.url).origin
    );
  } catch {
    return false;
  }
}

function isCrossSiteRequest(
  request: Request,
): boolean {
  return (
    request.headers.get(
      "sec-fetch-site",
    ) === "cross-site"
  );
}

function getContentLength(
  request: Request,
): number | null {
  const rawValue =
    request.headers.get(
      "content-length",
    );

  if (!rawValue) {
    return null;
  }

  const parsedValue =
    Number(rawValue);

  if (
    !Number.isFinite(parsedValue) ||
    parsedValue < 0
  ) {
    return null;
  }

  return parsedValue;
}

async function readRequestText(
  request: Request,
): Promise<
  | {
      ok: true;
      text: string;
    }
  | {
      ok: false;
      tooLarge: boolean;
    }
> {
  if (!request.body) {
    return {
      ok: false,
      tooLarge: false,
    };
  }

  const reader =
    request.body.getReader();

  const decoder =
    new TextDecoder();

  let totalBytes = 0;
  let text = "";

  try {
    while (true) {
      const {
        done,
        value,
      } = await reader.read();

      if (done) {
        break;
      }

      totalBytes +=
        value.byteLength;

      if (
        totalBytes >
        MAX_REQUEST_BYTES
      ) {
        try {
          await reader.cancel();
        } catch {
          // The stream may already be closed.
        }

        return {
          ok: false,
          tooLarge: true,
        };
      }

      text += decoder.decode(
        value,
        {
          stream: true,
        },
      );
    }

    text += decoder.decode();

    return {
      ok: true,
      text,
    };
  } finally {
    reader.releaseLock();
  }
}

async function parseRequestBody(
  request: Request,
): Promise<ParsedRequestBody> {
  const contentType =
    request.headers
      .get("content-type")
      ?.split(";")[0]
      .trim()
      .toLowerCase();

  if (
    contentType !==
    "application/json"
  ) {
    return {
      ok: false,
      status: 415,
      message:
        "The contact form requires a JSON request.",
    };
  }

  const declaredLength =
    getContentLength(request);

  if (
    declaredLength !== null &&
    declaredLength >
      MAX_REQUEST_BYTES
  ) {
    return {
      ok: false,
      status: 413,
      message:
        "The contact request exceeded the permitted size.",
    };
  }

  const bodyResult =
    await readRequestText(request);

  if (!bodyResult.ok) {
    return {
      ok: false,

      status: bodyResult.tooLarge
        ? 413
        : 400,

      message: bodyResult.tooLarge
        ? "The contact request exceeded the permitted size."
        : "The contact request did not contain a valid body.",
    };
  }

  if (!bodyResult.text.trim()) {
    return {
      ok: false,
      status: 400,
      message:
        "The contact request did not contain a valid body.",
    };
  }

  try {
    const parsed: unknown =
      JSON.parse(bodyResult.text);

    if (!isRecord(parsed)) {
      return {
        ok: false,
        status: 400,
        message:
          "The contact request was not valid.",
      };
    }

    return {
      ok: true,
      body: parsed,
    };
  } catch {
    return {
      ok: false,
      status: 400,
      message:
        "The contact request contained invalid JSON.",
    };
  }
}

function sanitizePhoneHref(
  phone: string,
): string {
  return phone.replace(/[^\d+]/g, "");
}

function formatSubmittedAt(
  date: Date,
): string {
  try {
    return new Intl.DateTimeFormat(
      "en-CA",
      {
        dateStyle: "full",
        timeStyle: "short",
        timeZone:
          "America/Edmonton",
      },
    ).format(date);
  } catch {
    return date.toISOString();
  }
}

function createTextEmail(
  payload: ContactPayload,
  submittedAt: Date,
  requestId: string,
): string {
  return [
    `New ${siteConfig.businessName} website message`,
    "",
    `Submitted: ${formatSubmittedAt(
      submittedAt,
    )}`,
    `Reference: ${requestId}`,
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,

    `Phone: ${
      payload.phone ||
      "Not provided"
    }`,

    `Preferred reply: ${payload.preferredContact}`,
    `Topic or service: ${payload.service}`,
    "",
    "Message:",
    payload.message,
    "",
    "Reply directly to this email to contact the sender.",
  ].join("\n");
}

function createHtmlEmail(
  payload: ContactPayload,
  submittedAt: Date,
  requestId: string,
): string {
  const safeName =
    escapeHtml(payload.name);

  const safeEmail =
    escapeHtml(payload.email);

  const safePhone = escapeHtml(
    payload.phone ||
      "Not provided",
  );

  const safeService =
    escapeHtml(payload.service);

  const safePreferredContact =
    escapeHtml(
      payload.preferredContact,
    );

  const safeSubmittedAt =
    escapeHtml(
      formatSubmittedAt(
        submittedAt,
      ),
    );

  const safeRequestId =
    escapeHtml(requestId);

  const safeMessage =
    escapeHtml(
      payload.message,
    ).replaceAll(
      "\n",
      "<br />",
    );

  const phoneHref =
    sanitizePhoneHref(
      payload.phone,
    );

  const phoneMarkup =
    payload.phone && phoneHref
      ? `
        <a
          href="tel:${escapeHtml(
            phoneHref,
          )}"
          style="
            color: #365d38;
            text-decoration: none;
          "
        >
          ${safePhone}
        </a>
      `
      : safePhone;

  return `
    <!doctype html>
    <html lang="en-CA">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width"
        />
        <title>
          New website message
        </title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background: #f4efe4;
          color: #20251f;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        "
      >
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="background: #f4efe4"
        >
          <tr>
            <td
              align="center"
              style="padding: 32px 16px"
            >
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width: 100%;
                  max-width: 660px;
                  overflow: hidden;
                  border: 1px solid #ddd2b9;
                  border-radius: 18px;
                  background: #fffdf8;
                "
              >
                <tr>
                  <td
                    style="
                      padding: 28px 32px;
                      background: #142719;
                      color: #fffaf0;
                    "
                  >
                    <p
                      style="
                        margin: 0 0 8px;
                        color: #d8bd76;
                        font-size: 12px;
                        font-weight: 700;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                      "
                    >
                      ${escapeHtml(
                        siteConfig.businessName,
                      )}
                    </p>

                    <h1
                      style="
                        margin: 0;
                        font-family:
                          Georgia,
                          'Times New Roman',
                          serif;
                        font-size: 30px;
                        font-weight: 500;
                        line-height: 1.2;
                      "
                    >
                      New website message
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 18px 32px;
                      border-bottom:
                        1px solid #e2d8c2;
                      background: #f8f3e9;
                      color: #6b6257;
                      font-size: 13px;
                      line-height: 1.6;
                    "
                  >
                    Submitted:
                    ${safeSubmittedAt}
                    <br />

                    Reference:
                    ${safeRequestId}
                  </td>
                </tr>

                <tr>
                  <td
                    style="padding: 30px 32px"
                  >
                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                    >
                      <tr>
                        <td
                          style="
                            padding: 0 0 12px;
                            line-height: 1.6;
                          "
                        >
                          <strong>Name:</strong>
                          ${safeName}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            padding: 0 0 12px;
                            line-height: 1.6;
                          "
                        >
                          <strong>Email:</strong>

                          <a
                            href="mailto:${safeEmail}"
                            style="
                              color: #365d38;
                              text-decoration: none;
                            "
                          >
                            ${safeEmail}
                          </a>
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            padding: 0 0 12px;
                            line-height: 1.6;
                          "
                        >
                          <strong>Phone:</strong>
                          ${phoneMarkup}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            padding: 0 0 12px;
                            line-height: 1.6;
                          "
                        >
                          <strong>
                            Preferred reply:
                          </strong>

                          ${safePreferredContact}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            padding: 0 0 24px;
                            line-height: 1.6;
                          "
                        >
                          <strong>
                            Topic or service:
                          </strong>

                          ${safeService}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            padding: 24px;
                            border:
                              1px solid #e2d8c2;
                            border-radius: 14px;
                            background: #f8f3e9;
                            line-height: 1.7;
                          "
                        >
                          <strong
                            style="
                              display: block;
                              margin-bottom: 10px;
                              color: #365d38;
                            "
                          >
                            Message
                          </strong>

                          ${safeMessage}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            padding-top: 24px;
                            text-align: center;
                          "
                        >
                          <a
                            href="mailto:${safeEmail}"
                            style="
                              display: inline-block;
                              padding:
                                13px 20px;
                              border-radius:
                                999px;
                              background:
                                #365d38;
                              color: #fffdf8;
                              font-size: 14px;
                              font-weight: 700;
                              text-decoration:
                                none;
                            "
                          >
                            Reply to
                            ${safeName}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function parseRecipientList(
  value: string | undefined,
): string[] {
  const recipients = (
    value ||
    siteConfig.email
  )
    .split(",")
    .map((email) =>
      email.trim().toLowerCase(),
    )
    .filter(isValidEmail);

  return Array.from(
    new Set(recipients),
  );
}

function getEmailConfiguration():
  EmailConfiguration | null {
  const apiKey =
    process.env.RESEND_API_KEY?.trim();

  const fromEmail =
    process.env.CONTACT_FROM_EMAIL
      ?.trim();

  const toEmails =
    parseRecipientList(
      process.env.CONTACT_TO_EMAIL,
    );

  if (
    !apiKey ||
    !fromEmail ||
    toEmails.length === 0
  ) {
    return null;
  }

  return {
    apiKey,
    fromEmail,
    toEmails,
  };
}

function createIdempotencyKey(
  payload: ContactPayload,
  configuration: EmailConfiguration,
  submittedAt: Date,
): string {
  const submissionWindow =
    Math.floor(
      submittedAt.getTime() /
        DUPLICATE_WINDOW_MS,
    );

  const fingerprint = [
    configuration.fromEmail,
    configuration.toEmails.join(","),
    payload.name.toLowerCase(),
    payload.email,
    payload.phone,
    payload.service.toLowerCase(),
    payload.preferredContact,
    payload.message,
    String(submissionWindow),
  ].join("\n");

  const digest =
    createHash("sha256")
      .update(
        fingerprint,
        "utf8",
      )
      .digest("hex");

  return `mhm-contact-v4-${digest}`;
}

function createEmailSubject(
  payload: ContactPayload,
): string {
  return normalizeSingleLine(
    `[Website] ${payload.service} — ${payload.name}`,
    180,
  );
}

async function parseResendResponse(
  responseText: string,
): Promise<
  ResendSuccessResponse &
    ResendErrorResponse
> {
  if (!responseText) {
    return {};
  }

  try {
    const value: unknown =
      JSON.parse(responseText);

    return isRecord(value)
      ? (value as ResendSuccessResponse &
          ResendErrorResponse)
      : {};
  } catch {
    return {};
  }
}

async function sendWithResend(
  payload: ContactPayload,
  configuration: EmailConfiguration,
  submittedAt: Date,
  requestId: string,
): Promise<ResendSuccessResponse> {
  const abortController =
    new AbortController();

  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, RESEND_TIMEOUT_MS);

  const idempotencyKey =
    createIdempotencyKey(
      payload,
      configuration,
      submittedAt,
    );

  try {
    const response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${configuration.apiKey}`,

          "Content-Type":
            "application/json",

          "Idempotency-Key":
            idempotencyKey,
        },

        body: JSON.stringify({
          from:
            configuration.fromEmail,

          to:
            configuration.toEmails,

          reply_to: payload.email,

          subject:
            createEmailSubject(
              payload,
            ),

          text: createTextEmail(
            payload,
            submittedAt,
            requestId,
          ),

          html: createHtmlEmail(
            payload,
            submittedAt,
            requestId,
          ),
        }),

        cache: "no-store",
        signal:
          abortController.signal,
      },
    );

    const responseText =
      await response.text();

    const result =
      await parseResendResponse(
        responseText,
      );

    if (!response.ok) {
      throw new ResendRequestError(
        response.status,

        result.name ||
          "unknown_provider_error",
      );
    }

    return {
      id: result.id,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse> {
  const requestId =
    randomUUID();

  if (
    isCrossSiteRequest(request) ||
    !isAllowedOrigin(request)
  ) {
    console.warn(
      "Rejected cross-site contact request.",
      {
        requestId,
      },
    );

    return jsonResponse(
      requestId,
      {
        ok: false,
        message:
          "This request is not permitted.",
      },
      403,
    );
  }

  let parsedBody:
    ParsedRequestBody;

  try {
    parsedBody =
      await parseRequestBody(
        request,
      );
  } catch (error) {
    console.warn(
      "Unable to read contact request body.",
      {
        requestId,

        reason:
          error instanceof Error
            ? error.name
            : "unknown_error",
      },
    );

    return jsonResponse(
      requestId,
      {
        ok: false,

        message:
          "The contact request could not be read.",
      },
      400,
    );
  }

  if (!parsedBody.ok) {
    return jsonResponse(
      requestId,
      {
        ok: false,
        message:
          parsedBody.message,
      },
      parsedBody.status,
    );
  }

  const payload =
    createPayload(
      parsedBody.body,
    );

  /*
   * Honeypot field. Return the same type of response as a successful
   * request so automated submitters are not informed that detection
   * occurred.
   */
  if (payload.website) {
    return jsonResponse(
      requestId,
      {
        ok: true,

        message:
          "Thank you. Your message has been received.",
      },
    );
  }

  const validation =
    validatePayload(payload);

  if (!validation.ok) {
    return jsonResponse(
      requestId,
      {
        ok: false,
        message:
          validation.message,
      },
      400,
    );
  }

  const emailConfiguration =
    getEmailConfiguration();

  if (!emailConfiguration) {
    console.error(
      "Contact email configuration is incomplete.",
      {
        requestId,

        missingResendApiKey:
          !process.env
            .RESEND_API_KEY,

        missingContactFromEmail:
          !process.env
            .CONTACT_FROM_EMAIL,
      },
    );

    return jsonResponse(
      requestId,
      {
        ok: false,

        message:
          "Online messaging is temporarily unavailable. Please text or email Heather directly.",
      },
      503,
      {
        "Retry-After": "60",
      },
    );
  }

  const submittedAt =
    new Date();

  try {
    const resendResult =
      await sendWithResend(
        payload,
        emailConfiguration,
        submittedAt,
        requestId,
      );

    console.info(
      "Contact message accepted by email provider.",
      {
        requestId,

        providerMessageId:
          resendResult.id ||
          "not-returned",
      },
    );

    return jsonResponse(
      requestId,
      {
        ok: true,

        message:
          "Thank you. Your message has been sent to Heather successfully.",
      },
    );
  } catch (error) {
    const isTimeout =
      error instanceof Error &&
      error.name ===
        "AbortError";

    const providerStatus =
      error instanceof
      ResendRequestError
        ? error.status
        : undefined;

    const providerCode =
      error instanceof
      ResendRequestError
        ? error.providerCode
        : undefined;

    console.error(
      "Contact message delivery failed.",
      {
        requestId,
        isTimeout,
        providerStatus,
        providerCode,
      },
    );

    return jsonResponse(
      requestId,
      {
        ok: false,

        message: isTimeout
          ? "The message service took too long to respond. Please try again or contact Heather directly."
          : "Your message could not be sent right now. Please text or email Heather directly.",
      },
      isTimeout ? 504 : 502,
      {
        "Retry-After":
          isTimeout ? "30" : "60",
      },
    );
  }
}