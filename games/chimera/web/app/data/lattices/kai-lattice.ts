// Kai's Source Code Lattice - The Anomaly
// A spiral pattern representing his glitched, unpredictable nature

import type { CharacterLattice, LatticeNode } from "../../types/lattice";

// Node definitions for Kai's spiral lattice
const KAI_NODES: LatticeNode[] = [
  // === RING 1: Core Stats (Cost 1 OP each) ===
  // Starting nodes - immediately available
  {
    id: "kai_hp_1",
    name: "Vitality I",
    description: "Increase maximum HP by 10.",
    type: "stat",
    cost: 1,
    position: { x: 2, y: 2 },
    statBoosts: [{ stat: "maxHp", value: 10 }],
    requiredNodes: [],
    tier: 1,
  },
  {
    id: "kai_str_1",
    name: "Strength I",
    description: "Increase Strength by 2.",
    type: "stat",
    cost: 1,
    position: { x: 3, y: 2 },
    statBoosts: [{ stat: "strength", value: 2 }],
    requiredNodes: [],
    tier: 1,
  },
  {
    id: "kai_def_1",
    name: "Fortitude I",
    description: "Increase Defense by 2.",
    type: "stat",
    cost: 1,
    position: { x: 4, y: 2 },
    statBoosts: [{ stat: "defense", value: 2 }],
    requiredNodes: [],
    tier: 1,
  },
  {
    id: "kai_spd_1",
    name: "Agility I",
    description: "Increase Speed by 1.",
    type: "stat",
    cost: 1,
    position: { x: 2, y: 3 },
    statBoosts: [{ stat: "speed", value: 1 }],
    requiredNodes: [],
    tier: 1,
  },
  {
    id: "kai_mag_1",
    name: "Focus I",
    description: "Increase Magic by 1.",
    type: "stat",
    cost: 1,
    position: { x: 4, y: 3 },
    statBoosts: [{ stat: "magic", value: 1 }],
    requiredNodes: [],
    tier: 1,
  },
  {
    id: "kai_hp_2",
    name: "Vitality II",
    description: "Increase maximum HP by 10.",
    type: "stat",
    cost: 1,
    position: { x: 3, y: 3 },
    statBoosts: [{ stat: "maxHp", value: 10 }],
    requiredNodes: ["kai_hp_1"],
    tier: 1,
  },

  // === RING 2: Enhanced Stats (Cost 1-2 OP) ===
  {
    id: "kai_hp_3",
    name: "Vitality III",
    description: "Increase maximum HP by 15.",
    type: "stat",
    cost: 2,
    position: { x: 1, y: 2 },
    statBoosts: [{ stat: "maxHp", value: 15 }],
    requiredNodes: ["kai_hp_1"],
    requiredLevel: 3,
    tier: 2,
  },
  {
    id: "kai_str_2",
    name: "Strength II",
    description: "Increase Strength by 3.",
    type: "stat",
    cost: 2,
    position: { x: 5, y: 2 },
    statBoosts: [{ stat: "strength", value: 3 }],
    requiredNodes: ["kai_str_1"],
    requiredLevel: 3,
    tier: 2,
  },
  {
    id: "kai_def_2",
    name: "Fortitude II",
    description: "Increase Defense by 3.",
    type: "stat",
    cost: 2,
    position: { x: 5, y: 3 },
    statBoosts: [{ stat: "defense", value: 3 }],
    requiredNodes: ["kai_def_1"],
    requiredLevel: 3,
    tier: 2,
  },
  {
    id: "kai_mdef_1",
    name: "Resistance I",
    description: "Increase Magic Defense by 2.",
    type: "stat",
    cost: 1,
    position: { x: 1, y: 3 },
    statBoosts: [{ stat: "magicDefense", value: 2 }],
    requiredNodes: ["kai_spd_1"],
    tier: 2,
  },

  // === PASSIVE NODES (Cost 2 OP) ===
  {
    id: "kai_counter",
    name: "Counter Stance",
    description: "5% chance to counterattack when hit.",
    type: "passive",
    cost: 2,
    position: { x: 1, y: 4 },
    passiveId: "counter_5",
    requiredNodes: ["kai_str_1", "kai_def_1"],
    requiredLevel: 5,
    tier: 2,
  },
  {
    id: "kai_resolve",
    name: "Iron Resolve",
    description: "10% chance to resist status effects.",
    type: "passive",
    cost: 2,
    position: { x: 5, y: 4 },
    passiveId: "status_resist_10",
    requiredNodes: ["kai_def_2"],
    requiredLevel: 5,
    tier: 2,
  },

  // === TECH NODES (Cost 2-3 OP) ===
  {
    id: "kai_heavy_strike",
    name: "Heavy Strike",
    description: "Unlocks Heavy Strike: A powerful blow dealing 150% damage but slower to execute.",
    type: "tech",
    cost: 3,
    position: { x: 0, y: 2 },
    abilityId: "heavy_strike",
    requiredNodes: ["kai_str_2"],
    requiredLevel: 5,
    tier: 2,
  },
  {
    id: "kai_quick_slash",
    name: "Quick Slash",
    description: "Unlocks Quick Slash: A fast attack dealing 75% damage with bonus turn speed.",
    type: "tech",
    cost: 2,
    position: { x: 0, y: 3 },
    abilityId: "quick_slash",
    requiredNodes: ["kai_spd_1"],
    requiredLevel: 4,
    tier: 2,
  },

  // === RING 3: Advanced (Cost 2-3 OP, requires level 7+) ===
  {
    id: "kai_hp_4",
    name: "Vitality IV",
    description: "Increase maximum HP by 20.",
    type: "stat",
    cost: 2,
    position: { x: 0, y: 1 },
    statBoosts: [{ stat: "maxHp", value: 20 }],
    requiredNodes: ["kai_hp_3"],
    requiredLevel: 7,
    tier: 3,
  },
  {
    id: "kai_str_3",
    name: "Strength III",
    description: "Increase Strength by 4.",
    type: "stat",
    cost: 2,
    position: { x: 6, y: 2 },
    statBoosts: [{ stat: "strength", value: 4 }],
    requiredNodes: ["kai_str_2"],
    requiredLevel: 7,
    tier: 3,
  },
  {
    id: "kai_mp_1",
    name: "Bandwidth I",
    description: "Increase maximum MP by 5.",
    type: "stat",
    cost: 1,
    position: { x: 3, y: 4 },
    statBoosts: [{ stat: "maxMp", value: 5 }],
    requiredNodes: ["kai_mag_1"],
    tier: 2,
  },
  {
    id: "kai_mp_2",
    name: "Bandwidth II",
    description: "Increase maximum MP by 10.",
    type: "stat",
    cost: 2,
    position: { x: 3, y: 5 },
    statBoosts: [{ stat: "maxMp", value: 10 }],
    requiredNodes: ["kai_mp_1"],
    requiredLevel: 6,
    tier: 3,
  },
  {
    id: "kai_crit",
    name: "Critical Edge",
    description: "Increase critical hit chance by 5%.",
    type: "passive",
    cost: 2,
    position: { x: 6, y: 3 },
    passiveId: "crit_5",
    requiredNodes: ["kai_str_3"],
    requiredLevel: 8,
    tier: 3,
  },

  // === CORE NODE (Level 10, Cost 5 OP) ===
  {
    id: "kai_core_1",
    name: "Anomaly Awakening",
    description: "Unlock the path to glitch abilities. Increases all stats by 5.",
    type: "core",
    cost: 5,
    position: { x: 3, y: 1 },
    statBoosts: [
      { stat: "maxHp", value: 10 },
      { stat: "maxMp", value: 5 },
      { stat: "strength", value: 2 },
      { stat: "magic", value: 2 },
      { stat: "defense", value: 2 },
      { stat: "magicDefense", value: 2 },
      { stat: "speed", value: 1 },
      { stat: "luck", value: 1 },
    ],
    requiredNodes: ["kai_hp_3", "kai_str_2", "kai_counter"],
    requiredLevel: 10,
    tier: 3,
  },
];

