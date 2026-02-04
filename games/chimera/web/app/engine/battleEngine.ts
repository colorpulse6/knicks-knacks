// Battle Engine - Core ATB combat orchestration

import type {
  BattleState,
  BattleCharacter,
  BattleCommand,
  BattleAction,
  BattleLogEntry,
  BattlePhase,
  Enemy,
  DamageResult,
} from "../types/battle";
import type { Character, Ability, StatusEffect } from "../types";
import {
  createATBState,
  updateGauge,
  resetGauge,
  setActing,
  ATB_MAX
} from "./atbSystem";
import { calculateAbilityDamage, calculateHealing, calculateFleeChance } from "./damageCalculator";
import { selectEnemyAction } from "./aiController";
import {
  getItemById,
  getStealableItems,
  selectItemToSteal,
  calculateStealChance,
} from "../data/items";
import {
  processFirstStrike,
  processTurnStartPassives,
  processDefensivePassives,
  processCounterCheck,
  getCritBonus,
} from "./passiveProcessor";
import { getEffectiveStats, getShardEffectValue } from "./equipmentEngine";
import {
  processStatusEffectsTurnStart,
  getATBSpeedModifier,
  getPhysicalDamageModifier,
  processOnDamageEffects,
  canActorAct,
  canActorUseMagic,
  isActorBerserked,
  applyStatusEffectToActor,
} from "./statusEffectProcessor";

/**
 * Initialize a new battle
 */
export function initializeBattle(
  party: Character[],
  enemies: Enemy[]
): BattleState {
  const battleParty: BattleCharacter[] = party.map((character, index) => ({
    character,
    atb: createATBState(character.stats.speed),
    statusEffects: [],
    position: { x: 50, y: 100 + index * 80 },
  }));

  const battleEnemies: Enemy[] = enemies.map((enemy, index) => ({
    ...enemy,
    atb: createATBState(enemy.stats.speed),
    position: { x: 350, y: 100 + index * 80 },
  }));

  let initialState: BattleState = {
    phase: "intro",
    party: battleParty,
    enemies: battleEnemies,
    activeActorId: null,
    commandQueue: [],
    turnCount: 0,
    battleLog: [{
      timestamp: Date.now(),
      message: "Battle Start!",
      type: "system"
    }],
    glitchLevel: 0,
    isGlitching: false,
  };

  // Process first_strike passive - gives ATB boost at battle start
  const { state: firstStrikeState, logs: firstStrikeLogs } = processFirstStrike(initialState);
  initialState = firstStrikeState;

  // Add first strike logs to battle log
  for (const log of firstStrikeLogs) {
    initialState = addBattleLog(initialState, log, "system");
  }

  return initialState;
}

/**
 * Update all ATB gauges (called every frame)
 */
export function updateATB(state: BattleState, deltaTime: number): BattleState {
  if (state.phase !== "active") {
    return state;
  }

  // Update party ATB with status effect speed modifiers
  const updatedParty = state.party.map(member => {
    if (member.character.stats.hp <= 0) return member;
    const speedMod = getATBSpeedModifier(state, member.character.id);
    return {
      ...member,
      atb: updateGauge(member.atb, deltaTime, speedMod),
    };
  });

  // Update enemy ATB with status effect speed modifiers
  const updatedEnemies = state.enemies.map(enemy => {
    if (enemy.stats.hp <= 0) return enemy;
    const speedMod = getATBSpeedModifier(state, enemy.id);
    return {
      ...enemy,
      atb: updateGauge(enemy.atb, deltaTime, speedMod),
    };
  });

  return {
    ...state,
    party: updatedParty,
    enemies: updatedEnemies,
  };
}

/**
 * Get the next actor who is ready to act (first come first serve)
 */
export function getReadyActor(state: BattleState): string | null {
  // Check party members
  for (const member of state.party) {
    if (member.character.stats.hp > 0 && member.atb.isReady && !member.atb.isActing) {
      return member.character.id;
    }
  }

  // Check enemies
  for (const enemy of state.enemies) {
    if (enemy.stats.hp > 0 && enemy.atb.isReady && !enemy.atb.isActing) {
      return enemy.id;
    }
  }

  return null;
}

/**
 * Check if an actor is a party member
 */
export function isPartyMember(state: BattleState, actorId: string): boolean {
  return state.party.some(m => m.character.id === actorId);
}

