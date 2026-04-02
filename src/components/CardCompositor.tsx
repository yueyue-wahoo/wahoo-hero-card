"use client";

import { useRef, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import { FourDPProfile } from "@/types";
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  TEXT_MARGIN,
  CARD_PADDING,
} from "@/lib/card-layout";
import { generateSnailSvg } from "@/lib/snail-svg";

interface Props {
  riderName: string;
  cartoonImage: string | null;
  profile: FourDPProfile;
  eventName?: string;
  onReady?: () => void;
}

export default function CardCompositor({
  riderName,
  cartoonImage,
  profile,
  eventName,
  onReady,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load Inter font files for canvas rendering via FontFace API
    const fontSpecs = [
      { weight: "400", src: "/fonts/inter-400.woff2" },
      { weight: "500", src: "/fonts/inter-500.woff2" },
      { weight: "600", src: "/fonts/inter-600.woff2" },
      { weight: "700", src: "/fonts/inter-700.woff2" },
    ];
    await Promise.all(
      fontSpecs.map(async ({ weight, src }) => {
        try {
          const face = new FontFace("Inter", `url(${src})`, { weight, style: "normal" });
          const loaded = await face.load();
          document.fonts.add(loaded);
        } catch (e) {
          console.error(`Failed to load Inter weight ${weight}:`, e);
        }
      })
    );
    // Give the browser a frame to register the newly loaded fonts
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;

    // Prime the font for canvas — some browsers need a measureText call first
    ctx.font = "700 32px 'Inter'";
    ctx.measureText("test");
    ctx.font = "500 12px 'Inter'";
    ctx.measureText("test");

    // 1. Background — light gray with large diagonal chevron pattern
    ctx.fillStyle = "#E0E0E0";
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    drawLargeChevronPattern(ctx, CARD_WIDTH, CARD_HEIGHT);

    // Layout constants
    const cardInset = 25;

    // 2. Portrait image — fills upper area between text margins, with top padding
    const portraitTop = 25;
    const portraitLeft = TEXT_MARGIN + cardInset;
    const portraitRight = CARD_WIDTH - TEXT_MARGIN - cardInset;
    const portraitWidth = portraitRight - portraitLeft;
    const portraitHeight = CARD_HEIGHT * 0.50 - portraitTop;

    if (cartoonImage) {
      try {
        const img = await loadImage(`data:image/png;base64,${cartoonImage}`);
        ctx.save();
        ctx.beginPath();
        ctx.rect(portraitLeft, portraitTop, portraitWidth, portraitHeight);
        ctx.clip();
        const scale = Math.max(
          portraitWidth / img.width,
          portraitHeight / img.height
        ) * 0.974; // further 3% reduction to ensure jersey logo fits
        const w = img.width * scale;
        const h = img.height * scale;
        const x = portraitLeft + (portraitWidth - w) / 2;
        const y = portraitTop + (portraitHeight - h) / 2 - 20;
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();
      } catch (e) {
        console.error("Failed to load portrait image:", e);
      }
    }

    // 3. Wahoo logo — rotated vertically on left side, top of logo pointed inward
    try {
      const logo = await loadImage("/wahoo-logo.png");
      const logoHeight = 61;
      const logoWidth = logoHeight * (logo.width / logo.height);
      ctx.save();
      // Align left edge of logo with left edge of white card (cardInset)
      // Rotated 90°, so the logo's "height" becomes horizontal width on card
      ctx.translate(cardInset + logoHeight / 2, portraitTop + logoWidth / 2 + 10);
      ctx.rotate(Math.PI / 2);
      // Tint the logo black by drawing it into an offscreen canvas with composite
      const offscreen = document.createElement("canvas");
      offscreen.width = logo.width;
      offscreen.height = logo.height;
      const offCtx = offscreen.getContext("2d")!;
      offCtx.drawImage(logo, 0, 0);
      offCtx.globalCompositeOperation = "source-in";
      offCtx.fillStyle = "#1a1a1a";
      offCtx.fillRect(0, 0, logo.width, logo.height);
      ctx.drawImage(offscreen, -logoWidth / 2, -logoHeight / 2, logoWidth, logoHeight);
      ctx.restore();
    } catch (e) {
      console.error("Failed to load wahoo logo:", e);
    }

    // 4. Rider name — bold black, rotated vertically on right side (top of text faces inward/left)
    if (riderName) {
      ctx.save();
      ctx.translate(CARD_WIDTH - TEXT_MARGIN, portraitTop + 10);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "700 55px 'Inter', Arial, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(riderName, 0, 0);
      ctx.restore();
    }

    // 5. White stats card — rounded rectangle in the lower portion
    // cardInset declared above
    const whiteCardTop = CARD_HEIGHT * 0.43;
    const whiteCardLeft = cardInset;
    const whiteCardWidth = CARD_WIDTH - cardInset * 2;
    const whiteCardBottom = CARD_HEIGHT - cardInset;
    const whiteCardHeight = whiteCardBottom - whiteCardTop;
    const whiteCardRadius = 20;

    // Slight shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.12)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = "#FFFFFF";
    drawRoundedRect(ctx, whiteCardLeft, whiteCardTop, whiteCardWidth, whiteCardHeight,
      whiteCardRadius, whiteCardRadius, whiteCardRadius, whiteCardRadius);
    ctx.fill();
    ctx.restore();

    // 6. Cyclist type label + estimate badge inside white card
    const innerPad = 25; // consistent inner padding
    const cardContentLeft = whiteCardLeft + innerPad;
    const cardContentTop = whiteCardTop + innerPad;

    ctx.fillStyle = "#1a1a1a";
    ctx.font = "700 32px 'Inter', Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(profile.cyclistType, cardContentLeft, cardContentTop);

    if (profile.isEstimate) {
      const badgeX = whiteCardLeft + whiteCardWidth - innerPad - 80;
      const badgeY = cardContentTop + 2;
      ctx.strokeStyle = "#999";
      ctx.lineWidth = 1;
      drawRoundedRect(ctx, badgeX, badgeY, 80, 24, 6, 6, 6, 6);
      ctx.stroke();
      ctx.fillStyle = "#666";
      ctx.font = "500 12px 'Inter', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Estimate", badgeX + 40, badgeY + 12);
    }

    // 7. Snail chart — centered both horizontally and vertically in the white card
    try {
      const headerHeight = 36;
      const snailAreaTop = whiteCardTop + innerPad + headerHeight;
      const snailAreaBottom = whiteCardBottom - innerPad;
      const snailAreaLeft = whiteCardLeft + innerPad + 5;
      const snailAreaRight = whiteCardLeft + whiteCardWidth - innerPad;
      const snailAvailableHeight = snailAreaBottom - snailAreaTop;
      const snailAvailableWidth = snailAreaRight - snailAreaLeft;

      const svgString = generateSnailSvg(profile, snailAvailableHeight);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      const snailImg = await loadImage(svgUrl);
      URL.revokeObjectURL(svgUrl);

      // Fit preserving aspect ratio
      const svgAspect = snailImg.width / snailImg.height;
      let drawWidth = snailAvailableWidth;
      let drawHeight = drawWidth / svgAspect;

      if (drawHeight > snailAvailableHeight) {
        drawHeight = snailAvailableHeight;
        drawWidth = drawHeight * svgAspect;
      }

      // Center the snail within the available area
      const snailX = snailAreaLeft + (snailAvailableWidth - drawWidth) / 2;
      const snailY = snailAreaTop + (snailAvailableHeight - drawHeight) / 2;
      ctx.drawImage(snailImg, snailX, snailY, drawWidth, drawHeight);
    } catch (e) {
      console.error("Failed to render snail:", e);
    }

    onReady?.();
  }, [cartoonImage, profile, riderName, onReady]);

  useEffect(() => {
    renderCard();
  }, [renderCard]);

  const downloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [54, 86] });
    doc.addImage(dataUrl, "PNG", 0, 0, 54, 86);
    const sanitize = (s: string) =>
      s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const namePart = riderName ? sanitize(riderName) : "athlete";
    const eventPart = eventName?.trim() ? `-${sanitize(eventName)}` : "";
    const year = new Date().getFullYear();
    doc.save(`${namePart}-herocard${eventPart}-${year}.pdf`);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <canvas
        ref={canvasRef}
        className="max-w-full border rounded-lg shadow-lg"
        style={{ maxHeight: "70vh", width: "auto" }}
      />
      <button
        onClick={downloadCard}
        className="px-8 py-4 text-white bg-blue-600 rounded-xl text-lg font-bold hover:bg-blue-700 transition-colors"
      >
        Download PDF
      </button>
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

