export interface MetricValue {
  /** Watts */
  value: number;
  /** Rank from -1 to 1, controls snail arc fill */
  rank: number;
}

export interface FourDPProfile {
  ftp: MetricValue;
  map: MetricValue;
  ac: MetricValue;
  nm: MetricValue;
  cyclistType: string;
  isEstimate: boolean;
}

export type AccountMode = "demo" | "personal";

export type AppStep =
  | "name"
  | "photo"
  | "quiz"
  | "assembling"
  | "done";

export interface CardData {
  riderName: string;
  cartoonImage: string; // base64
  profile: FourDPProfile;
}
