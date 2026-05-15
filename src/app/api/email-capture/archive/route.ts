import { NextRequest, NextResponse } from "next/server";
import { archiveAndReset } from "@/lib/email-csv";

export async function POST(request: NextRequest) {
  const eventName = request.cookies.get("event-name")?.value ?? "";

  try {
    const result = await archiveAndReset(eventName);
    if (!result) {
      return NextResponse.json(
        { ok: false, error: "Nothing to archive" },
        { status: 400 }
      );
    }
    return NextResponse.json({
      ok: true,
      archivedCount: result.archivedCount,
    });
  } catch (err) {
    console.error("Failed to archive emails", err);
    return NextResponse.json(
      { ok: false, error: "Archive failed" },
      { status: 500 }
    );
  }
}
