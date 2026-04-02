// Card dimensions: 54mm x 86mm at 300 DPI
export const CARD_WIDTH = 638;
export const CARD_HEIGHT = 1016;

// Layout regions
export const TEXT_MARGIN = 50; // margin from edge for vertical text
export const CARD_PADDING = 15; // padding for white card from card edges

// Metric bar colors (used by snail SVG)
export const METRIC_COLORS = {
  ftp: "#B3E5FC",
  map: "#FFF9C4",
  ac: "#FFCCBC",
  nm: {
    start: "#F8BBD0",
    end: "#EC407A",
  },
} as const;

// Metric display labels
export const METRIC_LABELS = {
  ftp: { name: "ENDURE", abbrev: "FTP" },
  map: { name: "BREAKAWAY", abbrev: "MAP" },
  ac: { name: "ATTACK", abbrev: "AC" },
  nm: { name: "SPRINT", abbrev: "NM" },
} as const;
