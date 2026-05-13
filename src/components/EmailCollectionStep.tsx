"use client";

import { useState } from "react";
import { FourDPProfile } from "@/types";
import CardCompositor from "./CardCompositor";

interface Props {
  defaultEmail: string | null;
  riderName: string;
  cartoonImage: string | null;
  profile: FourDPProfile;
  eventName?: string;
  onSubmitted: (email: string) => void;
}

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function EmailCollectionStep({
  defaultEmail,
  riderName,
  cartoonImage,
  profile,
  eventName,
  onSubmitted,
}: Props) {
  const hasPrefill = !!defaultEmail;
  const [useWahooEmail, setUseWahooEmail] = useState(hasPrefill);
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkFailed, setNetworkFailed] = useState(false);

  const effectiveEmail =
    hasPrefill && useWahooEmail ? (defaultEmail as string) : email;
  const emailValid = EMAIL_REGEX.test(effectiveEmail.trim());

  const handleSubmit = async () => {
    if (!emailValid || submitting) return;
    setSubmitting(true);
    setError(null);
    setNetworkFailed(false);

    try {
      const res = await fetch("/api/email-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: effectiveEmail.trim(),
          marketingOptIn,
          riderName,
          cyclistType: profile.cyclistType,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Failed to submit email");
      }
      onSubmitted(effectiveEmail.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit email");
      setNetworkFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-2xl font-bold text-white">
        Share your email to get your card
      </h2>

      <div className="mx-auto">
        <CardCompositor
          riderName={riderName}
          cartoonImage={cartoonImage}
          profile={profile}
          eventName={eventName}
          hideDownload
        />
      </div>

      <div className="space-y-4">
        {hasPrefill && (
          <div className="flex gap-2 bg-[#1C1C1C] rounded-xl p-1">
            <button
              onClick={() => {
                setUseWahooEmail(true);
                setEmail(defaultEmail ?? "");
              }}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-colors ${
                useWahooEmail
                  ? "bg-[#2A2A2A] text-white"
                  : "text-gray-500 hover:text-gray-400"
              }`}
            >
              Use my Wahoo email
            </button>
            <button
              onClick={() => {
                setUseWahooEmail(false);
                setEmail("");
              }}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-colors ${
                !useWahooEmail
                  ? "bg-[#2A2A2A] text-white"
                  : "text-gray-500 hover:text-gray-400"
              }`}
            >
              Use a different email
            </button>
          </div>
        )}

        <input
          id="capture-email"
          type="email"
          value={effectiveEmail}
          disabled={hasPrefill && useWahooEmail}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 bg-[#141414] border-2 border-[#2A2A2A] rounded-xl text-white placeholder-gray-600 focus:border-[#5FDFFF] focus:outline-none disabled:opacity-70"
        />

        <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[#5FDFFF]"
          />
          <span>
            I&apos;d like to hear from Wahoo about products and events.
          </span>
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="flex flex-col items-end gap-2">
        <button
          onClick={handleSubmit}
          disabled={!emailValid || submitting}
          className="px-8 py-4 text-black bg-[#5FDFFF] rounded-xl text-lg font-bold hover:bg-[#47D4F7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            "Get my card"
          )}
        </button>

        {networkFailed && (
          <button
            onClick={() => onSubmitted(effectiveEmail.trim())}
            className="text-gray-500 underline text-sm hover:text-gray-300"
          >
            Skip and continue
          </button>
        )}
      </div>
    </div>
  );
}
