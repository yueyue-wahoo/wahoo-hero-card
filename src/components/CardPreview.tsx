"use client";

import { useMemo } from "react";
import { FourDPProfile } from "@/types";
import { WfSnail, WfSnailVariant } from "./WfSnail";
import { METRIC_COLORS, METRIC_LABELS } from "@/lib/card-layout";
import { profileToSnailDimensions } from "@/lib/profile-to-snail";

interface Props {
  riderName: string;
  cartoonImage: string; // base64
  profile: FourDPProfile;
}

const metricKeys = ["ftp", "map", "ac", "nm"] as const;

export default function CardPreview({ riderName, cartoonImage, profile }: Props) {
  const snailDimensions = useMemo(() => profileToSnailDimensions(profile), [profile]);
  return (
    <div
      className="relative overflow-hidden bg-gray-50"
      style={{
        width: 265,
        height: 508,
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      }}
    >
      {/* Chevron background pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="chevrons"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <polyline
              points="0,0 20,16 40,0"
              fill="none"
              stroke="#B4B4B4"
              strokeWidth="3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#chevrons)" />
      </svg>

      {/* Left sidebar - Wahoo logo */}
      <div
        className="absolute left-0 top-0 bottom-0 bg-gray-900 flex items-center justify-center"
        style={{ width: 24 }}
      >
        <span
          className="text-white font-bold tracking-widest"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontSize: 10,
            letterSpacing: 3,
          }}
        >
          WAHOO
        </span>
      </div>

      {/* Right sidebar - Rider name */}
      <div
        className="absolute right-0 top-0 bottom-0 bg-white/80 flex items-center justify-center"
        style={{ width: 20 }}
      >
        {riderName && (() => {
          const truncated = riderName.toUpperCase().slice(0, 15);
          const previewFontSize = truncated.length > 12 ? Math.round(7 * 12 / truncated.length) : 7;
          return (
            <span
              className="text-gray-900 font-bold"
              style={{
                writingMode: "vertical-rl",
                fontSize: previewFontSize,
                letterSpacing: 1,
              }}
            >
              {truncated}
            </span>
          );
        })()}
      </div>

      {/* Portrait area */}
      <div
        className="absolute overflow-hidden"
        style={{ left: 24, right: 20, top: 0, height: "55%" }}
      >
        <img
          src={`data:image/png;base64,${cartoonImage}`}
          alt="Cartoon portrait"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Stats overlay */}
      <div
        className="absolute bg-white rounded-t-xl shadow-lg"
        style={{
          left: 24,
          right: 20,
          bottom: 0,
          top: "50%",
          padding: "8px 10px",
        }}
      >
        {/* Cyclist type header */}
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-gray-900" style={{ fontSize: 10 }}>
            {profile.cyclistType}
          </span>
          {profile.isEstimate && (
            <span
              className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium"
              style={{ fontSize: 6 }}
            >
              ESTIMATE
            </span>
          )}
        </div>

        {/* Metric bars */}
        <div className="space-y-1">
          {metricKeys.map((key) => {
            const label = METRIC_LABELS[key];
            const value = profile[key].value;
            const max = Math.max(
              profile.ftp.value,
              profile.map.value,
              profile.ac.value,
              profile.nm.value
            );
            const pct = (value / max) * 100;
            const color =
              typeof METRIC_COLORS[key] === "string"
                ? (METRIC_COLORS[key] as string)
                : (METRIC_COLORS[key] as { start: string }).start;

            return (
              <div key={key}>
                <div className="flex items-center justify-between" style={{ fontSize: 6 }}>
                  <span className="font-bold text-gray-700">{label.name}</span>
                  <span className="text-gray-500 font-medium">{value}W</span>
                </div>
                <div
                  className="rounded-full overflow-hidden bg-gray-100"
                  style={{ height: 8 }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Snail chart */}
        <div className="flex justify-end mt-1">
          <WfSnail dimensions={snailDimensions} variant={WfSnailVariant.Small} />
        </div>
      </div>
    </div>
  );
}