/**
 * Filled downward-pointing chevron pattern.
 * Chevron thickness and gap between chevrons are equal.
 */
function drawLargeChevronPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const chevronDepth = 120;
  const thickness = 72;
  const gap = thickness;
  const step = thickness + gap;

  ctx.fillStyle = "rgba(255,255,255,0.45)";

  for (let y = -chevronDepth - step; y < height + chevronDepth + step; y += step) {
    ctx.beginPath();
    // Outer V (top edge) — downward pointing
    ctx.moveTo(0, y);
    ctx.lineTo(width / 2, y + chevronDepth);
    ctx.lineTo(width, y);
    // Inner V (bottom edge, offset by thickness)
    ctx.lineTo(width, y + thickness);
    ctx.lineTo(width / 2, y + chevronDepth + thickness);
    ctx.lineTo(0, y + thickness);
    ctx.closePath();
    ctx.fill();
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  tlr: number, trr: number, brr: number, blr: number
) {
  ctx.beginPath();
  ctx.moveTo(x + tlr, y);
  ctx.lineTo(x + w - trr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + trr);
  ctx.lineTo(x + w, y + h - brr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - brr, y + h);
  ctx.lineTo(x + blr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - blr);
  ctx.lineTo(x, y + tlr);
  ctx.quadraticCurveTo(x, y, x + tlr, y);
  ctx.closePath();
}
