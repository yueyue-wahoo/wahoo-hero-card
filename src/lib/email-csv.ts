import { promises as fs } from "fs";
import path from "path";

export interface CapturedEmail {
  timestamp: string;
  email: string;
  marketingOptIn: boolean;
  riderName: string;
  cyclistType: string;
  eventName: string;
}

const CSV_HEADER =
  "timestamp,email,marketingOptIn,riderName,cyclistType,eventName\n";

export function csvPath(): string {
  return (
    process.env.EMAIL_CAPTURE_CSV_PATH ||
    path.join(process.cwd(), "data", "emails.csv")
  );
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsvRow(entry: CapturedEmail): string {
  return (
    [
      entry.timestamp,
      entry.email,
      entry.marketingOptIn ? "true" : "false",
      entry.riderName,
      entry.cyclistType,
      entry.eventName,
    ]
      .map(escapeCsvField)
      .join(",") + "\n"
  );
}

export async function appendCapturedEmail(entry: CapturedEmail): Promise<void> {
  const filePath = csvPath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  let needsHeader = false;
  try {
    await fs.access(filePath);
  } catch {
    needsHeader = true;
  }

  const payload = (needsHeader ? CSV_HEADER : "") + toCsvRow(entry);
  await fs.appendFile(filePath, payload, "utf8");
}

export async function readCapturedEmailsCsv(): Promise<string | null> {
  try {
    return await fs.readFile(csvPath(), "utf8");
  } catch {
    return null;
  }
}

export async function countCapturedEmails(): Promise<number> {
  const contents = await readCapturedEmailsCsv();
  if (!contents) return 0;
  const lines = contents.split("\n").filter((l) => l.trim().length > 0);
  return Math.max(0, lines.length - 1);
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") || "event"
  );
}

export async function archiveAndReset(
  eventName: string
): Promise<{ archivedPath: string; archivedCount: number } | null> {
  const filePath = csvPath();

  let archivedCount = 0;
  try {
    archivedCount = await countCapturedEmails();
  } catch {
    return null;
  }
  if (archivedCount === 0) return null;

  const archiveDir = path.join(path.dirname(filePath), "archives");
  await fs.mkdir(archiveDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const archivedPath = path.join(
    archiveDir,
    `emails-${slugify(eventName)}-${stamp}.csv`
  );

  await fs.rename(filePath, archivedPath);

  return { archivedPath, archivedCount };
}
