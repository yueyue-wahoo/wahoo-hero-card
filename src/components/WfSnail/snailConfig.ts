export interface RingConfig {
  label: string;
  secondaryLabel: string;
  secondaryToolTip?: string;
  colorKey: "4dpFtp" | "4dpMap" | "4dpAc" | "4dpNm";
}

export const cyclingConfig: RingConfig[] = [
  {
    label: "FTP",
    secondaryLabel: "60 min",
    colorKey: "4dpFtp",
  },
  {
    label: "MAP",
    secondaryLabel: "5 min",
    colorKey: "4dpMap",
  },
  {
    label: "AC",
    secondaryLabel: "1 min",
    secondaryToolTip: "1 min while fatigued",
    colorKey: "4dpAc",
  },
  {
    label: "NM",
    secondaryLabel: "5 sec",
    colorKey: "4dpNm",
  },
];

// Wahoo official 4DP colors from redesignr theme
const RING_COLORS = {
  "4dpFtp": {
    main: "#02c4f5",
    gradientStart: "#29d4ff",
    gradientEnd: "#a7edff",
  },
  "4dpMap": {
    main: "#f5b700",
    gradientStart: "#fecf12",
    gradientEnd: "#fef39b",
  },
  "4dpAc": {
    main: "#ff8400",
    gradientStart: "#ff8400",
    gradientEnd: "#ffcea1",
  },
  "4dpNm": {
    main: "#ff33a3",
    gradientStart: "#ff36a4",
    gradientEnd: "#ffc2e4",
  },
} as const;

export function getRingColors(colorKey: RingConfig["colorKey"]) {
  return RING_COLORS[colorKey];
}
