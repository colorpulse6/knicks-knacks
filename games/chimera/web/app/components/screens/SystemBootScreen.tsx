"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface SystemBootScreenProps {
  onComplete: () => void;
}

type LineType = "system" | "info" | "warning" | "alert" | "glitch" | "countdown" | "pause" | "progress";

interface BootLine {
  text: string;
  type: LineType;
  delay: number; // ms per character for typing effect
  flash?: boolean;
  hasProgress?: boolean;
}

const BOOT_SEQUENCE: BootLine[] = [
  { text: "// SYSTEM STARTUP: CYCLE 49,200", type: "system", delay: 15 },
  { text: "// REALITY LAYER: STABLE", type: "system", delay: 15 },
  { text: "// MEDIEVAL FACADE:", type: "system", delay: 15, hasProgress: true },
  { text: "", type: "pause", delay: 1800 },
  { text: "DIAGNOSTIC: Genetic parameters of House Lumina: OPTIMAL.", type: "info", delay: 20 },
  { text: "Control Vectors: SECURE", type: "info", delay: 25 },
  { text: "Population Deviance: 0.00%", type: "info", delay: 25 },
  { text: "", type: "pause", delay: 600 },
  { text: ">> ALERT <<", type: "alert", delay: 0, flash: true },
  { text: "Unregistered Variable Detected in Sector 7", type: "alert", delay: 20 },
  { text: "Origin: Unknown", type: "warning", delay: 30 },
  { text: "Heritage: Null", type: "warning", delay: 30 },
  { text: "Identity: KAI", type: "glitch", delay: 50 },
  { text: "", type: "pause", delay: 800 },
  { text: "ANALYSIS:", type: "system", delay: 25 },
  { text: "Subject represents a critical failure in the reproductive algorithm.", type: "info", delay: 18 },
  { text: "He comes from nowhere. He is no one.", type: "warning", delay: 25 },
  { text: "He is the Glitch.", type: "alert", delay: 40 },
  { text: "", type: "pause", delay: 800 },
  { text: "PROTOCOL: Initiate immediate containment.", type: "system", delay: 22 },
  { text: "Prepare the Execution Platform.", type: "warning", delay: 25 },
  { text: "", type: "pause", delay: 600 },
  { text: "STATUS: Purge in 3...", type: "countdown", delay: 800 },
  { text: "2...", type: "countdown", delay: 800 },
  { text: "1...", type: "countdown", delay: 800 },
];

function getLineColor(type: LineType): string {
  switch (type) {
    case "system":
      return "text-cyan-400";
    case "info":
      return "text-green-400";
    case "warning":
      return "text-yellow-400";
    case "alert":
      return "text-red-500";
    case "glitch":
      return "text-white";
    case "countdown":
      return "text-red-600";
    default:
      return "text-gray-400";
  }
}

