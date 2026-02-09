// Character definitions for Chimera

import type { Character, Ability } from "../types";
import { createBaseStats, getExperienceToLevel } from "../types/character";

// Kai's abilities
const KAI_ABILITIES: Ability[] = [
  {
    id: "slash",
    name: "Slash",
    type: "physical",
    mpCost: 0,
    power: 0, // Uses weapon damage
    target: "single",
    description: "A basic sword attack.",
  },
  {
    id: "temporal_edge",
    name: "Temporal Edge",
    type: "special",
    mpCost: 8,
    power: 25,
    target: "single",
    description:
      "Strike with a blade infused with temporal energy. Ignores some defense.",
    animation: "glitch",
  },
  {
    id: "focus",
    name: "Focus",
    type: "support",
    mpCost: 4,
    power: 20,
    target: "self",
    description: "Concentrate to boost attack power for the next turn.",
  },
  {
    id: "time_warp",
    name: "Time Warp",
    type: "magic",
    mpCost: 10,
    power: 15,
    target: "single",
    description: "Warp time around an enemy, slowing their actions.",
    animation: "glitch",
    statusEffects: [
      { statusId: "slow", chance: 80, duration: 4, targetType: "target" },
    ],
  },
  {
    id: "quickstep",
    name: "Quickstep",
    type: "support",
    mpCost: 12,
    power: 0,
    target: "self",
    description: "Move faster than the eye can see. Grants Haste.",
    isStatusOnly: true,
    statusEffects: [
      { statusId: "haste", chance: 100, duration: 4, targetType: "self" },
    ],
  },
];

// Lyra's abilities
const LYRA_ABILITIES: Ability[] = [
  {
    id: "staff_strike",
    name: "Staff Strike",
    type: "physical",
    mpCost: 0,
    power: 0,
    target: "single",
    description: "A basic staff attack.",
  },
  {
    id: "cure",
    name: "Cure",
    type: "support",
    mpCost: 6,
    power: 30,
    target: "ally",
    description: "Restore HP to a single ally.",
  },
  {
    id: "regen",
    name: "Regen",
    type: "support",
    mpCost: 10,
    power: 0,
    target: "ally",
    description: "Grant regeneration that heals over time.",
    isStatusOnly: true,
    statusEffects: [
      { statusId: "regen", chance: 100, duration: 5, targetType: "target" },
    ],
  },
  {
    id: "protect",
    name: "Protect",
    type: "support",
    mpCost: 8,
    power: 0,
    target: "ally",
    description: "Raise an ally's physical defense temporarily.",
    isStatusOnly: true,
    statusEffects: [
      { statusId: "protect", chance: 100, duration: 5, targetType: "target" },
    ],
  },
  {
    id: "shell",
    name: "Shell",
    type: "support",
    mpCost: 8,
    power: 0,
    target: "ally",
    description: "Raise an ally's magical defense temporarily.",
    isStatusOnly: true,
    statusEffects: [
      { statusId: "shell", chance: 100, duration: 5, targetType: "target" },
    ],
  },
  {
    id: "haste",
    name: "Haste",
    type: "support",
    mpCost: 12,
    power: 0,
    target: "ally",
    description: "Speed up an ally's actions.",
    isStatusOnly: true,
    statusEffects: [
      { statusId: "haste", chance: 100, duration: 4, targetType: "target" },
    ],
  },
  {
    id: "bio",
    name: "Bio",
    type: "magic",
    mpCost: 8,
    power: 20,
    target: "single",
    description: "Toxic magic that poisons the target.",
    statusEffects: [
      { statusId: "poison", chance: 75, duration: 5, targetType: "target" },
    ],
  },
  {
    id: "sleep",
    name: "Sleep",
    type: "magic",
    mpCost: 10,
    power: 0,
    target: "single",
    description: "Put an enemy into a deep slumber.",
    isStatusOnly: true,
    statusEffects: [
      { statusId: "sleep", chance: 65, duration: 3, targetType: "target" },
    ],
  },
  {
    id: "slow",
    name: "Slow",
    type: "magic",
    mpCost: 8,
    power: 0,
    target: "single",
    description: "Slow an enemy's actions.",
    isStatusOnly: true,
    statusEffects: [
      { statusId: "slow", chance: 70, duration: 4, targetType: "target" },
    ],
  },
  {
    id: "lucky_star",
    name: "Lucky Star",
    type: "support",
    mpCost: 5,
    power: 15,
    target: "all_allies",
    description: "Lyra's unusual luck grants minor buffs to all allies.",
  },
];

