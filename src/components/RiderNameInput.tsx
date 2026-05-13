"use client";

import { useState } from "react";

interface Props {
  onSubmit: (name: string) => void;
}

export default function RiderNameInput({ onSubmit }: Props) {
  const [name, setName] = useState("");

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h2 className="text-2xl font-bold text-white">
          Let&apos;s start with your name
        </h2>
        <p className="mt-2 text-base text-gray-400">
          We&apos;ll print this on your athlete card.
        </p>
      </div>

      <div>
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

      <div className="flex justify-end">
        <button
          onClick={() => onSubmit(name)}
          disabled={!name.trim()}
          className="px-6 py-3 text-black bg-[#5FDFFF] rounded-xl text-lg font-bold hover:bg-[#47D4F7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
