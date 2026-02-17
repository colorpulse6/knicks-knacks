"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface DesertCollapseProps {
  onComplete: () => void;
}

const COLLAPSE_LINES = [
  "The horizon is a liar. It moves as I move.",
  "The heat has a weight. It is crushing the air from my lungs.",
  "My shadow is gone. There is only the white sun and the red sand.",
  "The grain... I can hear the sand counting my steps.",
  "My knees... they aren't mine anymore.",
  "Deep... quiet...",
];

// Each line gets dimmer — consciousness fading
const LINE_OPACITY = [0.7, 0.6, 0.5, 0.4, 0.25, 0.12];

const TIMING = {
  CHAR_DELAY: 35,
  LINE_PAUSE: 1200,
  FINAL_PAUSE: 2000,
};

export default function DesertCollapse({ onComplete }: DesertCollapseProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [lineComplete, setLineComplete] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Typewriter effect
  useEffect(() => {
    if (lineIndex >= COLLAPSE_LINES.length || isComplete) return;

    setDisplayedChars(0);
    setLineComplete(false);

    const text = COLLAPSE_LINES[lineIndex];
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
  }, [lineIndex, isComplete]);

  // Auto-advance after line completes
  useEffect(() => {
    if (!lineComplete || isComplete) return;

    const nextIndex = lineIndex + 1;
    if (nextIndex < COLLAPSE_LINES.length) {
      const timer = setTimeout(() => setLineIndex(nextIndex), TIMING.LINE_PAUSE);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsComplete(true);
        onComplete();
      }, TIMING.FINAL_PAUSE);
      return () => clearTimeout(timer);
    }
  }, [lineComplete, lineIndex, isComplete, onComplete]);

  // Skip hint
  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Skip handler
  const handleSkip = useCallback(() => {
    if (!isComplete) {
      if (typingRef.current) {
        clearInterval(typingRef.current);
        typingRef.current = null;
      }
      setIsComplete(true);
      onComplete();
    }
  }, [isComplete, onComplete]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleSkip();
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        // Snap typing to full text
        if (!lineComplete && typingRef.current) {
          clearInterval(typingRef.current);
          typingRef.current = null;
          setDisplayedChars(COLLAPSE_LINES[lineIndex]?.length ?? 0);
          setLineComplete(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip, lineComplete, lineIndex]);

  const currentText = COLLAPSE_LINES[lineIndex] ?? "";
  const opacity = LINE_OPACITY[lineIndex] ?? 0.3;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      {lineIndex < COLLAPSE_LINES.length && !isComplete && (
        <div className="max-w-xl px-8 text-center">
          <p
            className="text-lg md:text-xl italic leading-relaxed"
            style={{
              fontFamily: "var(--font-pixel), monospace",
              color: `rgba(255, 255, 255, ${opacity})`,
              transition: "color 0.5s ease",
            }}
          >
            {currentText.substring(0, displayedChars)}
            {!lineComplete && (
              <span className="animate-pulse ml-0.5" style={{ color: `rgba(255, 255, 255, ${opacity * 0.5})` }}>
                ▌
              </span>
            )}
          </p>
        </div>
      )}

      {showSkip && !isComplete && (
        <div className="absolute bottom-8 right-8 text-gray-700 text-xs animate-pulse">
          Press ESC to skip
        </div>
      )}
    </div>
  );
}
