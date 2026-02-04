// Source Code Lattice type definitions
// The character progression grid system

import type { Stats, Ability } from "./character";

// Stat boost applied by a node
export interface StatBoost {
  stat: keyof Omit<Stats, "hp" | "mp">; // Can boost maxHp, maxMp, or combat stats
  value: number;
}

// Types of nodes in the lattice
export type LatticeNodeType = "stat" | "tech" | "passive" | "core";

// Individual node in the lattice
export interface LatticeNode {
  id: string;
  name: string;
  description: string;
  type: LatticeNodeType;
  cost: number; // OP cost to unlock
  position: { x: number; y: number }; // Grid position for rendering

  // What this node provides
  statBoosts?: StatBoost[];
  abilityId?: string; // For tech nodes - unlocks this ability
  passiveId?: string; // For passive nodes - activates this passive

  // Prerequisites
  requiredNodes: string[]; // Node IDs that must be unlocked first
  requiredLevel?: number; // Minimum character level to unlock

  // Visual tier (affects appearance)
  tier: number; // 1-3, higher = more advanced appearance
}

// Passive effect types
export type PassiveEffectType =
  | "counter_chance" // % chance to counter on hit
  | "auto_guard" // % chance to reduce damage
  | "crit_bonus" // +% crit chance
  | "hp_regen" // HP restored per turn
  | "mp_regen" // MP restored per turn
  | "damage_reduction" // % damage reduction
  | "status_resist" // % resist status effects
  | "first_strike"; // % chance to act first

// Passive routine definition
export interface PassiveRoutine {
  id: string;
  name: string;
  description: string;
  type: PassiveEffectType;
  value: number; // Effect magnitude (% or flat value)
  condition?: "low_hp" | "full_hp" | "buffed"; // Optional trigger condition
}

// Complete lattice definition for a character
export interface CharacterLattice {
  characterId: string;
  name: string; // Display name for the lattice
  shape: "spiral" | "radial" | "grid" | "lightning" | "fractured";
  nodes: LatticeNode[];
  connections: [string, string][]; // Pairs of connected node IDs
}

// Player's progress on a lattice
export interface LatticeProgress {
  unlockedNodes: string[];
  mutations: MutationRecord[];
}

// Glitch Sector patch option (safe choice)
export interface GlitchPatch {
  name: string;
  description: string;
  statBoosts: StatBoost[];
}

// Mutation benefit types
export type MutationBenefitType =
  | "stat_percent" // % increase to a stat
  | "ability_unlock" // Unlock a special ability
  | "passive_unlock" // Unlock a powerful passive
  | "crit_damage_mult" // Multiply crit damage
  | "evasion"; // % evasion boost

// Mutation drawback types
export type MutationDrawbackType =
  | "stun_on_hit" // % chance to be stunned when hit
  | "stat_reduction" // % reduction to a stat
  | "self_damage" // % of damage dealt to self
  | "accuracy_penalty" // % accuracy reduction
  | "heal_cap"; // Can't heal above % of max HP

// Mutation effect (benefit or drawback)
export interface MutationEffect {
  type: MutationBenefitType | MutationDrawbackType;
  stat?: keyof Stats;
  value: number;
  abilityId?: string;
  passiveId?: string;
}

// Glitch Sector mutation option (risky choice)
export interface GlitchMutation {
  id: string;
  name: string;
  description: string;
  benefit: MutationEffect;
  drawback: MutationEffect;
}

// Complete Glitch Sector choice at a milestone level
export interface GlitchChoice {
  level: number; // 10, 20, 30, etc.
  characterId: string;
  patch: GlitchPatch;
  mutation: GlitchMutation;
}

// Record of a mutation choice made by the player
export interface MutationRecord {
  level: number;
  choseMutation: boolean;
  mutationId?: string; // Only set if choseMutation is true
}

// Dissonance gauge state for limit breaks
export interface DissonanceState {
  current: number; // 0-100
  max: number; // Always 100
  overrideReady: boolean;
  overrideUsedThisBattle: boolean;
}

// Level-up result from processing a level increase
export interface LevelUpResult {
  newLevel: number;
  opEarned: number;
  statGains: Partial<Stats>;
  isGlitchSector: boolean; // True if level is 10, 20, 30, etc.
}

// Utility function to calculate OP for a given level
export function getOPForLevel(level: number): number {
  return 2 + Math.floor(level / 5);
}

// Utility function to check if a level is a Glitch Sector milestone
export function isGlitchSectorLevel(level: number): boolean {
  return level >= 10 && level % 10 === 0;
}
