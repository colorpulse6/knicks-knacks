"use client";

import type { Enemy } from "../../types/battle";
import ATBGauge from "./ATBGauge";
import StatusEffectIcons from "./StatusEffectIcons";

interface EnemyDisplayProps {
  enemies: Enemy[];
  selectedEnemyId?: string | null;
  onSelectEnemy?: (enemyId: string) => void;
}

export default function EnemyDisplay({
  enemies,
  selectedEnemyId,
  onSelectEnemy,
}: EnemyDisplayProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {enemies.map((enemy) => {
        const isDead = enemy.stats.hp <= 0;
        const isSelected = enemy.id === selectedEnemyId;
        const hpPercent = (enemy.stats.hp / enemy.stats.maxHp) * 100;

        return (
          <div
            key={enemy.id}
            onClick={() => !isDead && onSelectEnemy?.(enemy.id)}
            className={`
              relative flex flex-col items-center p-4 rounded-lg transition-all
              ${isDead ? "opacity-30 grayscale" : "cursor-pointer"}
              ${isSelected && !isDead ? "ring-2 ring-cyan-400 bg-cyan-900/30" : ""}
              ${!isDead && !isSelected ? "hover:bg-gray-800/50" : ""}
            `}
          >
            {/* Enemy Sprite Placeholder */}
            <div
              className={`
                w-24 h-24 rounded-lg flex items-center justify-center mb-2
                ${getEnemyColor(enemy.name)}
                ${isDead ? "" : "animate-pulse"}
              `}
            >
              <span className="text-3xl">
                {getEnemyEmoji(enemy.name)}
              </span>
            </div>

            {/* Enemy Name */}
            <span className={`text-sm font-bold mb-1 ${isDead ? "text-gray-500" : "text-white"}`}>
              {enemy.name}
            </span>

            {/* HP Bar */}
            {!isDead && (
              <div className="w-full">
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full transition-all ${
                      hpPercent <= 25
                        ? "bg-red-500"
                        : hpPercent <= 50
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
                {/* HP Numbers */}
                <div className="text-xs text-center text-gray-300 mb-1">
                  {enemy.stats.hp}/{enemy.stats.maxHp}
                </div>
                <div className="flex justify-center">
                  <ATBGauge atb={enemy.atb} size="small" />
                </div>
                {/* Status Effects */}
                {enemy.statusEffects.length > 0 && (
                  <div className="flex justify-center mt-1">
                    <StatusEffectIcons effects={enemy.statusEffects} size="sm" maxDisplay={4} />
                  </div>
                )}
              </div>
            )}

            {/* Dead indicator */}
            {isDead && (
              <span className="text-gray-500 text-xs">Defeated</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getEnemyColor(name: string): string {
  if (name.includes("Rat")) return "bg-amber-900";
  if (name.includes("Bandit")) return "bg-orange-900";
  if (name.includes("Wolf") || name.includes("Hound")) return "bg-gray-700";
  if (name.includes("Knight")) return "bg-slate-700";
  if (name.includes("Sprite") || name.includes("Corrupted")) return "bg-purple-900";
  if (name.includes("Wraith")) return "bg-indigo-900";
  if (name.includes("System") || name.includes("Agent")) return "bg-cyan-900";
  return "bg-gray-800";
}

function getEnemyEmoji(name: string): string {
  if (name.includes("Rat")) return "🐀";
  if (name.includes("Bandit")) return "🗡️";
  if (name.includes("Wolf") || name.includes("Hound")) return "🐺";
  if (name.includes("Knight")) return "⚔️";
  if (name.includes("Sprite") || name.includes("Corrupted")) return "👻";
  if (name.includes("Wraith")) return "💀";
  if (name.includes("System") || name.includes("Agent")) return "🤖";
  return "👾";
}
