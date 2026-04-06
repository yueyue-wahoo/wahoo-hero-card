"use client";

import { useState } from "react";

interface Props {
  onSubmit: (name: string) => void;
}

export default function RiderNameInput({ onSubmit }: Props) {
  const [name, setName] = useState("");

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <p className="text-lg font-medium text-[#5FDFFF]">
        Create your athlete profile card
      </p>

      <div className="w-full max-w-md">
        <label
          htmlFor="rider-name"
          className="block text-sm font-semibold text-[#5FDFFF] mb-2"
        >
          Enter your rider name
        </label>
        <input
          id="rider-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 15))}
          maxLength={15}
          placeholder="Your name"
          className="w-full px-4 py-3 text-lg bg-[#141414] border-2 border-[#2A2A2A] rounded-xl text-white placeholder-gray-600 focus:border-[#5FDFFF] focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit(name);
          }}
        />
        <p className="mt-1.5 text-xs text-gray-500 text-right">
          {name.length}/15
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => onSubmit(name)}
          className="px-6 py-3 text-black bg-[#5FDFFF] rounded-xl text-lg font-bold hover:bg-[#47D4F7] transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
