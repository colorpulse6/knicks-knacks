"use client";

import { useState, useEffect } from "react";
import type { QuestCompleteRewards } from "../../stores/gameStore";

interface QuestCompleteScreenProps {
  rewards: QuestCompleteRewards;
  onComplete: () => void;
}

export default function QuestCompleteScreen({ rewards, onComplete }: QuestCompleteScreenProps) {
  const [phase, setPhase] = useState<"title" | "gold" | "exp" | "items" | "done">("title");
  const [displayedGold, setDisplayedGold] = useState(0);
  const [displayedExp, setDisplayedExp] = useState(0);
  const [visibleItems, setVisibleItems] = useState(0);
  const [canDismiss, setCanDismiss] = useState(false);

  // Animate title phase
  useEffect(() => {
    if (phase !== "title") return;
    const timer = setTimeout(() => setPhase("gold"), 800);
    return () => clearTimeout(timer);
  }, [phase]);

  // Animate Gold counter
  useEffect(() => {
    if (phase !== "gold") return;

    if (rewards.gold === 0) {
      setTimeout(() => setPhase("exp"), 100);
      return;
    }

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
        setTimeout(() => setPhase("exp"), 300);
      }
    };

    requestAnimationFrame(animate);
  }, [phase, rewards.gold]);

  // Animate EXP counter
  useEffect(() => {
    if (phase !== "exp") return;

    if (rewards.experience === 0) {
      setTimeout(() => setPhase("items"), 100);
      return;
    }

    const duration = 600;
    const startTime = Date.now();
    const targetExp = rewards.experience;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayedExp(Math.floor(targetExp * progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => setPhase("items"), 300);
      }
    };

    requestAnimationFrame(animate);
  }, [phase, rewards.experience]);

  // Show items one by one
  useEffect(() => {
    if (phase !== "items") return;

    if (rewards.items.length === 0) {
      setTimeout(() => {
        setPhase("done");
        setCanDismiss(true);
      }, 200);
      return;
    }

    const interval = setInterval(() => {
      setVisibleItems((prev) => {
        if (prev >= rewards.items.length) {
          clearInterval(interval);
          setTimeout(() => {
            setPhase("done");
            setCanDismiss(true);
          }, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [phase, rewards.items.length]);

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
      <div className="bg-gray-900/95 border-2 border-green-600/50 rounded-lg p-6 min-w-[320px] max-w-[400px] shadow-2xl">
        {/* Quest Complete header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-green-400 mb-2">
            Quest Complete!
          </h2>
          <p className="text-amber-300 text-lg font-semibold">
            {rewards.questName}
          </p>
          <div className="h-0.5 mt-2 bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
        </div>

        {/* Rewards section */}
        <div className="space-y-4">
          <p className="text-gray-400 text-sm text-center">Rewards</p>

          {/* Gold */}
          {rewards.gold > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Gold</span>
              <span className="text-xl font-bold text-yellow-400">
                +{displayedGold} <span className="text-sm font-normal">G</span>
              </span>
            </div>
          )}

          {/* EXP */}
          {rewards.experience > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Experience</span>
              <span className="text-xl font-bold text-cyan-400">
                +{displayedExp} <span className="text-sm font-normal">XP</span>
              </span>
            </div>
          )}

          {/* Items received */}
          {rewards.items.length > 0 && (
            <div className="border-t border-gray-700 pt-3">
              <p className="text-gray-500 text-sm mb-2">Items Received</p>
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

          {/* No rewards case */}
          {rewards.gold === 0 && rewards.experience === 0 && rewards.items.length === 0 && (
            <p className="text-gray-500 text-center italic">No material rewards</p>
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
