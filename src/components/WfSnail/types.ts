export interface SnailDimension {
  /** Watts (cycling) */
  value: number;
  /** Rank from -1 to 1, controls arc fill position */
  rank: number;
}

export interface CyclingDimensions {
  ftp: SnailDimension;
  map: SnailDimension;
  ac: SnailDimension;
  nm: SnailDimension;
}

export enum WfSnailVariant {
  Standard = "standard",
  Small = "small",
}

export interface WfSnailProps {
  dimensions: CyclingDimensions;
  variant?: WfSnailVariant;
  empty?: boolean;
}