// Connection definitions for visual rendering
const KAI_CONNECTIONS: [string, string][] = [
  // Ring 1 connections
  ["kai_hp_1", "kai_str_1"],
  ["kai_str_1", "kai_def_1"],
  ["kai_hp_1", "kai_spd_1"],
  ["kai_def_1", "kai_mag_1"],
  ["kai_hp_1", "kai_hp_2"],
  ["kai_str_1", "kai_hp_2"],
  ["kai_spd_1", "kai_hp_2"],
  ["kai_mag_1", "kai_hp_2"],

  // Ring 1 to Ring 2
  ["kai_hp_1", "kai_hp_3"],
  ["kai_str_1", "kai_str_2"],
  ["kai_def_1", "kai_def_2"],
  ["kai_spd_1", "kai_mdef_1"],
  ["kai_mag_1", "kai_mp_1"],

  // Passive connections
  ["kai_str_1", "kai_counter"],
  ["kai_def_1", "kai_counter"],
  ["kai_def_2", "kai_resolve"],

  // Tech connections
  ["kai_str_2", "kai_heavy_strike"],
  ["kai_spd_1", "kai_quick_slash"],

  // Ring 2 to Ring 3
  ["kai_hp_3", "kai_hp_4"],
  ["kai_str_2", "kai_str_3"],
  ["kai_mp_1", "kai_mp_2"],
  ["kai_str_3", "kai_crit"],

  // Core node connections
  ["kai_hp_3", "kai_core_1"],
  ["kai_str_2", "kai_core_1"],
  ["kai_counter", "kai_core_1"],
];

// Export Kai's complete lattice
export const KAI_LATTICE: CharacterLattice = {
  characterId: "kai",
  name: "Anomaly's Spiral",
  shape: "spiral",
  nodes: KAI_NODES,
  connections: KAI_CONNECTIONS,
};

// Get a specific node by ID
export function getKaiNode(nodeId: string): LatticeNode | undefined {
  return KAI_NODES.find((n) => n.id === nodeId);
}
