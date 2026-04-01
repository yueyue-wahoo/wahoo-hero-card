import { NextRequest, NextResponse } from "next/server";
import { login, fetchFourDPProfile } from "@/lib/wahoo-cloud";

// Cache the demo token in memory so we don't re-login every request
let demoTokenCache: { token: string; expiresAt: number } | null = null;

async function getDemoToken(): Promise<string> {
  const email = process.env.WAHOO_DEMO_EMAIL;
  const password = process.env.WAHOO_DEMO_PASSWORD;

  if (!email || !password) {
    throw new Error("Demo account credentials not configured");
  }

  // Reuse cached token if less than 30 minutes old
  if (demoTokenCache && Date.now() < demoTokenCache.expiresAt) {
    return demoTokenCache.token;
  }

  const token = await login(email, password);
  demoTokenCache = { token, expiresAt: Date.now() + 30 * 60 * 1000 };
  return token;
}

export async function POST(request: NextRequest) {
  try {
    const { mode, email, password } = await request.json();

    let userToken: string;

    if (mode === "demo") {
      userToken = await getDemoToken();
    } else {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        );
      }
      userToken = await login(email, password);
    }

    const profile = await fetchFourDPProfile(userToken);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Wahoo profile error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch 4DP profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
