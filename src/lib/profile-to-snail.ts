import { FourDPProfile } from "@/types";
import { CyclingDimensions } from "@/components/WfSnail/types";

/**
 * Convert a FourDPProfile to CyclingDimensions for the snail chart.
 * The API provides value and rank directly — no computation needed.
 */
export function profileToSnailDimensions(
  profile: FourDPProfile
): CyclingDimensions {
  return {
    ftp: { value: profile.ftp.value, rank: profile.ftp.rank },
    map: { value: profile.map.value, rank: profile.map.rank },
    ac: { value: profile.ac.value, rank: profile.ac.rank },
    nm: { value: profile.nm.value, rank: profile.nm.rank },
  };
}