/**
 * Queue a command for execution
 */
export function queueCommand(
  state: BattleState,
  actorId: string,
  action: BattleAction
): BattleState {
  const command: BattleCommand = {
    actorId,
    action,
    timestamp: Date.now(),
  };

  // Mark the actor as "acting" to prevent them from being selected again
  let newState = { ...state };

  // Check if actor is a party member
  const partyIndex = state.party.findIndex(m => m.character.id === actorId);
  if (partyIndex >= 0) {
    const newParty = [...state.party];
    const member = newParty[partyIndex];
    // Remove defending status when taking a new action (defending ends on next turn)
    const filteredEffects = member.statusEffects.filter(e => e.id !== "defending");
    newParty[partyIndex] = {
      ...member,
      atb: setActing(member.atb, true),
      statusEffects: filteredEffects,
    };
    newState = { ...newState, party: newParty };
  }

  // Check if actor is an enemy
  const enemyIndex = state.enemies.findIndex(e => e.id === actorId);
  if (enemyIndex >= 0) {
    const newEnemies = [...state.enemies];
    const enemy = newEnemies[enemyIndex];
    // Remove defending status when taking a new action
    const filteredEffects = enemy.statusEffects.filter(e => e.id !== "defending");
    newEnemies[enemyIndex] = {
      ...enemy,
      atb: setActing(enemy.atb, true),
      statusEffects: filteredEffects,
    };
    newState = { ...newState, enemies: newEnemies };
  }

  return {
    ...newState,
    commandQueue: [...newState.commandQueue, command],
    activeActorId: null,
  };
}

/**
 * Execute the next command in the queue
 */
export function executeNextCommand(state: BattleState): BattleState {
  if (state.commandQueue.length === 0) {
    return state;
  }

  const [command, ...remainingQueue] = state.commandQueue;
  let newState = { ...state, commandQueue: remainingQueue };

  // Find the actor
  const partyMember = newState.party.find(m => m.character.id === command.actorId);
  const enemy = newState.enemies.find(e => e.id === command.actorId);

  if (!partyMember && !enemy) {
    return newState;
  }

  // Process status effects at turn start (poison damage, regen healing, etc.)
  const { state: statusState, logs: statusLogs } = processStatusEffectsTurnStart(newState, command.actorId);
  newState = statusState;
  for (const log of statusLogs) {
    const logType = log.includes("damage") ? "damage" : log.includes("regenerate") ? "heal" : "status";
    newState = addBattleLog(newState, log, logType as BattleLogEntry["type"]);
  }

  // Check if actor can still act (might have died from poison or be asleep)
  const actorAfterStatus = partyMember
    ? newState.party.find(m => m.character.id === command.actorId)
    : newState.enemies.find(e => e.id === command.actorId);

  if (actorAfterStatus) {
    const hp = partyMember
      ? (actorAfterStatus as BattleCharacter).character.stats.hp
      : (actorAfterStatus as Enemy).stats.hp;

    if (hp <= 0) {
      // Actor died from status effects, skip their turn
      newState = resetActorATB(newState, command.actorId);
      newState = checkBattleEnd(newState);
      return newState;
    }
  }

  // Check if actor can act (sleep, etc.)
  const { canAct, reason } = canActorAct(newState, command.actorId);
  if (!canAct) {
    const actorName = partyMember ? partyMember.character.name : enemy?.name ?? "Unknown";
    newState = addBattleLog(newState, `${actorName} ${reason}`, "status");
    newState = resetActorATB(newState, command.actorId);
    return newState;
  }

  // Process turn-start passives for party members (hp_regen, mp_regen from lattice)
  if (partyMember) {
    const { state: regenState, logs: regenLogs } = processTurnStartPassives(newState, command.actorId);
    newState = regenState;
    for (const log of regenLogs) {
      newState = addBattleLog(newState, log, "heal");
    }
  }

  // Execute based on action type
  switch (command.action.type) {
    case "attack":
      newState = executeAttack(newState, command.actorId, command.action.targetId);
      break;
    case "magic":
      newState = executeMagic(
        newState,
        command.actorId,
        command.action.abilityId,
        command.action.targetId
      );
      break;
    case "item":
      newState = executeItem(
        newState,
        command.actorId,
        command.action.itemId,
        command.action.targetId
      );
      break;
    case "defend":
      newState = executeDefend(newState, command.actorId);
      break;
    case "flee":
      newState = executeFlee(newState);
      break;
  }

  // Reset actor's ATB
  newState = resetActorATB(newState, command.actorId);

  // Check for victory/defeat
  newState = checkBattleEnd(newState);

  return newState;
}

