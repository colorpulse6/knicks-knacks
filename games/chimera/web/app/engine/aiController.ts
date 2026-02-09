// AI Controller - Enemy decision making for ATB battles

import type { Enemy, BattleAction, BattleCharacter, BattleState } from "../types/battle";
import type { Ability } from "../types";

/**
 * Select an action for an enemy based on AI type
 */
export function selectEnemyAction(
  enemy: Enemy,
  battleState: BattleState
): BattleAction {
  const { ai } = enemy;
  const aliveParty = battleState.party.filter(p => p.character.stats.hp > 0);

  if (aliveParty.length === 0) {
    return { type: "defend" };
  }

  switch (ai.type) {
    case "random":
      return selectRandomAction(enemy, aliveParty);
    case "aggressive":
      return selectAggressiveAction(enemy, aliveParty);
    case "defensive":
      return selectDefensiveAction(enemy, battleState);
    case "smart":
      return selectSmartAction(enemy, battleState);
    default:
      return selectRandomAction(enemy, aliveParty);
  }
}

/**
 * Random AI - picks attack or ability at random
 */
function selectRandomAction(
  enemy: Enemy,
  targets: BattleCharacter[]
): BattleAction {
  const randomTarget = targets[Math.floor(Math.random() * targets.length)];

  // 70% basic attack, 30% ability
  if (Math.random() < 0.7 || enemy.abilities.length === 0) {
    return { type: "attack", targetId: randomTarget.character.id };
  }

  const usableAbilities = enemy.abilities.filter(
    a => a.mpCost <= enemy.stats.mp
  );

  if (usableAbilities.length === 0) {
    return { type: "attack", targetId: randomTarget.character.id };
  }

  const ability = usableAbilities[Math.floor(Math.random() * usableAbilities.length)];
  return selectAbilityTarget(ability, randomTarget.character.id, targets);
}

/**
 * Aggressive AI - prioritizes low HP targets, uses powerful abilities
 * Bandits have a chance to use Steal
 */
function selectAggressiveAction(
  enemy: Enemy,
  targets: BattleCharacter[]
): BattleAction {
  // Find lowest HP target
  const sortedTargets = [...targets].sort(
    (a, b) => a.character.stats.hp - b.character.stats.hp
  );
  const weakestTarget = sortedTargets[0];

  // Check if this enemy has the Steal ability (bandits)
  const stealAbility = enemy.abilities.find(a => a.id === "steal");
  if (stealAbility) {
    // 25% chance to attempt steal each turn
    if (Math.random() < 0.25) {
      // Pick a random target for stealing
      const randomTarget = targets[Math.floor(Math.random() * targets.length)];
      return {
        type: "magic",
        abilityId: "steal",
        targetId: randomTarget.character.id
      };
    }
  }

  // Check for finishing abilities if target is low
  const hpPercent = weakestTarget.character.stats.hp / weakestTarget.character.stats.maxHp;

  if (hpPercent < 0.3 && enemy.abilities.length > 0) {
    const powerfulAbility = enemy.abilities
      .filter(a => a.mpCost <= enemy.stats.mp && a.type !== "support" && a.id !== "steal")
      .sort((a, b) => b.power - a.power)[0];

    if (powerfulAbility) {
      return selectAbilityTarget(powerfulAbility, weakestTarget.character.id, targets);
    }
  }

  return { type: "attack", targetId: weakestTarget.character.id };
}

/**
 * Defensive AI - uses support abilities, attacks when needed
 */
function selectDefensiveAction(
  enemy: Enemy,
  battleState: BattleState
): BattleAction {
  const aliveParty = battleState.party.filter(p => p.character.stats.hp > 0);
  const aliveEnemies = battleState.enemies.filter(e => e.stats.hp > 0);

  // Check if any ally enemy is low HP
  const lowHpAlly = aliveEnemies.find(
    e => e.stats.hp / e.stats.maxHp < 0.4 && e.id !== enemy.id
  );

  if (lowHpAlly) {
    const healAbility = enemy.abilities.find(
      a => a.type === "support" && a.mpCost <= enemy.stats.mp
    );
    if (healAbility) {
      return {
        type: "magic",
        abilityId: healAbility.id,
        targetId: lowHpAlly.id
      };
    }
  }

  // Check own HP
  if (enemy.stats.hp / enemy.stats.maxHp < 0.3) {
    return { type: "defend" };
  }

  // Basic attack on random target
  const target = aliveParty[Math.floor(Math.random() * aliveParty.length)];
  return { type: "attack", targetId: target.character.id };
}

/**
 * Smart AI - adapts based on battle situation
 */
function selectSmartAction(
  enemy: Enemy,
  battleState: BattleState
): BattleAction {
  const aliveParty = battleState.party.filter(p => p.character.stats.hp > 0);
  const hpPercent = enemy.stats.hp / enemy.stats.maxHp;
  const specialThreshold = enemy.ai.specialThreshold ?? 0.5;

  // Use special abilities when below threshold
  if (hpPercent < specialThreshold) {
    const powerfulAbility = enemy.abilities
      .filter(a => a.mpCost <= enemy.stats.mp && a.power > 20)
      .sort((a, b) => b.power - a.power)[0];

    if (powerfulAbility) {
      return selectAbilityTarget(
        powerfulAbility,
        aliveParty[0].character.id,
        aliveParty
      );
    }
  }

  // Target priority
  let target: BattleCharacter;
  switch (enemy.ai.targetPriority) {
    case "lowest_hp":
      target = [...aliveParty].sort(
        (a, b) => a.character.stats.hp - b.character.stats.hp
      )[0];
      break;
    case "highest_hp":
      target = [...aliveParty].sort(
        (a, b) => b.character.stats.hp - a.character.stats.hp
      )[0];
      break;
    case "healer":
      target = aliveParty.find(p =>
        p.character.abilities.some(a => a.type === "magic" && a.target === "ally")
      ) ?? aliveParty[0];
      break;
    default:
      target = aliveParty[Math.floor(Math.random() * aliveParty.length)];
  }

  // 50% chance to use ability if available
  if (Math.random() < 0.5 && enemy.abilities.length > 0) {
    const usableAbility = enemy.abilities.find(a => a.mpCost <= enemy.stats.mp);
    if (usableAbility) {
      return selectAbilityTarget(usableAbility, target.character.id, aliveParty);
    }
  }

  return { type: "attack", targetId: target.character.id };
}

/**
 * Helper to select proper target for ability based on target type
 */
function selectAbilityTarget(
  ability: Ability,
  defaultTargetId: string,
  targets: BattleCharacter[]
): BattleAction {
  switch (ability.target) {
    case "all":
      return {
        type: "magic",
        abilityId: ability.id,
        targetId: targets.map(t => t.character.id)
      };
    case "single":
      return { type: "magic", abilityId: ability.id, targetId: defaultTargetId };
    default:
      return { type: "magic", abilityId: ability.id, targetId: defaultTargetId };
  }
}
