import { NextResponse } from "next/server";
import { readCapturedEmailsCsv } from "@/lib/email-csv";

export async function GET() {
  const contents = await readCapturedEmailsCsv();

  if (contents === null) {
    return new NextResponse(
      "timestamp,email,marketingOptIn,riderName,cyclistType,eventName\n",
      {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="emails-empty.csv"',
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  return new NextResponse(contents, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="emails-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
