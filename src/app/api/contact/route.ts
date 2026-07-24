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