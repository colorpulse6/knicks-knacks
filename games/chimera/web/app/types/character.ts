// Character and party member types for Chimera

import type { LatticeProgress, DissonanceState } from "./lattice";

export interface Stats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  strength: number;
  magic: number;
  defense: number;
  magicDefense: number;
  speed: number;
  luck: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: "weapon" | "armor" | "helmet" | "accessory";
  attack?: number;
  defense?: number;
  magicAttack?: number;
  magicDefense?: number;
  speed?: number;
  description: string;
}

export type EquipmentSlot = "weapon" | "armor" | "helmet" | "accessory";

// Equipment can be either the simple Equipment type or a full Item
export interface EquipmentSlots {
  weapon?: Equipment | null;
  armor?: Equipment | null;
  helmet?: Equipment | null;
  accessory?: Equipment | null;
}

export interface AbilityStatusEffect {
  statusId: string;        // ID from statusEffects.ts
  chance: number;          // 0-100, chance to apply
  duration?: number;       // Override default duration
  power?: number;          // Override default power
  targetType: "target" | "self" | "allies" | "enemies"; // Who gets the effect
}

export interface Ability {
  id: string;
  name: string;
  type: "physical" | "magic" | "support" | "special";
  mpCost: number;
  power: number;
  target: "single" | "all" | "self" | "ally" | "all_allies";
  description: string;
  animation?: string;
  // Status effect application
  statusEffects?: AbilityStatusEffect[];
  // For pure buff/debuff abilities that don't deal damage
  isStatusOnly?: boolean;
}

export interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  experience: number;
  experienceToNext: number;
  stats: Stats;
  equipment: EquipmentSlots;
  abilities: Ability[];
  sprites: {
    field: string;
    battle: string;
    portrait: string;
  };
  // Story-specific
  isGlitched?: boolean;
  luminaMark?: boolean;
  // Source Code Lattice progression
  optimizationPoints: number;
  totalOPEarned: number;
  latticeProgress: LatticeProgress;
  activePassives: string[]; // IDs of active passive routines from lattice
  dissonance?: DissonanceState; // Limit break gauge (optional, initialized in battle)
  systemAwareness: number; // 0-100, affects lattice visual style
}

export interface StatusEffect {
  id: string;
  name: string;
  type: "buff" | "debuff" | "dot" | "special";
  duration: number;
  power?: number;
  stat?: keyof Stats;
}

// Experience formula (FF6-style)
export function getExperienceToLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Create default stats for a character
export function createBaseStats(
  level: number,
  baseHp: number,
  baseMp: number,
  str: number,
  mag: number,
  def: number,
  mdef: number,
  spd: number,
  luck: number
): Stats {
  const hpGrowth = Math.floor(baseHp * (1 + (level - 1) * 0.15));
  const mpGrowth = Math.floor(baseMp * (1 + (level - 1) * 0.1));

  return {
    hp: hpGrowth,
    maxHp: hpGrowth,
    mp: mpGrowth,
    maxMp: mpGrowth,
    strength: str + Math.floor((level - 1) * 2),
    magic: mag + Math.floor((level - 1) * 2),
    defense: def + Math.floor((level - 1) * 1.5),
    magicDefense: mdef + Math.floor((level - 1) * 1.5),
    speed: spd + Math.floor((level - 1) * 0.5),
    luck: luck + Math.floor((level - 1) * 0.5),
  };
}
