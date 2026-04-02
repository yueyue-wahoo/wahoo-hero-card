"use client";

import { useState } from "react";
import { AccountMode } from "@/types";

interface Props {
  onFinishQuiz: (
    mode: AccountMode,
    credentials?: { email: string; password: string }
  ) => void;
  isLoading: boolean;
}

export default function AccountModeSelector({ onFinishQuiz, isLoading }: Props) {
  const [mode, setMode] = useState<AccountMode>("demo");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleFinish = () => {
    if (mode === "personal" && (!email.trim() || !password)) return;
    onFinishQuiz(
      mode,
      mode === "personal"
        ? { email: email.trim(), password }
        : undefined
    );
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h2 className="text-2xl font-bold text-white">Take your athlete profile quiz</h2>
      <p className="font-medium text-[#5FDFFF] text-center max-w-md">
        Take the athlete profile quiz in the Wahoo app, then come back here when you've finished it.
      </p>

      <div className="w-full max-w-md space-y-4">
        <div className="flex gap-2 bg-[#1C1C1C] rounded-xl p-1">
          <button
            onClick={() => setMode("demo")}
            className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-colors ${
              mode === "demo"
                ? "bg-[#2A2A2A] text-white"
                : "text-gray-500 hover:text-gray-400"
            }`}
          >
            Demo Account
          </button>
          <button
            onClick={() => setMode("personal")}
            className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-colors ${
              mode === "personal"
                ? "bg-[#2A2A2A] text-white"
                : "text-gray-500 hover:text-gray-400"
            }`}
          >
            My Wahoo Account
          </button>
        </div>

        {mode === "demo" ? (
          <p className="text-sm text-gray-500 text-center">
            Use the demo device at the booth to take the quiz.
          </p>
        ) : (
          <div className="space-y-3">
            <div>
              <label
                htmlFor="wahoo-email"
                className="block text-sm font-semibold text-[#5FDFFF] mb-2"
              >
                Wahoo account email
              </label>
              <input
                id="wahoo-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-[#141414] border-2 border-[#2A2A2A] rounded-xl text-white placeholder-gray-600 focus:border-[#5FDFFF] focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="wahoo-password"
                className="block text-sm font-semibold text-[#5FDFFF] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="wahoo-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 bg-[#141414] border-2 border-[#2A2A2A] rounded-xl text-white placeholder-gray-600 focus:border-[#5FDFFF] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleFinish}
        disabled={
          isLoading || (mode === "personal" && (!email.trim() || !password))
        }
        className="px-8 py-4 text-black bg-[#5FDFFF] rounded-xl text-lg font-bold hover:bg-[#47D4F7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? (
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
            Fetching Profile...
          </span>
        ) : (
          "I've Finished My Quiz"
        )}
      </button>
    </div>
  );
}
