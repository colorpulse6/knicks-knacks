// Shard definitions for Chimera
// Shards are mysterious futuristic relics that medieval people find in ruins
// They don't understand the technology, but know that socketing them into equipment grants power

import type { Shard } from "../types/item";

// ============================================
// STAT SHARDS - Raw stat bonuses
// ============================================

export const STAT_SHARDS: Record<string, Shard> = {
  // Power Shards (Red) - Offensive
  crimson_shard: {
    id: "crimson_shard",
    name: "Crimson Shard",
    description:
      "A blood-red crystal that pulses with warmth. Warriors covet these.",
    hiddenNature: "Compressed combat subroutines from a military AI",
    rarity: "uncommon",
    effect: { type: "attack_bonus", value: 5 },
    color: "red",
  },
  scarlet_shard: {
    id: "scarlet_shard",
    name: "Scarlet Shard",
    description:
      "Deeper red than its lesser kin. The heat within is almost unbearable.",
    hiddenNature: "Advanced tactical processor core fragment",
    rarity: "rare",
    effect: { type: "attack_bonus", value: 10 },
    color: "red",
  },

  // Wisdom Shards (Blue) - Magic
  azure_shard: {
    id: "azure_shard",
    name: "Azure Shard",
    description:
      "A cool blue crystal. Scholars say it sharpens the mind.",
    hiddenNature: "Neural enhancement module for cognitive acceleration",
    rarity: "uncommon",
    effect: { type: "magic_bonus", value: 5 },
    color: "blue",
  },
  sapphire_shard: {
    id: "sapphire_shard",
    name: "Sapphire Shard",
    description:
      "Deep ocean blue. Mages whisper it connects to other realms.",
    hiddenNature: "Quantum entanglement processor for parallel computation",
    rarity: "rare",
    effect: { type: "magic_bonus", value: 10 },
    color: "blue",
  },
  cerulean_shard: {
    id: "cerulean_shard",
    name: "Cerulean Shard",
    description:
      "A pale blue crystal that seems to hold infinite depth.",
    hiddenNature: "Mana pool expansion buffer - increases magical capacity",
    rarity: "uncommon",
    effect: { type: "mp_bonus", value: 15 },
    color: "blue",
  },

  // Vitality Shards (Green) - Defense/HP
  emerald_shard: {
    id: "emerald_shard",
    name: "Emerald Shard",
    description: "A verdant crystal that hums with vitality.",
    hiddenNature: "Cellular regeneration catalyst array",
    rarity: "uncommon",
    effect: { type: "hp_bonus", value: 25 },
    color: "green",
  },
  jade_shard: {
    id: "jade_shard",
    name: "Jade Shard",
    description:
      "Smooth green stone that radiates calm. Protects the bearer.",
    hiddenNature: "Defensive barrier generation subroutine",
    rarity: "uncommon",
    effect: { type: "defense_bonus", value: 5 },
    color: "green",
  },
  malachite_shard: {
    id: "malachite_shard",
    name: "Malachite Shard",
    description:
      "Swirling green patterns. Ancient healers prized these above gold.",
    hiddenNature: "Advanced nanobot repair cluster",
    rarity: "rare",
    effect: { type: "defense_bonus", value: 10 },
    color: "green",
  },

  // Agility Shards (Gold) - Speed
  amber_shard: {
    id: "amber_shard",
    name: "Amber Shard",
    description:
      "A golden crystal that seems to vibrate with energy.",
    hiddenNature: "Kinetic amplification matrix",
    rarity: "uncommon",
    effect: { type: "speed_bonus", value: 3 },
    color: "gold",
  },
  topaz_shard: {
    id: "topaz_shard",
    name: "Topaz Shard",
    description:
      "Brilliant gold. Those who carry it seem to move before others act.",
    hiddenNature: "Reflex enhancement neural accelerator",
    rarity: "rare",
    effect: { type: "speed_bonus", value: 6 },
    color: "gold",
  },
};

