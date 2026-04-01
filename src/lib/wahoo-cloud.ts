import { FourDPProfile } from "@/types";

const WAHOO_API_BASE = "https://www.wahooligan.com";
const FITNESS_APP_ID = "32";

/**
 * Exchange email + password for a WF-USER-TOKEN via the sessions endpoint.
 */
export async function login(
  email: string,
  password: string
): Promise<string> {
  const res = await fetch(`${WAHOO_API_BASE}/api/v1/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Wahoo login failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.token) {
    throw new Error("Wahoo login response missing token");
  }
  return data.token;
}

// Maps fitness_type_id to cyclist type label
const CYCLIST_TYPES: Record<number, string> = {
  1: "Attacker",
  2: "Pursuiter",
  3: "Rouleur",
  4: "Sprinter",
  5: "Time Trialist",
  6: "Climber",
};

interface WahooFitnessProfile {
  id: number;
  fitness_app_id: number;
  fitness_type_id: number;
  dim_1: number;
  dim_2: number;
  dim_3: number;
  dim_4: number;
  dim_1_rank: number;
  dim_2_rank: number;
  dim_3_rank: number;
  dim_4_rank: number;
  assessment_id: number | null;
  created_at: string;
  updated_at: string;
}

function mapToCyclistType(fitnessTypeId: number): string {
  return CYCLIST_TYPES[fitnessTypeId] ?? "All-Rounder";
}

function mapToProfile(raw: WahooFitnessProfile): FourDPProfile {
  return {
    ftp: { value: raw.dim_1, rank: raw.dim_1_rank },
    map: { value: raw.dim_2, rank: raw.dim_2_rank },
    ac: { value: raw.dim_3, rank: raw.dim_3_rank },
    nm: { value: raw.dim_4, rank: raw.dim_4_rank },
    cyclistType: mapToCyclistType(raw.fitness_type_id),
    isEstimate: raw.assessment_id === null,
  };
}

/**
 * Fetch the latest 4DP fitness profile from Wahoo Cloud API.
 */
export async function fetchFourDPProfile(
  userToken: string
): Promise<FourDPProfile> {
  const res = await fetch(`${WAHOO_API_BASE}/api/v1/fitness_profiles`, {
    headers: {
      "WF-USER-TOKEN": userToken,
      "WF-FITNESS-APP-ID": FITNESS_APP_ID,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Wahoo API error ${res.status}: ${text}`);
  }

  const profiles: WahooFitnessProfile[] = await res.json();

  if (!profiles.length) {
    throw new Error("No fitness profile found for this account");
  }

  // API returns the newest profile first
  return mapToProfile(profiles[0]);
}
