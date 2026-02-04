// Item and inventory types for Chimera

import type { Stats } from "./character";

export type ItemType =
  | "consumable"
  | "weapon"
  | "armor"
  | "helmet"
  | "accessory"
  | "key"
  | "treasure"
  | "shard"; // Mysterious futuristic relics

export type ItemRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary";

// Shard effect types - what mysterious shards can grant
export type ShardEffectType =
  | "attack_bonus" // +ATK (strength)
  | "defense_bonus" // +DEF
  | "magic_bonus" // +MAG
  | "speed_bonus" // +SPD
  | "hp_bonus" // +Max HP
  | "mp_bonus" // +Max MP
  | "crit_bonus" // +% crit chance
  | "counter_chance" // % chance to counter
  | "hp_regen" // HP per turn
  | "mp_regen" // MP per turn
  | "lifesteal" // % damage as HP
  | "status_resist" // % resist status
  | "first_strike" // % act first
  | "exp_bonus" // +% exp
  | "gold_bonus"; // +% gold

// A shard - mysterious futuristic relic that can be socketed into equipment
export interface Shard {
  id: string;
  name: string;
  description: string; // Medieval interpretation
  hiddenNature: string; // Sci-fi reality (revealed later in story)
  rarity: ItemRarity;
  effect: {
    type: ShardEffectType;
    value: number;
  };
  color: "red" | "blue" | "green" | "gold" | "purple"; // Glow color
}

export interface ItemEffect {
  type: "heal_hp" | "heal_mp" | "cure_status" | "buff" | "damage" | "revive";
  power: number;
  target: "single" | "all";
  stat?: keyof Stats;
  duration?: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  value: number; // Gold value
  stackable: boolean;
  maxStack: number;
  usableInBattle: boolean;
  usableInField: boolean;
  effect?: ItemEffect;
  // Equipment stats (if equippable)
  equipStats?: {
    attack?: number;
    defense?: number;
    magicAttack?: number;
    magicDefense?: number;
    speed?: number;
    hp?: number;
    mp?: number;
  };
  // Shard slot system (for equipment)
  shardSlots?: number; // How many shards can be attached (0-4 based on rarity)
  socketedShards?: string[]; // IDs of currently socketed shards
}

export interface InventorySlot {
  item: Item;
  quantity: number;
}

export interface Inventory {
  items: InventorySlot[];
  maxSlots: number;
  gold: number;
}

// Get item rarity color
export function getRarityColor(rarity: ItemRarity): string {
  switch (rarity) {
    case "common":
      return "#ffffff";
    case "uncommon":
      return "#00ff00";
    case "rare":
      return "#0088ff";
    case "epic":
      return "#aa00ff";
    case "legendary":
      return "#ffaa00";
  }
}

// Get a human-readable effect description from an item
export function getEffectDescription(item: Item): string | null {
  if (!item.effect) {
    // Check for equipment stats
    if (item.equipStats) {
      const stats: string[] = [];
      if (item.equipStats.attack) stats.push(`+${item.equipStats.attack} ATK`);
      if (item.equipStats.defense) stats.push(`+${item.equipStats.defense} DEF`);
      if (item.equipStats.magicAttack) stats.push(`+${item.equipStats.magicAttack} MAG`);
      if (item.equipStats.magicDefense) stats.push(`+${item.equipStats.magicDefense} MDEF`);
      if (item.equipStats.speed) stats.push(`+${item.equipStats.speed} SPD`);
      if (item.equipStats.hp) stats.push(`+${item.equipStats.hp} HP`);
      if (item.equipStats.mp) stats.push(`+${item.equipStats.mp} MP`);
      return stats.length > 0 ? stats.join(", ") : null;
    }
    return null;
  }

  const { type, power, target } = item.effect;
  const targetText = target === "all" ? " (All)" : "";

  switch (type) {
    case "heal_hp":
      return `Restores ${power} HP${targetText}`;
    case "heal_mp":
      return `Restores ${power} MP${targetText}`;
    case "cure_status":
      return `Cures status ailments${targetText}`;
    case "buff":
      return `Boosts stats by ${power}%${targetText}`;
    case "damage":
      return `Deals ${power} damage${targetText}`;
    case "revive":
      return `Revives with ${power}% HP`;
    default:
      return null;
  }
}

// Check if inventory has space
export function hasInventorySpace(inventory: Inventory): boolean {
  return inventory.items.length < inventory.maxSlots;
}

// Add item to inventory
export function addItemToInventory(
  inventory: Inventory,
  item: Item,
  quantity: number = 1
): Inventory {
  const existingSlot = inventory.items.find(
    (slot) => slot.item.id === item.id && slot.item.stackable
  );

  if (existingSlot && item.stackable) {
    const newQuantity = Math.min(
      existingSlot.quantity + quantity,
      item.maxStack
    );
    return {
      ...inventory,
      items: inventory.items.map((slot) =>
        slot.item.id === item.id
          ? { ...slot, quantity: newQuantity }
          : slot
      ),
    };
  }

  if (inventory.items.length >= inventory.maxSlots) {
    return inventory; // No space
  }

  return {
    ...inventory,
    items: [...inventory.items, { item, quantity }],
  };
}

// Remove item from inventory
export function removeItemFromInventory(
  inventory: Inventory,
  itemId: string,
  quantity: number = 1
): Inventory {
  return {
    ...inventory,
    items: inventory.items
      .map((slot) => {
        if (slot.item.id === itemId) {
          const newQuantity = slot.quantity - quantity;
          return newQuantity > 0
            ? { ...slot, quantity: newQuantity }
            : null;
        }
        return slot;
      })
      .filter((slot): slot is InventorySlot => slot !== null),
  };
}
