import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("booth-session", "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set("event-name", "", { path: "/", maxAge: 0 });
  return res;
}
