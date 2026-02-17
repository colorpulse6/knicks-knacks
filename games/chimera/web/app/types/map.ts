// Map and world types for Chimera

export type TileType =
  | "grass"
  | "dirt"
  | "stone"
  | "water"
  | "wall"
  | "floor"
  | "door"
  | "stairs_up"
  | "stairs_down"
  | "chest"
  | "save_point"
  | "void";

export interface Tile {
  type: TileType;
  walkable: boolean;
  spriteIndex: number;
  elevation?: number;
}

export interface MapEvent {
  id: string;
  type:
    | "treasure"
    | "door"
    | "npc"
    | "trigger"
    | "save_point"
    | "battle"
    | "teleport"
    | "collectible"  // Quest collectibles (flowers, etc.)
    | "shop"         // Shop entrance
    | "inn";         // Inn entrance
  x: number;
  y: number;
  data: Record<string, unknown>;
  triggered?: boolean;
}

// Shop entrance data
export interface ShopEventData {
  shopId: string;
}

// Inn entrance data
export interface InnEventData {
  innName?: string;
  cost?: number; // Optional override for rest cost
  message?: string; // Custom interaction prompt
}

// Treasure chest contents - can contain items, equipment, shards, or gold
export interface TreasureContents {
  items?: { itemId: string; quantity: number }[];
  gold?: number;
  shards?: string[]; // Shard IDs
}

// Helper to check if an event is a treasure chest
export function isTreasureEvent(event: MapEvent): event is MapEvent & { data: TreasureContents } {
  return event.type === "treasure";
}

// Collectible contents - quest items that can be picked up from the map
export interface CollectibleContents {
  itemId: string;
  quantity: number;
  requiredQuest?: string;  // Only visible/collectible if this quest is active
  message?: string;        // Custom pickup message
}

// Helper to check if an event is a collectible
export function isCollectibleEvent(event: MapEvent): event is MapEvent & { data: CollectibleContents } {
  return event.type === "collectible";
}

export interface NPC {
  id: string;
  name: string;
  x: number;
  y: number;
  sprite: string;
  facing: Direction;
  dialogueId: string;
  movement?: "static" | "wander" | "patrol";
  patrolPath?: { x: number; y: number }[];
  scale?: number; // Render scale multiplier (default 1.5)
  // Visibility conditions based on story flags
  visibleWhenFlag?: string;  // Only show when this flag is true
  hiddenWhenFlag?: string;   // Hide when this flag is true
}

export interface EnemyEncounter {
  id: string;
  enemies: string[]; // Enemy IDs to spawn
  chance: number; // Encounter rate (0-1)
  zone: { x: number; y: number; width: number; height: number };
}

export interface MapConnection {
  id: string;
  targetMapId: string;
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  type: "door" | "stairs" | "edge" | "teleport";
}

// Static objects (buildings, trees, rocks) with explicit sprite and collision
export interface StaticObject {
  id: string;
  sprite: string;           // Path to sprite image
  x: number;                // Tile x position
  y: number;                // Tile y position (top-left of object)
  width: number;            // Width in tiles
  height: number;           // Height in tiles
  // Source rectangle in sprite sheet (optional - if not set, uses whole image)
  sourceX?: number;
  sourceY?: number;
  sourceWidth?: number;
  sourceHeight?: number;
  // Collision - which tiles block movement (relative to x,y)
  // If not provided, defaults to blocking bottom row only
  collision?: { offsetX: number; offsetY: number }[];
  // Z-order for rendering (higher = rendered later/on top)
  zIndex?: number;
  // Visibility conditions based on story flags (like NPCs)
  visibleWhenFlag?: string;  // Only show when this flag is true
  hiddenWhenFlag?: string;   // Hide when this flag is true
}

export interface GameMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tileSize: number; // 16 or 32 pixels
  layers: {
    ground: number[][]; // Tile sprite indices
    collision: boolean[][]; // Walkable map
    overhead: number[][]; // Above player layer
  };
  events: MapEvent[];
  npcs: NPC[];
  staticObjects?: StaticObject[]; // Buildings, trees, rocks with sprites
  encounters: EnemyEncounter[];
  connections: MapConnection[];
  // Overhead regions — portions of the background re-drawn ON TOP of characters
  // to create "walk behind" occlusion (pillars, archways, tall furniture, etc.)
  // Coordinates are in tile units. The renderer re-draws these background
  // regions after characters, so sprites naturally appear behind them.
  overheadRegions?: { x: number; y: number; width: number; height: number; baseY?: number }[];
  // Visual settings
  tileset?: string; // Tileset name (outdoor, cave, interior, ruins, glitch)
  background?: string; // Pre-rendered background image path (skips tile rendering)
  ambientColor?: string;
  flickerLight?: boolean; // Subtle ambient light flicker (firelight, torches)
  music?: string;
  // Story flags required to access
  requiredFlags?: string[];
}

export type Direction = "up" | "down" | "left" | "right";

export interface Position {
  x: number;
  y: number;
}

export interface PlayerPosition extends Position {
  mapId: string;
  facing: Direction;
}

// Movement helpers
export function getDirectionOffset(
  direction: Direction
): { dx: number; dy: number } {
  switch (direction) {
    case "up":
      return { dx: 0, dy: -1 };
    case "down":
      return { dx: 0, dy: 1 };
    case "left":
      return { dx: -1, dy: 0 };
    case "right":
      return { dx: 1, dy: 0 };
  }
}

export function isValidPosition(
  map: GameMap,
  x: number,
  y: number
): boolean {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) {
    return false;
  }
  return map.layers.collision[y][x];
}

/**
 * Get NPCs that should be visible based on story flags
 */
export function getVisibleNpcs(
  npcs: NPC[],
  storyFlags: Record<string, boolean>
): NPC[] {
  return npcs.filter((npc) => {
    // If NPC has a visibleWhenFlag, check if that flag is true
    if (npc.visibleWhenFlag && !storyFlags[npc.visibleWhenFlag]) {
      return false;
    }
    // If NPC has a hiddenWhenFlag, check if that flag is true (hide if so)
    if (npc.hiddenWhenFlag && storyFlags[npc.hiddenWhenFlag]) {
      return false;
    }
    return true;
  });
}

/**
 * Get static objects that should be visible based on story flags
 */
export function getVisibleStaticObjects(
  objects: StaticObject[],
  storyFlags: Record<string, boolean>
): StaticObject[] {
  return objects.filter((obj) => {
    // If object has a visibleWhenFlag, check if that flag is true
    if (obj.visibleWhenFlag && !storyFlags[obj.visibleWhenFlag]) {
      return false;
    }
    // If object has a hiddenWhenFlag, check if that flag is true (hide if so)
    if (obj.hiddenWhenFlag && storyFlags[obj.hiddenWhenFlag]) {
      return false;
    }
    return true;
  });
}
