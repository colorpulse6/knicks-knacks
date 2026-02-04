"use client";

import { useState, useEffect } from "react";
import type { BattleRewards } from "../../stores/gameStore";

interface VictoryScreenProps {
  rewards: BattleRewards;
  onComplete: () => void;
}

export default function VictoryScreen({ rewards, onComplete }: VictoryScreenProps) {
  const [phase, setPhase] = useState<"exp" | "gold" | "items" | "levelups" | "done">("exp");
  const [displayedExp, setDisplayedExp] = useState(0);
  const [displayedGold, setDisplayedGold] = useState(0);
  const [visibleItems, setVisibleItems] = useState(0);
  const [showLevelUps, setShowLevelUps] = useState(false);
  const [canDismiss, setCanDismiss] = useState(false);

  // Animate EXP counter
  useEffect(() => {
    if (phase !== "exp") return;

    const duration = 800;
    const startTime = Date.now();
    const targetExp = rewards.experience;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayedExp(Math.floor(targetExp * progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => setPhase("gold"), 300);
      }
    };

    requestAnimationFrame(animate);
  }, [phase, rewards.experience]);

  // Animate Gold counter
  useEffect(() => {
    if (phase !== "gold") return;

    const duration = 600;
    const startTime = Date.now();
    const targetGold = rewards.gold;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayedGold(Math.floor(targetGold * progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => setPhase("items"), 300);
      }
    };

    requestAnimationFrame(animate);
  }, [phase, rewards.gold]);

  // Show items one by one
  useEffect(() => {
    if (phase !== "items") return;

    if (rewards.items.length === 0) {
      setTimeout(() => setPhase("levelups"), 200);
      return;
    }

    const interval = setInterval(() => {
      setVisibleItems((prev) => {
        if (prev >= rewards.items.length) {
          clearInterval(interval);
          setTimeout(() => setPhase("levelups"), 500);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [phase, rewards.items.length]);

  // Show level ups
  useEffect(() => {
    if (phase !== "levelups") return;

    if (rewards.levelUps.length > 0) {
      setShowLevelUps(true);
    }

    setTimeout(() => {
      setPhase("done");
      setCanDismiss(true);
    }, rewards.levelUps.length > 0 ? 1500 : 300);
  }, [phase, rewards.levelUps.length]);

  // Handle dismiss
  useEffect(() => {
    if (!canDismiss) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        onComplete();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [canDismiss, onComplete]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/85 z-50">
      <div className="bg-gray-900/95 border-2 border-amber-600/50 rounded-lg p-6 min-w-[320px] max-w-[400px] shadow-2xl">
        {/* Victory header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-amber-400 mb-1 animate-pulse">
            Victory!
          </h2>
          <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        </div>

        {/* Rewards section */}
        <div className="space-y-4">
          {/* EXP */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Experience</span>
            <span className="text-xl font-bold text-cyan-400">
              +{displayedExp} <span className="text-sm font-normal">EXP</span>
            </span>
          </div>

          {/* Gold */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Gold</span>
            <span className="text-xl font-bold text-yellow-400">
              +{displayedGold} <span className="text-sm font-normal">G</span>
            </span>
          </div>

          {/* Items dropped */}
          {rewards.items.length > 0 && (
            <div className="border-t border-gray-700 pt-3">
              <p className="text-gray-500 text-sm mb-2">Items Obtained</p>
              <div className="space-y-1">
                {rewards.items.slice(0, visibleItems).map((item, idx) => (
                  <div
                    key={`${item.itemId}-${idx}`}
                    className="flex justify-between items-center text-sm animate-fade-in"
                  >
                    <span className="text-green-400">{item.name}</span>
                    <span className="text-gray-400">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Level ups */}
          {showLevelUps && rewards.levelUps.length > 0 && (
            <div className="border-t border-amber-700/50 pt-3 mt-3">
              <div className="bg-amber-900/30 rounded p-3 border border-amber-500/30">
                {rewards.levelUps.map((levelUp, idx) => (
                  <div
                    key={idx}
                    className="text-center text-amber-300 font-bold animate-bounce-once"
                  >
                    {levelUp.characterName} reached Level {levelUp.newLevel}!
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dismiss prompt */}
        {canDismiss && (
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm animate-pulse">
              Press ENTER to continue
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
