// Encounter Engine - Handles collision detection and battle triggering

import type { GameMap, EnemyEncounter, PlayerPosition } from "../types/map";
import type { Enemy } from "../types/battle";
import {
  createBanditEncounter,
  createWolfEncounter,
  createCorruptedEncounter,
  createSystemAgentEncounter,
} from "../data/enemies";

// Encounter factory map
const ENCOUNTER_FACTORIES: Record<string, () => Enemy[]> = {
  bandit: createBanditEncounter,
  wolf: createWolfEncounter,
  corrupted: createCorruptedEncounter,
  system_agent: createSystemAgentEncounter,
};

/**
 * Check if player position is within an encounter zone
 */
export function isInEncounterZone(
  position: PlayerPosition,
  encounters: EnemyEncounter[]
): EnemyEncounter | null {
  for (const encounter of encounters) {
    const { x, y, width, height } = encounter.zone;
    if (
      position.x >= x &&
      position.x < x + width &&
      position.y >= y &&
      position.y < y + height
    ) {
      return encounter;
    }
  }
  return null;
}

/**
 * Roll for random encounter based on encounter chance
 */
export function rollForEncounter(encounter: EnemyEncounter): boolean {
  return Math.random() < encounter.chance;
}

/**
 * Create enemy group from encounter definition
 */
export function createEnemiesFromEncounter(encounter: EnemyEncounter): Enemy[] {
  // Use factory if encounter enemies match known types
  const firstEnemyType = encounter.enemies[0];
  const factory = ENCOUNTER_FACTORIES[firstEnemyType];

  if (factory) {
    return factory();
  }

  // Fallback: create bandits
  return createBanditEncounter();
}

/**
 * Check for encounter on player movement
 * Returns enemies if encounter triggered, null otherwise
 */
export function checkForEncounter(
  map: GameMap,
  position: PlayerPosition,
  previousPosition: PlayerPosition
): Enemy[] | null {
  // Only check if player actually moved
  if (position.x === previousPosition.x && position.y === previousPosition.y) {
    return null;
  }

  // Check if in encounter zone
  const encounter = isInEncounterZone(position, map.encounters);
  if (!encounter) {
    return null;
  }

  // Roll for encounter
  if (!rollForEncounter(encounter)) {
    return null;
  }

  // Create and return enemies
  return createEnemiesFromEncounter(encounter);
}

/**
 * Step counter for encounter rate
 * Some games use step-based encounters instead of pure chance
 */
export interface StepCounter {
  steps: number;
  minSteps: number;
  maxSteps: number;
  nextEncounterAt: number;
}

export function createStepCounter(minSteps = 10, maxSteps = 30): StepCounter {
  return {
    steps: 0,
    minSteps,
    maxSteps,
    nextEncounterAt: minSteps + Math.floor(Math.random() * (maxSteps - minSteps)),
  };
}

export function incrementSteps(counter: StepCounter): StepCounter {
  return {
    ...counter,
    steps: counter.steps + 1,
  };
}

export function shouldTriggerEncounter(counter: StepCounter, inEncounterZone: boolean): boolean {
  if (!inEncounterZone) return false;
  return counter.steps >= counter.nextEncounterAt;
}

export function resetStepCounter(counter: StepCounter): StepCounter {
  return {
    ...counter,
    steps: 0,
    nextEncounterAt: counter.minSteps + Math.floor(Math.random() * (counter.maxSteps - counter.minSteps)),
  };
}

/**
 * Get encounter danger level text for UI
 */
export function getEncounterDangerLevel(encounter: EnemyEncounter): string {
  if (encounter.chance >= 0.3) return "High Danger";
  if (encounter.chance >= 0.15) return "Moderate";
  return "Low Danger";
}
