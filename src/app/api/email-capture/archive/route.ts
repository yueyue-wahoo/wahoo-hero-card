import { NextRequest, NextResponse } from "next/server";
import { archiveAndReset } from "@/lib/email-csv";

export async function POST(request: NextRequest) {
  const eventName = request.cookies.get("event-name")?.value ?? "";

  try {
    // null means the CSV was already empty/cleared — treat as success no-op
    // so a double-click race or a stale tab doesn't surface a confusing error
    // after the first request succeeded.
    const result = await archiveAndReset(eventName);
    return NextResponse.json({
      ok: true,
      archivedCount: result?.archivedCount ?? 0,
    });
  } catch (err) {
    console.error("Failed to archive emails", err);
    return NextResponse.json(
      { ok: false, error: "Archive failed" },
      { status: 500 }
    );
  }
}
