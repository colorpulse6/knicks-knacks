"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface DesertAwakeningProps {
  onComplete: () => void;
}

type ScenePhase =
  | "darkness" // Black overlay fades in/out between text lines, gradually revealing scene
  | "reveal" // Full reveal — overlay fades to 0
  | "scene" // Text over fully visible scene
  | "transition" // Fade to black, then complete
  | "complete";

// --- Scene Content (from Gemini creative direction) ---

const DARKNESS_LINES = [
  "The humming stopped.",
  "Heat. Dry and heavy.",
  "Something scraping against my skin... sand?",
  "I can breathe. It hurts, but I can breathe.",
  "Amber light... bleeding through my eyelids.",
];

const SCENE_LINES = [
  "A ceiling of tattered cloth and old wood. Dust motes dancing in shafts of light.",
  "And... shapes. Standing in the shadows.",
  "Three of them. Hooded. Faceless. They are completely still.",
  "Are they... waiting?",
  "I try to lift my hand. It feels like lead. My voice is just a rasp.",
  "The shadows lengthen. My eyes... too heavy...",
  "Back to the dark.",
];

// --- Timing ---

const TIMING = {
  CHAR_DELAY: 30, // ms per character
  FLASH_FADE_MS: 600, // Overlay fade-down duration
  FLASH_HOLD_MS: 600, // Hold at peak visibility
  FLASH_RETURN_MS: 500, // Overlay fade-back duration
  REVEAL_DURATION: 2000, // Full reveal fade
  TRANSITION_DURATION: 1500, // Fade to black at end
  SKIP_SHOW_DELAY: 3000,
  STRANGER_FRAME_MS: 350, // Walk frame cycle speed
};

// How transparent the overlay gets per darkness line (lower = more scene visible)
// Consciousness gradually returns: each line reveals more of the tent
const OVERLAY_TARGETS = [0.82, 0.65, 0.48, 0.3, 0.1];

// Stranger sprite positions in the scene (% of canvas)
const STRANGER_DEFS = [
  { xPct: 0.15, yPct: 0.48, dirRow: 2 }, // left side, facing right toward Kai
  { xPct: 0.68, yPct: 0.46, dirRow: 1 }, // right side, facing left toward Kai
  { xPct: 0.42, yPct: 0.70, dirRow: 0 }, // center-bottom, facing down/toward Kai
];

// --- Component ---