export default function SystemBootScreen({ onComplete }: SystemBootScreenProps) {
  const [displayedLines, setDisplayedLines] = useState<{ text: string; type: LineType; complete: boolean }[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [screenShake, setScreenShake] = useState(0);
  const [flashScreen, setFlashScreen] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [whiteOut, setWhiteOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Show skip button after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Handle skip
  const handleSkip = useCallback(() => {
    if (!isComplete) {
      setIsComplete(true);
      setWhiteOut(true);
      setTimeout(onComplete, 500);
    }
  }, [isComplete, onComplete]);

  // Keyboard listener for skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip]);

  // Progress bar animation
  useEffect(() => {
    if (showProgress && progressValue < 100) {
      const timer = setTimeout(() => {
        setProgressValue((prev) => Math.min(prev + 5, 100));
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [showProgress, progressValue]);

  // Main typing animation
  useEffect(() => {
    if (isComplete || currentLineIndex >= BOOT_SEQUENCE.length) {
      if (!isComplete && currentLineIndex >= BOOT_SEQUENCE.length) {
        // Sequence complete - trigger white out and transition
        setIsComplete(true);
        setWhiteOut(true);
        setTimeout(onComplete, 800);
      }
      return;
    }

    const currentLine = BOOT_SEQUENCE[currentLineIndex];

    // Handle pause lines
    if (currentLine.type === "pause") {
      const timer = setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
      }, currentLine.delay);
      return () => clearTimeout(timer);
    }

    // Handle progress bar trigger
    if (currentLine.hasProgress && currentCharIndex === currentLine.text.length) {
      setShowProgress(true);
      if (progressValue >= 100) {
        // Progress complete, add "RENDERED" and move on
        setDisplayedLines((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            text: updated[updated.length - 1].text + " RENDERED",
            complete: true,
          };
          return updated;
        });
        setShowProgress(false);
        setProgressValue(0);
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
      }
      return;
    }

    // Handle flash effect
    if (currentLine.flash && currentCharIndex === 0) {
      setFlashScreen(true);
      setTimeout(() => setFlashScreen(false), 100);
    }

    // Handle countdown screen shake
    if (currentLine.type === "countdown") {
      const shakeIntensity = currentLine.text.includes("3") ? 1 : currentLine.text.includes("2") ? 2 : 3;
      setScreenShake(shakeIntensity);
    }

    // Initialize line if needed
    if (currentCharIndex === 0 && currentLine.text.length > 0) {
      setDisplayedLines((prev) => [
        ...prev,
        { text: "", type: currentLine.type, complete: false },
      ]);
    }

    // Type next character
    if (currentCharIndex < currentLine.text.length) {
      const delay = currentLine.delay || 30;
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0) {
            updated[lastIndex] = {
              ...updated[lastIndex],
              text: currentLine.text.substring(0, currentCharIndex + 1),
            };
          }
          return updated;
        });
        setCurrentCharIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      // Line complete
      if (!currentLine.hasProgress) {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0) {
            updated[lastIndex] = { ...updated[lastIndex], complete: true };
          }
          return updated;
        });
        const timer = setTimeout(() => {
          setCurrentLineIndex((prev) => prev + 1);
          setCurrentCharIndex(0);
          setScreenShake(0);
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [currentLineIndex, currentCharIndex, isComplete, onComplete, progressValue]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedLines]);

  const renderProgressBar = () => {
    const filled = Math.floor(progressValue / 5);
    const empty = 20 - filled;
    return (
      <span className="text-green-400">
        {" "}[{"█".repeat(filled)}{"░".repeat(empty)}] {progressValue}%
      </span>
    );
  };

  const getShakeStyle = () => {
    if (screenShake === 0) return {};
    const intensity = screenShake * 2;
    const x = Math.random() * intensity - intensity / 2;
    const y = Math.random() * intensity - intensity / 2;
    return { transform: `translate(${x}px, ${y}px)` };
  };

  return (
    <div
      className={`fixed inset-0 bg-black overflow-hidden transition-all duration-300 ${
        whiteOut ? "bg-white" : ""
      }`}
      style={getShakeStyle()}
      onClick={handleSkip}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none scanline-overlay opacity-20" />

      {/* Screen flash */}
      {flashScreen && (
        <div className="absolute inset-0 bg-red-500 opacity-30 pointer-events-none z-50" />
      )}

      {/* Terminal content */}
      <div
        ref={containerRef}
        className="h-full p-8 overflow-y-auto font-mono text-sm md:text-base"
        style={{ fontFamily: "var(--font-pixel), monospace" }}
      >
        <div className="max-w-3xl mx-auto space-y-1">
          {displayedLines.map((line, index) => (
            <div
              key={index}
              className={`${getLineColor(line.type)} ${
                line.type === "alert" && !line.complete ? "animate-text-flicker" : ""
              } ${line.type === "glitch" ? "glitch-text" : ""}`}
            >
              {line.text}
              {/* Show progress bar inline */}
              {showProgress &&
                index === displayedLines.length - 1 &&
                BOOT_SEQUENCE[currentLineIndex]?.hasProgress &&
                renderProgressBar()}
              {/* Cursor on current line */}
              {!line.complete && index === displayedLines.length - 1 && !showProgress && (
                <span className="animate-pulse">█</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skip button */}
      {showSkip && !isComplete && (
        <div className="absolute bottom-8 right-8 text-gray-600 text-xs animate-fade-in">
          <span className="opacity-50">Press ENTER to skip</span>
        </div>
      )}

      {/* CRT vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </div>
  );
}
