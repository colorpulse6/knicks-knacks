"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ExecutionSceneProps {
  onComplete: () => void;
}

type ScenePhase =
  | "white_in"      // 0-3s: White fades to reveal sky
  | "playing"       // 3-30s: Pan + system voice + thoughts + heartbeat (timeline-driven)
  | "disruption"    // 30-35s: Reality fractures
  | "white_out"     // 35s: Blinding flash
  | "awakening"     // Black screen, text fades
  | "complete";

// --- Gemini Scene Content ---

interface ThoughtBubble {
  text: string;
  type: "text" | "image_flash" | "system";
  position: string;
  duration: number;
  glitch?: boolean;
  shake?: boolean;
  color?: string;
}

// Thoughts are scheduled at absolute times from when "playing" phase starts (t=0 = 3s into scene)
interface ScheduledThought {
  startTime: number; // ms from playing phase start
  thought: ThoughtBubble;
}

const SCHEDULED_THOUGHTS: ScheduledThought[] = [
  // t=7s into playing (10s scene time): "My hands... can't move."
  {
    startTime: 7000,
    thought: {
      text: "My hands... can't move.",
      type: "text",
      position: "bottom-left",
      duration: 2000,
      glitch: false,
    },
  },
  // t=12s into playing (15s scene time): Elara flash (subliminal)
  {
    startTime: 12000,
    thought: {
      text: "",
      type: "image_flash",
      position: "center",
      duration: 500,
      glitch: true,
      color: "rgba(255, 220, 140, 0.4)",
    },
  },
  // t=13s into playing (16s scene time): "Elara...?"
  {
    startTime: 13000,
    thought: {
      text: "Elara...?",
      type: "text",
      position: "center",
      duration: 1500,
      glitch: false,
    },
  },
  // t=17s into playing (20s scene time): System intrusion
  {
    startTime: 17000,
    thought: {
      text: "Target: KAI_7.34. Variable: Unstable.",
      type: "system",
      position: "top-right",
      duration: 3000,
      glitch: true,
    },
  },
  // t=22s into playing (25s scene time): "I didn't... do anything."
  {
    startTime: 22000,
    thought: {
      text: "I didn't... do anything.",
      type: "text",
      position: "bottom-center",
      duration: 2000,
      glitch: true,
      shake: true,
    },
  },
];

// System voice - two parts, typed at different times
const SYSTEM_VOICE_PART1 = "PROCESS: PURGE_ENTITY [KAI_7.34].";
const SYSTEM_VOICE_PART1_PAUSE = 1000; // 1s pause after part 1
const SYSTEM_VOICE_PART2 = " COMPLIANCE: ABSOLUTE.";
const SYSTEM_VOICE_PART2_PAUSE = 500;
const SYSTEM_VOICE_PART3 = " NULLIFICATION SEQUENCE ENGAGED.";

// Disruption scrambled text
const DISRUPTION_GLITCH_TEXTS = [
  "NULLIF---",
  "FATAL_EXCEPT&&N/",
  "R3ALITY_BR3AK",
  "ERR0R: ENTITY_P3RSISTS",
  "CANNOT_DELET█████",
];

const AWAKENING_LINES = [
  "Static...",
  "Where is the cold?",
  "Am I... still here?",
];

// --- Timing ---

const TIMING = {
  // Phase durations
  WHITE_IN: 3000,
  PAN_DURATION: 12000,            // 12s pan (3s-15s scene time)
  PLAYING_DURATION: 27000,        // Total playing phase (3s-30s)
  DISRUPTION_DURATION: 5000,      // 5s disruption (30s-35s)
  WHITE_OUT_HOLD: 1500,

  // System voice starts immediately in playing phase
  SYSTEM_VOICE_START: 0,          // t=0 in playing phase (3s scene time)
  SYSTEM_VOICE_CHAR_DELAY: 35,

  // Heartbeat starts at t=12s in playing (15s scene time)
  HEARTBEAT_START: 12000,
  HEARTBEAT_BEAT_COUNT: 12,
  HEARTBEAT_FIRST_INTERVAL: 900,
  HEARTBEAT_ACCELERATION: 55,
  HEARTBEAT_BEAT_DURATION: 150,

  // Awakening
  AWAKENING_LINE_DELAY: 1800,
  AWAKENING_LINE_HOLD: 1200,
  AWAKENING_FADE_OUT: 800,

  SKIP_SHOW_DELAY: 3000,
};

