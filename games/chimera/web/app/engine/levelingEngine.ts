// Leveling Engine - Core logic for the Source Code Lattice system

import type { Character, Stats } from "../types/character";
import type {
  LatticeNode,
  CharacterLattice,
  LevelUpResult,
  StatBoost,
} from "../types/lattice";
import { getExperienceToLevel, createBaseStats } from "../types/character";
import { getOPForLevel, isGlitchSectorLevel } from "../types/lattice";

// Base stat parameters for each character (used for stat recalculation)
const CHARACTER_BASE_STATS: Record<
  string,
  {
    baseHp: number;
    baseMp: number;
    str: number;
    mag: number;
    def: number;
    mdef: number;
    spd: number;
    luck: number;
  }
> = {
  kai: {
    baseHp: 120,
    baseMp: 40,
    str: 12,
    mag: 8,
    def: 10,
    mdef: 8,
    spd: 10,
    luck: 8,
  },
  lyra: {
    baseHp: 90,
    baseMp: 60,
    str: 6,
    mag: 14,
    def: 6,
    mdef: 12,
    spd: 12,
    luck: 15,
  },
};

/**
 * Check if a character has enough XP to level up
 */
export function canLevelUp(character: Character): boolean {
  return character.experience >= character.experienceToNext;
}

/**
 * Process a single level-up for a character
 * Returns the updated character and level-up details
 */
export function processLevelUp(character: Character): {
  character: Character;
  result: LevelUpResult;
} {
  const newLevel = character.level + 1;
  const opEarned = getOPForLevel(newLevel);

  // Get base stats for this character
  const baseStats = CHARACTER_BASE_STATS[character.id] ?? CHARACTER_BASE_STATS.kai;

  // Calculate new stats at the new level
  const oldStats = character.stats;
  const newBaseStats = createBaseStats(
    newLevel,
    baseStats.baseHp,
    baseStats.baseMp,
    baseStats.str,
    baseStats.mag,
    baseStats.def,
    baseStats.mdef,
    baseStats.spd,
    baseStats.luck
  );

  // Calculate stat gains (difference between new and old base stats)
  const statGains: Partial<Stats> = {
    maxHp: newBaseStats.maxHp - oldStats.maxHp,
    maxMp: newBaseStats.maxMp - oldStats.maxMp,
    strength: newBaseStats.strength - oldStats.strength,
    magic: newBaseStats.magic - oldStats.magic,
    defense: newBaseStats.defense - oldStats.defense,
    magicDefense: newBaseStats.magicDefense - oldStats.magicDefense,
    speed: newBaseStats.speed - oldStats.speed,
    luck: newBaseStats.luck - oldStats.luck,
  };

  // Create updated character
  const updatedCharacter: Character = {
    ...character,
    level: newLevel,
    experience: character.experience - character.experienceToNext,
    experienceToNext: getExperienceToLevel(newLevel + 1),
    stats: {
      ...newBaseStats,
      // Preserve current HP/MP ratios
      hp: Math.min(
        oldStats.hp + (statGains.maxHp ?? 0),
        newBaseStats.maxHp
      ),
      mp: Math.min(
        oldStats.mp + (statGains.maxMp ?? 0),
        newBaseStats.maxMp
      ),
    },
    optimizationPoints: character.optimizationPoints + opEarned,
    totalOPEarned: character.totalOPEarned + opEarned,
  };

  const result: LevelUpResult = {
    newLevel,
    opEarned,
    statGains,
    isGlitchSector: isGlitchSectorLevel(newLevel),
  };

  return { character: updatedCharacter, result };
}

/**
 * Process all pending level-ups for a character
 * Can handle multiple level-ups at once (e.g., from a big XP gain)
 */
export function processAllLevelUps(character: Character): {
  character: Character;
  results: LevelUpResult[];
} {
  const results: LevelUpResult[] = [];
  let current = character;

  // Process level-ups until we can't anymore (max 99)
  while (canLevelUp(current) && current.level < 99) {
    const { character: updated, result } = processLevelUp(current);
    current = updated;
    results.push(result);
  }

  return { character: current, results };
}

/**
 * Calculate effective stats including lattice node bonuses
 */
