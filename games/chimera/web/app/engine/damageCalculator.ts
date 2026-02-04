// Damage Calculator - FF6-inspired damage formulas
// Core damage functions are in types/battle.ts, this file has additional utilities

import type { Stats, Character, Ability, StatusEffect } from "../types";
import type { Enemy, DamageResult } from "../types/battle";
import { getEffectiveStats } from "./equipmentEngine";

// Re-export core damage functions
export { calculatePhysicalDamage, calculateMagicDamage } from "../types/battle";

/**
 * Calculate healing amount for cure spells
 */
export function calculateHealing(
  caster: Stats,
  spellPower: number
): number {
  const base = caster.magic + spellPower;
  const variance = 0.9 + Math.random() * 0.2; // 90% - 110%
  return Math.floor(base * variance);
}

/**
 * Calculate ability damage based on ability type
 * Now uses effective stats (base + equipment + shards)
 */
export function calculateAbilityDamage(
  attacker: Character | Enemy,
  defender: Character | Enemy,
  ability: Ability
): DamageResult {
  // Use effective stats for party members (includes equipment bonuses)
  const attackerStats = "character" in attacker
    ? getEffectiveStats((attacker as { character: Character }).character)
    : attacker.stats;
  const defenderStats = "character" in defender
    ? getEffectiveStats((defender as { character: Character }).character)
    : defender.stats;

  // Equipment attack is now included in effective strength, so just add ability power
  switch (ability.type) {
    case "physical":
      return calculatePhysicalDamageWithWeapon(
        attackerStats,
        defenderStats,
        ability.power
      );
    case "magic":
      return calculateMagicDamageFromStats(attackerStats, defenderStats, ability.power);
    case "special":
      // Special abilities ignore some defense
      return calculateSpecialDamage(attackerStats, defenderStats, ability.power);
    default:
      return { damage: 0, isCritical: false, isDodged: false, isBlocked: false };
  }
}

/**
 * Physical damage with weapon attack
 */
function calculatePhysicalDamageWithWeapon(
  attacker: Stats,
  defender: Stats,
  totalAttack: number
): DamageResult {
  const base = attacker.strength + totalAttack;
  const variance = 0.875 + Math.random() * 0.25;
  const rawDamage = Math.floor((base * base) / 16 * variance);
  const defense = Math.floor(defender.defense / 2);
  const damage = Math.max(1, rawDamage - defense);

  const critChance = (attacker.luck / 100) * 0.15;
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

/**
 * Magic damage calculation
 */
function calculateMagicDamageFromStats(
  attacker: Stats,
  defender: Stats,
  spellPower: number
): DamageResult {
  const base = attacker.magic + spellPower;
  const variance = 0.875 + Math.random() * 0.25;
  const rawDamage = Math.floor((base * base) / 32 * variance);
  const magicDefense = Math.floor(defender.magicDefense / 2);
  const damage = Math.max(1, rawDamage - magicDefense);

  return {
    damage,
    isCritical: false,
    isDodged: false,
    isBlocked: false,
  };
}

/**
 * Special ability damage (ignores 50% defense)
 */
function calculateSpecialDamage(
  attacker: Stats,
  defender: Stats,
  power: number
): DamageResult {
  const base = attacker.strength + attacker.magic + power;
  const variance = 0.875 + Math.random() * 0.25;
  const rawDamage = Math.floor((base * base) / 24 * variance);
  const defense = Math.floor(defender.defense / 4); // Less defense applied
  const damage = Math.max(1, rawDamage - defense);

  const critChance = (attacker.luck / 100) * 0.2; // Higher crit chance for specials
  const isCritical = Math.random() < critChance;

  return {
    damage: isCritical ? Math.floor(damage * 1.5) : damage,
    isCritical,
    isDodged: false,
    isBlocked: false,
  };
}

/**
 * Apply status effect modifiers to damage
 */
export function applyStatusModifiers(
  baseDamage: number,
  attackerEffects: StatusEffect[],
  defenderEffects: StatusEffect[]
): number {
  let damage = baseDamage;

  // Check for attack buffs
  const attackBuff = attackerEffects.find(
    e => e.type === "buff" && (e.stat === "strength" || e.stat === "magic")
  );
  if (attackBuff) {
    damage = Math.floor(damage * (1 + (attackBuff.power ?? 0) / 100));
  }

  // Check for defense debuffs on target
  const defenseDebuff = defenderEffects.find(
    e => e.type === "debuff" && (e.stat === "defense" || e.stat === "magicDefense")
  );
  if (defenseDebuff) {
    damage = Math.floor(damage * (1 + (defenseDebuff.power ?? 0) / 100));
  }

  return damage;
}

/**
 * Calculate flee success chance
 */
export function calculateFleeChance(
  partyAvgSpeed: number,
  enemyAvgSpeed: number
): number {
  const speedDiff = partyAvgSpeed - enemyAvgSpeed;
  const baseChance = 0.5;
  return Math.min(0.95, Math.max(0.1, baseChance + speedDiff / 100));
}
