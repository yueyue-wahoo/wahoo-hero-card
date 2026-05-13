"use client";

interface Props {
  capturedPhotoBase64: string;
  jerseyColor: string;
  customNote: string;
  onJerseyColorChange: (color: string) => void;
  onCustomNoteChange: (note: string) => void;
  onConfirm: () => void;
  onRetake: () => void;
}

const JERSEY_COLORS = [
  { label: "Black", value: "black" },
  { label: "Brown", value: "brown" },
  { label: "Forest Green", value: "forest green" },
  { label: "Grey", value: "grey" },
  { label: "Navy", value: "navy blue" },
  { label: "Purple", value: "purple" },
] as const;

export default function JerseyCustomizer({
  capturedPhotoBase64,
  jerseyColor,
  customNote,
  onJerseyColorChange,
  onCustomNoteChange,
  onConfirm,
  onRetake,
}: Props) {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h2 className="text-2xl font-bold text-white">Customize your jersey</h2>
        <p className="mt-2 text-base text-gray-400">
          Pick a jersey color and add any extra detail you&apos;d like.
        </p>
      </div>

      <img
        src={`data:image/jpeg;base64,${capturedPhotoBase64}`}
        alt="Your photo"
        className="w-32 h-32 rounded-2xl object-cover shadow-md bg-[#1C1C1C] mx-auto"
      />

      <div className="space-y-2">
        <p className="text-sm font-semibold text-[#5FDFFF]">Jersey color</p>
        <div className="flex flex-wrap gap-1.5">
          {JERSEY_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => onJerseyColorChange(color.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
                jerseyColor === color.value
                  ? "bg-[#5FDFFF] text-black border-[#5FDFFF]"
                  : "bg-transparent text-gray-400 border-[#2A2A2A] hover:border-[#5FDFFF] hover:text-[#5FDFFF]"
              }`}
            >
              {color.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="custom-note"
          className="block text-sm font-semibold text-[#5FDFFF]"
        >
          Additional instructions <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          id="custom-note"
          value={customNote}
          onChange={(e) => onCustomNoteChange(e.target.value)}
          maxLength={300}
          rows={2}
          placeholder="e.g. add a sponsor logo on the sleeve"
          className="w-full px-3 py-2 text-sm bg-[#141414] border border-[#2A2A2A] rounded-lg resize-none text-white placeholder-gray-600 focus:outline-none focus:border-[#5FDFFF]"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onRetake}
          className="px-6 py-3 text-gray-400 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors"
        >
          Retake
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-3 text-black bg-[#5FDFFF] rounded-xl font-bold hover:bg-[#47D4F7] transition-colors"
        >
          Generate card
        </button>
      </div>
    </div>
  );
}
