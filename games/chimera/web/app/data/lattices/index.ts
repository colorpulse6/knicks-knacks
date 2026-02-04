// Lattice registry - exports all character lattices

import type { CharacterLattice, PassiveRoutine } from "../../types/lattice";
import { KAI_LATTICE } from "./kai-lattice";

// Registry of all character lattices
const LATTICE_REGISTRY: Record<string, CharacterLattice> = {
  kai: KAI_LATTICE,
  // lyra: LYRA_LATTICE, // TODO: Add when Lyra's lattice is designed
};

/**
 * Get the lattice for a specific character
 */
export function getLatticeForCharacter(
  characterId: string
): CharacterLattice | null {
  return LATTICE_REGISTRY[characterId] ?? null;
}

/**
 * Get all available lattices
 */
export function getAllLattices(): CharacterLattice[] {
  return Object.values(LATTICE_REGISTRY);
}

// Passive routine definitions
export const PASSIVE_ROUTINES: Record<string, PassiveRoutine> = {
  counter_5: {
    id: "counter_5",
    name: "Counter Stance",
    description: "5% chance to counterattack when hit.",
    type: "counter_chance",
    value: 5,
  },
  counter_10: {
    id: "counter_10",
    name: "Counter Mastery",
    description: "10% chance to counterattack when hit.",
    type: "counter_chance",
    value: 10,
  },
  status_resist_10: {
    id: "status_resist_10",
    name: "Iron Resolve",
    description: "10% chance to resist status effects.",
    type: "status_resist",
    value: 10,
  },
  status_resist_20: {
    id: "status_resist_20",
    name: "Unshakeable",
    description: "20% chance to resist status effects.",
    type: "status_resist",
    value: 20,
  },
  crit_5: {
    id: "crit_5",
    name: "Critical Edge",
    description: "+5% critical hit chance.",
    type: "crit_bonus",
    value: 5,
  },
  crit_10: {
    id: "crit_10",
    name: "Deadly Precision",
    description: "+10% critical hit chance.",
    type: "crit_bonus",
    value: 10,
  },
  auto_guard_5: {
    id: "auto_guard_5",
    name: "Instinctive Guard",
    description: "5% chance to automatically reduce damage.",
    type: "auto_guard",
    value: 5,
  },
  hp_regen_5: {
    id: "hp_regen_5",
    name: "Regeneration",
    description: "Recover 5 HP at the start of each turn.",
    type: "hp_regen",
    value: 5,
  },
  mp_regen_3: {
    id: "mp_regen_3",
    name: "Meditation",
    description: "Recover 3 MP at the start of each turn.",
    type: "mp_regen",
    value: 3,
  },
  first_strike_10: {
    id: "first_strike_10",
    name: "Quick Draw",
    description: "10% chance to act first in battle.",
    type: "first_strike",
    value: 10,
  },
};

/**
 * Get a passive routine by ID
 */
export function getPassiveById(passiveId: string): PassiveRoutine | undefined {
  return PASSIVE_ROUTINES[passiveId];
}

// Re-export lattices
export { KAI_LATTICE } from "./kai-lattice";
