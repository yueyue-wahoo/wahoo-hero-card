import { NextRequest, NextResponse } from "next/server";

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(request: NextRequest) {
  let body: {
    email?: string;
    marketingOptIn?: boolean;
    riderName?: string;
    cyclistType?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }

  const webhookUrl = process.env.SHEETS_WEBHOOK_URL;
  const webhookSecret = process.env.SHEETS_WEBHOOK_SECRET;
  if (!webhookUrl || !webhookSecret) {
    console.error("SHEETS_WEBHOOK_URL or SHEETS_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { ok: false, error: "Email capture not configured" },
      { status: 500 }
    );
  }

  const eventName = request.cookies.get("event-name")?.value ?? "";

  const payload = {
    timestamp: new Date().toISOString(),
    email,
    marketingOptIn: !!body.marketingOptIn,
    riderName: (body.riderName ?? "").trim(),
    cyclistType: (body.cyclistType ?? "").trim(),
    eventName,
    secret: webhookSecret,
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    if (!res.ok) {
      console.error("Sheets webhook returned non-OK status", res.status);
      return NextResponse.json(
        { ok: false, error: "Sheets webhook failed" },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("Sheets webhook request failed", err);
    return NextResponse.json(
      { ok: false, error: "Sheets webhook unreachable" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
