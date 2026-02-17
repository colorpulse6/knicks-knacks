// Havenwood Estate Road - A winding uphill path leading to the Lumina Estate
// Features: Cobblestone road through hedgerows, ornate lampposts, garden statue alcove, gated entrance
// Background image: 1024x1536 (32x48 tiles at 32px/tile, portrait orientation)

import type { GameMap, NPC, MapEvent, StaticObject } from "../../types";

// Map dimensions — doubled from 16x24 for finer collision control at 32px tiles
const WIDTH = 32;
const HEIGHT = 48;

// Ground layer - simple fill with 0s (background image handles visuals)
function createGroundLayer(): number[][] {
  const ground: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    ground.push(new Array(WIDTH).fill(0));
  }
  return ground;
}

// Create collision layer (true = walkable, false = blocked)
// Paint-editor export — wide S-curve path matching background cobblestone
function createCollisionLayer(): boolean[][] {
  const collision: boolean[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < WIDTH; x++) {
      let walkable = false;

      // === GATE APPROACH (y=8-10) ===
      if (y === 8  && x >= 18 && x <= 22) walkable = true;
      if (y === 9  && x >= 17 && x <= 23) walkable = true;
      if (y === 10 && x >= 12 && x <= 21) walkable = true;

      // === UPPER LEFT CURVE (y=11-15) ===
      if (y === 11 && x >= 10 && x <= 17) walkable = true;
      if (y === 12 && x >= 7 && x <= 15) walkable = true;
      if (y === 13 && x >= 7 && x <= 14) walkable = true;
      if (y === 14 && x >= 8 && x <= 14) walkable = true;
      if (y === 15 && x >= 9 && x <= 15) walkable = true;

      // === MID RIGHT CURVE (y=16-21) ===
      if (y === 16 && x >= 12 && x <= 17) walkable = true;
      if (y === 17 && x >= 13 && x <= 19) walkable = true;
      if (y === 18 && x >= 13 && x <= 21) walkable = true;
      if (y === 19 && x >= 13 && x <= 24) walkable = true;
      if (y === 20 && x >= 16 && x <= 25) walkable = true;
      if (y === 21 && x >= 16 && x <= 26) walkable = true;

      // === WIDE COURTYARD AREA (y=22-28) ===
      if (y === 22 && x >= 7 && x <= 11) walkable = true;
      if (y === 22 && x >= 16 && x <= 26) walkable = true;
      if (y >= 23 && y <= 25 && x >= 3 && x <= 11) walkable = true;
      if (y >= 23 && y <= 25 && x >= 16 && x <= 27) walkable = true;
      if (y === 26 && x >= 3 && x <= 11) walkable = true;
      if (y === 26 && x >= 15 && x <= 27) walkable = true;
      if (y === 27 && x >= 3 && x <= 9) walkable = true;
      if (y === 27 && x >= 15 && x <= 27) walkable = true;
      if (y === 28 && x >= 2 && x <= 9) walkable = true;
      if (y === 28 && x >= 14 && x <= 27) walkable = true;

      // === WIDE MERGE (y=29-33) ===
      if (y === 29 && x >= 2 && x <= 27) walkable = true;
      if (y === 30 && x >= 2 && x <= 26) walkable = true;
      if (y === 31 && x >= 2 && x <= 7) walkable = true;
      if (y === 31 && x >= 9 && x <= 26) walkable = true;
      if (y === 32 && x >= 3 && x <= 7) walkable = true;
      if (y === 32 && x >= 9 && x <= 26) walkable = true;
      if (y === 33 && x >= 9 && x <= 26) walkable = true;

      // === LOWER NARROWING (y=34-38) ===
      if (y === 34 && x >= 9 && x <= 24) walkable = true;
      if (y === 35 && x >= 9 && x <= 23) walkable = true;
      if (y === 36 && x >= 7 && x <= 23) walkable = true;
      if (y === 37 && x >= 4 && x <= 23) walkable = true;
      if (y === 38 && x >= 3 && x <= 23) walkable = true;

      // === BOTTOM APPROACH (y=39-47) ===
      if (y === 39 && x >= 1 && x <= 23) walkable = true;
      if (y === 40 && x >= 0 && x <= 23) walkable = true;
      if (y === 41 && x >= 0 && x <= 22) walkable = true;
      if (y === 42 && x >= 0 && x <= 21) walkable = true;
      if (y >= 43 && y <= 44 && x >= 0 && x <= 20) walkable = true;
      if (y === 45 && x >= 0 && x <= 18) walkable = true;
      if (y === 46 && x >= 0 && x <= 17) walkable = true;
      if (y === 47 && x >= 0 && x <= 16) walkable = true;

      row.push(walkable);
    }
    collision.push(row);
  }
  return collision;
}

// Create overhead layer (empty - background image handles visuals)
function createOverheadLayer(): number[][] {
  const overhead: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    overhead.push(new Array(WIDTH).fill(-1));
  }
  return overhead;
}

// NPCs on Estate Road (coordinates for 32px grid)
const NPCS: NPC[] = [
  {
    id: "estate_gate_guard",
    name: "Gate Guard",
    x: 19,
    y: 9,
    sprite: "/sprites/characters/guard.png",
    facing: "down",
    dialogueId: "estate_gate_guard_dynamic",
    movement: "static",
  },
  {
    id: "noble_servant_walking",
    name: "Servant",
    x: 20,
    y: 25,
    sprite: "/sprites/characters/villager.png",
    facing: "up",
    dialogueId: "noble_servant",
    movement: "static",
  },
];

