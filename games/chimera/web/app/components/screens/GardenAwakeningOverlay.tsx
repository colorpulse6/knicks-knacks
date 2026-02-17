"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type AwakeningPhase = "pan" | "text" | "wake";

interface GardenAwakeningOverlayProps {
  phase: AwakeningPhase;
  onTextComplete: () => void; // text phase done → transition to "wake"
  onSkip: () => void; // escape → skip entire sequence
}

const DREAM_LINES = [
  "Petals... falling upward.",
  "The stones are humming. Or is that my blood?",
  "Something green... pressing against my eyelids.",
  "I was somewhere dry. Somewhere that wanted me gone.",
  "But this place... it smells of rain that hasn't fallen yet.",
  "A garden that breathes.",
  "Am I still in the desert?",
  "No. The sand has no memory of me here.",
  "Open your eyes, Kai.",
];

const TIMING = {
  CHAR_DELAY: 30,
  PAN_DURATION: 3000,
  SKIP_SHOW_DELAY: 3000,
};

export default function GardenAwakeningOverlay({
  phase,
  onTextComplete,
  onSkip,
}: GardenAwakeningOverlayProps) {
  const [showSkip, setShowSkip] = useState(false);

  // Text state (for "text" phase)
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [lineComplete, setLineComplete] = useState(false);

  // Pan overlay fade
  const [panStartTime] = useState(() => Date.now());
  const [panOpacity, setPanOpacity] = useState(0.6);

  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentText = DREAM_LINES[lineIndex] ?? "";

  // Skip hint
  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), TIMING.SKIP_SHOW_DELAY);
    return () => clearTimeout(timer);
  }, []);

  // Pan phase: animate overlay fade
  useEffect(() => {
    if (phase !== "pan") return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - panStartTime;
      const t = Math.min(elapsed / TIMING.PAN_DURATION, 1);
      setPanOpacity(0.6 * (1 - t));
    }, 16);
    return () => clearInterval(interval);
  }, [phase, panStartTime]);

  // Typewriter effect for text phase
  useEffect(() => {
    if (phase !== "text") return;
    if (lineIndex >= DREAM_LINES.length) return;

    setDisplayedChars(0);
    setLineComplete(false);

    const text = DREAM_LINES[lineIndex];
    let charIndex = 0;

    typingRef.current = setInterval(() => {
      charIndex++;
      setDisplayedChars(charIndex);
      if (charIndex >= text.length) {
        if (typingRef.current) clearInterval(typingRef.current);
        typingRef.current = null;
        setLineComplete(true);
      }
    }, TIMING.CHAR_DELAY);

    return () => {
      if (typingRef.current) {
        clearInterval(typingRef.current);
        typingRef.current = null;
      }
    };
  }, [phase, lineIndex]);

  // Advance logic for text phase
  const handleAdvance = useCallback(() => {
    if (phase !== "text") return;

    if (!lineComplete) {
      // Still typing — snap to full text
      if (typingRef.current) {
        clearInterval(typingRef.current);
        typingRef.current = null;
      }
      setDisplayedChars(currentText.length);
      setLineComplete(true);
    } else {
      const nextIndex = lineIndex + 1;
      if (nextIndex < DREAM_LINES.length) {
        setLineIndex(nextIndex);
      } else {
        // All lines done — transition to wake phase
        onTextComplete();
      }
    }
  }, [phase, lineComplete, lineIndex, currentText, onTextComplete]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
        return;
      }
      if (phase === "text" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, handleAdvance, onSkip]);

  return (
    <>
      {/* Pan phase: fading dark overlay */}
      {phase === "pan" && (
        <div
          className="absolute inset-0 bg-black pointer-events-none z-20"
          style={{ opacity: panOpacity }}
        />
      )}

      {/* Text phase: dream lines */}
      {phase === "text" && lineIndex < DREAM_LINES.length && (
        <div
          className="absolute inset-0 flex items-center justify-center z-20 px-8"
          onClick={handleAdvance}
        >
          <div className="max-w-2xl w-full text-center">
            <p
              className="text-lg md:text-xl leading-relaxed text-white/70 italic"
              style={{ fontFamily: "var(--font-pixel), monospace" }}
            >
              {currentText.substring(0, displayedChars)}
              {!lineComplete && (
                <span className="animate-pulse ml-0.5 text-white/50">▌</span>
              )}
            </p>

            {lineComplete && (
              <div className="animate-bounce mt-3 text-center">
                <span className="text-yellow-500/70 text-sm">▼</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wake phase: movement prompt */}
      {phase === "wake" && (
        <div className="absolute inset-x-0 bottom-24 flex justify-center z-20">
          <div className="bg-black/70 border border-gray-600 rounded-lg px-6 py-3 animate-pulse">
            <p
              className="text-white/80 text-sm"
              style={{ fontFamily: "var(--font-pixel), monospace" }}
            >
              Press a direction to wake up...
            </p>
          </div>
        </div>
      )}

      {/* Skip hint */}
      {showSkip && (
        <div className="absolute bottom-8 right-8 text-gray-600 text-xs z-50 animate-pulse">
          Press ESC to skip
        </div>
      )}
    </>
  );
}
