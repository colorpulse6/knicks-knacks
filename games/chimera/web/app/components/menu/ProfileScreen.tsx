"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useGameStore } from "../../stores/gameStore";
import { getCharacterProfile, getRevealedSecrets } from "../../data/characterProfiles";
import type { Character } from "../../types";

export default function ProfileScreen() {
  const { party } = useGameStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"story" | "abilities" | "secrets">("story");
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });

  const selectedCharacter = party[selectedIndex];
  const profile = selectedCharacter ? getCharacterProfile(selectedCharacter.id) : null;

  // Glitch effect for anomalous characters
  useEffect(() => {
    if (!selectedCharacter?.isGlitched) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.15) {
        setGlitchOffset({
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4
        });
        setTimeout(() => setGlitchOffset({ x: 0, y: 0 }), 100);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [selectedCharacter?.isGlitched]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") {
        setSelectedIndex(prev => prev > 0 ? prev - 1 : party.length - 1);
      } else if (e.key === "ArrowRight" || e.key === "d") {
        setSelectedIndex(prev => prev < party.length - 1 ? prev + 1 : 0);
      } else if (e.key === "Tab") {
        e.preventDefault();
        setActiveTab(prev =>
          prev === "story" ? "abilities" : prev === "abilities" ? "secrets" : "story"
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [party.length]);

  if (!selectedCharacter || !profile) {
    return <div className="text-gray-400">No character data available</div>;
  }

  const revealedSecrets = getRevealedSecrets(profile, selectedCharacter.systemAwareness);
  const expPercent = (selectedCharacter.experience / selectedCharacter.experienceToNext) * 100;

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      {/* Character selector tabs */}
      {party.length > 1 && (
        <div className="flex gap-2 border-b border-amber-700/30 pb-2">
          {party.map((char, idx) => (
            <button
              key={char.id}
              onClick={() => setSelectedIndex(idx)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                idx === selectedIndex
                  ? "bg-amber-700/50 text-amber-300"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {char.name}
            </button>
          ))}
        </div>
      )}

      {/* Main content area */}
      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* Left column - Character info */}
        <div className="w-48 flex-shrink-0 flex flex-col gap-2">
          {/* Top row: Illustration + Name side by side */}
          <div className="flex gap-3">
            {/* Cropped illustration */}
            <div
              className={`relative w-20 h-24 flex-shrink-0 bg-gray-800/30 rounded-lg border overflow-hidden ${
                selectedCharacter.isGlitched ? "border-cyan-500/50" : "border-amber-700/30"
              }`}
              style={{
                transform: `translate(${glitchOffset.x}px, ${glitchOffset.y}px)`
              }}
            >
              <Image
                src={profile.illustration}
                alt={selectedCharacter.name}
                fill
                className="object-cover object-top scale-110"
                onError={(e) => {
                  e.currentTarget.src = selectedCharacter.sprites.battle;
                }}
              />
              {selectedCharacter.isGlitched && (
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
              )}
            </div>

            {/* Name & title */}
            <div className="flex flex-col justify-center">
              <h2 className={`text-base font-bold ${
                selectedCharacter.isGlitched ? "text-cyan-400" : "text-amber-400"
              }`}>
                {selectedCharacter.name}
              </h2>
              <p className="text-gray-400 text-xs italic">{profile.title}</p>
              <p className="text-gray-500 text-xs">
                Lv.{selectedCharacter.level} {selectedCharacter.class}
              </p>
            </div>
          </div>

          {/* HP and MP bars */}
          <div className="flex flex-col gap-1 text-xs">
            <StatBadge label="HP" value={selectedCharacter.stats.hp} max={selectedCharacter.stats.maxHp} color="red" />
            <StatBadge label="MP" value={selectedCharacter.stats.mp} max={selectedCharacter.stats.maxMp} color="blue" />
          </div>

          {/* EXP progress */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>EXP</span>
              <span>{selectedCharacter.experience}/{selectedCharacter.experienceToNext}</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-1 text-xs">
            <StatBadge label="STR" value={selectedCharacter.stats.strength} color="orange" />
            <StatBadge label="MAG" value={selectedCharacter.stats.magic} color="purple" />
            <StatBadge label="DEF" value={selectedCharacter.stats.defense} color="gray" />
            <StatBadge label="SPD" value={selectedCharacter.stats.speed} color="green" />
          </div>

          {/* System awareness bar (for glitched characters) */}
          {selectedCharacter.isGlitched && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-cyan-400">Awareness</span>
                <span className="text-cyan-300">{selectedCharacter.systemAwareness}%</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all"
                  style={{ width: `${selectedCharacter.systemAwareness}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right column - Details */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Quote */}
          <blockquote className="text-gray-400 italic text-sm border-l-2 border-amber-700/50 pl-3 mb-2">
            &ldquo;{profile.quote}&rdquo;
          </blockquote>

          {/* Tab navigation */}
          <div className="flex gap-4 border-b border-gray-700 mb-3">
            {(["story", "abilities", "secrets"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? "text-amber-400 border-b-2 border-amber-500"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {tab}
                {tab === "secrets" && revealedSecrets.length > 0 && (
                  <span className="ml-1 text-cyan-400 text-xs">({revealedSecrets.length})</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto pr-2">
            {activeTab === "story" && (
              <div className="space-y-4">
                {/* Backstory */}
                <div>
                  <h3 className="text-amber-400 text-sm font-semibold mb-2">Background</h3>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {profile.backstory}
                  </p>
                </div>

                {/* Traits */}
                <div>
                  <h3 className="text-amber-400 text-sm font-semibold mb-2">Traits</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.traits.map(trait => (
                      <span
                        key={trait}
                        className={`px-2 py-0.5 rounded text-xs ${
                          trait === "Anomalous"
                            ? "bg-cyan-900/50 text-cyan-400 border border-cyan-500/30"
                            : "bg-gray-700/50 text-gray-300"
                        }`}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Origin info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {profile.element && (
                    <div>
                      <span className="text-gray-500">Affinity:</span>
                      <span className={`ml-2 ${
                        profile.element === "Temporal" ? "text-cyan-400" : "text-amber-400"
                      }`}>
                        {profile.element}
                      </span>
                    </div>
                  )}
                  {profile.hometown && (
                    <div>
                      <span className="text-gray-500">Origin:</span>
                      <span className="ml-2 text-gray-300">{profile.hometown}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "abilities" && (
              <div className="space-y-2">
                {selectedCharacter.abilities.map(ability => (
                  <div
                    key={ability.id}
                    className="p-2 bg-gray-800/30 rounded border border-gray-700/50"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-medium text-sm ${
                        ability.animation === "glitch" ? "text-cyan-400" : "text-amber-300"
                      }`}>
                        {ability.name}
                      </span>
                      <span className="text-blue-400 text-xs">
                        {ability.mpCost > 0 ? `${ability.mpCost} MP` : "Free"}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs">{ability.description}</p>
                    <div className="flex gap-3 mt-1 text-xs">
                      <span className="text-gray-500">
                        Type: <span className="text-gray-400 capitalize">{ability.type}</span>
                      </span>
                      <span className="text-gray-500">
                        Target: <span className="text-gray-400 capitalize">{ability.target.replace("_", " ")}</span>
                      </span>
                      {ability.power > 0 && (
                        <span className="text-gray-500">
                          Power: <span className="text-orange-400">{ability.power}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "secrets" && (
              <div className="space-y-3">
                {revealedSecrets.length > 0 ? (
                  <>
                    <p className="text-cyan-400/70 text-xs mb-3">
                      System records accessed through heightened awareness...
                    </p>
                    {revealedSecrets.map((secret, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-cyan-900/20 rounded border border-cyan-500/20"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-500 text-xs mt-0.5">[{String(idx + 1).padStart(2, "0")}]</span>
                          <p className="text-cyan-300 text-sm font-mono">{secret}</p>
                        </div>
                      </div>
                    ))}
                    {revealedSecrets.length < profile.secrets.length && (
                      <p className="text-gray-500 text-xs italic text-center mt-4">
                        [{profile.secrets.length - revealedSecrets.length} records require higher system awareness to access]
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">
                      {selectedCharacter.isGlitched
                        ? "System records are encrypted. Increase System Awareness to unlock hidden data."
                        : "No hidden records detected for this character."
                      }
                    </p>
                    {selectedCharacter.isGlitched && (
                      <p className="text-cyan-500/50 text-xs mt-2 font-mono">
                        AWARENESS_THRESHOLD: 15%
                      </p>
                    )}
                  </div>
                )}

                {/* System designation (visible for glitched characters with awareness) */}
                {selectedCharacter.isGlitched && profile.systemDesignation && selectedCharacter.systemAwareness >= 10 && (
                  <div className="mt-4 p-2 bg-gray-900/80 rounded border border-cyan-500/30">
                    <p className="text-cyan-500/70 text-xs font-mono">
                      SYSTEM_DESIGNATION: {profile.systemDesignation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer controls hint */}
      <div className="text-xs text-gray-500 text-center border-t border-gray-700/50 pt-2">
        {party.length > 1 && <span>[A/D] Switch Character</span>}
        <span className="mx-3">[Tab] Switch Tab</span>
      </div>
    </div>
  );
}

// Compact stat badge component
function StatBadge({
  label,
  value,
  max,
  color
}: {
  label: string;
  value: number;
  max?: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    red: "text-red-400",
    blue: "text-blue-400",
    orange: "text-orange-400",
    purple: "text-purple-400",
    gray: "text-gray-400",
    green: "text-green-400"
  };

  return (
    <div className="bg-gray-800/50 rounded px-2 py-1 flex justify-between">
      <span className={colorClasses[color]}>{label}</span>
      <span className="text-white">
        {max ? `${value}/${max}` : value}
      </span>
    </div>
  );
}