/**
 * Execute a basic attack
 */
function executeAttack(
  state: BattleState,
  actorId: string,
  targetId: string
): BattleState {
  const actor = getActor(state, actorId);
  const target = getActor(state, targetId);

  if (!actor || !target) return state;

  // Use effective stats (base + equipment + shards) for party members
  const actorStats = "character" in actor
    ? getEffectiveStats(actor.character)
    : actor.stats;
  const targetStats = "character" in target
    ? getEffectiveStats(target.character)
    : target.stats;
  const actorName = "character" in actor ? actor.character.name : actor.name;
  const targetName = "character" in target ? target.character.name : target.name;

  // Get status effects for damage modifiers
  const attackerEffects = "character" in actor ? actor.statusEffects : (actor as Enemy).statusEffects;
  const defenderEffects = "character" in target ? target.statusEffects : (target as Enemy).statusEffects;
  const { attackMod, defenseMod, missChance } = getPhysicalDamageModifier(attackerEffects, defenderEffects);

  // Get crit bonus from passives and shards
  let critBonus = 0;
  if ("character" in actor) {
    critBonus = getCritBonus(actor as BattleCharacter) +
      getShardEffectValue(actor.character, "crit_bonus");
  }

  // Calculate damage (weapon attack is now included in effective strength)
  const result = calculatePhysicalDamage(actorStats, targetStats, 0, critBonus);
  let newState = state;

  // Check for blind miss chance
  if (missChance > 0 && Math.random() < missChance) {
    newState = addBattleLog(newState, `${actorName} attacks ${targetName}... but can't see! Miss!`, "action");
    return newState;
  }

  if (result.isDodged) {
    newState = addBattleLog(newState, `${actorName} attacks ${targetName}... Miss!`, "action");
  } else {
    // Apply status effect modifiers to damage
    let finalDamage = Math.floor(result.damage * attackMod * defenseMod);

    // Process defensive passives if target is a party member
    const { damage: modifiedDamage, logs: defenseLogs } = processDefensivePassives(newState, targetId, finalDamage);
    finalDamage = modifiedDamage;

    // Add defensive passive logs
    for (const log of defenseLogs) {
      newState = addBattleLog(newState, log, "action");
    }

    // Apply the damage
    newState = applyDamage(newState, targetId, finalDamage);

    // Process on-damage status effects (wake from sleep, etc.)
    const { state: onDamageState, logs: onDamageLogs } = processOnDamageEffects(newState, targetId);
    newState = onDamageState;
    for (const log of onDamageLogs) {
      newState = addBattleLog(newState, log, "status");
    }

    const critText = result.isCritical ? " Critical hit!" : "";
    newState = addBattleLog(
      newState,
      `${actorName} attacks ${targetName} for ${finalDamage} damage!${critText}`,
      "damage"
    );

    // Process lifesteal from shards if attacker is a party member
    if ("character" in actor) {
      const lifesteal = getShardEffectValue(actor.character, "lifesteal");
      if (lifesteal > 0 && finalDamage > 0) {
        const healAmount = Math.floor(finalDamage * lifesteal / 100);
        if (healAmount > 0) {
          newState = applyHealing(newState, actorId, healAmount);
          newState = addBattleLog(
            newState,
            `${actorName} drains ${healAmount} HP!`,
            "heal"
          );
        }
      }
    }

    // Check for counter-attack if target is a party member and attacker is an enemy
    if (!("character" in actor)) {
      const { shouldCounter, logs: counterLogs } = processCounterCheck(newState, targetId, actorId);
      for (const log of counterLogs) {
        newState = addBattleLog(newState, log, "action");
      }

      if (shouldCounter) {
        // Execute counter-attack (simplified - basic attack back)
        newState = executeCounterAttack(newState, targetId, actorId);
      }
    }
  }

  return newState;
}

/**
 * Execute a counter-attack (simplified attack without triggering another counter)
 */
