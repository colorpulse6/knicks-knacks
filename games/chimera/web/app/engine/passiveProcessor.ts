// Passive Processor - Handles lattice passive effects during battle
// Processes character.activePassives array and applies effects at appropriate battle phases

import type { BattleState, BattleCharacter, Enemy } from "../types/battle";
import type { PassiveEffectType, PassiveRoutine } from "../types/lattice";
import { getPassiveById } from "../data/lattices";

/**
 * Result of aggregating all passives of the same type
 */
export interface AggregatedPassive {
  type: PassiveEffectType;
  totalValue: number; // Sum of all passive values of this type
  sources: string[]; // Passive IDs contributing
}

/**
 * Get all active passives for a party member, aggregated by type
 */
export function getAggregatedPassives(member: BattleCharacter): Map<PassiveEffectType, AggregatedPassive> {
  const aggregated = new Map<PassiveEffectType, AggregatedPassive>();

  const activePassives = member.character.activePassives ?? [];

  for (const passiveId of activePassives) {
    const passive = getPassiveById(passiveId);
    if (!passive) continue;

    // Check condition (if any)
    if (passive.condition && !checkPassiveCondition(passive.condition, member)) {
      continue;
    }

    const existing = aggregated.get(passive.type);
    if (existing) {
      existing.totalValue += passive.value;
      existing.sources.push(passiveId);
    } else {
      aggregated.set(passive.type, {
        type: passive.type,
        totalValue: passive.value,
        sources: [passiveId],
      });
    }
  }

  return aggregated;
}

/**
 * Check if a passive's condition is met
 */
function checkPassiveCondition(
  condition: "low_hp" | "full_hp" | "buffed",
  member: BattleCharacter
): boolean {
  const stats = member.character.stats;

  switch (condition) {
    case "low_hp":
      return stats.hp <= stats.maxHp * 0.25; // Below 25% HP
    case "full_hp":
      return stats.hp === stats.maxHp;
    case "buffed":
      return member.statusEffects.some(e => e.type === "buff");
    default:
      return true;
  }
}

/**
 * Get a specific passive value for a party member (summed if multiple sources)
 */
export function getPassiveValue(member: BattleCharacter, type: PassiveEffectType): number {
  const passives = getAggregatedPassives(member);
  return passives.get(type)?.totalValue ?? 0;
}

/**
 * Check if a character has any passive of a given type
 */
export function hasPassive(member: BattleCharacter, type: PassiveEffectType): boolean {
  return getPassiveValue(member, type) > 0;
}

// ============================================
// BATTLE PHASE PROCESSORS
// ============================================

/**
 * Process turn-start passives (regeneration)
 * Called when a party member's ATB fills and they're about to act
 */
export function processTurnStartPassives(
  state: BattleState,
  actorId: string
): { state: BattleState; logs: string[] } {
  const logs: string[] = [];
  let newState = state;

  const partyIndex = state.party.findIndex(m => m.character.id === actorId);
  if (partyIndex < 0) {
    return { state, logs }; // Not a party member, skip
  }

  const member = state.party[partyIndex];
  const passives = getAggregatedPassives(member);

  // HP Regeneration
  const hpRegen = passives.get("hp_regen");
  if (hpRegen && member.character.stats.hp < member.character.stats.maxHp) {
    const healAmount = Math.min(
      hpRegen.totalValue,
      member.character.stats.maxHp - member.character.stats.hp
    );
    if (healAmount > 0) {
      newState = applyPassiveHealing(newState, partyIndex, healAmount, "hp");
      logs.push(`${member.character.name} regenerates ${healAmount} HP!`);
    }
  }

  // MP Regeneration
  const mpRegen = passives.get("mp_regen");
  if (mpRegen && member.character.stats.mp < member.character.stats.maxMp) {
    const mpAmount = Math.min(
      mpRegen.totalValue,
      member.character.stats.maxMp - member.character.stats.mp
    );
    if (mpAmount > 0) {
      newState = applyPassiveHealing(newState, partyIndex, mpAmount, "mp");
      logs.push(`${member.character.name} recovers ${mpAmount} MP!`);
    }
  }

  return { state: newState, logs };
}

/**
 * Apply passive healing to a party member
 */
function applyPassiveHealing(
  state: BattleState,
  partyIndex: number,
  amount: number,
  type: "hp" | "mp"
): BattleState {
  const newParty = [...state.party];
  const member = newParty[partyIndex];

  if (type === "hp") {
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
  } else {
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
  }

  return { ...state, party: newParty };
}

/**
 * Calculate crit bonus from passives
 * Returns additional crit chance (0-100 scale, e.g., 5 = +5%)
 */
export function getCritBonus(member: BattleCharacter): number {
  return getPassiveValue(member, "crit_bonus");
}

