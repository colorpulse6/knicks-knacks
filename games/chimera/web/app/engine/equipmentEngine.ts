// Equipment Engine - Calculates effective stats from base + equipment + shards
// This engine properly applies all equipment stats to characters during combat

import type { Character, Stats, EquipmentSlot } from "../types/character";
import type { Item, Shard, ShardEffectType } from "../types/item";
import { getShardById } from "../data/shards";

/**
 * A shard effect that's been aggregated from all equipped shards
 */
export interface ShardEffect {
  type: ShardEffectType;
  value: number;
}

/**
 * Get equipment stats from an equipment item
 * Handles both Equipment type and Item type with equipStats
 */
function getEquipmentStats(equipment: unknown): {
  attack?: number;
  defense?: number;
  magicAttack?: number;
  magicDefense?: number;
  speed?: number;
  hp?: number;
  mp?: number;
} | null {
  if (!equipment || typeof equipment !== "object") return null;

  // Check if it's an Item with equipStats
  if ("equipStats" in equipment && equipment.equipStats) {
    return equipment.equipStats as {
      attack?: number;
      defense?: number;
      magicAttack?: number;
      magicDefense?: number;
      speed?: number;
      hp?: number;
      mp?: number;
    };
  }

  // Check if it's a simple Equipment type with direct stats
  const equip = equipment as Record<string, unknown>;
  if ("attack" in equip || "defense" in equip || "magicAttack" in equip) {
    return {
      attack: typeof equip.attack === "number" ? equip.attack : undefined,
      defense: typeof equip.defense === "number" ? equip.defense : undefined,
      magicAttack: typeof equip.magicAttack === "number" ? equip.magicAttack : undefined,
      magicDefense: typeof equip.magicDefense === "number" ? equip.magicDefense : undefined,
      speed: typeof equip.speed === "number" ? equip.speed : undefined,
    };
  }

  return null;
}

/**
 * Calculate effective stats: base + equipment + socketed shards
 * This is the MAIN function that should be used everywhere instead of raw character.stats
 */
export function getEffectiveStats(character: Character): Stats {
  const base: Stats = { ...character.stats };
  const slots: EquipmentSlot[] = ["weapon", "armor", "helmet", "accessory"];

  for (const slot of slots) {
    const equipped = character.equipment[slot];
    if (!equipped) continue;

    // Apply equipment base stats
    const equipStats = getEquipmentStats(equipped);
    if (equipStats) {
      if (equipStats.attack) base.strength += equipStats.attack;
      if (equipStats.defense) base.defense += equipStats.defense;
      if (equipStats.magicAttack) base.magic += equipStats.magicAttack;
      if (equipStats.magicDefense) base.magicDefense += equipStats.magicDefense;
      if (equipStats.speed) base.speed += equipStats.speed;
      if (equipStats.hp) base.maxHp += equipStats.hp;
      if (equipStats.mp) base.maxMp += equipStats.mp;
    }

    // Apply socketed shard stat bonuses
    const item = equipped as Item;
    const shardIds = item.socketedShards ?? [];
    for (const shardId of shardIds) {
      const shard = getShardById(shardId);
      if (!shard) continue;

      // Apply stat-type shard effects
      switch (shard.effect.type) {
        case "attack_bonus":
          base.strength += shard.effect.value;
          break;
        case "defense_bonus":
          base.defense += shard.effect.value;
          break;
        case "magic_bonus":
          base.magic += shard.effect.value;
          break;
        case "speed_bonus":
          base.speed += shard.effect.value;
          break;
        case "hp_bonus":
          base.maxHp += shard.effect.value;
          break;
        case "mp_bonus":
          base.maxMp += shard.effect.value;
          break;
      }
    }
  }

  return base;
}

/**
 * Get all non-stat shard effects (lifesteal, counter, regen, etc.)
 * These effects need to be processed separately during combat
 */
export function getShardEffects(character: Character): ShardEffect[] {
  const effects: ShardEffect[] = [];
  const slots: EquipmentSlot[] = ["weapon", "armor", "helmet", "accessory"];

  for (const slot of slots) {
    const equipped = character.equipment[slot];
    if (!equipped) continue;

    const item = equipped as Item;
    const shardIds = item.socketedShards ?? [];

    for (const shardId of shardIds) {
      const shard = getShardById(shardId);
      if (!shard) continue;

      // Non-stat effects that need special handling in combat
      const nonStatTypes: ShardEffectType[] = [
        "lifesteal",
        "counter_chance",
        "hp_regen",
        "mp_regen",
        "crit_bonus",
        "first_strike",
        "status_resist",
        "exp_bonus",
        "gold_bonus",
      ];

      if (nonStatTypes.includes(shard.effect.type)) {
        effects.push(shard.effect);
      }
    }
  }

  return effects;
}

/**
 * Get total value for a specific shard effect type
 * Aggregates all shards of the same type
 */
export function getShardEffectValue(character: Character, type: ShardEffectType): number {
  return getShardEffects(character)
    .filter((e) => e.type === type)
    .reduce((sum, e) => sum + e.value, 0);
}

/**
 * Socket a shard into equipment
 * Returns the modified equipment or null if no slots available
 */
export function socketShard(equipment: Item, shardId: string): Item | null {
  const slots = equipment.shardSlots ?? 0;
  const socketed = equipment.socketedShards ?? [];

  if (socketed.length >= slots) return null; // No room

  return {
    ...equipment,
    socketedShards: [...socketed, shardId],
  };
}

/**
 * Remove a shard from equipment
 * Returns the modified equipment and the removed shard ID
 */
export function unsocketShard(
  equipment: Item,
  shardId: string
): { equipment: Item; shard: string } {
  const socketed = equipment.socketedShards ?? [];
  return {
    equipment: {
      ...equipment,
      socketedShards: socketed.filter((id) => id !== shardId),
    },
    shard: shardId,
  };
}

/**
 * Get the number of available shard slots for equipment
 */
export function getAvailableSlots(equipment: Item): number {
  const total = equipment.shardSlots ?? 0;
  const used = equipment.socketedShards?.length ?? 0;
  return total - used;
}

/**
 * Check if equipment has any shards socketed
 */
export function hasSocketedShards(equipment: Item): boolean {
  return (equipment.socketedShards?.length ?? 0) > 0;
}

/**
 * Get all socketed shards from a piece of equipment
 */
export function getSocketedShards(equipment: Item): Shard[] {
  const shardIds = equipment.socketedShards ?? [];
  const shards: Shard[] = [];

  for (const shardId of shardIds) {
    const shard = getShardById(shardId);
    if (shard) shards.push(shard);
  }

  return shards;
}