function executeCounterAttack(
  state: BattleState,
  counterId: string,
  targetId: string
): BattleState {
  const counter = getActor(state, counterId);
  const target = getActor(state, targetId);

  if (!counter || !target) return state;
  if (!("character" in counter)) return state; // Only party members can counter

  // Use effective stats (equipment bonuses are now in strength)
  const counterStats = getEffectiveStats(counter.character);
  const targetStats = "character" in target
    ? getEffectiveStats(target.character)
    : target.stats;
  const counterName = counter.character.name;
  const targetName = "character" in target ? target.character.name : target.name;

  // Calculate damage (no crit bonus for counter-attacks, weapon attack in strength)
  const result = calculatePhysicalDamage(counterStats, targetStats, 0, 0);
  let newState = state;

  if (!result.isDodged) {
    newState = applyDamage(newState, targetId, result.damage);
    newState = addBattleLog(
      newState,
      `${counterName}'s counter hits ${targetName} for ${result.damage} damage!`,
      "damage"
    );
  }

  return newState;
}

/**
 * Execute a magic/ability
 */
function executeMagic(
  state: BattleState,
  actorId: string,
  abilityId: string,
  targetId: string | string[]
): BattleState {
  const actor = getActor(state, actorId);
  if (!actor) return state;

  const abilities = "character" in actor ? actor.character.abilities : actor.abilities;
  const ability = abilities.find(a => a.id === abilityId);
  if (!ability) return state;

  // Handle steal ability specially
  if (abilityId === "steal") {
    return executeSteal(state, actorId, Array.isArray(targetId) ? targetId[0] : targetId);
  }

  const actorName = "character" in actor ? actor.character.name : actor.name;
  let newState = state;

  // Deduct MP
  newState = modifyMP(newState, actorId, -ability.mpCost);

  const targetIds = Array.isArray(targetId) ? targetId : [targetId];

  // Handle status-only abilities (no damage, just apply status effects)
  if (ability.isStatusOnly) {
    for (const tid of targetIds) {
      const targetName = getActorName(newState, tid);

      // Apply status effects
      if (ability.statusEffects) {
        const { state: effectState, logs: effectLogs } = applyAbilityStatusEffects(
          newState,
          ability,
          actorId,
          tid
        );
        newState = effectState;

        // If no status effects were applied, show generic message
        if (effectLogs.length === 0) {
          newState = addBattleLog(
            newState,
            `${actorName} uses ${ability.name} on ${targetName}!`,
            "action"
          );
        } else {
          // Show the status effect logs
          for (const log of effectLogs) {
            newState = addBattleLog(newState, log, "status");
          }
        }
      } else {
        newState = addBattleLog(
          newState,
          `${actorName} uses ${ability.name} on ${targetName}!`,
          "action"
        );
      }
    }
    return newState;
  }

  // Handle healing abilities (support type with power > 0)
  if (ability.type === "support" && ability.power > 0) {
    for (const tid of targetIds) {
      // Use effective stats for healing calculations
      const healerStats = "character" in actor
        ? getEffectiveStats(actor.character)
        : actor.stats;
      const healAmount = calculateHealing(healerStats, ability.power);
      newState = applyHealing(newState, tid, healAmount);
      const targetName = getActorName(newState, tid);
      newState = addBattleLog(
        newState,
        `${actorName} uses ${ability.name} on ${targetName}! Recovered ${healAmount} HP!`,
        "heal"
      );

      // Apply any status effects from healing abilities
      if (ability.statusEffects) {
        const { state: effectState, logs: effectLogs } = applyAbilityStatusEffects(
          newState,
          ability,
          actorId,
          tid
        );
        newState = effectState;
        for (const log of effectLogs) {
          newState = addBattleLog(newState, log, "status");
        }
      }
    }
    return newState;
  }

  // Handle damage abilities
  for (const tid of targetIds) {
    const target = getActor(newState, tid);
    if (!target) continue;

    const result = calculateAbilityDamage(actor as never, target as never, ability);
    newState = applyDamage(newState, tid, result.damage);

    const targetName = "character" in target ? target.character.name : target.name;
    newState = addBattleLog(
      newState,
      `${actorName} casts ${ability.name} on ${targetName} for ${result.damage} damage!`,
      "damage"
    );

    // Apply any status effects from damage abilities
    if (ability.statusEffects) {
      const { state: effectState, logs: effectLogs } = applyAbilityStatusEffects(
        newState,
        ability,
        actorId,
        tid
      );
      newState = effectState;
      for (const log of effectLogs) {
        newState = addBattleLog(newState, log, "status");
      }
    }
  }

  return newState;
}

