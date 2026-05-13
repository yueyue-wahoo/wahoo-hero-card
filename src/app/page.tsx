"use client";

import { useState, useEffect } from "react";
import { AppStep, AccountMode, FourDPProfile } from "@/types";
import RiderNameInput from "@/components/RiderNameInput";
import WebcamCapture from "@/components/WebcamCapture";
import JerseyCustomizer from "@/components/JerseyCustomizer";
import AccountModeSelector from "@/components/AccountModeSelector";
import CardCompositor from "@/components/CardCompositor";
import EmailCollectionStep from "@/components/EmailCollectionStep";

export default function Home() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [step, setStep] = useState<AppStep>("name");
  const [riderName, setRiderName] = useState("");
  const [cartoonImage, setCartoonImage] = useState<string | null>(null);
  const [cartoonLoading, setCartoonLoading] = useState(false);
  const [cartoonError, setCartoonError] = useState<string | null>(null);
  const [profile, setProfile] = useState<FourDPProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [cardReady, setCardReady] = useState(false);
  const [pendingPhotoBase64, setPendingPhotoBase64] = useState<string | null>(null);
  const [jerseyColor, setJerseyColor] = useState("black");
  const [customNote, setCustomNote] = useState("");
  const [eventName, setEventName] = useState("");
  const [wahooEmail, setWahooEmail] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("booth-authenticated")) {
      setSessionChecked(true);
    } else {
      fetch("/api/auth/logout", { method: "POST" }).finally(() => {
        window.location.href = "/login";
      });
    }
  }, []);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)event-name=([^;]*)/);
    if (match) setEventName(decodeURIComponent(match[1]));
  }, []);

  const handleNameSubmit = (name: string) => {
    setRiderName(name);
    setStep("photo");
  };

  const handlePhotoCaptured = (imageBase64: string) => {
    setPendingPhotoBase64(imageBase64);
    setStep("customize");
  };

  const handleCustomizeConfirm = async () => {
    if (!pendingPhotoBase64) return;
    setStep("quiz");
    setCartoonLoading(true);
    setCartoonError(null);

    try {
      const res = await fetch("/api/cartoonify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: pendingPhotoBase64, jerseyColor, customNote }),
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
      setWahooEmail(mode === "personal" ? credentials?.email ?? null : null);
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
    setPendingPhotoBase64(null);
    setJerseyColor("black");
    setCustomNote("");
    setWahooEmail(null);
  };

  const photoSkipped = !cartoonImage && !cartoonLoading && !cartoonError;
  const isAssemblyReady = (cartoonImage || photoSkipped) && profile;

  if (!sessionChecked) return null;

  return (
    <main className="flex flex-col items-center justify-start pt-0 px-4 pb-4">
      <div className="w-full max-w-lg mx-auto">
        {step === "name" && <RiderNameInput onSubmit={handleNameSubmit} />}

        {step === "photo" && (
          <WebcamCapture
            onCapture={handlePhotoCaptured}
          />
        )}

        {step === "customize" && pendingPhotoBase64 && (
          <JerseyCustomizer
            capturedPhotoBase64={pendingPhotoBase64}
            jerseyColor={jerseyColor}
            customNote={customNote}
            onJerseyColorChange={setJerseyColor}
            onCustomNoteChange={setCustomNote}
            onConfirm={handleCustomizeConfirm}
            onRetake={() => {
              setPendingPhotoBase64(null);
              setStep("photo");
            }}
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
                  className="w-40 h-40 rounded-2xl object-cover shadow-md bg-[#1C1C1C]"
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
                  className="text-[#5FDFFF] underline text-sm hover:text-[#47D4F7]"
                >
                  Go back and retake photo
                </button>
              </div>
            )}
          </div>
        )}

        {step === "assembling" && (
          <div className="flex flex-col items-center gap-6 p-8">
            <h2 className="text-2xl font-bold text-white">
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
                eventName={eventName}
                hideDownload
                onReady={() => {
                  setCardReady(true);
                  setStep("email");
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

        {step === "email" && profile && (
          <EmailCollectionStep
            defaultEmail={wahooEmail}
            riderName={riderName}
            cartoonImage={cartoonImage}
            profile={profile}
            eventName={eventName}
            onSubmitted={() => {
              setStep("done");
            }}
          />
        )}

        {step === "done" && profile && (
          <div className="flex flex-col gap-6 p-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Your card is ready
              </h2>
              <p className="mt-2 text-base text-gray-400">
                Download the PDF below and bring it to the print station.
              </p>
            </div>

            <div className="mx-auto">
              <CardCompositor
                riderName={riderName}
                cartoonImage={cartoonImage}
                profile={profile}
                eventName={eventName}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleStartOver}
                className="px-6 py-3 text-gray-400 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl text-lg font-medium hover:bg-[#2A2A2A] transition-colors"
              >
                Start over
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
        <span className="text-[#5FDFFF] text-lg">&#10003;</span>
      ) : loading ? (
        <svg
          className="animate-spin h-4 w-4 text-[#5FDFFF]"
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
        <span className="text-gray-700 text-lg">&#9744;</span>
      )}
      <span className={done ? "text-white font-medium" : "text-gray-500"}>
        {label}
        {error && <span className="text-red-500 ml-1">— {error}</span>}
      </span>
    </div>
  );
}