// ============================================
// ABILITY SHARDS - Grant special effects
// ============================================

export const ABILITY_SHARDS: Record<string, Shard> = {
  // Combat Abilities
  vampire_shard: {
    id: "vampire_shard",
    name: "Shard of the Leech",
    description:
      "A dark crystal that drinks light. Wounds inflicted seem to heal the wielder.",
    hiddenNature: "Bio-energy recycling nanite cluster",
    rarity: "rare",
    effect: { type: "lifesteal", value: 10 },
    color: "purple",
  },
  counter_shard: {
    id: "counter_shard",
    name: "Shard of Retribution",
    description:
      "A jagged crystal that sparks when struck. Enemies fear its wrath.",
    hiddenNature: "Reflex enhancement and predictive combat module",
    rarity: "rare",
    effect: { type: "counter_chance", value: 15 },
    color: "red",
  },
  critical_shard: {
    id: "critical_shard",
    name: "Shard of Precision",
    description:
      "A razor-sharp crystal that seems to find weak points.",
    hiddenNature: "Target vulnerability analysis system",
    rarity: "rare",
    effect: { type: "crit_bonus", value: 10 },
    color: "red",
  },

  // Regeneration
  regen_shard: {
    id: "regen_shard",
    name: "Shard of Renewal",
    description:
      "A soft-glowing crystal. Wounds close slowly in its presence.",
    hiddenNature: "Persistent tissue reconstruction nanites",
    rarity: "rare",
    effect: { type: "hp_regen", value: 5 },
    color: "green",
  },
  meditation_shard: {
    id: "meditation_shard",
    name: "Shard of Clarity",
    description:
      "A tranquil crystal. The mind feels refreshed in its presence.",
    hiddenNature: "Mental energy restoration field emitter",
    rarity: "rare",
    effect: { type: "mp_regen", value: 3 },
    color: "blue",
  },

  // Initiative
  quickstep_shard: {
    id: "quickstep_shard",
    name: "Shard of the First Step",
    description:
      "A lightning-bright crystal. Those who carry it always seem ready.",
    hiddenNature: "Temporal micro-acceleration field generator",
    rarity: "epic",
    effect: { type: "first_strike", value: 25 },
    color: "gold",
  },

  // Resistance
  steadfast_shard: {
    id: "steadfast_shard",
    name: "Shard of Iron Will",
    description:
      "A gray-tinged crystal. The bearer's mind becomes harder to influence.",
    hiddenNature: "Cognitive firewall and status immunity subroutine",
    rarity: "rare",
    effect: { type: "status_resist", value: 20 },
    color: "purple",
  },

  // Utility
  fortune_shard: {
    id: "fortune_shard",
    name: "Shard of Fortune",
    description:
      "A glittering crystal. Merchants claim it attracts wealth.",
    hiddenNature: "Resource optimization algorithm",
    rarity: "uncommon",
    effect: { type: "gold_bonus", value: 15 },
    color: "gold",
  },
  wisdom_shard: {
    id: "wisdom_shard",
    name: "Shard of Experience",
    description:
      "A crystal that seems ancient. Knowledge flows easier near it.",
    hiddenNature: "Learning acceleration neural interface",
    rarity: "uncommon",
    effect: { type: "exp_bonus", value: 10 },
    color: "blue",
  },
};

// ============================================
// LEGENDARY SHARDS - Powerful, rare finds
// ============================================