export function calculateEffectiveStats(
  character: Character,
  lattice: CharacterLattice | null
): Stats {
  // Start with base stats
  const stats = { ...character.stats };

  if (!lattice) return stats;

  // Apply bonuses from unlocked nodes
  for (const nodeId of character.latticeProgress.unlockedNodes) {
    const node = lattice.nodes.find((n) => n.id === nodeId);
    if (node?.statBoosts) {
      for (const boost of node.statBoosts) {
        applyStatBoost(stats, boost);
      }
    }
  }

  // Apply mutation effects (both benefits and drawbacks)
  for (const mutation of character.latticeProgress.mutations) {
    if (mutation.choseMutation && mutation.mutationId) {
      // TODO: Apply mutation effects when we have the mutation data loaded
    }
  }

  return stats;
}

/**
 * Apply a stat boost to a stats object
 */
function applyStatBoost(stats: Stats, boost: StatBoost): void {
  const stat = boost.stat;
  switch (stat) {
    case "maxHp":
      stats.maxHp += boost.value;
      stats.hp = Math.min(stats.hp + boost.value, stats.maxHp);
      break;
    case "maxMp":
      stats.maxMp += boost.value;
      stats.mp = Math.min(stats.mp + boost.value, stats.maxMp);
      break;
    case "strength":
      stats.strength += boost.value;
      break;
    case "magic":
      stats.magic += boost.value;
      break;
    case "defense":
      stats.defense += boost.value;
      break;
    case "magicDefense":
      stats.magicDefense += boost.value;
      break;
    case "speed":
      stats.speed += boost.value;
      break;
    case "luck":
      stats.luck += boost.value;
      break;
  }
}

/**
 * Check if a node can be unlocked
 */
export function canUnlockNode(
  character: Character,
  node: LatticeNode,
  lattice: CharacterLattice
): { canUnlock: boolean; reason?: string } {
  // Check if already unlocked
  if (character.latticeProgress.unlockedNodes.includes(node.id)) {
    return { canUnlock: false, reason: "Already unlocked" };
  }

  // Check OP cost
  if (character.optimizationPoints < node.cost) {
    return { canUnlock: false, reason: `Need ${node.cost} OP` };
  }

  // Check level requirement
  if (node.requiredLevel && character.level < node.requiredLevel) {
    return { canUnlock: false, reason: `Requires level ${node.requiredLevel}` };
  }

  // Check prerequisite nodes
  for (const requiredId of node.requiredNodes) {
    if (!character.latticeProgress.unlockedNodes.includes(requiredId)) {
      const requiredNode = lattice.nodes.find((n) => n.id === requiredId);
      const name = requiredNode?.name ?? requiredId;
      return { canUnlock: false, reason: `Requires: ${name}` };
    }
  }

  return { canUnlock: true };
}

/**
 * Unlock a node for a character
 */
export function unlockNode(
  character: Character,
  nodeId: string,
  lattice: CharacterLattice
): Character | null {
  const node = lattice.nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  const { canUnlock } = canUnlockNode(character, node, lattice);
  if (!canUnlock) return null;

  return {
    ...character,
    optimizationPoints: character.optimizationPoints - node.cost,
    latticeProgress: {
      ...character.latticeProgress,
      unlockedNodes: [...character.latticeProgress.unlockedNodes, nodeId],
    },
    // Add passive to active list if this is a passive node
    activePassives: node.passiveId
      ? [...character.activePassives, node.passiveId]
      : character.activePassives,
  };
}

/**
 * Get total OP earned at a given level (cumulative)
 */
export function getTotalOPAtLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += getOPForLevel(i);
  }
  return total;
}

/**
 * Get nodes that are available to unlock (prerequisites met, not yet unlocked)
 */
export function getAvailableNodes(
  character: Character,
  lattice: CharacterLattice
): LatticeNode[] {
  return lattice.nodes.filter((node) => {
    const { canUnlock } = canUnlockNode(character, node, lattice);
    return canUnlock;
  });
}

/**
 * Initialize lattice progress for a new character
 */
export function createInitialLatticeProgress(): Character["latticeProgress"] {
  return {
    unlockedNodes: [],
    mutations: [],
  };
}

/**
 * Initialize a character's lattice-related fields
 */
export function initializeCharacterLattice(character: Character): Character {
  return {
    ...character,
    optimizationPoints: getTotalOPAtLevel(character.level),
    totalOPEarned: getTotalOPAtLevel(character.level),
    latticeProgress: createInitialLatticeProgress(),
    activePassives: [],
    systemAwareness: character.isGlitched ? 10 : 0, // Glitched characters start with some awareness
  };
}
