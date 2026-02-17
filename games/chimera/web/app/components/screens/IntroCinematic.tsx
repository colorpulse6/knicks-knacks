"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface IntroCinematicProps {
  onComplete: () => void;
}

export default function IntroCinematic({ onComplete }: IntroCinematicProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showSkip, setShowSkip] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [opacity, setOpacity] = useState(0);

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => setOpacity(1), 100);
    return () => clearTimeout(timer);
  }, []);

  // Show skip button after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleComplete = useCallback(() => {
    if (isFading) return;
    setIsFading(true);
    setOpacity(0);
    setTimeout(onComplete, 800);
  }, [isFading, onComplete]);

  // Video ended naturally
  const handleVideoEnd = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  // Skip via keyboard or click
  const handleSkip = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    handleComplete();
  }, [handleComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip]);

  return (
    <div
      className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer"
      style={{
        opacity,
        transition: "opacity 0.8s ease-in-out",
      }}
      onClick={handleSkip}
    >
      <video
        ref={videoRef}
        src="/video/new_game_video.mp4"
        autoPlay
        playsInline
        onEnded={handleVideoEnd}
        className="w-full h-full object-contain"
      />

      {/* Skip prompt */}
      {showSkip && !isFading && (
        <div className="absolute bottom-8 right-8 text-gray-500 text-xs animate-pulse">
          Press ENTER to skip
        </div>
      )}
    </div>
  );
}