// Kai - The Protagonist (Anomaly KAI_7.34)
export const KAI: Character = {
  id: "kai",
  name: "Kai",
  class: "Anomaly",
  level: 1,
  experience: 0,
  experienceToNext: getExperienceToLevel(2),
  stats: createBaseStats(
    1,
    120, // Base HP
    40, // Base MP
    12, // STR - balanced fighter
    8, // MAG - some magical potential
    10, // DEF
    8, // MDEF
    10, // SPD
    8 // LUCK
  ),
  equipment: {
    weapon: {
      id: "rusty_sword",
      name: "Rusty Sword",
      type: "weapon",
      attack: 8,
      description: "An old sword, worn but still serviceable.",
    },
    armor: {
      id: "traveler_clothes",
      name: "Traveler's Clothes",
      type: "armor",
      defense: 5,
      description: "Simple but durable traveling attire.",
    },
    helmet: null,
    accessory: null,
  },
  abilities: KAI_ABILITIES,
  sprites: {
    field: "/sprites/characters/kai_field.png",
    battle: "/sprites/characters/kai_battle.png",
    portrait: "/portraits/kai.png",
  },
  isGlitched: true,
  luminaMark: false,
  // Source Code Lattice progression
  optimizationPoints: 2, // Starting OP at level 1
  totalOPEarned: 2,
  latticeProgress: {
    unlockedNodes: [],
    mutations: [],
  },
  activePassives: [],
  systemAwareness: 10, // Glitched characters have some initial awareness
};

// Lady Lyra Lumina - Support/Diplomat
export const LYRA: Character = {
  id: "lyra",
  name: "Lady Lyra",
  class: "Diplomat",
  level: 1,
  experience: 0,
  experienceToNext: getExperienceToLevel(2),
  stats: createBaseStats(
    1,
    90, // Lower HP
    60, // Higher MP
    6, // Lower STR
    14, // Higher MAG
    6, // Lower DEF
    12, // Higher MDEF
    12, // Higher SPD
    15 // High LUCK (Unusual Luck)
  ),
  equipment: {
    weapon: {
      id: "oak_staff",
      name: "Oak Staff",
      type: "weapon",
      attack: 4,
      magicAttack: 6,
      description: "A simple wooden staff that channels magical energy.",
    },
    armor: {
      id: "noble_dress",
      name: "Noble Dress",
      type: "armor",
      defense: 3,
      magicDefense: 8,
      description: "Elegant attire that offers some magical protection.",
    },
    helmet: null,
    accessory: null,
  },
  abilities: LYRA_ABILITIES,
  sprites: {
    field: "/sprites/characters/lyra_field.png",
    battle: "/sprites/characters/lyra_battle.png",
    portrait: "/portraits/lyra.png",
  },
  isGlitched: false,
  luminaMark: true,
  // Source Code Lattice progression
  optimizationPoints: 2, // Starting OP at level 1
  totalOPEarned: 2,
  latticeProgress: {
    unlockedNodes: [],
    mutations: [],
  },
  activePassives: [],
  systemAwareness: 0, // Non-glitched characters start with no awareness
};

// Helper to get character by ID
export function getCharacterById(id: string): Character | undefined {
  const characters: Record<string, Character> = {
    kai: KAI,
    lyra: LYRA,
  };
  return characters[id];
}

// Calculate level from experience
export function calculateLevel(experience: number): number {
  let level = 1;
  let totalExp = 0;
  while (totalExp + getExperienceToLevel(level + 1) <= experience) {
    totalExp += getExperienceToLevel(level + 1);
    level++;
    if (level >= 99) break; // Max level cap
  }
  return level;
}
