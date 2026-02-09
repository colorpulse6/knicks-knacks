"use client";

import type { StatusEffect } from "../../types/character";
import { getStatusEffectDefinition } from "../../data/statusEffects";

interface StatusEffectIconsProps {
  effects: StatusEffect[];
  size?: "sm" | "md" | "lg";
  maxDisplay?: number;
}

export default function StatusEffectIcons({
  effects,
  size = "sm",
  maxDisplay = 5,
}: StatusEffectIconsProps) {
  // Filter out defending (it's implied by the defend action)
  const visibleEffects = effects
    .filter(e => e.id !== "defending")
    .slice(0, maxDisplay);

  if (visibleEffects.length === 0) return null;

  const sizeClasses = {
    sm: "text-xs w-4 h-4",
    md: "text-sm w-5 h-5",
    lg: "text-base w-6 h-6",
  };

  return (
    <div className="flex gap-0.5 items-center flex-wrap">
      {visibleEffects.map((effect) => {
        const def = getStatusEffectDefinition(effect.id);
        const isDebuff = effect.type === "debuff" || effect.type === "dot";

        return (
          <div
            key={effect.id}
            className={`
              ${sizeClasses[size]}
              flex items-center justify-center
              rounded
              ${isDebuff ? "bg-red-900/60" : "bg-green-900/60"}
              border
              ${isDebuff ? "border-red-500/50" : "border-green-500/50"}
              animate-pulse
            `}
            style={{
              boxShadow: `0 0 4px ${def?.color ?? "#fff"}`,
            }}
            title={`${def?.name ?? effect.name} (${effect.duration} turns)`}
          >
            <span className="leading-none">{def?.icon ?? "?"}</span>
          </div>
        );
      })}
      {effects.length > maxDisplay && (
        <span className="text-xs text-gray-400 ml-1">
          +{effects.length - maxDisplay}
        </span>
      )}
    </div>
  );
}

/**
 * Status effect bar for larger display (e.g., on party status panel)
 */
interface StatusEffectBarProps {
  effects: StatusEffect[];
}

export function StatusEffectBar({ effects }: StatusEffectBarProps) {
  const visibleEffects = effects.filter(e => e.id !== "defending");

  if (visibleEffects.length === 0) return null;

  return (
    <div className="flex gap-1 items-center mt-1">
      {visibleEffects.map((effect) => {
        const def = getStatusEffectDefinition(effect.id);
        const isDebuff = effect.type === "debuff" || effect.type === "dot";

        return (
          <div
            key={effect.id}
            className={`
              px-1.5 py-0.5
              rounded text-xs
              flex items-center gap-1
              ${isDebuff ? "bg-red-900/60 border-red-500/50" : "bg-green-900/60 border-green-500/50"}
              border
            `}
            style={{ color: def?.color ?? "#fff" }}
          >
            <span>{def?.icon ?? "?"}</span>
            <span className="text-white/80">{effect.duration}</span>
          </div>
        );
      })}
    </div>
  );
}