/**
 * Apply status effects from an ability
 */
function applyAbilityStatusEffects(
  state: BattleState,
  ability: Ability,
  actorId: string,
  targetId: string
): { state: BattleState; logs: string[] } {
  const logs: string[] = [];
  let newState = state;

  if (!ability.statusEffects) {
    return { state: newState, logs };
  }

  const actorName = getActorName(state, actorId);
  const targetName = getActorName(state, targetId);

  for (const effectConfig of ability.statusEffects) {
    // Determine actual target based on targetType
    let effectTargetId = targetId;
    if (effectConfig.targetType === "self") {
      effectTargetId = actorId;
    }
    // For "allies" and "enemies" targetTypes, we'd need to handle all targets
    // For now, we just handle single target

    // Roll for chance
    if (Math.random() * 100 >= effectConfig.chance) {
      // Effect didn't proc
      if (effectConfig.chance < 100) {
        logs.push(`${targetName} resisted ${ability.name}!`);
      }
      continue;
    }

    // Create the status effect
    const effect: StatusEffect = {
      id: effectConfig.statusId,
      name: effectConfig.statusId.charAt(0).toUpperCase() + effectConfig.statusId.slice(1),
      type: getStatusEffectType(effectConfig.statusId),
      duration: effectConfig.duration ?? 3,
      power: effectConfig.power,
    };

    // Apply to target
    const { state: appliedState, success, log } = applyStatusEffectToActor(
      newState,
      effectTargetId,
      effect
    );
    newState = appliedState;

    if (success) {
      const effectTargetName = effectConfig.targetType === "self" ? actorName : targetName;
      logs.push(`${actorName} uses ${ability.name}! ${effectTargetName} is now ${effect.name.toLowerCase()}!`);
    }
  }

  return { state: newState, logs };
}

/**
 * Get the status effect type from its ID
 */
function getStatusEffectType(statusId: string): StatusEffect["type"] {
  const debuffs = ["poison", "slow", "sleep", "blind", "silence"];
  const buffs = ["regen", "haste", "protect", "shell", "defending"];
  const dots = ["poison"];

  if (dots.includes(statusId)) return "dot";
  if (debuffs.includes(statusId)) return "debuff";
  if (buffs.includes(statusId)) return "buff";
  return "special";
}

/**
 * Execute item use
 */
function executeItem(
  state: BattleState,
  actorId: string,
  itemId: string,
  targetId: string
): BattleState {
  const actorName = getActorName(state, actorId);
  const targetName = getActorName(state, targetId);
  const item = getItemById(itemId);

  if (!item || !item.effect) {
    return addBattleLog(state, `${actorName} tries to use an item, but nothing happens!`, "action");
  }

  let newState = state;
  const effect = item.effect;

  switch (effect.type) {
    case "heal_hp": {
      const healAmount = effect.power ?? 50;
      newState = applyHealing(newState, targetId, healAmount);
      newState = addBattleLog(
        newState,
        `${actorName} uses ${item.name} on ${targetName}! Restored ${healAmount} HP!`,
        "heal"
      );
      break;
    }
    case "heal_mp": {
      const mpAmount = effect.power ?? 30;
      newState = restoreMP(newState, targetId, mpAmount);
      newState = addBattleLog(
        newState,
        `${actorName} uses ${item.name} on ${targetName}! Restored ${mpAmount} MP!`,
        "heal"
      );
      break;
    }
    case "revive": {
      // Only works on KO'd party members
      const partyIndex = state.party.findIndex(m => m.character.id === targetId);
      if (partyIndex >= 0 && state.party[partyIndex].character.stats.hp <= 0) {
        const reviveHp = Math.floor(state.party[partyIndex].character.stats.maxHp * (effect.power ?? 10) / 100);
        newState = applyHealing(newState, targetId, reviveHp);
        newState = addBattleLog(
          newState,
          `${actorName} uses ${item.name}! ${targetName} is revived with ${reviveHp} HP!`,
          "heal"
        );
      } else {
        newState = addBattleLog(newState, `${item.name} has no effect on ${targetName}!`, "action");
      }
      break;
    }
    case "cure_status": {
      // Remove negative status effects (debuffs and DoTs)
      const partyIndex = state.party.findIndex(m => m.character.id === targetId);
      if (partyIndex >= 0) {
        const newParty = [...state.party];
        newParty[partyIndex] = {
          ...newParty[partyIndex],
          statusEffects: newParty[partyIndex].statusEffects.filter(e => e.type !== "debuff" && e.type !== "dot")
        };
        newState = { ...newState, party: newParty };
        newState = addBattleLog(newState, `${actorName} uses ${item.name} on ${targetName}! Status effects cured!`, "action");
      }
      break;
    }
    default:
      newState = addBattleLog(newState, `${actorName} uses ${item.name} on ${targetName}!`, "action");
  }

  return newState;
}

