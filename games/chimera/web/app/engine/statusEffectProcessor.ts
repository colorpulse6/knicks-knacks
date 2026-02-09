/**
 * Status Effect Processor
 * Handles processing of status effects during battle
 */

import type { BattleState, BattleCharacter, Enemy } from "../types/battle";
import type { StatusEffect } from "../types/character";
import {
  getStatusEffectDefinition,
  hasStatusEffect,
  tickStatusEffects,
  removeStatusEffect,
  type StatusEffectId,
} from "../data/statusEffects";

export interface StatusProcessResult {
  state: BattleState;
  logs: string[];
  damageDealt: { targetId: string; damage: number }[];
  healingDealt: { targetId: string; healing: number }[];
}

/**
 * Process status effects at the start of an actor's turn
 */
export function processStatusEffectsTurnStart(
  state: BattleState,
  actorId: string
): StatusProcessResult {
  const logs: string[] = [];
  const damageDealt: { targetId: string; damage: number }[] = [];
  const healingDealt: { targetId: string; healing: number }[] = [];
  let newState = { ...state };

  // Find the actor
  const partyIndex = state.party.findIndex(m => m.character.id === actorId);
  const enemyIndex = state.enemies.findIndex(e => e.id === actorId);

  if (partyIndex >= 0) {
    const member = state.party[partyIndex];
    const { effects, logs: effectLogs, damage, healing } = processTurnStartEffects(
      member.character.id,
      member.character.name,
      member.statusEffects,
      member.character.stats.maxHp
    );

    logs.push(...effectLogs);
    if (damage > 0) damageDealt.push({ targetId: actorId, damage });
    if (healing > 0) healingDealt.push({ targetId: actorId, healing });

    // Apply damage/healing to HP
    const newParty = [...state.party];
    let newHp = member.character.stats.hp - damage + healing;
    newHp = Math.max(0, Math.min(member.character.stats.maxHp, newHp));

    newParty[partyIndex] = {
      ...member,
      character: {
        ...member.character,
        stats: { ...member.character.stats, hp: newHp },
      },
      statusEffects: effects,
    };
    newState = { ...newState, party: newParty };
  }

  if (enemyIndex >= 0) {
    const enemy = state.enemies[enemyIndex];
    const { effects, logs: effectLogs, damage, healing } = processTurnStartEffects(
      enemy.id,
      enemy.name,
      enemy.statusEffects,
      enemy.stats.maxHp
    );

    logs.push(...effectLogs);
    if (damage > 0) damageDealt.push({ targetId: actorId, damage });
    if (healing > 0) healingDealt.push({ targetId: actorId, healing });

    const newEnemies = [...state.enemies];
    let newHp = enemy.stats.hp - damage + healing;
    newHp = Math.max(0, Math.min(enemy.stats.maxHp, newHp));

    newEnemies[enemyIndex] = {
      ...enemy,
      stats: { ...enemy.stats, hp: newHp },
      statusEffects: effects,
    };
    newState = { ...newState, enemies: newEnemies };
  }

  return { state: newState, logs, damageDealt, healingDealt };
}

/**
 * Process individual turn-start effects
 */
function processTurnStartEffects(
  id: string,
  name: string,
  effects: StatusEffect[],
  maxHp: number
): { effects: StatusEffect[]; logs: string[]; damage: number; healing: number } {
  const logs: string[] = [];
  let damage = 0;
  let healing = 0;

  for (const effect of effects) {
    const def = getStatusEffectDefinition(effect.id);
    if (!def || def.tickTiming !== "turn_start") continue;

    switch (effect.id) {
      case "poison": {
        const poisonDamage = Math.floor(maxHp * (effect.power ?? 10) / 100);
        damage += poisonDamage;
        logs.push(`${name} takes ${poisonDamage} poison damage!`);
        break;
      }
      case "regen": {
        const regenHealing = Math.floor(maxHp * (effect.power ?? 8) / 100);
        healing += regenHealing;
        logs.push(`${name} regenerates ${regenHealing} HP!`);
        break;
      }
    }
  }

  // Tick down effect durations
  const tickedEffects = tickStatusEffects(effects);

  // Log expired effects
  const expiredEffects = effects.filter(
    e => !tickedEffects.some(te => te.id === e.id)
  );
  for (const expired of expiredEffects) {
    logs.push(`${name}'s ${expired.name} wore off!`);
  }

  return { effects: tickedEffects, logs, damage, healing };
}

