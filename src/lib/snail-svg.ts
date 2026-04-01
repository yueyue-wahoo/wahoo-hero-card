import { FourDPProfile } from "@/types";

// Official Wahoo 4DP colors from redesignr theme
const COLORS = {
  ftp: { gradientStart: "#29d4ff", gradientEnd: "#a7edff" },
  map: { gradientStart: "#fecf12", gradientEnd: "#fef39b" },
  ac: { gradientStart: "#ff8400", gradientEnd: "#ffcea1" },
  nm: { gradientStart: "#ff36a4", gradientEnd: "#ffc2e4" },
};

const LABELS: Record<string, string> = {
  ftp: "ENDURE",
  map: "BREAKAWAY",
  ac: "ATTACK",
  nm: "SPRINT",
};

const SECONDARY_LABELS: Record<string, string> = {
  ftp: "FTP",
  map: "MAP",
  ac: "AC",
  nm: "NM",
};

const SECONDARY_MAIN = "#ecedee";
const DIVIDER_COLOR = "#0000001f";
const TEXT_SECONDARY = "#00000099";

interface RingCalc {
  key: string;
  index: number;
  value: number;
  rank: number;
  radius: number;
  circumference: number;
  dashoffset: number;
  dashoffsetMax: number;
  clampedValue: number;
  gradientStart: string;
  gradientEnd: string;
}

/**
 * Generate a standalone SVG string for the snail chart.
 * Includes horizontal bars with labels that flow continuously into concentric rings.
 * Faithfully reproduces the layout from WahooFitness/redesignr WfSnail component.
 */