// Events on Estate Road (coordinates for 32px grid)
const EVENTS: MapEvent[] = [
  // South exit back to Village Square (y=47, walkable x=0-16)
  // Cover the full bottom edge so the player can't walk past
  // Lands at y=5, x=30 (north entrance path in square)
  ...Array.from({ length: 17 }, (_, i) => ({
    id: i === 0 ? "to_square_south" : `to_square_south_${i + 1}`,
    type: "teleport" as const,
    x: i,
    y: 47,
    data: {
      targetMapId: "havenwood",
      targetX: 30 + (i % 2),
      targetY: 5,
      message: "Back to Village Square",
    },
  })),
  // Estate entrance — gated by found_mechanism flag (gate at y=8, walkable x=18-22)
  {
    id: "estate_entrance",
    type: "teleport",
    x: 19,
    y: 8,
    data: {
      targetMapId: "lumina_estate",
      targetX: 19,
      targetY: 29,
      message: "Enter the Lumina Estate?",
      requiredFlag: "found_mechanism",
      notMetMessage:
        "The Lumina Estate is home to the region's nobility. You have no business here... yet.",
    },
  },
  {
    id: "estate_entrance_2",
    type: "teleport",
    x: 20,
    y: 8,
    data: {
      targetMapId: "lumina_estate",
      targetX: 19,
      targetY: 29,
      message: "Enter the Lumina Estate?",
      requiredFlag: "found_mechanism",
      notMetMessage:
        "The Lumina Estate is home to the region's nobility. You have no business here... yet.",
    },
  },
  {
    id: "estate_entrance_3",
    type: "teleport",
    x: 21,
    y: 8,
    data: {
      targetMapId: "lumina_estate",
      targetX: 20,
      targetY: 29,
      message: "Enter the Lumina Estate?",
      requiredFlag: "found_mechanism",
      notMetMessage:
        "The Lumina Estate is home to the region's nobility. You have no business here... yet.",
    },
  },
  // Lamppost examine 1 (left side of wide merge area)
  {
    id: "lamppost_examine_1",
    type: "trigger",
    x: 9,
    y: 32,
    data: {
      triggerType: "examine",
      message:
        "An ornate iron lamppost with a glass enclosure. The flame inside burns with an unusually steady blue light...",
    },
  },
  // Lamppost examine 2 (right side of mid curve)
  {
    id: "lamppost_examine_2",
    type: "trigger",
    x: 24,
    y: 20,
    data: {
      triggerType: "examine",
      message:
        "This lamppost has the Lumina family crest engraved on its base. The metalwork is impossibly precise...",
    },
  },
  // Garden statue (upper left curve at y=14, walkable x=8-14)
  {
    id: "garden_statue",
    type: "trigger",
    x: 8,
    y: 14,
    data: {
      triggerType: "examine",
      message:
        "A stone statue of a robed figure holding a crystal orb. The plaque reads: 'First Lumina — She Who Brought the Light.' The orb seems to faintly pulse...",
    },
  },
  // Gate plaque (beside the gate)
  {
    id: "gate_plaque",
    type: "trigger",
    x: 17,
    y: 9,
    data: {
      triggerType: "examine",
      message:
        "An engraved stone plaque beside the gate: 'House Lumina — Keepers of Knowledge, Guardians of Truth.'",
    },
  },
];

// Static objects
const STATIC_OBJECTS: StaticObject[] = [];

// Overhead regions — hedgerows and foliage that characters walk behind
const OVERHEAD_REGIONS: { x: number; y: number; width: number; height: number; baseY?: number }[] = [
  // Upper hedge overhangs (gate approach)
  { x: 20, y: 10, width: 2, height: 1, baseY: 11 },
  { x: 16, y: 11, width: 2, height: 1, baseY: 12 },
  { x: 15, y: 12, width: 1, height: 1, baseY: 13 },
  // Left hedge along mid curve
  { x: 11, y: 16, width: 1, height: 3, baseY: 19 },
  { x: 12, y: 17, width: 3, height: 3, baseY: 20 },
  { x: 15, y: 18, width: 1, height: 2, baseY: 20 },
  // Courtyard area hedges
  { x: 8, y: 22, width: 1, height: 1, baseY: 23 },
  { x: 10, y: 23, width: 2, height: 4, baseY: 27 },
  // Right garden wall overhangs
  { x: 26, y: 28, width: 1, height: 6, baseY: 34 },
  { x: 25, y: 29, width: 1, height: 5, baseY: 34 },
  // Lower left archway/hedge
  { x: 5, y: 30, width: 3, height: 3, baseY: 33 },
];

export const HAVENWOOD_ESTATE_ROAD_MAP: GameMap = {
  id: "havenwood_estate_road",
  name: "Estate Road",
  width: WIDTH,
  height: HEIGHT,
  tileSize: 32,
  layers: {
    ground: createGroundLayer(),
    collision: createCollisionLayer(),
    overhead: createOverheadLayer(),
  },
  events: EVENTS,
  npcs: NPCS,
  staticObjects: STATIC_OBJECTS,
  overheadRegions: OVERHEAD_REGIONS,
  encounters: [],
  connections: [],
  background: "/backgrounds/havenwood_estate_road.png",
  ambientColor: "#d8ceb8",
  music: "peaceful_village",
};
