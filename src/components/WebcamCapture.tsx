"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

interface Props {
  onCapture: (imageBase64: string) => void;
  onSkip: () => void;
}

const videoConstraints = {
  width: 1024,
  height: 1024,
  facingMode: "user",
};

export default function WebcamCapture({ onCapture, onSkip }: Props) {
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
      // Strip the data URL prefix to get raw base64
      const base64 = capturedImage.replace(/^data:image\/\w+;base64,/, "");
      onCapture(base64);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h2 className="text-2xl font-bold text-gray-900">Take Your Photo</h2>
      <p className="text-gray-600">
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
            {/* Portrait guide overlay */}
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
            className="px-6 py-3 text-gray-600 bg-gray-200 rounded-xl text-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Retake
          </button>
          <button
            onClick={usePhoto}
            className="px-6 py-3 text-white bg-blue-600 rounded-xl text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Use This Photo
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={capture}
            className="px-8 py-4 text-white bg-red-500 rounded-full text-xl font-bold hover:bg-red-600 transition-colors shadow-lg"
          >
            Take Photo
          </button>
          <button
            onClick={onSkip}
            className="text-gray-500 text-sm underline hover:text-gray-700 transition-colors"
          >
            Skip photo
          </button>
        </div>
      )}
    </div>
  );
}
