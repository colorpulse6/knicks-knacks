"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "../../stores/gameStore";
import type { LevelUpResult } from "../../types/lattice";

interface LevelUpDisplayData {
  characterName: string;
  results: LevelUpResult[];
}

export default function LevelUpNotification() {
  const { party, pendingLevelUps, clearLevelUps, toggleMenu } = useGameStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Convert pending level-ups to display data
  const levelUpData: LevelUpDisplayData[] = pendingLevelUps.map((lu) => {
    const character = party.find((c) => c.id === lu.characterId);
    return {
      characterName: character?.name ?? "Unknown",
      results: lu.results,
    };
  });

  // Show notification when there are pending level-ups
  useEffect(() => {
    if (pendingLevelUps.length > 0) {
      setIsVisible(true);
      setCurrentIndex(0);
    }
  }, [pendingLevelUps]);

  // Handle dismiss
  const handleDismiss = () => {
    if (currentIndex < levelUpData.length - 1) {
      // Show next character's level-up
      setCurrentIndex((prev) => prev + 1);
    } else {
      // All done, clear and hide
      setIsVisible(false);
      clearLevelUps();
    }
  };

  // Handle open lattice
  const handleOpenLattice = () => {
    setIsVisible(false);
    clearLevelUps();
    toggleMenu();
  };

  if (!isVisible || levelUpData.length === 0) {
    return null;
  }

  const current = levelUpData[currentIndex];
  const latestResult = current.results[current.results.length - 1];
  const totalOPEarned = current.results.reduce((sum, r) => sum + r.opEarned, 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <div className="w-[400px] bg-gray-900/95 border-2 border-amber-500/70 rounded-lg shadow-2xl overflow-hidden animate-pulse-once">
        {/* Header with glow effect */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-amber-900/50 via-amber-700/50 to-amber-900/50 border-b border-amber-500/50">
          <div className="absolute inset-0 bg-amber-500/10 animate-pulse" />
          <h2 className="relative text-2xl font-bold text-amber-300 text-center tracking-wider">
            LEVEL UP!
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Character name and new level */}
          <div className="text-center mb-4">
            <div className="text-xl text-white font-bold">
              {current.characterName}
            </div>
            <div className="text-amber-400">
              reached Level {latestResult.newLevel}
              {current.results.length > 1 && (
                <span className="text-amber-500/70">
                  {" "}
                  (+{current.results.length} levels!)
                </span>
              )}
            </div>
          </div>

          {/* Stat gains */}
          <div className="bg-gray-800/50 rounded p-4 mb-4">
            <div className="text-sm text-gray-400 mb-2 text-center">
              Stats Increased
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {latestResult.statGains.maxHp && latestResult.statGains.maxHp > 0 && (
                <StatGain label="HP" value={latestResult.statGains.maxHp} />
              )}
              {latestResult.statGains.maxMp && latestResult.statGains.maxMp > 0 && (
                <StatGain label="MP" value={latestResult.statGains.maxMp} />
              )}
              {latestResult.statGains.strength && latestResult.statGains.strength > 0 && (
                <StatGain label="STR" value={latestResult.statGains.strength} />
              )}
              {latestResult.statGains.magic && latestResult.statGains.magic > 0 && (
                <StatGain label="MAG" value={latestResult.statGains.magic} />
              )}
              {latestResult.statGains.defense && latestResult.statGains.defense > 0 && (
                <StatGain label="DEF" value={latestResult.statGains.defense} />
              )}
              {latestResult.statGains.magicDefense && latestResult.statGains.magicDefense > 0 && (
                <StatGain label="MDEF" value={latestResult.statGains.magicDefense} />
              )}
              {latestResult.statGains.speed && latestResult.statGains.speed > 0 && (
                <StatGain label="SPD" value={latestResult.statGains.speed} />
              )}
              {latestResult.statGains.luck && latestResult.statGains.luck > 0 && (
                <StatGain label="LUCK" value={latestResult.statGains.luck} />
              )}
            </div>
          </div>

          {/* OP earned */}
          <div className="text-center mb-4">
            <span className="text-cyan-400 font-bold text-lg">
              +{totalOPEarned} Optimization Points
            </span>
          </div>

          {/* Glitch Sector warning */}
          {latestResult.isGlitchSector && (
            <div className="bg-purple-900/30 border border-purple-500/50 rounded p-3 mb-4 text-center">
              <div className="text-purple-300 font-bold">
                Glitch Sector Reached!
              </div>
              <div className="text-purple-400/80 text-sm">
                A critical choice awaits in the Lattice...
              </div>
            </div>
          )}

          {/* Multiple level-ups indicator */}
          {levelUpData.length > 1 && (
            <div className="text-center text-gray-500 text-xs mb-4">
              {currentIndex + 1} of {levelUpData.length} party members
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-500/50 rounded transition-colors text-gray-300"
          >
            {currentIndex < levelUpData.length - 1 ? "Next" : "Continue"}
          </button>
          <button
            onClick={handleOpenLattice}
            className="flex-1 px-4 py-2 bg-cyan-700/50 hover:bg-cyan-600/50 border border-cyan-500/50 rounded transition-colors text-cyan-300"
          >
            Open Lattice
          </button>
        </div>
      </div>
    </div>
  );
}

// Stat gain display component
function StatGain({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center px-2 py-1 bg-gray-900/50 rounded">
      <span className="text-gray-400">{label}</span>
      <span className="text-green-400 font-bold">+{value}</span>
    </div>
  );
}