/**
 * Check if actor can act (not asleep, etc.)
 */
export function canActorAct(state: BattleState, actorId: string): { canAct: boolean; reason?: string } {
  const effects = getActorStatusEffects(state, actorId);

  // Sleep prevents action
  if (hasStatusEffect(effects, "sleep")) {
    return { canAct: false, reason: "is asleep!" };
  }

  return { canAct: true };
}

/**
 * Check if actor can use magic (not silenced)
 */
export function canActorUseMagic(state: BattleState, actorId: string): boolean {
  const effects = getActorStatusEffects(state, actorId);
  return !hasStatusEffect(effects, "silence");
}

/**
 * Check if actor is berserked (auto-attack only)
 */
export function isActorBerserked(state: BattleState, actorId: string): boolean {
  const effects = getActorStatusEffects(state, actorId);
  return hasStatusEffect(effects, "berserk");
}

/**
 * Get ATB speed modifier from status effects
 */
export function getATBSpeedModifier(state: BattleState, actorId: string): number {
  const effects = getActorStatusEffects(state, actorId);
  let modifier = 1;

  if (hasStatusEffect(effects, "haste")) {
    modifier *= 1.5; // 50% faster
  }
  if (hasStatusEffect(effects, "slow")) {
    modifier *= 0.5; // 50% slower
  }

  return modifier;
}

/**
 * Get physical damage modifier from status effects
 */
export function getPhysicalDamageModifier(
  attackerEffects: StatusEffect[],
  defenderEffects: StatusEffect[]
): { attackMod: number; defenseMod: number; missChance: number } {
  let attackMod = 1;
  let defenseMod = 1;
  let missChance = 0;

  // Attacker modifiers
  if (hasStatusEffect(attackerEffects, "berserk")) {
    const berserkEffect = attackerEffects.find(e => e.id === "berserk");
    attackMod *= 1 + (berserkEffect?.power ?? 50) / 100;
  }
  if (hasStatusEffect(attackerEffects, "blind")) {
    const blindEffect = attackerEffects.find(e => e.id === "blind");
    missChance = (blindEffect?.power ?? 50) / 100;
  }

  // Defender modifiers
  if (hasStatusEffect(defenderEffects, "protect")) {
    const protectEffect = defenderEffects.find(e => e.id === "protect");
    defenseMod *= 1 - (protectEffect?.power ?? 25) / 100;
  }
  if (hasStatusEffect(defenderEffects, "defending")) {
    const defendEffect = defenderEffects.find(e => e.id === "defending");
    defenseMod *= 1 - (defendEffect?.power ?? 50) / 100;
  }

  return { attackMod, defenseMod, missChance };
}

/**
 * Get magic damage modifier from status effects
 */
export function getMagicDamageModifier(
  defenderEffects: StatusEffect[]
): { defenseMod: number } {
  let defenseMod = 1;

  if (hasStatusEffect(defenderEffects, "shell")) {
    const shellEffect = defenderEffects.find(e => e.id === "shell");
    defenseMod *= 1 - (shellEffect?.power ?? 25) / 100;
  }

  return { defenseMod };
}

/**
 * Process damage-triggered effects (like waking from sleep)
 */