export const LEGENDARY_SHARDS: Record<string, Shard> = {
  temporal_shard: {
    id: "temporal_shard",
    name: "Shard of Frozen Time",
    description:
      "A crystal that shows impossible reflections. Time moves strangely near it.",
    hiddenNature: "Temporal stasis field fragment - classified precursor tech",
    rarity: "legendary",
    effect: { type: "first_strike", value: 50 },
    color: "gold",
  },
  immortal_shard: {
    id: "immortal_shard",
    name: "Shard of Undying",
    description: "An ancient crystal that defies death itself.",
    hiddenNature: "Emergency resurrection protocol crystal",
    rarity: "legendary",
    effect: { type: "hp_regen", value: 15 },
    color: "green",
  },
  berserker_shard: {
    id: "berserker_shard",
    name: "Shard of Wrath",
    description:
      "A violently pulsing red crystal. It screams for blood.",
    hiddenNature: "Combat override system - removes safety limiters",
    rarity: "legendary",
    effect: { type: "attack_bonus", value: 20 },
    color: "red",
  },
  archmage_shard: {
    id: "archmage_shard",
    name: "Shard of the Arcane",
    description:
      "A crystal of impossible colors. Reality bends around it.",
    hiddenNature: "Reality manipulation core fragment",
    rarity: "legendary",
    effect: { type: "magic_bonus", value: 20 },
    color: "purple",
  },
  guardian_shard: {
    id: "guardian_shard",
    name: "Shard of the Sentinel",
    description:
      "An unbreakable crystal. No force seems able to scratch it.",
    hiddenNature: "Absolute defense protocol - military grade shielding",
    rarity: "legendary",
    effect: { type: "defense_bonus", value: 20 },
    color: "green",
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Combine all shards into a single registry
export const ALL_SHARDS: Record<string, Shard> = {
  ...STAT_SHARDS,
  ...ABILITY_SHARDS,
  ...LEGENDARY_SHARDS,
};

/**
 * Get a shard by ID
 */
export function getShardById(shardId: string): Shard | undefined {
  return ALL_SHARDS[shardId];
}

/**
 * Get all shards of a specific rarity
 */
export function getShardsByRarity(rarity: Shard["rarity"]): Shard[] {
  return Object.values(ALL_SHARDS).filter((shard) => shard.rarity === rarity);
}

/**
 * Get all shards of a specific color
 */
export function getShardsByColor(color: Shard["color"]): Shard[] {
  return Object.values(ALL_SHARDS).filter((shard) => shard.color === color);
}

/**
 * Get all shards of a specific effect type
 */
export function getShardsByEffectType(type: Shard["effect"]["type"]): Shard[] {
  return Object.values(ALL_SHARDS).filter((shard) => shard.effect.type === type);
}

/**
 * Get shard glow color for UI
 */
export function getShardGlowColor(color: Shard["color"]): string {
  switch (color) {
    case "red":
      return "#ff4444";
    case "blue":
      return "#4488ff";
    case "green":
      return "#44ff44";
    case "gold":
      return "#ffcc44";
    case "purple":
      return "#aa44ff";
    default:
      return "#ffffff";
  }
}

/**
 * Get shard Tailwind color classes for UI
 */
export function getShardColorClasses(color: Shard["color"]): {
  text: string;
  bg: string;
  border: string;
  glow: string;
} {
  switch (color) {
    case "red":
      return {
        text: "text-red-400",
        bg: "bg-red-900/30",
        border: "border-red-500",
        glow: "shadow-red-500/50",
      };
    case "blue":
      return {
        text: "text-blue-400",
        bg: "bg-blue-900/30",
        border: "border-blue-500",
        glow: "shadow-blue-500/50",
      };
    case "green":
      return {
        text: "text-green-400",
        bg: "bg-green-900/30",
        border: "border-green-500",
        glow: "shadow-green-500/50",
      };
    case "gold":
      return {
        text: "text-amber-400",
        bg: "bg-amber-900/30",
        border: "border-amber-500",
        glow: "shadow-amber-500/50",
      };
    case "purple":
      return {
        text: "text-purple-400",
        bg: "bg-purple-900/30",
        border: "border-purple-500",
        glow: "shadow-purple-500/50",
      };
    default:
      return {
        text: "text-gray-400",
        bg: "bg-gray-900/30",
        border: "border-gray-500",
        glow: "shadow-gray-500/50",
      };
  }
}
