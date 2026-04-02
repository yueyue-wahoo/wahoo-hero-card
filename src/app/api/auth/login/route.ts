import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password, eventName } = await request.json();

  if (!password || password !== process.env.BOOTH_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("booth-session", "authenticated", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  res.cookies.set("event-name", eventName?.trim() ?? "", {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
  });
  return res;
}
