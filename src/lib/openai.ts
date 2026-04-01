import OpenAI, { toFile } from "openai";
import { readFileSync } from "fs";
import { join } from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load the style reference image once at module level
let styleReferenceBuffer: Buffer | null = null;
function getStyleReference(): Buffer {
  if (!styleReferenceBuffer) {
    styleReferenceBuffer = readFileSync(
      join(process.cwd(), "public", "assets", "style-reference.png")
    );
  }
  return styleReferenceBuffer;
}

export async function cartoonifyImage(base64Image: string): Promise<string> {
  const imageBuffer = Buffer.from(base64Image, "base64");
  const photoFile = await toFile(imageBuffer, "photo.png", {
    type: "image/png",
  });
  const styleFile = await toFile(getStyleReference(), "style-reference.png", {
    type: "image/png",
  });

  const response = await openai.images.edit({
    model: "gpt-image-1.5",
    image: [photoFile, styleFile],
    prompt: `You are given two images:

IMAGE 1: The person to cartoonify — preserve their likeness, pose, and expression.
IMAGE 2: Style reference — match this EXACT flat vector portrait style precisely.

Create a cartoon portrait of the person in IMAGE 1 that looks like it was drawn by the same artist who drew IMAGE 2. The style match to IMAGE 2 must be perfect.

STYLE (match IMAGE 2 exactly):
- FLAT CEL-SHADED coloring — each area is a single solid color fill with hard edges, like a clean vector illustration
- BOLD DARK OUTLINES (near-black, thick) around all major shapes: hair silhouette, face, jawline, clothing, ears
- NO gradients, NO highlights, NO specular shine, NO soft shading, NO realistic lighting whatsoever
- NO brushstrokes, texture, or noise on any surface
- Skin: ONE warm, natural flat color per region — no blush, no chin shadow, no light/dark sides. The tone should be warm and natural, not pale or oversaturated
- Hair: simple chunky solid-color shapes with perfectly smooth edges — ZERO flyaways, wisps, stray hairs, or frizz. Hair should look like clean vector paths, not painted
- Clothing: render as simple dark solid shapes with bold outlines and minimal detail — no fabric texture, no wrinkles, no complex folds
- Overall: clean, crisp, digital vector illustration quality

LIKENESS (critical):
- Preserve the person's recognizable features, face shape, hair style, and expression from IMAGE 1
- Subtly idealize: slightly larger/brighter eyes, smooth clear skin, symmetrical face
- Warm, genuine, friendly expression
- The person should be clearly recognizable but look like the best version of themselves
- Result should feel cute, charming, and appealing — like a character on a collectible trading card

DO NOT:
- Exaggerate unflattering features
- Add ANY realistic skin texture, pores, shadows, or lighting effects
- Include stray hairs or flyaways
- Copy the identity/face from IMAGE 2 — only copy the ART STYLE
- Include any background elements
- Use thin or grey outlines — outlines must be bold and dark

OUTPUT: Head and upper chest only, white/transparent background, no other elements.`,
    size: "1024x1024",
    quality: "high",
    background: "transparent",
    output_format: "png",
  });

  const imageData = response.data?.[0]?.b64_json;
  if (!imageData) {
    throw new Error("No image returned from OpenAI");
  }

  return imageData;
}