// --- Position helper ---

function getPositionClass(position: string): string {
  switch (position) {
    case "bottom-left":
      return "bottom-1/4 left-1/4 -translate-x-1/2";
    case "bottom-center":
      return "bottom-1/4 left-1/2 -translate-x-1/2";
    case "top-right":
      return "top-1/4 right-1/4 translate-x-1/2";
    case "left":
      return "top-1/3 left-1/4 -translate-x-1/2";
    case "right":
      return "top-1/3 right-1/4 translate-x-1/2";
    case "center":
    default:
      return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
  }
}

// --- Component ---

export default function ExecutionScene({ onComplete }: ExecutionSceneProps) {
  const [scenePhase, setScenePhase] = useState<ScenePhase>("white_in");
  const [showSkip, setShowSkip] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // White overlay (initial fade)
  const [whiteOverlay, setWhiteOverlay] = useState(1);

  // Pan
  const [panTarget, setPanTarget] = useState("0%");

  // Thought bubbles
  const [activeThought, setActiveThought] = useState<ThoughtBubble | null>(null);

  // System voice
  const [systemVoiceText, setSystemVoiceText] = useState("");
  const [showSystemVoice, setShowSystemVoice] = useState(false);

  // Heartbeat
  const [heartbeatActive, setHeartbeatActive] = useState(false);
  const [heartbeatPulse, setHeartbeatPulse] = useState(false);

  // Disruption
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [screenShake, setScreenShake] = useState(0);
  const [disruptionText, setDisruptionText] = useState("");

  // White-out / awakening
  const [whiteOut, setWhiteOut] = useState(false);
  const [awakeningLine, setAwakeningLine] = useState(-1);
  const [awakeningOpacity, setAwakeningOpacity] = useState(0);

  // Refs
  const phaseRef = useRef<ScenePhase>("white_in");
  phaseRef.current = scenePhase;
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Helper to schedule a timeout that gets cleaned up
  const scheduleTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  // Cleanup all scheduled timeouts on unmount or skip
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // ==========================================
  // Skip logic
  // ==========================================

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), TIMING.SKIP_SHOW_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const handleSkip = useCallback(() => {
    if (!isComplete) {
      setIsComplete(true);
      // Clear all pending timeouts
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      // Quick fade to black then complete
      setActiveThought(null);
      setShowSystemVoice(false);
      setHeartbeatActive(false);
      setGlitchIntensity(0);
      setScreenShake(0);
      setWhiteOut(true);
      setTimeout(onComplete, 800);
    }
  }, [isComplete, onComplete]);

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

  // ==========================================
  // Phase: white_in (0-3s)
  // ==========================================

  useEffect(() => {
    if (scenePhase !== "white_in") return;
    const fadeTimer = setTimeout(() => setWhiteOverlay(0), 100);
    const phaseTimer = setTimeout(() => {
      if (phaseRef.current === "white_in") setScenePhase("playing");
    }, TIMING.WHITE_IN);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(phaseTimer);
    };
  }, [scenePhase]);

  // ==========================================
  // Phase: playing (3-30s) — timeline-driven
  // ==========================================

  useEffect(() => {
    if (scenePhase !== "playing") return;

    // --- Start pan immediately ---
    const panTimer = setTimeout(() => setPanTarget("70%"), 100);
    timeoutsRef.current.push(panTimer);

    // --- Schedule thought bubbles ---
    for (const scheduled of SCHEDULED_THOUGHTS) {
      scheduleTimeout(() => {
        if (phaseRef.current !== "playing") return;
        setActiveThought(scheduled.thought);
        // Auto-hide after duration
        scheduleTimeout(() => {
          setActiveThought(null);
        }, scheduled.thought.duration);
      }, scheduled.startTime);
    }

    // --- Schedule system voice typing ---
    const fullText = SYSTEM_VOICE_PART1 + SYSTEM_VOICE_PART2 + SYSTEM_VOICE_PART3;
    let charIndex = 0;

    const typeSystemVoice = () => {
      if (phaseRef.current !== "playing") return;
      setShowSystemVoice(true);

      const typeChar = () => {
        if (phaseRef.current !== "playing" || charIndex >= fullText.length) return;
        charIndex++;
        setSystemVoiceText(fullText.substring(0, charIndex));

        // Check for pauses at segment boundaries
        const currentText = fullText.substring(0, charIndex);
        if (currentText === SYSTEM_VOICE_PART1) {
          scheduleTimeout(typeChar, SYSTEM_VOICE_PART1_PAUSE);
        } else if (currentText === SYSTEM_VOICE_PART1 + SYSTEM_VOICE_PART2) {
          scheduleTimeout(typeChar, SYSTEM_VOICE_PART2_PAUSE);
        } else {
          scheduleTimeout(typeChar, TIMING.SYSTEM_VOICE_CHAR_DELAY);
        }
      };

      typeChar();
    };

    scheduleTimeout(typeSystemVoice, TIMING.SYSTEM_VOICE_START);

    // --- Schedule heartbeat ---
    scheduleTimeout(() => {
      if (phaseRef.current !== "playing") return;
      setHeartbeatActive(true);

      let beatCount = 0;
      const doBeat = () => {
        if (phaseRef.current !== "playing" && phaseRef.current !== "disruption") return;

        setHeartbeatPulse(true);
        setScreenShake(2);

        scheduleTimeout(() => {
          setHeartbeatPulse(false);
          setScreenShake(0);
          beatCount++;

          if (beatCount < TIMING.HEARTBEAT_BEAT_COUNT) {
            const nextDelay = Math.max(
              250,
              TIMING.HEARTBEAT_FIRST_INTERVAL - beatCount * TIMING.HEARTBEAT_ACCELERATION
            );
            scheduleTimeout(doBeat, nextDelay);
          }
        }, TIMING.HEARTBEAT_BEAT_DURATION);
      };

      doBeat();
    }, TIMING.HEARTBEAT_START);

    // --- Transition to disruption at end of playing phase ---
    scheduleTimeout(() => {
      if (phaseRef.current === "playing") {
        setActiveThought(null);
        setScenePhase("disruption");
      }
    }, TIMING.PLAYING_DURATION);

    return () => {
      clearTimeout(panTimer);
    };
  }, [scenePhase, scheduleTimeout]);

  // ==========================================
  // Phase: disruption (30-35s)
  // ==========================================

  useEffect(() => {
    if (scenePhase !== "disruption") return;

    let frame = 0;
    const totalFrames = Math.round((TIMING.DISRUPTION_DURATION / 1000) * 60);
    let rafId: number;
    let glitchTextIndex = 0;

    // Cycle through disruption glitch texts
    const glitchTextInterval = setInterval(() => {
      if (phaseRef.current !== "disruption") return;
      glitchTextIndex = (glitchTextIndex + 1) % DISRUPTION_GLITCH_TEXTS.length;
      setDisruptionText(DISRUPTION_GLITCH_TEXTS[glitchTextIndex]);
    }, 400);

    const animate = () => {
      frame++;
      const progress = frame / totalFrames;

      setGlitchIntensity(Math.min(1, progress * 1.5));
      setScreenShake(Math.floor(progress * 12));

      if (frame < totalFrames && phaseRef.current === "disruption") {
        rafId = requestAnimationFrame(animate);
      } else {
        clearInterval(glitchTextInterval);
        setScenePhase("white_out");
      }
    };

    // Start disruption text immediately
    setDisruptionText(DISRUPTION_GLITCH_TEXTS[0]);
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(glitchTextInterval);
    };
  }, [scenePhase]);

  // ==========================================
  // Phase: white_out → awakening
  // ==========================================

  useEffect(() => {
    if (scenePhase !== "white_out") return;
    setWhiteOut(true);
    setGlitchIntensity(0);
    setScreenShake(0);
    setShowSystemVoice(false);
    setHeartbeatActive(false);
    setDisruptionText("");

    const timer = setTimeout(() => {
      if (phaseRef.current === "white_out") {
        setWhiteOut(false);
        setScenePhase("awakening");
      }
    }, TIMING.WHITE_OUT_HOLD);
    return () => clearTimeout(timer);
  }, [scenePhase]);

  // ==========================================
  // Phase: awakening → complete
  // ==========================================

  useEffect(() => {
    if (scenePhase !== "awakening") return;

    let cancelled = false;
    let lineIndex = 0;

    const showNextLine = () => {
      if (cancelled || phaseRef.current !== "awakening") return;
      if (lineIndex >= AWAKENING_LINES.length) {
        setTimeout(() => {
          if (!cancelled) {
            setAwakeningOpacity(0);
            setTimeout(() => {
              if (!cancelled && phaseRef.current === "awakening") {
                setIsComplete(true);
                onComplete();
              }
            }, TIMING.AWAKENING_FADE_OUT);
          }
        }, TIMING.AWAKENING_LINE_HOLD);
        return;
      }

      setAwakeningLine(lineIndex);
      setAwakeningOpacity(1);
      lineIndex++;

      setTimeout(() => {
        if (!cancelled) {
          setAwakeningOpacity(0);
          setTimeout(showNextLine, TIMING.AWAKENING_FADE_OUT);
        }
      }, TIMING.AWAKENING_LINE_DELAY);
    };

    const timer = setTimeout(showNextLine, 800);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [scenePhase, onComplete]);

  // ==========================================
  // Screen shake
  // ==========================================

  const getShakeStyle = (): React.CSSProperties => {
    if (screenShake === 0) return {};
    const intensity = screenShake * 3;
    const x = Math.random() * intensity - intensity / 2;
    const y = Math.random() * intensity - intensity / 2;
    return { transform: `translate(${x}px, ${y}px)` };
  };

  // ==========================================
  // Render
  // ==========================================

  const isAwakening = scenePhase === "awakening";
  const isDisruption = scenePhase === "disruption";
  const showScene = !isAwakening && scenePhase !== "complete";

  return (
    <div
      className="fixed inset-0 bg-black overflow-hidden"
      style={getShakeStyle()}
      onClick={handleSkip}
    >
      {/* Background image with pan */}
      {showScene && (
        <img
          src="/backgrounds/execution_platform.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition: `center ${panTarget}`,
            transition:
              scenePhase === "playing" || scenePhase === "disruption"
                ? `object-position ${TIMING.PAN_DURATION}ms ease-in-out`
                : "none",
            filter:
              glitchIntensity > 0
                ? `hue-rotate(${glitchIntensity * 120}deg) saturate(${1 + glitchIntensity * 1.5}) brightness(${1 + glitchIntensity * 0.3}) contrast(${1 + glitchIntensity * 0.5})`
                : "none",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}

      {/* Fallback gradient when image is missing */}
      {showScene && (
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, #0a0f0a 0%, #0d1a0d 20%, #1a0a2e 50%, #0d1117 80%, #1a1a2e 100%)",
          }}
        />
      )}

      {/* Vignette */}
      {showScene && (
        <div
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.7) 100%)",
          }}
        />
      )}

      {/* === DISRUPTION EFFECTS === */}

      {/* RGB channel split (chromatic aberration) */}
      {isDisruption && glitchIntensity > 0.15 && (
        <>
          <div
            className="absolute inset-0 pointer-events-none mix-blend-lighten"
            style={{
              background: `rgba(255,0,0,${glitchIntensity * 0.15})`,
              transform: `translateX(${glitchIntensity * 8}px)`,
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none mix-blend-lighten"
            style={{
              background: `rgba(0,255,255,${glitchIntensity * 0.15})`,
              transform: `translateX(${-glitchIntensity * 8}px)`,
            }}
          />
        </>
      )}

      {/* Color inversion strobe */}
      {isDisruption && glitchIntensity > 0.5 && Math.random() > 0.7 && (
        <div
          className="absolute inset-0 pointer-events-none z-[8]"
          style={{
            background: "white",
            mixBlendMode: "difference",
            opacity: 0.3,
          }}
        />
      )}

      {/* Block displacement */}
      {isDisruption &&
        glitchIntensity > 0.3 &&
        Array.from({ length: Math.floor(glitchIntensity * 8) }).map((_, i) => (
          <div
            key={i}
            className="absolute pointer-events-none z-[7]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${15 + Math.random() * 35}%`,
              height: `${1 + Math.random() * 5}%`,
              background:
                i % 3 === 0
                  ? `rgba(0,255,255,${0.08 + glitchIntensity * 0.15})`
                  : i % 3 === 1
                    ? `rgba(255,0,100,${0.08 + glitchIntensity * 0.15})`
                    : `rgba(0,0,0,${0.3 + glitchIntensity * 0.4})`,
              transform: `translateX(${(Math.random() - 0.5) * 80}px)`,
            }}
          />
        ))}

      {/* Scanlines (disruption) */}
      {isDisruption && (
        <div
          className="scanline-overlay absolute inset-0 pointer-events-none z-[6]"
          style={{ opacity: 0.3 + glitchIntensity * 0.5 }}
        />
      )}

      {/* Disruption glitch text */}
      {isDisruption && disruptionText && (
        <div className="absolute inset-x-0 top-1/3 flex justify-center z-20 px-4">
          <p
            className="text-red-500 font-mono text-xl md:text-2xl tracking-widest glitch-text"
            style={{ textShadow: "0 0 10px rgba(255,0,0,0.8)" }}
          >
            {disruptionText}
          </p>
        </div>
      )}

      {/* === HEARTBEAT VIGNETTE === */}
      {heartbeatActive && !isAwakening && (
        <div
          className="absolute inset-0 pointer-events-none z-10 transition-all duration-150"
          style={{
            background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${heartbeatPulse ? 0.85 : 0.4}) 100%)`,
          }}
        />
      )}

      {/* === THOUGHT BUBBLE === */}
      {activeThought && (
        <div
          key={activeThought.text || "flash"}
          className={`absolute z-20 ${getPositionClass(activeThought.position)} ${activeThought.glitch ? "glitch-text" : ""}`}
          style={
            {
              "--thought-duration": `${activeThought.duration}ms`,
              textShadow:
                activeThought.type !== "image_flash"
                  ? "0 0 20px rgba(255,255,255,0.5), 2px 2px 0 #000"
                  : undefined,
            } as React.CSSProperties
          }
        >
          {activeThought.type === "image_flash" ? (
            <div
              className="w-56 h-36 rounded-lg animate-thought-bubble"
              style={{
                background: activeThought.color || "rgba(255,255,255,0.2)",
                filter: "blur(12px)",
                boxShadow: `0 0 40px ${activeThought.color || "rgba(255,220,140,0.3)"}`,
              }}
            />
          ) : (
            <span
              className={`animate-thought-bubble text-xl md:text-2xl lg:text-3xl ${
                activeThought.type === "system"
                  ? "text-cyan-400 font-mono tracking-wider text-base md:text-lg"
                  : "text-white/90 italic"
              } ${activeThought.shake ? "animate-pulse" : ""}`}
              style={{ fontFamily: "var(--font-pixel), monospace" }}
            >
              {activeThought.text}
            </span>
          )}
        </div>
      )}

      {/* === SYSTEM VOICE === */}
      {showSystemVoice && systemVoiceText && !isDisruption && !isAwakening && (
        <div className="absolute inset-x-0 top-8 flex justify-center z-20 px-4">
          <div className="bg-black/85 border border-cyan-900/60 px-6 py-3 max-w-2xl">
            <p className="text-cyan-400/90 font-mono text-xs md:text-sm tracking-widest">
              {systemVoiceText}
              <span className="animate-pulse text-cyan-300">_</span>
            </p>
          </div>
        </div>
      )}

      {/* === OVERLAYS === */}

      {/* White overlay (initial fade from SystemBootScreen) */}
      <div
        className="absolute inset-0 bg-white pointer-events-none z-30"
        style={{
          opacity: whiteOverlay,
          transition: `opacity ${TIMING.WHITE_IN}ms ease-out`,
        }}
      />

      {/* White-out (end of disruption → hard cut to black) */}
      {whiteOut && (
        <div
          className="absolute inset-0 bg-white pointer-events-none z-40"
          style={{
            animation: `screen-flash-white ${TIMING.WHITE_OUT_HOLD}ms ease-in forwards`,
          }}
        />
      )}

      {/* Awakening */}
      {isAwakening && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-40">
          {awakeningLine >= 0 && awakeningLine < AWAKENING_LINES.length && (
            <p
              className="text-white/50 text-xl md:text-2xl transition-opacity duration-700 italic"
              style={{
                opacity: awakeningOpacity,
                fontFamily: "var(--font-pixel), monospace",
              }}
            >
              {AWAKENING_LINES[awakeningLine]}
            </p>
          )}
        </div>
      )}

      {/* Skip button */}
      {showSkip && !isComplete && (
        <div className="absolute bottom-8 right-8 text-gray-600 text-xs z-50 animate-pulse">
          Press ENTER to skip
        </div>
      )}
    </div>
  );
}
