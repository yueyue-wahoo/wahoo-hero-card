"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

interface Props {
  onCapture: (imageBase64: string) => void;
}

const videoConstraints = {
  width: 1024,
  height: 1024,
  facingMode: "user",
};

export default function WebcamCapture({ onCapture }: Props) {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, []);

  const retake = () => {
    setCapturedImage(null);
  };

  const usePhoto = () => {
    if (capturedImage) {
      const base64 = capturedImage.replace(/^data:image\/\w+;base64,/, "");
      onCapture(base64);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h2 className="text-2xl font-bold text-white">Take Your Photo</h2>
      <p className="font-medium text-[#5FDFFF]">
        Position yourself in the frame for your trading card portrait
      </p>

      <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-black">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured photo"
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
              mirrored
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-4 border-white/30 rounded-2xl" />
              <div className="absolute top-[15%] left-[25%] right-[25%] bottom-[10%] border-2 border-dashed border-white/40 rounded-full" />
            </div>
          </>
        )}
      </div>

      {capturedImage ? (
        <div className="flex gap-4">
          <button
            onClick={retake}
            className="px-6 py-3 text-gray-400 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl text-lg font-medium hover:bg-[#2A2A2A] transition-colors"
          >
            Retake
          </button>
          <button
            onClick={usePhoto}
            className="px-6 py-3 text-black bg-[#5FDFFF] rounded-xl text-lg font-bold hover:bg-[#47D4F7] transition-colors"
          >
            Use This Photo
          </button>
        </div>
      ) : (
        <button
          onClick={capture}
          className="px-8 py-4 text-white bg-red-600 rounded-full text-xl font-bold hover:bg-red-700 transition-colors shadow-lg"
        >
          Take Photo
        </button>
      )}
    </div>
  );
}