export default function DesertAwakening({ onComplete }: DesertAwakeningProps) {
  const [scenePhase, setScenePhase] = useState<ScenePhase>("darkness");
  const [showSkip, setShowSkip] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Text state
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [lineComplete, setLineComplete] = useState(false);

  // Scene visibility
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const [overlayTransitionMs, setOverlayTransitionMs] = useState(TIMING.FLASH_FADE_MS);
  const [fadeOut, setFadeOut] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Stranger animation
  const [strangerFrame, setStrangerFrame] = useState(0);

  // Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const phaseRef = useRef<ScenePhase>("darkness");
  phaseRef.current = scenePhase;
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Image refs
  const imagesRef = useRef<{
    bg: HTMLImageElement | null;
    kaiLying: HTMLImageElement | null;
    strangerSheet: HTMLImageElement | null;
  }>({ bg: null, kaiLying: null, strangerSheet: null });

  // Get the current line set based on phase
  const getCurrentLines = useCallback((): string[] => {
    if (scenePhase === "darkness") return DARKNESS_LINES;
    if (scenePhase === "scene") return SCENE_LINES;
    return [];
  }, [scenePhase]);

  const currentLines = getCurrentLines();
  const currentText = currentLines[lineIndex] ?? "";

  // ==========================================
  // Load images
  // ==========================================

  useEffect(() => {
    const load = (src: string, key: "bg" | "kaiLying" | "strangerSheet") => {
      const img = new Image();
      img.onload = () => {
        imagesRef.current[key] = img;
      };
      img.src = src;
    };
    load("/backgrounds/stranger_tent.png", "bg");
    load("/sprites/characters/kai_lying.png", "kaiLying");
    load("/sprites/characters/hooded_stranger_walk.png", "strangerSheet");
  }, []);

  // ==========================================
  // Stranger walk frame cycling
  // ==========================================

  useEffect(() => {
    const interval = setInterval(() => {
      setStrangerFrame((f) => (f + 1) % 5);
    }, TIMING.STRANGER_FRAME_MS);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // Canvas scene rendering
  // ==========================================

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const { bg, kaiLying, strangerSheet } = imagesRef.current;

    // Background (object-fit: cover)
    if (bg) {
      const bgAspect = bg.width / bg.height;
      const canvasAspect = w / h;
      let dw: number, dh: number, dx: number, dy: number;
      if (canvasAspect > bgAspect) {
        dw = w;
        dh = w / bgAspect;
        dx = 0;
        dy = (h - dh) / 2;
      } else {
        dh = h;
        dw = h * bgAspect;
        dx = (w - dw) / 2;
        dy = 0;
      }
      ctx.drawImage(bg, dx, dy, dw, dh);
    } else {
      // Fallback gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#2a1a0a");
      grad.addColorStop(0.3, "#3d2817");
      grad.addColorStop(0.7, "#1a0f05");
      grad.addColorStop(1, "#0d0805");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // Kai lying sprite — positioned on the tent floor, left of center
    if (kaiLying) {
      const displayH = h * 0.25;
      const scale = displayH / kaiLying.height;
      const displayW = kaiLying.width * scale;
      const x = w * 0.35 - displayW / 2;
      const y = h * 0.25;
      // Use lighten blend to hide the dark gradient background
      ctx.globalCompositeOperation = "lighten";
      ctx.drawImage(kaiLying, x, y, displayW, displayH);
      ctx.globalCompositeOperation = "source-over";
    }

    // Stranger sprites from walk sheet (5 cols x 4 rows)
    if (strangerSheet) {
      const frameW = strangerSheet.width / 5;
      const frameH = strangerSheet.height / 4;
      const displayH = h * 0.16;
      const displayW = displayH * (frameW / frameH);

      ctx.globalCompositeOperation = "lighten";
      for (const s of STRANGER_DEFS) {
        const x = w * s.xPct - displayW / 2;
        const y = h * s.yPct - displayH / 2;
        ctx.drawImage(
          strangerSheet,
          strangerFrame * frameW,
          s.dirRow * frameH,
          frameW,
          frameH,
          x,
          y,
          displayW,
          displayH
        );
      }
      ctx.globalCompositeOperation = "source-over";
    }

    // Vignette overlay
    const vigGrad = ctx.createRadialGradient(
      w / 2, h / 2, w * 0.2,
      w / 2, h / 2, w * 0.7
    );
    vigGrad.addColorStop(0, "rgba(0,0,0,0)");
    vigGrad.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, w, h);
  }, [strangerFrame]);

  // ==========================================
  // Fade in scene when new darkness line starts
  // ==========================================

  useEffect(() => {
    if (scenePhase !== "darkness") return;
    if (lineIndex >= DARKNESS_LINES.length) return;

    const target = OVERLAY_TARGETS[lineIndex] ?? 0.5;
    setOverlayTransitionMs(TIMING.FLASH_FADE_MS);
    const timer = setTimeout(() => setOverlayOpacity(target), 50);
    return () => clearTimeout(timer);
  }, [scenePhase, lineIndex]);

  // ==========================================
  // Skip hint
  // ==========================================

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), TIMING.SKIP_SHOW_DELAY);
    return () => clearTimeout(timer);
  }, []);

  // ==========================================
  // Typewriter effect
  // ==========================================

  useEffect(() => {
    if (scenePhase !== "darkness" && scenePhase !== "scene") return;
    if (lineIndex >= currentLines.length) return;

    setDisplayedChars(0);
    setLineComplete(false);

    const text = currentLines[lineIndex];
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
  }, [scenePhase, lineIndex, currentLines]);

  // ==========================================
  // Advance logic
  // ==========================================

  const handleAdvance = useCallback(() => {
    if (isComplete || isTransitioning) return;
    if (scenePhase === "reveal" || scenePhase === "transition") return;

    if (scenePhase === "darkness" || scenePhase === "scene") {
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

        if (nextIndex < currentLines.length) {
          if (scenePhase === "darkness") {
            // Fade overlay back to black, then show next line
            setIsTransitioning(true);
            setOverlayTransitionMs(TIMING.FLASH_RETURN_MS);
            setOverlayOpacity(1);
            setTimeout(() => {
              if (phaseRef.current === "darkness") {
                setLineIndex(nextIndex);
                setIsTransitioning(false);
              }
            }, TIMING.FLASH_RETURN_MS);
          } else {
            // Scene phase — just advance
            setLineIndex(nextIndex);
          }
        } else {
          // All lines in this phase done
          if (scenePhase === "darkness") {
            setScenePhase("reveal");
            setLineIndex(0);
          } else if (scenePhase === "scene") {
            setScenePhase("transition");
          }
        }
      }
    }
  }, [
    isComplete,
    isTransitioning,
    scenePhase,
    lineComplete,
    lineIndex,
    currentLines,
    currentText,
  ]);

  // ==========================================
  // Skip (Escape only)
  // ==========================================

  const handleSkip = useCallback(() => {
    if (!isComplete) {
      setIsComplete(true);
      if (typingRef.current) {
        clearInterval(typingRef.current);
        typingRef.current = null;
      }
      setFadeOut(1);
      setTimeout(onComplete, 800);
    }
  }, [isComplete, onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleSkip();
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip, handleAdvance]);

  // ==========================================
  // Phase: reveal (full scene fade-in)
  // ==========================================

  useEffect(() => {
    if (scenePhase !== "reveal") return;

    setOverlayTransitionMs(TIMING.REVEAL_DURATION);
    const fadeTimer = setTimeout(() => setOverlayOpacity(0), 100);

    const sceneTimer = setTimeout(() => {
      if (phaseRef.current === "reveal") {
        setScenePhase("scene");
      }
    }, TIMING.REVEAL_DURATION + 500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(sceneTimer);
    };
  }, [scenePhase]);

  // ==========================================
  // Phase: transition (fade to black → complete)
  // ==========================================

  useEffect(() => {
    if (scenePhase !== "transition") return;

    const fadeTimer = setTimeout(() => setFadeOut(1), 100);
    const completeTimer = setTimeout(() => {
      if (phaseRef.current === "transition") {
        setIsComplete(true);
        onComplete();
      }
    }, TIMING.TRANSITION_DURATION);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [scenePhase, onComplete]);

  // ==========================================
  // Render
  // ==========================================

  const showText = scenePhase === "darkness" || scenePhase === "scene";
  const isOverScene = scenePhase === "scene";

  return (
    <div
      className="fixed inset-0 bg-black overflow-hidden"
      onClick={handleAdvance}
    >
      {/* Scene canvas — always renders tent + sprites behind overlay */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Dark overlay — controls how much scene is visible */}
      <div
        className="absolute inset-0 bg-black pointer-events-none z-10"
        style={{
          opacity: overlayOpacity,
          transition: `opacity ${overlayTransitionMs}ms ease-in-out`,
        }}
      />

      {/* === TEXT DISPLAY === */}
      {showText && lineIndex < currentLines.length && !isTransitioning && (
        <div
          className={`absolute inset-0 flex items-center justify-center z-20 px-8 ${
            isOverScene ? "items-end pb-24" : ""
          }`}
        >
          <div
            className={`max-w-2xl w-full ${
              isOverScene
                ? "bg-black/80 border border-gray-700 rounded-lg px-6 py-4"
                : "text-center"
            }`}
          >
            <p
              className={`text-lg md:text-xl leading-relaxed ${
                isOverScene ? "text-white/90" : "text-white/70 italic"
              }`}
              style={{ fontFamily: "var(--font-pixel), monospace" }}
            >
              {currentText.substring(0, displayedChars)}
              {!lineComplete && (
                <span className="animate-pulse ml-0.5 text-white/50">▌</span>
              )}
            </p>

            {/* Continue indicator */}
            {lineComplete && (
              <div
                className={`animate-bounce mt-3 ${
                  isOverScene ? "text-right" : "text-center"
                }`}
              >
                <span className="text-yellow-500/70 text-sm">▼</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fade-out overlay (transition phase) */}
      <div
        className="absolute inset-0 bg-black pointer-events-none z-30"
        style={{
          opacity: fadeOut,
          transition: `opacity ${TIMING.TRANSITION_DURATION}ms ease-in`,
        }}
      />

      {/* Skip hint */}
      {showSkip && !isComplete && (
        <div className="absolute bottom-8 right-8 text-gray-600 text-xs z-50 animate-pulse">
          Press ESC to skip
        </div>
      )}
    </div>
  );
}
