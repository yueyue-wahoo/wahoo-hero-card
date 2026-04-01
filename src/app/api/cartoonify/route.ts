import { NextRequest, NextResponse } from "next/server";
import { cartoonifyImage } from "@/lib/openai";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

function saveDebugImages(original: string, cartoon?: string) {
  const dir = join(process.cwd(), "ref_images");
  mkdirSync(dir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  writeFileSync(join(dir, `${ts}-original.png`), Buffer.from(original, "base64"));
  if (cartoon) {
    writeFileSync(join(dir, `${ts}-cartoon.png`), Buffer.from(cartoon, "base64"));
  }
}

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      // Mock mode: return the original photo unchanged so UI can be tested
      console.log("OPENAI_API_KEY not set — returning original photo as mock cartoon");
      return NextResponse.json({ cartoonImage: image });
    }

    const cartoonImage = await cartoonifyImage(image);
    saveDebugImages(image, cartoonImage);
    return NextResponse.json({ cartoonImage });
  } catch (error) {
    console.error("Cartoonify error:", error);
    return NextResponse.json(
      { error: "Failed to cartoonify image" },
      { status: 500 }
    );
  }
}
