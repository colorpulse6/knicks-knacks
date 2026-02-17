// Desert Plateau - Immediate area outside the stranger's tent
// Rocky, windswept terrain. Part of the desert prologue area.
// No encounters — safe, contemplative space.

import type { GameMap, NPC, MapEvent, StaticObject } from "../../types";

// Map dimensions
const WIDTH = 24;
const HEIGHT = 18;

// Ground layer — all tile 0 (background image handles visuals)
function createGroundLayer(): number[][] {
  const ground: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    ground.push(new Array(WIDTH).fill(0));
  }
  return ground;
}

// Create collision layer (true = walkable, false = blocked)
// Painted via collision editor
// ASCII grid (. = walkable, # = blocked):
// x_tens:000000000011111111112222
// x_ones:012345678901234567890123
// y=00  ########################
// y=01  ########################
// y=02  ########################
// y=03  ########################
// y=04  ########################
// y=05  #############...########
// y=06  ####.#..................
// y=07  ####....................
// y=08  ###........##...........
// y=09  ######.....##.....##....
// y=10  #######...........#####.
// y=11  #######...........######
// y=12  ###...............######
// y=13  ########................
// y=14  ...#######..............
// y=15  ........................
// y=16  .....................##.
// y=17  #.......................
function createCollisionLayer(): boolean[][] {
  const collision: boolean[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < WIDTH; x++) {
      let walkable = false;

      if (y === 5 && x >= 13 && x <= 15) walkable = true;
      if (y === 6 && x === 4) walkable = true;
      if (y === 6 && x >= 6 && x <= 23) walkable = true;
      if (y === 7 && x >= 4 && x <= 23) walkable = true;
      if (y === 8 && x >= 3 && x <= 10) walkable = true;
      if (y === 8 && x >= 13 && x <= 23) walkable = true;
      if (y === 9 && x >= 6 && x <= 10) walkable = true;
      if (y === 9 && x >= 13 && x <= 17) walkable = true;
      if (y === 9 && x >= 20 && x <= 23) walkable = true;
      if (y === 10 && x >= 7 && x <= 17) walkable = true;
      if (y === 10 && x === 23) walkable = true;
      if (y === 11 && x >= 7 && x <= 17) walkable = true;
      if (y === 12 && x >= 3 && x <= 17) walkable = true;
      if (y === 13 && x >= 8 && x <= 23) walkable = true;
      if (y === 14 && x >= 0 && x <= 2) walkable = true;
      if (y === 14 && x >= 10 && x <= 23) walkable = true;
      if (y === 15 && x >= 0 && x <= 23) walkable = true;
      if (y === 16 && x >= 0 && x <= 20) walkable = true;
      if (y === 16 && x === 23) walkable = true;
      if (y === 17 && x >= 1 && x <= 23) walkable = true;

      row.push(walkable);
    }
    collision.push(row);
  }
  return collision;
}

// Create overhead layer (empty — background image handles visuals)
function createOverheadLayer(): number[][] {
  const overhead: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    overhead.push(new Array(WIDTH).fill(-1));
  }
  return overhead;
}

const STATIC_OBJECTS: StaticObject[] = [];
const NPCS: NPC[] = [];

// Overhead regions — walk-behind occlusion for rock formations
const OVERHEAD_REGIONS: { x: number; y: number; width: number; height: number; baseY?: number }[] = [
  { x: 20, y: 6, width: 1, height: 1, baseY: 7 },
  { x: 21, y: 9, width: 2, height: 1, baseY: 10 },
];

const EVENTS: MapEvent[] = [
  // Entry to tent at (4, 7) — tent entrance
  {
    id: "to_tent",
    type: "teleport",
    x: 4,
    y: 7,
    data: {
      targetMapId: "stranger_tent",
      targetX: 5,
      targetY: 12,
      message: "Return to the tent?",
    },
  },

  // East exit to desert wastes
  {
    id: "to_wastes",
    type: "teleport",
    x: 23,
    y: 9,
    data: {
      targetMapId: "desert_wastes",
      targetX: 2,
      targetY: 10,
    },
  },
  {
    id: "to_wastes_2",
    type: "teleport",
    x: 23,
    y: 8,
    data: {
      targetMapId: "desert_wastes",
      targetX: 2,
      targetY: 9,
    },
  },
  {
    id: "to_wastes_3",
    type: "teleport",
    x: 23,
    y: 10,
    data: {
      targetMapId: "desert_wastes",
      targetX: 2,
      targetY: 11,
    },
  },

  // South exit to desert ridge
  ...Array.from({ length: 4 }, (_, i) => ({
    id: i === 0 ? "to_ridge" : `to_ridge_${i + 1}`,
    type: "teleport" as const,
    x: 10 + i,
    y: 17,
    data: {
      targetMapId: "desert_ridge",
      targetX: 12,
      targetY: 2,
    },
  })),

  // Examine — stone cairn
  {
    id: "stone_cairn",
    type: "trigger",
    x: 7,
    y: 6,
    data: {
      triggerType: "examine",
      message:
        "A stack of flat stones, carefully balanced. Someone built this deliberately. A marker? A warning?",
    },
  },
  // Examine — dried well
  {
    id: "dried_well",
    type: "trigger",
    x: 15,
    y: 5,
    data: {
      triggerType: "examine",
      message:
        "The remains of a well, completely dry. The stones around its rim are worn smooth by wind and time.",
    },
  },
  // Examine — faded markings
  {
    id: "faded_markings",
    type: "trigger",
    x: 9,
    y: 13,
    data: {
      triggerType: "examine",
      message:
        "Strange markings scratched into the rock face. They shimmer faintly when you look at them directly, but vanish at the edges of your vision.",
    },
  },
];

export const DESERT_PLATEAU_MAP: GameMap = {
  id: "desert_plateau",
  name: "Desert Plateau",
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
  encounters: [], // No encounters — safe prologue space
  connections: [],
  overheadRegions: OVERHEAD_REGIONS,
  background: "/backgrounds/desert_plateau.png",
  ambientColor: "#8b6914", // Warm amber desert
};