/**
 * Restore MP to a target
 */
function restoreMP(state: BattleState, targetId: string, amount: number): BattleState {
  const partyIndex = state.party.findIndex(m => m.character.id === targetId);
  if (partyIndex >= 0) {
    const newParty = [...state.party];
    const member = newParty[partyIndex];
    newParty[partyIndex] = {
      ...member,
      character: {
        ...member.character,
        stats: {
          ...member.character.stats,
          mp: Math.min(member.character.stats.maxMp, member.character.stats.mp + amount)
        }
      }
    };
    return { ...state, party: newParty };
  }
  return state;
}

/**
 * Execute defend - adds "defending" status that halves incoming damage
 */
function executeDefend(state: BattleState, actorId: string): BattleState {
  const actorName = getActorName(state, actorId);
  let newState = state;

  // Add defending status to party member
  const partyIndex = state.party.findIndex(m => m.character.id === actorId);
  if (partyIndex >= 0) {
    const newParty = [...state.party];
    const member = newParty[partyIndex];
    // Remove any existing defending status and add fresh one
    const filteredEffects = member.statusEffects.filter(e => e.id !== "defending");
    newParty[partyIndex] = {
      ...member,
      statusEffects: [
        ...filteredEffects,
        {
          id: "defending",
          name: "Defending",
          type: "buff",
          duration: 1, // Lasts until next turn
          power: 50, // 50% damage reduction
        }
      ]
    };
    newState = { ...newState, party: newParty };
  }

  // Add defending status to enemy (in case enemies can defend)
  const enemyIndex = state.enemies.findIndex(e => e.id === actorId);
  if (enemyIndex >= 0) {
    const newEnemies = [...state.enemies];
    const enemy = newEnemies[enemyIndex];
    const filteredEffects = enemy.statusEffects.filter(e => e.id !== "defending");
    newEnemies[enemyIndex] = {
      ...enemy,
      statusEffects: [
        ...filteredEffects,
        {
          id: "defending",
          name: "Defending",
          type: "buff",
          duration: 1,
          power: 50,
        }
      ]
    };
    newState = { ...newState, enemies: newEnemies };
  }

  return addBattleLog(newState, `${actorName} takes a defensive stance!`, "action");
}

/**
 * Execute steal attempt (enemy steals from player)
 * Uses rarity-based resistance system - higher rarity items are harder to steal
 */
function executeSteal(
  state: BattleState,
  actorId: string,
  targetId: string
): BattleState {
  const actor = getActor(state, actorId);
  const target = getActor(state, targetId);

  if (!actor || !target) return state;

  const actorName = "character" in actor ? actor.character.name : actor.name;
  const targetName = "character" in target ? target.character.name : target.name;

  let newState = state;

  // Get thief's luck stat
  const thiefLuck = "character" in actor ? actor.character.stats.luck : actor.stats.luck;

  // Get target's luck stat
  const targetLuck = "character" in target ? target.character.stats.luck : target.stats.luck;

  // 30% chance to attempt nothing (fumble)
  if (Math.random() < 0.30) {
    return addBattleLog(
      newState,
      `${actorName} tries to steal from ${targetName}... but fumbles!`,
      "action"
    );
  }

  // Get stealable items from the game store (we need to access inventory)
  // Since we can't directly access the store here, we'll use a workaround
  // by checking if target is a party member and accessing their inventory indirectly

  // For enemy stealing from party - we need to dispatch an event that the UI will handle
  // For now, we'll simulate the steal by checking against common items

  // Calculate base steal success based on luck comparison
  // Higher target luck = harder to steal from
  const baseLuckDiff = thiefLuck - targetLuck;
  let stealAttemptSuccess = 0.5 + (baseLuckDiff * 0.02); // ±2% per luck point difference
  stealAttemptSuccess = Math.max(0.15, Math.min(0.85, stealAttemptSuccess)); // 15%-85%

  // Emit a steal event that BattleScreen will handle
  // We'll add a special log entry type that signals a steal attempt
  const stealEventData = {
    thiefId: actorId,
    targetId: targetId,
    thiefLuck: thiefLuck,
    targetLuck: targetLuck,
  };

  // Add a special battle log entry that contains steal data
  // The BattleScreen will parse this and handle the actual item removal
  newState = {
    ...newState,
    battleLog: [
      ...newState.battleLog,
      {
        timestamp: Date.now(),
        message: `STEAL_ATTEMPT:${JSON.stringify(stealEventData)}`,
        type: "action" as const,
      }
    ],
    // Store pending steal event for the UI to process
    pendingStealEvent: stealEventData,
  };

  return newState;
}