export function generateSnailSvg(
  profile: FourDPProfile,
  componentHeight: number
): string {
  const keys = ["ftp", "map", "ac", "nm"] as const;

  // Match the original component's sizing math
  const BAR_PADDING = componentHeight * 0.025;
  const BAR_HEIGHT = componentHeight * 0.075;
  const MAX_RADIUS = (componentHeight - (BAR_HEIGHT + BAR_PADDING) * 2) / 2;

  // Width: bars on left + rings on right + label margins
  const componentWidth = (MAX_RADIUS + BAR_HEIGHT) * 2 + 60;
  const cx = componentWidth / 2;
  const cy = componentHeight / 2;

  const values: Record<string, number> = {
    ftp: profile.ftp.value,
    map: profile.map.value,
    ac: profile.ac.value,
    nm: profile.nm.value,
  };

  const ranks: Record<string, number> = {
    ftp: profile.ftp.rank,
    map: profile.map.rank,
    ac: profile.ac.rank,
    nm: profile.nm.rank,
  };

  const rings: RingCalc[] = keys.map((key, index) => {
    const rank = ranks[key];
    const radius = MAX_RADIUS - (BAR_HEIGHT + BAR_PADDING) * index;
    const circumference = 2 * Math.PI * radius;
    const maxFillRatio = 0.75;
    const clampedValue = Math.max(-1, Math.min(1, rank));
    const arcLength = circumference * ((clampedValue + 1) / 2) * maxFillRatio;
    const dashoffset = circumference - arcLength;
    const dashoffsetMax = circumference * (1 - maxFillRatio);

    return {
      key,
      index,
      value: values[key],
      rank,
      radius,
      circumference,
      dashoffset,
      dashoffsetMax,
      clampedValue,
      gradientStart: COLORS[key].gradientStart,
      gradientEnd: COLORS[key].gradientEnd,
    };
  });

  const defs: string[] = [];
  const elements: string[] = [];

  // --- Gradient definitions ---
  rings.forEach((ring, i) => {
    defs.push(`
      <linearGradient id="grad-${i}" gradientTransform="rotate(5)">
        <stop offset="0%" stop-color="${ring.gradientStart}" />
        <stop offset="100%" stop-color="${ring.gradientEnd}" />
      </linearGradient>
      <linearGradient id="bar-grad-${i}">
        <stop offset="0%" stop-color="${ring.gradientEnd}" />
        <stop offset="100%" stop-color="${ring.gradientStart}" />
      </linearGradient>
    `);
  });

  // --- Mask: cut out where colored arcs go from the grey background ---
  let maskCircles = "";
  rings.forEach((ring) => {
    const linecap = ring.clampedValue === 1 ? "butt" : "round";
    maskCircles += `
      <circle cx="${cx}" cy="${cy}" r="${ring.radius}"
        stroke="black" stroke-width="${BAR_HEIGHT + 5}" fill="none"
        stroke-dasharray="${ring.circumference}"
        stroke-dashoffset="${ring.dashoffset}"
        stroke-linecap="${linecap}"
        transform="rotate(-90 ${cx} ${cy})" />
    `;
  });

  defs.push(`
    <mask id="grey-mask">
      <rect x="0" y="0" width="${componentWidth}" height="${componentHeight}" fill="white" />
      ${maskCircles}
    </mask>
  `);

  // --- Background grey circles (masked) ---
  let bgCircles = "";
  rings.forEach((ring) => {
    bgCircles += `
      <circle cx="${cx}" cy="${cy}" r="${ring.radius}"
        stroke="${SECONDARY_MAIN}" stroke-width="${BAR_HEIGHT}" fill="none"
        stroke-dasharray="${ring.circumference}"
        stroke-dashoffset="${ring.dashoffsetMax}"
        transform="rotate(-90 ${cx} ${cy})" />
    `;
  });
  elements.push(`<g mask="url(#grey-mask)">${bgCircles}</g>`);

  // --- Colored circles (rings) ---
  rings.forEach((ring, i) => {
    const linecap = ring.clampedValue === 1 ? "butt" : "round";
    elements.push(`
      <circle cx="${cx}" cy="${cy}" r="${ring.radius}"
        stroke="url(#grad-${i})" stroke-width="${BAR_HEIGHT}" fill="none"
        stroke-dasharray="${ring.circumference}"
        stroke-dashoffset="${ring.dashoffset}"
        stroke-linecap="${linecap}"
        transform="rotate(-90 ${cx} ${cy})" />
    `);
  });

  // --- Horizontal bars from left edge to center ---
  // These connect continuously to the rings (drawn AFTER circles to cover left stroke edges)
  rings.forEach((ring, i) => {
    const barY = BAR_PADDING + 0.5 * BAR_HEIGHT + (BAR_PADDING + BAR_HEIGHT) * i;
    elements.push(`
      <rect x="0" y="${barY}" width="${cx}" height="${BAR_HEIGHT}"
        fill="${ring.gradientEnd}" />
    `);
  });

  // --- Labels and values ON the bars ---
  rings.forEach((ring, i) => {
    const barY = BAR_PADDING + 0.5 * BAR_HEIGHT + (BAR_PADDING + BAR_HEIGHT) * i;
    const textY = barY + BAR_HEIGHT / 2;
    const fontSize = Math.max(10, BAR_HEIGHT * 0.55);

    // Label (left side): "FTP 60 min"
    elements.push(`
      <text x="${8}" y="${textY}"
        font-family="Inter, Arial, sans-serif" font-size="${fontSize}" font-weight="600"
        fill="#000000" dominant-baseline="central">
        ${LABELS[ring.key]}
        <tspan font-weight="400" font-size="${fontSize * 0.8}" dx="3">${SECONDARY_LABELS[ring.key]}</tspan>
      </text>
    `);

    // Value (right side): "228 W"
    elements.push(`
      <text x="${cx - 8}" y="${textY}"
        font-family="Inter, Arial, sans-serif" font-size="${fontSize}" font-weight="700"
        fill="#000000" dominant-baseline="central" text-anchor="end">
        ${ring.value}
        <tspan font-weight="400" font-size="${fontSize * 0.75}" dx="1">W</tspan>
      </text>
    `);
  });

  // --- 3 Dotted divider lines ---
  const R = MAX_RADIUS + BAR_HEIGHT - 2;

  // Line 1: Horizontal - left extent to center
  elements.push(`
    <line x1="${(componentWidth - R * 2) / 2}" y1="${cy}"
      x2="${cx}" y2="${cy}"
      stroke="${DIVIDER_COLOR}" stroke-width="2" stroke-dasharray="4,4" />
  `);

  // Line 2: Vertical - top extent to center
  elements.push(`
    <line x1="${cx}" y1="${(componentHeight - R * 2) / 2}"
      x2="${cx}" y2="${cy}"
      stroke="${DIVIDER_COLOR}" stroke-width="2" stroke-dasharray="4,4" />
  `);

  // Line 3: Diagonal - center to bottom-right at 45°
  elements.push(`
    <line x1="${cx}" y1="${cy}"
      x2="${cx + R / Math.sqrt(2)}" y2="${cy + R / Math.sqrt(2)}"
      stroke="${DIVIDER_COLOR}" stroke-width="2" stroke-dasharray="4,4" />
  `);

  // --- Arc label paths ---
  const opportunityR = MAX_RADIUS + BAR_HEIGHT + 2;
  const labelR = MAX_RADIUS + BAR_HEIGHT + 12;

  defs.push(`
    <path id="opportunityPath"
      d="M ${cx},${cy - opportunityR} A ${opportunityR},${opportunityR} 0 0,1 ${cx + opportunityR},${cy}"
      fill="none" />
    <path id="baselinePath"
      d="M ${cx},${cy + labelR} A ${labelR},${labelR} 0 0,0 ${cx + labelR},${cy}"
      fill="none" />
    <path id="strengthPath"
      d="M ${cx - labelR},${cy} A ${labelR},${labelR} 0 0,0 ${cx},${cy + labelR}"
      fill="none" />
  `);

  const labelStyle = `fill="${TEXT_SECONDARY}" font-family="Inter, Arial, sans-serif" font-size="${Math.max(8, componentHeight * 0.035)}" text-anchor="middle"`;

  elements.push(`
    <text ${labelStyle}>
      <textPath href="#opportunityPath" startOffset="50%">
        <tspan letter-spacing="1.5">OPPORTUNITY</tspan>
      </textPath>
    </text>
    <text ${labelStyle}>
      <textPath href="#baselinePath" startOffset="50%">
        <tspan letter-spacing="1.5">BASELINE</tspan>
      </textPath>
    </text>
    <text ${labelStyle}>
      <textPath href="#strengthPath" startOffset="50%">
        <tspan letter-spacing="1.5">STRENGTH</tspan>
      </textPath>
    </text>
  `);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${componentWidth}" height="${componentHeight}" viewBox="0 0 ${componentWidth} ${componentHeight}">
    <defs>${defs.join("")}</defs>
    ${elements.join("")}
  </svg>`;
}
