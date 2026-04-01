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
      <h2 className="text-2xl font-bold text-gray-900">Take the 4DP Quiz</h2>
      <p className="text-gray-600 text-center max-w-md">
        Open the Wahoo SYSTM app and complete the 4DP quiz, then come back here
        and tap the button below.
      </p>

      <div className="w-full max-w-md space-y-4">
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setMode("demo")}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
              mode === "demo"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Demo Account
          </button>
          <button
            onClick={() => setMode("personal")}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
              mode === "personal"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
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
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Wahoo account email
              </label>
              <input
                id="wahoo-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="wahoo-password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="wahoo-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleFinish}
        disabled={
          isLoading || (mode === "personal" && (!email.trim() || !password))
        }
        className="px-8 py-4 text-white bg-green-600 rounded-xl text-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
