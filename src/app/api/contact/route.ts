import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  website?: string;
};

function validate(payload: ContactPayload): { ok: true; data: { name: string; email: string; message: string } } | { ok: false; errors: Record<string, string> } {
  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const message = payload.message?.trim() ?? "";

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Please enter your name";
  if (!email) errors.email = "Please enter your email";
  else if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email";
  if (!message) errors.message = "Tell us what you need";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return { ok: true, data: { name, email, message } };
}

export async function POST(request: Request) {
  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ errors: { form: "Invalid submission" } }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields; drop silently.
  if (payload.website) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const result = validate(payload);
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return NextResponse.json(
      { errors: { form: "Messaging is not configured yet — email us directly instead." } },
      { status: 500 }
    );
  }

  const { name, email, message } = result.data;
  const from = process.env.RESEND_FROM ?? "Rafters <on@rafters.site>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: ["therafters.official@gmail.com"],
        reply_to: email,
        subject: `New enquiry from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    });

    if (!res.ok) {
      console.error("Resend error:", res.status, await res.text());
      return NextResponse.json(
        { errors: { form: "Something went wrong sending your message. Please try again or email us directly." } },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Resend request failed:", err);
    return NextResponse.json(
      { errors: { form: "Something went wrong sending your message. Please try again or email us directly." } },
      { status: 502 }
    );
  }
}
