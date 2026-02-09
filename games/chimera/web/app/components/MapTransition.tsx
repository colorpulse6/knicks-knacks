"use client";

import { useEffect, useState } from "react";

interface MapTransitionProps {
  isActive: boolean;
  onMidpoint: () => void; // Called when screen is fully black (time to switch maps)
  onComplete: () => void; // Called when fade-in completes
  duration?: number; // Total duration in ms (default 800)
}

/**
 * Fade to black transition for map changes
 */
export default function MapTransition({
  isActive,
  onMidpoint,
  onComplete,
  duration = 800,
}: MapTransitionProps) {
  const [phase, setPhase] = useState<"idle" | "fade-out" | "hold" | "fade-in">("idle");
  const [opacity, setOpacity] = useState(0);

  const fadeTime = duration / 3; // Split into thirds: fade-out, hold, fade-in
  const holdTime = duration / 3;

  useEffect(() => {
    if (isActive && phase === "idle") {
      // Start fade-out
      setPhase("fade-out");
      setOpacity(0);

      // Animate fade-out
      const fadeOutStart = performance.now();
      const animateFadeOut = (time: number) => {
        const elapsed = time - fadeOutStart;
        const progress = Math.min(elapsed / fadeTime, 1);
        setOpacity(progress);

        if (progress < 1) {
          requestAnimationFrame(animateFadeOut);
        } else {
          // Fade-out complete, start hold phase
          setPhase("hold");
          onMidpoint(); // Switch maps now while screen is black
        }
      };
      requestAnimationFrame(animateFadeOut);
    }
  }, [isActive, phase, fadeTime, onMidpoint]);

  useEffect(() => {
    if (phase === "hold") {
      // Hold black screen briefly, then start fade-in
      const holdTimeout = setTimeout(() => {
        setPhase("fade-in");

        // Animate fade-in
        const fadeInStart = performance.now();
        const animateFadeIn = (time: number) => {
          const elapsed = time - fadeInStart;
          const progress = Math.min(elapsed / fadeTime, 1);
          setOpacity(1 - progress);

          if (progress < 1) {
            requestAnimationFrame(animateFadeIn);
          } else {
            // Fade-in complete
            setPhase("idle");
            onComplete();
          }
        };
        requestAnimationFrame(animateFadeIn);
      }, holdTime);

      return () => clearTimeout(holdTimeout);
    }
  }, [phase, fadeTime, holdTime, onComplete]);

  // Reset when deactivated
  useEffect(() => {
    if (!isActive && phase !== "idle") {
      setPhase("idle");
      setOpacity(0);
    }
  }, [isActive, phase]);

  if (!isActive && phase === "idle") {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black pointer-events-none z-50"
      style={{ opacity }}
    />
  );
}
