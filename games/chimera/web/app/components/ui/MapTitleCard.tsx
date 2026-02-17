"use client";

import { useState, useEffect, useRef } from "react";
import { useGameStore } from "../../stores/gameStore";

// Maps that trigger a cinematic title card (shown once per session)
const TITLE_CARDS: Record<string, string> = {
  havenwood_square: "Havenwood",
};

// Track which title cards have already been shown (persists across re-mounts, resets on refresh)
const shownTitles = new Set<string>();

const TIMING = {
  FADE_IN: 1200,
  HOLD: 2500,
  FADE_OUT: 1200,
};

export default function MapTitleCard() {
  const currentMap = useGameStore((s) => s.currentMap);

  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [opacity, setOpacity] = useState(0);

  const prevMapIdRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mapId = currentMap?.id ?? null;

    if (
      !mapId ||
      mapId === prevMapIdRef.current ||
      !TITLE_CARDS[mapId] ||
      shownTitles.has(mapId)
    ) {
      prevMapIdRef.current = mapId;
      return;
    }

    prevMapIdRef.current = mapId;
    shownTitles.add(mapId);

    // Clear any existing animation
    if (timerRef.current) clearTimeout(timerRef.current);

    setTitle(TITLE_CARDS[mapId]);
    setVisible(true);
    setOpacity(0);

    // Fade in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOpacity(1);
      });
    });

    // Hold, then fade out
    timerRef.current = setTimeout(() => {
      setOpacity(0);
      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, TIMING.FADE_OUT);
    }, TIMING.FADE_IN + TIMING.HOLD);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentMap?.id]);

  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
      style={{
        opacity,
        transition: `opacity ${opacity === 1 ? TIMING.FADE_IN : TIMING.FADE_OUT}ms ease-in-out`,
      }}
    >
      <div className="text-center">
        {/* Decorative line above */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-yellow-400/80" />
          <div className="w-2 h-2 rotate-45 border border-yellow-400/60" />
          <div className="w-24 h-px bg-gradient-to-l from-transparent via-yellow-400/50 to-yellow-400/80" />
        </div>

        {/* Title text */}
        <h1
          className="text-4xl md:text-5xl lg:text-6xl text-white tracking-[0.15em] uppercase"
          style={{
            fontFamily: "var(--font-title), serif",
            textShadow:
              "0 0 40px rgba(255, 200, 50, 0.4), 0 0 80px rgba(255, 180, 30, 0.15), 0 2px 10px rgba(0, 0, 0, 0.9)",
          }}
        >
          {title}
        </h1>

        {/* Decorative line below */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-yellow-400/80" />
          <div className="w-2 h-2 rotate-45 border border-yellow-400/60" />
          <div className="w-24 h-px bg-gradient-to-l from-transparent via-yellow-400/50 to-yellow-400/80" />
        </div>
      </div>
    </div>
  );
}
