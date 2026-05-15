import { NextRequest, NextResponse } from "next/server";
import { appendCapturedEmail } from "@/lib/email-csv";

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

  const eventName = request.cookies.get("event-name")?.value ?? "";

  try {
    await appendCapturedEmail({
      timestamp: new Date().toISOString(),
      email,
      marketingOptIn: !!body.marketingOptIn,
      riderName: (body.riderName ?? "").trim(),
      cyclistType: (body.cyclistType ?? "").trim(),
      eventName,
    });
  } catch (err) {
    console.error("Failed to append captured email", err);
    return NextResponse.json(
      { ok: false, error: "Failed to save email" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
