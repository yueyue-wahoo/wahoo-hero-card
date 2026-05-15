"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ArchiveEventButton({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleArchive = async () => {
    if (disabled || busy) return;
    const confirmed = window.confirm(
      "Archive the current event and start fresh? Make sure you've downloaded the CSV first — this resets the active list to empty."
    );
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/email-capture/archive", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Archive failed");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Archive failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleArchive}
        disabled={disabled || busy}
        className="text-sm text-gray-500 underline hover:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
      >
        {busy ? "Archiving..." : "Archive event & start fresh"}
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
