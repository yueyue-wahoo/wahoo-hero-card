"use client";

import { useState } from "react";
import { AppStep, AccountMode, FourDPProfile } from "@/types";
import RiderNameInput from "@/components/RiderNameInput";
import WebcamCapture from "@/components/WebcamCapture";
import AccountModeSelector from "@/components/AccountModeSelector";
import CardCompositor from "@/components/CardCompositor";

export default function Home() {
  const [step, setStep] = useState<AppStep>("name");
  const [riderName, setRiderName] = useState("");
  const [cartoonImage, setCartoonImage] = useState<string | null>(null);
  const [cartoonLoading, setCartoonLoading] = useState(false);
  const [cartoonError, setCartoonError] = useState<string | null>(null);
  const [profile, setProfile] = useState<FourDPProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [cardReady, setCardReady] = useState(false);

  const handleNameSubmit = (name: string) => {
    setRiderName(name);
    setStep("photo");
  };

  const handlePhotoCapture = async (imageBase64: string) => {
    setStep("quiz");
    setCartoonLoading(true);
    setCartoonError(null);

    try {
      const res = await fetch("/api/cartoonify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cartoonify");
      setCartoonImage(data.cartoonImage);
    } catch (err) {
      setCartoonError(
        err instanceof Error ? err.message : "Cartoonification failed"
      );
    } finally {
      setCartoonLoading(false);
    }
  };

  const handleQuizFinish = async (
    mode: AccountMode,
    credentials?: { email: string; password: string }
  ) => {
    setProfileLoading(true);
    setProfileError(null);

    try {
      const res = await fetch("/api/wahoo-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, ...credentials }),
      });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Server returned an unexpected response");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch profile");
      setProfile(data);
      setStep("assembling");
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to fetch profile"
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleStartOver = () => {
    setStep("name");
    setRiderName("");
    setCartoonImage(null);
    setCartoonLoading(false);
    setCartoonError(null);
    setProfile(null);
    setProfileLoading(false);
    setProfileError(null);
    setCardReady(false);
  };

  const photoSkipped = !cartoonImage && !cartoonLoading && !cartoonError;
  const isAssemblyReady = (cartoonImage || photoSkipped) && profile;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto">
        {step === "name" && <RiderNameInput onSubmit={handleNameSubmit} />}

        {step === "photo" && (
          <WebcamCapture
            onCapture={handlePhotoCapture}
            onSkip={() => setStep("quiz")}
          />
        )}

        {step === "quiz" && (
          <div className="space-y-4">
            {/* Cartoon preview */}
            {cartoonImage && (
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${cartoonImage}`}
                  alt="Your cartoon portrait"
                  className="w-40 h-40 rounded-2xl object-cover shadow-md bg-gray-100"
                />
              </div>
            )}

            <AccountModeSelector
              onFinishQuiz={handleQuizFinish}
              isLoading={profileLoading}
            />

            <div className="flex flex-col items-center gap-2 text-sm">
              <StatusItem
                label="Cartoon portrait"
                loading={cartoonLoading}
                done={!!cartoonImage}
                error={cartoonError}
              />
              {profileError && (
                <p className="text-red-500 text-sm">{profileError}</p>
              )}
            </div>

            {cartoonError && (
              <div className="text-center">
                <button
                  onClick={() => setStep("photo")}
                  className="text-blue-600 underline text-sm"
                >
                  Go back and retake photo
                </button>
              </div>
            )}
          </div>
        )}

        {step === "assembling" && (
          <div className="flex flex-col items-center gap-6 p-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Assembling Your Card...
            </h2>
            <div className="space-y-3">
              <StatusItem
                label="Cartoon image"
                loading={cartoonLoading}
                done={!!cartoonImage}
                error={cartoonError}
              />
              <StatusItem
                label="4DP profile"
                loading={false}
                done={!!profile}
                error={profileError}
              />
              <StatusItem
                label="Rendering card"
                loading={!cardReady && !!isAssemblyReady}
                done={cardReady}
                error={null}
              />
            </div>

            {isAssemblyReady && (
              <CardCompositor
                riderName={riderName}
                cartoonImage={cartoonImage}
                profile={profile}
                onReady={() => {
                  setCardReady(true);
                  setStep("done");
                }}
              />
            )}

            {!isAssemblyReady && (
              <div className="animate-pulse text-gray-500">
                Waiting for all pieces...
              </div>
            )}
          </div>
        )}

        {step === "done" && profile && (
          <div className="flex flex-col items-center gap-6 p-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Card is Ready!
            </h2>

            <CardCompositor
              riderName={riderName}
              cartoonImage={cartoonImage}
              profile={profile}
            />

            <div className="flex gap-4">
              <button
                onClick={handleStartOver}
                className="px-6 py-3 text-gray-600 bg-gray-200 rounded-xl text-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StatusItem({
  label,
  loading,
  done,
  error,
}: {
  label: string;
  loading: boolean;
  done: boolean;
  error: string | null;
}) {
  return (
    <div className="flex items-center gap-2">
      {error ? (
        <span className="text-red-500 text-lg">&#10007;</span>
      ) : done ? (
        <span className="text-green-500 text-lg">&#10003;</span>
      ) : loading ? (
        <svg
          className="animate-spin h-4 w-4 text-blue-500"
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
      ) : (
        <span className="text-gray-300 text-lg">&#9744;</span>
      )}
      <span className={done ? "text-gray-700" : "text-gray-500"}>
        {label}
        {error && <span className="text-red-500 ml-1">— {error}</span>}
      </span>
    </div>
  );
}