/**
 * Execute flee attempt
 */
function executeFlee(state: BattleState): BattleState {
  const partyAvgSpeed = state.party.reduce(
    (sum, m) => sum + m.character.stats.speed, 0
  ) / state.party.length;
  const enemyAvgSpeed = state.enemies.reduce(
    (sum, e) => sum + e.stats.speed, 0
  ) / state.enemies.length;

  const fleeChance = calculateFleeChance(partyAvgSpeed, enemyAvgSpeed);

  if (Math.random() < fleeChance) {
    return {
      ...addBattleLog(state, "Got away safely!", "system"),
      phase: "fled"
    };
  }

  return addBattleLog(state, "Couldn't escape!", "system");
}

/**
 * Process enemy turn (AI selects action)
 */
export function processEnemyTurn(state: BattleState, enemyId: string): BattleState {
  const enemy = state.enemies.find(e => e.id === enemyId);
  if (!enemy || enemy.stats.hp <= 0) return state;

  const action = selectEnemyAction(enemy, state);
  return queueCommand(state, enemyId, action);
}

/**
 * Check for battle end conditions
 */
export function checkBattleEnd(state: BattleState): BattleState {
  const partyAlive = state.party.some(m => m.character.stats.hp > 0);
  const enemiesAlive = state.enemies.some(e => e.stats.hp > 0);

  if (!partyAlive) {
    return {
      ...addBattleLog(state, "Party defeated...", "system"),
      phase: "defeat"
    };
  }

  if (!enemiesAlive) {
    const totalExp = state.enemies.reduce((sum, e) => sum + e.experience, 0);
    const totalGold = state.enemies.reduce((sum, e) => sum + e.gold, 0);
    return {
      ...addBattleLog(state, `Victory! Gained ${totalExp} EXP and ${totalGold} gold!`, "system"),
      phase: "victory"
    };
  }

  return state;
}

/**
 * Start the active battle phase
 */
export function startBattle(state: BattleState): BattleState {
  return {
    ...state,
    phase: "active"
  };
}

// Helper functions

function getActor(state: BattleState, id: string): BattleCharacter | Enemy | null {
  const partyMember = state.party.find(m => m.character.id === id);
  if (partyMember) return partyMember;

  const enemy = state.enemies.find(e => e.id === id);
  return enemy ?? null;
}

function getActorName(state: BattleState, id: string): string {
  const actor = getActor(state, id);
  if (!actor) return "Unknown";
  return "character" in actor ? actor.character.name : actor.name;
}

function applyDamage(state: BattleState, targetId: string, damage: number): BattleState {
  // Check if target is party member
  const partyIndex = state.party.findIndex(m => m.character.id === targetId);
  if (partyIndex >= 0) {
    const newParty = [...state.party];
    const member = newParty[partyIndex];

    // Check if defending - halve incoming damage
    const isDefending = member.statusEffects.some(e => e.id === "defending");
    const finalDamage = isDefending ? Math.floor(damage * 0.5) : damage;

    newParty[partyIndex] = {
      ...member,
      character: {
        ...member.character,
        stats: {
          ...member.character.stats,
          hp: Math.max(0, member.character.stats.hp - finalDamage)
        }
      }
    };
    return { ...state, party: newParty };
  }

  // Check if target is enemy
  const enemyIndex = state.enemies.findIndex(e => e.id === targetId);
  if (enemyIndex >= 0) {
    const newEnemies = [...state.enemies];
    const enemy = newEnemies[enemyIndex];

    // Check if defending - halve incoming damage
    const isDefending = enemy.statusEffects.some(e => e.id === "defending");
    const finalDamage = isDefending ? Math.floor(damage * 0.5) : damage;

    newEnemies[enemyIndex] = {
      ...enemy,
      stats: {
        ...enemy.stats,
        hp: Math.max(0, enemy.stats.hp - finalDamage)
      }
    };
    return { ...state, enemies: newEnemies };
  }

  return state;
}

