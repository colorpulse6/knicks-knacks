"use client";

import { useState, useCallback, useEffect } from "react";
import { useGameStore } from "../../stores/gameStore";
import type { Character } from "../../types";

export default function StatusScreen() {
  const { party, story, openedChests, setStoryFlag, resetTriggeredEvent } = useGameStore();
  const [showDebug, setShowDebug] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyboard navigation for party member selection
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (party.length <= 1) return;

      if (e.key === "ArrowLeft" || e.key === "a") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : party.length - 1));
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev < party.length - 1 ? prev + 1 : 0));
      }
    },
    [party.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (party.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No party members.</p>
      </div>
    );
  }

  const character = party[selectedIndex];

  // Calculate stat bar percentages (for visual display)
  const getStatBarWidth = (value: number, max: number = 100): string => {
    return `${Math.min((value / max) * 100, 100)}%`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Party member tabs (if multiple) */}
      {party.length > 1 && (
        <div className="flex gap-2 mb-4 pb-2 border-b border-gray-700/50">
          {party.map((member, index) => (
            <button
              key={member.id}
              onClick={() => setSelectedIndex(index)}
              className={`
                px-4 py-2 rounded text-sm transition-colors
                ${index === selectedIndex ? "bg-amber-700/30 text-amber-300 border border-amber-500/50" : "text-gray-400 hover:bg-gray-700/30"}
              `}
            >
              {member.name}
            </button>
          ))}
        </div>
      )}

      {/* Character details */}
      <div className="flex gap-6 flex-1">
        {/* Left: Portrait and basic info */}
        <div className="w-40 flex flex-col items-center">
          {/* Portrait placeholder */}
          <div className="w-32 h-32 bg-gray-800 border-2 border-amber-700/50 rounded flex items-center justify-center mb-3">
            <span className="text-4xl text-gray-600">{character.name[0]}</span>
          </div>

          <h3 className="text-amber-400 font-bold text-lg">{character.name}</h3>
          <p className="text-gray-400 text-sm">{character.class}</p>
          <p className="text-gray-500 text-xs mt-1">Level {character.level}</p>
        </div>

        {/* Right: Stats */}
        <div className="flex-1">
          {/* HP/MP bars */}
          <div className="space-y-3 mb-6">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-red-400">HP</span>
                <span className="text-gray-300">
                  {character.stats.hp} / {character.stats.maxHp}
                </span>
              </div>
              <div className="h-3 bg-gray-700 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
                  style={{
                    width: `${(character.stats.hp / character.stats.maxHp) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-blue-400">MP</span>
                <span className="text-gray-300">
                  {character.stats.mp} / {character.stats.maxMp}
                </span>
              </div>
              <div className="h-3 bg-gray-700 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
                  style={{
                    width: `${(character.stats.mp / character.stats.maxMp) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Core stats grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <StatRow label="Strength" value={character.stats.strength} abbrev="STR" />
            <StatRow label="Magic" value={character.stats.magic} abbrev="MAG" />
            <StatRow label="Defense" value={character.stats.defense} abbrev="DEF" />
            <StatRow label="M. Defense" value={character.stats.magicDefense} abbrev="MDEF" />
            <StatRow label="Speed" value={character.stats.speed} abbrev="SPD" />
            <StatRow label="Luck" value={character.stats.luck} abbrev="LUCK" />
          </div>

          {/* Equipment summary */}
          <div className="mt-6 pt-4 border-t border-gray-700/50">
            <h4 className="text-gray-400 text-sm mb-2">Equipment</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <EquipSlot label="Weapon" item={character.equipment?.weapon?.name} />
              <EquipSlot label="Armor" item={character.equipment?.armor?.name} />
              <EquipSlot label="Helmet" item={character.equipment?.helmet?.name} />
              <EquipSlot label="Accessory" item={character.equipment?.accessory?.name} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation hint */}
      {party.length > 1 && (
        <div className="mt-2 pt-2 border-t border-gray-700/50 text-xs text-gray-500">
          [←/→] Switch character
        </div>
      )}

      {/* Debug Panel */}
      <div className="mt-4 pt-2 border-t border-gray-700/50">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs text-gray-500 hover:text-gray-400"
        >
          {showDebug ? "▼ Hide Debug" : "▶ Show Debug"}
        </button>
        {showDebug && (
          <div className="mt-2 p-2 bg-gray-800/50 rounded border border-gray-700 text-xs">
            <h4 className="text-cyan-400 font-bold mb-2">Debug Info</h4>

            {/* Party Info */}
            <div className="mb-2">
              <span className="text-gray-400">Party Members: </span>
              <span className="text-white">{party.map(p => p.name).join(", ")}</span>
            </div>

            {/* Key Flags */}
            <div className="mb-2">
              <span className="text-gray-400">Story Flags:</span>
              <div className="ml-2 mt-1 space-y-1">
                <FlagStatus name="lyra_recruited" value={story.flags.lyra_recruited} />
                <FlagStatus name="guardian_defeated" value={story.flags.guardian_defeated} />
                <FlagStatus name="found_laboratory_entrance" value={story.flags.found_laboratory_entrance} />
              </div>
            </div>

            {/* Triggered Events */}
            <div className="mb-2">
              <span className="text-gray-400">Guardian Event Triggered: </span>
              <span className={openedChests.has("terminal_guardian_battle") ? "text-red-400" : "text-green-400"}>
                {openedChests.has("terminal_guardian_battle") ? "Yes (blocked)" : "No (ready)"}
              </span>
            </div>

            {/* Reset Buttons */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  resetTriggeredEvent("terminal_guardian_battle");
                  if (story.flags.guardian_defeated) {
                    setStoryFlag("guardian_defeated", false);
                  }
                }}
                className="px-2 py-1 bg-red-800/50 hover:bg-red-700/50 border border-red-500/50 rounded text-red-300"
              >
                Reset Guardian Battle
              </button>
              {!story.flags.lyra_recruited && (
                <button
                  onClick={() => setStoryFlag("lyra_recruited", true)}
                  className="px-2 py-1 bg-green-800/50 hover:bg-green-700/50 border border-green-500/50 rounded text-green-300"
                >
                  Set Lyra Recruited
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FlagStatus({ name, value }: { name: string; value?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={value ? "text-green-400" : "text-gray-500"}>
        {value ? "✓" : "✗"}
      </span>
      <span className="text-gray-300">{name}</span>
    </div>
  );
}

function StatRow({
  label,
  value,
  abbrev,
}: {
  label: string;
  value: number;
  abbrev: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-amber-400/70 text-xs w-10">{abbrev}</span>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <span className="text-white font-mono">{value}</span>
    </div>
  );
}

function EquipSlot({ label, item }: { label: string; item?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500 text-xs">{label}:</span>
      <span className={item ? "text-gray-300" : "text-gray-600"}>
        {item || "—"}
      </span>
    </div>
  );
}
