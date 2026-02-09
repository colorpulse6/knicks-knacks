/**
 * Status Effects Data
 * Defines all status effects that can be applied in battle
 */

import type { StatusEffect } from "../types/character";

export type StatusEffectId =
  | "poison"
  | "regen"
  | "haste"
  | "slow"
  | "sleep"
  | "blind"
  | "protect"
  | "shell"
  | "berserk"
  | "silence"
  | "defending";

export interface StatusEffectDefinition {
  id: StatusEffectId;
  name: string;
  description: string;
  type: StatusEffect["type"];
  icon: string; // Emoji or sprite reference
  color: string; // For visual effects
  defaultDuration: number; // Number of turns
  defaultPower?: number;
  stackable: boolean;
  // Processing behavior
  tickTiming: "turn_start" | "turn_end" | "continuous" | "on_damage" | "passive";
  canBeDispelled: boolean;
}

export const STATUS_EFFECT_DEFINITIONS: Record<StatusEffectId, StatusEffectDefinition> = {
  // Damage over time
  poison: {
    id: "poison",
    name: "Poison",
    description: "Takes damage at the start of each turn",
    type: "dot",
    icon: "☠️",
    color: "#8b5cf6", // Purple
    defaultDuration: 5,
    defaultPower: 10, // % of max HP per tick
    stackable: false,
    tickTiming: "turn_start",
    canBeDispelled: true,
  },

  // Healing over time
  regen: {
    id: "regen",
    name: "Regen",
    description: "Recovers HP at the start of each turn",
    type: "buff",
    icon: "💚",
    color: "#22c55e", // Green
    defaultDuration: 5,
    defaultPower: 8, // % of max HP per tick
    stackable: false,
    tickTiming: "turn_start",
    canBeDispelled: true,
  },

  // Speed modifiers
  haste: {
    id: "haste",
    name: "Haste",
    description: "ATB gauge fills 50% faster",
    type: "buff",
    icon: "⚡",
    color: "#f59e0b", // Amber
    defaultDuration: 4,
    defaultPower: 50, // % ATB speed increase
    stackable: false,
    tickTiming: "passive",
    canBeDispelled: true,
  },

  slow: {
    id: "slow",
    name: "Slow",
    description: "ATB gauge fills 50% slower",
    type: "debuff",
    icon: "🐌",
    color: "#64748b", // Slate
    defaultDuration: 4,
    defaultPower: 50, // % ATB speed decrease
    stackable: false,
    tickTiming: "passive",
    canBeDispelled: true,
  },

  // Disable effects
  sleep: {
    id: "sleep",
    name: "Sleep",
    description: "Cannot act. Wakes up when damaged",
    type: "debuff",
    icon: "💤",
    color: "#6366f1", // Indigo
    defaultDuration: 3,
    stackable: false,
    tickTiming: "on_damage", // Removed when taking damage
    canBeDispelled: true,
  },

  silence: {
    id: "silence",
    name: "Silence",
    description: "Cannot use magic abilities",
    type: "debuff",
    icon: "🔇",
    color: "#ec4899", // Pink
    defaultDuration: 4,
    stackable: false,
    tickTiming: "passive",
    canBeDispelled: true,
  },

  // Accuracy debuff
  blind: {
    id: "blind",
    name: "Blind",
    description: "Physical attacks have 50% chance to miss",
    type: "debuff",
    icon: "🌑",
    color: "#1e293b", // Dark slate
    defaultDuration: 4,
    defaultPower: 50, // % miss chance
    stackable: false,
    tickTiming: "passive",
    canBeDispelled: true,
  },

  // Defensive buffs
  protect: {
    id: "protect",
    name: "Protect",
    description: "Reduces physical damage by 25%",
    type: "buff",
    icon: "🛡️",
    color: "#f97316", // Orange
    defaultDuration: 5,
    defaultPower: 25, // % damage reduction
    stackable: false,
    tickTiming: "passive",
    canBeDispelled: true,
  },

  shell: {
    id: "shell",
    name: "Shell",
    description: "Reduces magic damage by 25%",
    type: "buff",
    icon: "✨",
    color: "#06b6d4", // Cyan
    defaultDuration: 5,
    defaultPower: 25, // % magic damage reduction
    stackable: false,
    tickTiming: "passive",
    canBeDispelled: true,
  },

  // Special states
  berserk: {
    id: "berserk",
    name: "Berserk",
    description: "Attack power +50% but can only use basic attacks",
    type: "special",
    icon: "😤",
    color: "#ef4444", // Red
    defaultDuration: 4,
    defaultPower: 50, // % attack boost
    stackable: false,
    tickTiming: "passive",
    canBeDispelled: true,
  },

  // Temporary defend status (from Defend command)
  defending: {
    id: "defending",
    name: "Defending",
    description: "Taking 50% less damage until next turn",
    type: "buff",
    icon: "🛡️",
    color: "#3b82f6", // Blue
    defaultDuration: 1,
    defaultPower: 50, // % damage reduction
    stackable: false,
    tickTiming: "passive",
    canBeDispelled: false,
  },
};

/**
 * Create a status effect instance from a definition
 */
export function createStatusEffect(
  id: StatusEffectId,
  overrides?: Partial<StatusEffect>
): StatusEffect {
  const def = STATUS_EFFECT_DEFINITIONS[id];
  return {
    id: def.id,
    name: def.name,
    type: def.type,
    duration: overrides?.duration ?? def.defaultDuration,
    power: overrides?.power ?? def.defaultPower,
    ...overrides,
  };
}

/**
 * Get a status effect definition
 */
export function getStatusEffectDefinition(id: string): StatusEffectDefinition | undefined {
  return STATUS_EFFECT_DEFINITIONS[id as StatusEffectId];
}

/**
 * Check if an entity has a specific status effect
 */
export function hasStatusEffect(effects: StatusEffect[], id: StatusEffectId): boolean {
  return effects.some(e => e.id === id);
}

/**
 * Get a specific status effect from an entity
 */
export function getStatusEffect(effects: StatusEffect[], id: StatusEffectId): StatusEffect | undefined {
  return effects.find(e => e.id === id);
}

/**
 * Add or refresh a status effect
 * If the effect already exists and isn't stackable, refreshes the duration
 */
export function applyStatusEffect(
  currentEffects: StatusEffect[],
  newEffect: StatusEffect
): StatusEffect[] {
  const def = STATUS_EFFECT_DEFINITIONS[newEffect.id as StatusEffectId];

  // If the effect exists and isn't stackable, replace it
  if (!def?.stackable && currentEffects.some(e => e.id === newEffect.id)) {
    return currentEffects.map(e =>
      e.id === newEffect.id ? { ...newEffect } : e
    );
  }

  // Otherwise, add the new effect
  return [...currentEffects, newEffect];
}

/**
 * Remove a status effect by ID
 */
export function removeStatusEffect(
  effects: StatusEffect[],
  id: StatusEffectId
): StatusEffect[] {
  return effects.filter(e => e.id !== id);
}

/**
 * Tick down all effect durations and remove expired ones
 */
export function tickStatusEffects(effects: StatusEffect[]): StatusEffect[] {
  return effects
    .map(e => ({ ...e, duration: e.duration - 1 }))
    .filter(e => e.duration > 0);
}

/**
 * Get all buffs from effects
 */
export function getBuffs(effects: StatusEffect[]): StatusEffect[] {
  return effects.filter(e => e.type === "buff");
}

/**
 * Get all debuffs from effects
 */
export function getDebuffs(effects: StatusEffect[]): StatusEffect[] {
  return effects.filter(e => e.type === "debuff" || e.type === "dot");
}