function applyHealing(state: BattleState, targetId: string, amount: number): BattleState {
  const partyIndex = state.party.findIndex(m => m.character.id === targetId);
  if (partyIndex >= 0) {
    const newParty = [...state.party];
    const member = newParty[partyIndex];
    newParty[partyIndex] = {
      ...member,
      character: {
        ...member.character,
        stats: {
          ...member.character.stats,
          hp: Math.min(member.character.stats.maxHp, member.character.stats.hp + amount)
        }
      }
    };
    return { ...state, party: newParty };
  }

  return state;
}

function modifyMP(state: BattleState, actorId: string, amount: number): BattleState {
  const partyIndex = state.party.findIndex(m => m.character.id === actorId);
  if (partyIndex >= 0) {
    const newParty = [...state.party];
    const member = newParty[partyIndex];
    newParty[partyIndex] = {
      ...member,
      character: {
        ...member.character,
        stats: {
          ...member.character.stats,
          mp: Math.max(0, member.character.stats.mp + amount)
        }
      }
    };
    return { ...state, party: newParty };
  }

  const enemyIndex = state.enemies.findIndex(e => e.id === actorId);
  if (enemyIndex >= 0) {
    const newEnemies = [...state.enemies];
    const enemy = newEnemies[enemyIndex];
    newEnemies[enemyIndex] = {
      ...enemy,
      stats: {
        ...enemy.stats,
        mp: Math.max(0, enemy.stats.mp + amount)
      }
    };
    return { ...state, enemies: newEnemies };
  }

  return state;
}

function resetActorATB(state: BattleState, actorId: string): BattleState {
  const partyIndex = state.party.findIndex(m => m.character.id === actorId);
  if (partyIndex >= 0) {
    const newParty = [...state.party];
    newParty[partyIndex] = {
      ...newParty[partyIndex],
      atb: resetGauge(newParty[partyIndex].atb)
    };
    return { ...state, party: newParty };
  }

  const enemyIndex = state.enemies.findIndex(e => e.id === actorId);
  if (enemyIndex >= 0) {
    const newEnemies = [...state.enemies];
    newEnemies[enemyIndex] = {
      ...newEnemies[enemyIndex],
      atb: resetGauge(newEnemies[enemyIndex].atb)
    };
    return { ...state, enemies: newEnemies };
  }

  return state;
}

function addBattleLog(
  state: BattleState,
  message: string,
  type: BattleLogEntry["type"]
): BattleState {
  return {
    ...state,
    battleLog: [
      ...state.battleLog,
      { timestamp: Date.now(), message, type }
    ]
  };
}

function calculatePhysicalDamage(
  attacker: { strength: number; luck: number; speed: number },
  defender: { defense: number; speed: number },
  weaponAttack: number,
  critBonus: number = 0 // Additional crit chance from passives (0-100 scale)
): DamageResult {
  const base = attacker.strength + weaponAttack;
  const variance = 0.875 + Math.random() * 0.25;
  const rawDamage = Math.floor((base * base) / 16 * variance);
  const defense = Math.floor(defender.defense / 2);
  const damage = Math.max(1, rawDamage - defense);

  // Base crit chance from luck + passive bonus
  const baseCritChance = (attacker.luck / 100) * 0.15; // Max ~15% from luck
  const passiveCritChance = critBonus / 100; // Convert from 0-100 to 0-1
  const critChance = Math.min(0.5, baseCritChance + passiveCritChance); // Cap at 50%
  const isCritical = Math.random() < critChance;

  const dodgeChance = Math.max(0, (defender.speed - attacker.speed) / 200);
  const isDodged = Math.random() < dodgeChance;

  return {
    damage: isCritical ? Math.floor(damage * 1.5) : damage,
    isCritical,
    isDodged,
    isBlocked: false,
  };
}
