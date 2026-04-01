"use client";

import { useState } from "react";

interface Props {
  onSubmit: (name: string) => void;
}

export default function RiderNameInput({ onSubmit }: Props) {
  const [name, setName] = useState("");

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Wahoo 4DP Card Builder
      </h1>
      <p className="text-lg text-gray-600">
        Create your cycling athlete profile card
      </p>

      <div className="w-full max-w-md">
        <label
          htmlFor="rider-name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Enter your rider name (optional)
        </label>
        <input
          id="rider-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit(name);
          }}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => onSubmit("")}
          className="px-6 py-3 text-gray-600 bg-gray-200 rounded-xl text-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Skip
        </button>
        <button
          onClick={() => onSubmit(name)}
          className="px-6 py-3 text-white bg-blue-600 rounded-xl text-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