export function processOnDamageEffects(
  state: BattleState,
  targetId: string
): { state: BattleState; logs: string[] } {
  const logs: string[] = [];
  let newState = { ...state };
  const targetName = getActorName(state, targetId);

  const partyIndex = state.party.findIndex(m => m.character.id === targetId);
  const enemyIndex = state.enemies.findIndex(e => e.id === targetId);

  if (partyIndex >= 0) {
    const member = state.party[partyIndex];
    if (hasStatusEffect(member.statusEffects, "sleep")) {
      logs.push(`${targetName} woke up!`);
      const newParty = [...state.party];
      newParty[partyIndex] = {
        ...member,
        statusEffects: removeStatusEffect(member.statusEffects, "sleep"),
      };
      newState = { ...newState, party: newParty };
    }
  }

  if (enemyIndex >= 0) {
    const enemy = state.enemies[enemyIndex];
    if (hasStatusEffect(enemy.statusEffects, "sleep")) {
      logs.push(`${targetName} woke up!`);
      const newEnemies = [...state.enemies];
      newEnemies[enemyIndex] = {
        ...enemy,
        statusEffects: removeStatusEffect(enemy.statusEffects, "sleep"),
      };
      newState = { ...newState, enemies: newEnemies };
    }
  }

  return { state: newState, logs };
}

/**
 * Apply a status effect to an actor
 */
export function applyStatusEffectToActor(
  state: BattleState,
  targetId: string,
  effect: StatusEffect
): { state: BattleState; success: boolean; log: string } {
  const targetName = getActorName(state, targetId);
  const def = getStatusEffectDefinition(effect.id);
  let newState = { ...state };

  const partyIndex = state.party.findIndex(m => m.character.id === targetId);
  const enemyIndex = state.enemies.findIndex(e => e.id === targetId);

  if (partyIndex >= 0) {
    const member = state.party[partyIndex];
    // Check if already has this effect
    if (hasStatusEffect(member.statusEffects, effect.id as StatusEffectId) && !def?.stackable) {
      // Refresh duration instead
      const newParty = [...state.party];
      newParty[partyIndex] = {
        ...member,
        statusEffects: member.statusEffects.map(e =>
          e.id === effect.id ? { ...effect } : e
        ),
      };
      return {
        state: { ...newState, party: newParty },
        success: true,
        log: `${targetName}'s ${effect.name} was refreshed!`,
      };
    }

    const newParty = [...state.party];
    newParty[partyIndex] = {
      ...member,
      statusEffects: [...member.statusEffects, effect],
    };
    newState = { ...newState, party: newParty };
  }

  if (enemyIndex >= 0) {
    const enemy = state.enemies[enemyIndex];
    if (hasStatusEffect(enemy.statusEffects, effect.id as StatusEffectId) && !def?.stackable) {
      const newEnemies = [...state.enemies];
      newEnemies[enemyIndex] = {
        ...enemy,
        statusEffects: enemy.statusEffects.map(e =>
          e.id === effect.id ? { ...effect } : e
        ),
      };
      return {
        state: { ...newState, enemies: newEnemies },
        success: true,
        log: `${targetName}'s ${effect.name} was refreshed!`,
      };
    }

    const newEnemies = [...state.enemies];
    newEnemies[enemyIndex] = {
      ...enemy,
      statusEffects: [...enemy.statusEffects, effect],
    };
    newState = { ...newState, enemies: newEnemies };
  }

  return {
    state: newState,
    success: true,
    log: `${targetName} is now affected by ${effect.name}!`,
  };
}

// Helper functions

function getActorStatusEffects(state: BattleState, actorId: string): StatusEffect[] {
  const partyMember = state.party.find(m => m.character.id === actorId);
  if (partyMember) return partyMember.statusEffects;

  const enemy = state.enemies.find(e => e.id === actorId);
  if (enemy) return enemy.statusEffects;

  return [];
}

function getActorName(state: BattleState, actorId: string): string {
  const partyMember = state.party.find(m => m.character.id === actorId);
  if (partyMember) return partyMember.character.name;

  const enemy = state.enemies.find(e => e.id === actorId);
  if (enemy) return enemy.name;

  return "Unknown";
}
