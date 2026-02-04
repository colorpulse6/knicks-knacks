// Battle and combat types for Chimera's ATB system

import type { Character, Stats, StatusEffect, Ability } from "./character";

export interface ATBState {
  gauge: number; // 0-100
  maxGauge: number; // Always 100
  fillRate: number; // Based on speed stat
  isReady: boolean; // gauge >= 100
  isActing: boolean; // Currently executing action
}

export interface BattleCharacter {
  character: Character;
  atb: ATBState;
  statusEffects: StatusEffect[];
  position: { x: number; y: number }; // Battle position for animations
}

export interface Enemy {
  id: string;
  name: string;
  stats: Stats;
  atb: ATBState;
  statusEffects: StatusEffect[];
  abilities: Ability[];
  sprite: string;
  position: { x: number; y: number };
  // AI behavior
  ai: EnemyAI;
  // Rewards
  experience: number;
  gold: number;
  drops: { itemId: string; chance: number }[];
}

export type EnemyAI = {
  type: "random" | "aggressive" | "defensive" | "smart";
  targetPriority?: "lowest_hp" | "highest_hp" | "random" | "healer";
  specialThreshold?: number; // HP% to use special moves
};

export type BattleAction =
  | { type: "attack"; targetId: string }
  | { type: "magic"; abilityId: string; targetId: string | string[] }
  | { type: "item"; itemId: string; targetId: string }
  | { type: "defend" }
  | { type: "flee" };

export interface BattleCommand {
  actorId: string;
  action: BattleAction;
  timestamp: number;
}

export interface DamageResult {
  damage: number;
  isCritical: boolean;
  isDodged: boolean;
  isBlocked: boolean;
  elementalMultiplier?: number;
}

export type BattlePhase =
  | "intro" // Battle transition animation
  | "active" // Main combat loop
  | "victory" // All enemies defeated
  | "defeat" // Party wiped
  | "fled"; // Escaped successfully

export interface StealEvent {
  thiefId: string;
  targetId: string;
  thiefLuck: number;
  targetLuck: number;
}

export interface BattleState {
  phase: BattlePhase;
  party: BattleCharacter[];
  enemies: Enemy[];
  activeActorId: string | null; // Who is selecting action
  commandQueue: BattleCommand[];
  turnCount: number;
  battleLog: BattleLogEntry[];
  // Glitch mechanic (environment shifts during combat)
  glitchLevel: number; // 0-100, visual intensity of sci-fi elements
  isGlitching: boolean;
  // Pending steal event for UI to process
  pendingStealEvent?: StealEvent;
}

export interface BattleLogEntry {
  timestamp: number;
  message: string;
  type: "action" | "damage" | "heal" | "status" | "system";
}

// ATB calculations
export function calculateATBFillRate(speed: number): number {
  // Higher speed = faster gauge fill
  // Range roughly 1-10 per tick at 60fps
  return (speed + 20) / 16;
}

// Damage calculations (FF6-inspired)
export function calculatePhysicalDamage(
  attacker: Stats,
  defender: Stats,
  weaponAttack: number = 0
): DamageResult {
  const base = attacker.strength + weaponAttack;
  const variance = 0.875 + Math.random() * 0.25; // 87.5% - 112.5%
  const rawDamage = Math.floor((base * base) / 16 * variance);
  const defense = Math.floor(defender.defense / 2);
  const damage = Math.max(1, rawDamage - defense);

  // Critical hit check (based on luck)
  const critChance = (attacker.luck / 100) * 0.15; // Max ~15% crit chance
  const isCritical = Math.random() < critChance;

  // Dodge check (based on speed difference)
  const dodgeChance = Math.max(0, (defender.speed - attacker.speed) / 200);
  const isDodged = Math.random() < dodgeChance;

  return {
    damage: isCritical ? Math.floor(damage * 1.5) : damage,
    isCritical,
    isDodged,
    isBlocked: false,
  };
}

export function calculateMagicDamage(
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
