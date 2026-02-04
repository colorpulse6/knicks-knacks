// Interaction Engine - Handles player interactions with map objects
// Treasure chests, NPCs, save points, doors, etc.

import type { GameMap, MapEvent, TreasureContents, Direction, Position, NPC } from "../types/map";
import { getDirectionOffset } from "../types/map";
import { getItemById } from "../data/items";
import { getShardById } from "../data/shards";

/**
 * Result of opening a treasure chest
 */
export interface TreasureResult {
  success: boolean;
  alreadyOpened: boolean;
  contents: {
    items: { name: string; quantity: number }[];
    gold: number;
    shards: { id: string; name: string }[];
  };
  message: string;
}

/**
 * Get the position the player is facing
 */
export function getFacingPosition(
  playerX: number,
  playerY: number,
  facing: Direction
): Position {
  const { dx, dy } = getDirectionOffset(facing);
  return { x: playerX + dx, y: playerY + dy };
}

/**
 * Find an interactable event at the given position
 */
export function getEventAtPosition(
  map: GameMap,
  x: number,
  y: number
): MapEvent | null {
  return map.events.find((event) => event.x === x && event.y === y) ?? null;
}

/**
 * Find the event the player is facing
 */
export function getEventPlayerIsFacing(
  map: GameMap,
  playerX: number,
  playerY: number,
  facing: Direction
): MapEvent | null {
  const { x, y } = getFacingPosition(playerX, playerY, facing);
  return getEventAtPosition(map, x, y);
}

/**
 * Check if player can interact with something in front of them
 */
export function canInteract(
  map: GameMap,
  playerX: number,
  playerY: number,
  facing: Direction
): boolean {
  const event = getEventPlayerIsFacing(map, playerX, playerY, facing);
  if (!event) return false;

  // Check event types that support interaction
  const interactableTypes = ["treasure", "npc", "save_point", "door", "inn"];
  return interactableTypes.includes(event.type);
}

/**
 * Process opening a treasure chest
 */
export function processTreasure(event: MapEvent): TreasureResult {
  // Already opened
  if (event.triggered) {
    return {
      success: false,
      alreadyOpened: true,
      contents: { items: [], gold: 0, shards: [] },
      message: "The chest is empty.",
    };
  }

  const data = event.data as TreasureContents;
  const result: TreasureResult = {
    success: true,
    alreadyOpened: false,
    contents: { items: [], gold: 0, shards: [] },
    message: "",
  };

  const messages: string[] = [];

  // Process items
  if (data.items && data.items.length > 0) {
    for (const { itemId, quantity } of data.items) {
      const item = getItemById(itemId);
      if (item) {
        result.contents.items.push({ name: item.name, quantity });
        if (quantity > 1) {
          messages.push(`${item.name} x${quantity}`);
        } else {
          messages.push(item.name);
        }
      }
    }
  }

  // Process gold
  if (data.gold && data.gold > 0) {
    result.contents.gold = data.gold;
    messages.push(`${data.gold} Gold`);
  }

  // Process shards
  if (data.shards && data.shards.length > 0) {
    for (const shardId of data.shards) {
      const shard = getShardById(shardId);
      if (shard) {
        result.contents.shards.push({ id: shard.id, name: shard.name });
        messages.push(shard.name);
      }
    }
  }

  if (messages.length > 0) {
    result.message = `Found: ${messages.join(", ")}!`;
  } else {
    result.message = "The chest is empty.";
    result.success = false;
  }

  return result;
}

/**
 * Get interaction prompt text based on event type
 */
export function getInteractionPrompt(event: MapEvent): string {
  switch (event.type) {
    case "treasure":
      return event.triggered ? "Empty Chest" : "Open Chest";
    case "npc":
      return "Talk";
    case "save_point":
      return "Save";
    case "door":
      return "Enter";
    case "shop":
      return "Enter Shop";
    case "inn":
      return "Enter Inn";
    default:
      return "Interact";
  }
}

/**
 * Check if a position has a chest (for rendering)
 */
export function isChestPosition(map: GameMap, x: number, y: number): boolean {
  const event = getEventAtPosition(map, x, y);
  return event?.type === "treasure";
}

/**
 * Check if chest at position is opened
 */
export function isChestOpened(
  map: GameMap,
  x: number,
  y: number,
  openedChests: Set<string>
): boolean {
  const event = getEventAtPosition(map, x, y);
  if (!event || event.type !== "treasure") return false;
  return event.triggered || openedChests.has(event.id);
}

/**
 * Find an NPC at the given position
 */
export function getNpcAtPosition(
  map: GameMap,
  x: number,
  y: number
): NPC | null {
  return map.npcs.find((npc) => npc.x === x && npc.y === y) ?? null;
}

/**
 * Find the NPC the player is facing
 */
export function getNpcPlayerIsFacing(
  map: GameMap,
  playerX: number,
  playerY: number,
  facing: Direction
): NPC | null {
  const { x, y } = getFacingPosition(playerX, playerY, facing);
  return getNpcAtPosition(map, x, y);
}
