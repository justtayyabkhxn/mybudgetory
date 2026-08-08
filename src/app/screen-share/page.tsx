"use client";

import { useState } from "react";

export default function Page() {
  const [isSharing, setIsSharing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startScreenShare = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      setStream(mediaStream);
      setIsSharing(true);

      mediaStream.getVideoTracks()[0].onended = () => {
        setIsSharing(false);
        setStream(null);
      };
    } catch (error) {
      console.error("Screen sharing failed:", error);
    }
  };

  const stopScreenShare = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setIsSharing(false);
    setStream(null);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <button
        onClick={isSharing ? stopScreenShare : startScreenShare}
        className={`w-full max-w-xs rounded-xl px-6 py-4 text-white font-semibold text-lg transition ${
          isSharing
            ? "bg-red-500 hover:bg-red-600"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {isSharing ? "Stop Sharing" : "Share Screen"}
      </button>
    </main>
  );
}