/**
 * Calculate flat damage reduction from passives
 * Returns percentage reduction (0-100 scale)
 */
export function getDamageReduction(member: BattleCharacter): number {
  return getPassiveValue(member, "damage_reduction");
}

/**
 * Check if auto-guard triggers
 * Returns true if the attack should be partially blocked
 */
export function checkAutoGuard(member: BattleCharacter): boolean {
  const autoGuardChance = getPassiveValue(member, "auto_guard");
  if (autoGuardChance <= 0) return false;

  return Math.random() * 100 < autoGuardChance;
}

/**
 * Check if counter-attack triggers
 * Returns true if the defender should counter
 */
export function checkCounterChance(member: BattleCharacter): boolean {
  const counterChance = getPassiveValue(member, "counter_chance");
  if (counterChance <= 0) return false;

  return Math.random() * 100 < counterChance;
}

/**
 * Check if status effect is resisted
 * Returns true if the status should NOT be applied
 */
export function checkStatusResist(member: BattleCharacter): boolean {
  const resistChance = getPassiveValue(member, "status_resist");
  if (resistChance <= 0) return false;

  return Math.random() * 100 < resistChance;
}

/**
 * Process first-strike at battle initialization
 * Returns modified state with ATB bonuses for party members with first_strike
 */
export function processFirstStrike(state: BattleState): { state: BattleState; logs: string[] } {
  const logs: string[] = [];
  const newParty = [...state.party];
  let anyFirstStrike = false;

  for (let i = 0; i < newParty.length; i++) {
    const member = newParty[i];
    const firstStrikeChance = getPassiveValue(member, "first_strike");

    if (firstStrikeChance > 0 && Math.random() * 100 < firstStrikeChance) {
      // Give a significant ATB boost (50-75% of gauge)
      const atbBoost = 50 + Math.random() * 25;
      newParty[i] = {
        ...member,
        atb: {
          ...member.atb,
          gauge: Math.min(100, member.atb.gauge + atbBoost),
          isReady: member.atb.gauge + atbBoost >= 100,
        }
      };
      logs.push(`${member.character.name} gets the jump on the enemy!`);
      anyFirstStrike = true;
    }
  }

  if (!anyFirstStrike) {
    return { state, logs };
  }

  return { state: { ...state, party: newParty }, logs };
}

/**
 * Process damage modification passives
 * Called when damage is about to be applied to a party member
 * Returns modified damage amount and any log messages
 */
export function processDefensivePassives(
  state: BattleState,
  targetId: string,
  baseDamage: number
): { damage: number; logs: string[]; autoGuardTriggered: boolean } {
  const logs: string[] = [];
  let damage = baseDamage;
  let autoGuardTriggered = false;

  const partyIndex = state.party.findIndex(m => m.character.id === targetId);
  if (partyIndex < 0) {
    return { damage, logs, autoGuardTriggered }; // Not a party member
  }

  const member = state.party[partyIndex];

  // Check auto-guard (chance to reduce damage)
  if (checkAutoGuard(member)) {
    damage = Math.floor(damage * 0.5);
    logs.push(`${member.character.name}'s instincts kick in! Damage halved!`);
    autoGuardTriggered = true;
  }

  // Apply flat damage reduction (always active if present)
  const damageReduction = getDamageReduction(member);
  if (damageReduction > 0) {
    const reduction = Math.floor(damage * (damageReduction / 100));
    damage = Math.max(1, damage - reduction);
  }

  return { damage, logs, autoGuardTriggered };
}

/**
 * Check if a counter-attack should occur after being hit
 * Returns the counter attack info if triggered
 */
export function processCounterCheck(
  state: BattleState,
  defenderId: string,
  attackerId: string
): { shouldCounter: boolean; logs: string[] } {
  const logs: string[] = [];

  const partyIndex = state.party.findIndex(m => m.character.id === defenderId);
  if (partyIndex < 0) {
    return { shouldCounter: false, logs }; // Only party members can counter
  }

  const member = state.party[partyIndex];

  // Check if character is still alive
  if (member.character.stats.hp <= 0) {
    return { shouldCounter: false, logs };
  }

  // Check counter chance
  if (checkCounterChance(member)) {
    logs.push(`${member.character.name} counterattacks!`);
    return { shouldCounter: true, logs };
  }

  return { shouldCounter: false, logs };
}

/**
 * Get all passive info for display in UI
 */
export function getPassiveDisplayInfo(member: BattleCharacter): PassiveRoutine[] {
  const activePassives = member.character.activePassives ?? [];
  const passives: PassiveRoutine[] = [];

  for (const passiveId of activePassives) {
    const passive = getPassiveById(passiveId);
    if (passive) {
      passives.push(passive);
    }
  }

  return passives;
}
