// Desert Ridge - Elevated terrain overlooking Havenwood
// The exit from the desert prologue. From here, Kai first sees
// the green forest of Havenwood and walks toward it.
// No encounters — safe, contemplative space.

import type { GameMap, NPC, MapEvent, StaticObject } from "../../types";

// Map dimensions
const WIDTH = 24;
const HEIGHT = 16;

// Ground layer — all tile 0 (background image handles visuals)
function createGroundLayer(): number[][] {
  const ground: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    ground.push(new Array(WIDTH).fill(0));
  }
  return ground;
}

// Create collision layer (true = walkable, false = blocked)
function createCollisionLayer(): boolean[][] {
  const collision: boolean[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < WIDTH; x++) {
      let walkable = false;

      // North entry from plateau
      if (y >= 1 && y <= 2 && x >= 10 && x <= 14) walkable = true;

      // Main ridge path
      if (y >= 3 && y <= 12 && x >= 4 && x <= 19) walkable = true;

      // Ridge cliff edges (not walkable)
      if (y >= 3 && y <= 8 && x >= 4 && x <= 5) walkable = false;
      if (y >= 3 && y <= 6 && x >= 18 && x <= 19) walkable = false;

      // Lookout point (wider area)
      if (y >= 7 && y <= 10 && x >= 3 && x <= 20) walkable = true;

      // Rock outcrops
      if (y >= 5 && y <= 6 && x >= 9 && x <= 10) walkable = false;

      // South exit to Havenwood
      if (y >= 13 && y <= 15 && x >= 10 && x <= 13) walkable = true;

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

const EVENTS: MapEvent[] = [
  // North entry — return to plateau
  ...Array.from({ length: 5 }, (_, i) => ({
    id: i === 0 ? "to_plateau" : `to_plateau_${i + 1}`,
    type: "teleport" as const,
    x: 10 + i,
    y: 1,
    data: {
      targetMapId: "desert_plateau",
      targetX: 11,
      targetY: 16,
    },
  })),

  // South exit — seems like it leads toward the village, but loops to wastes
  ...Array.from({ length: 4 }, (_, i) => ({
    id: i === 0 ? "to_wastes_south" : `to_wastes_south_${i + 1}`,
    type: "teleport" as const,
    x: 10 + i,
    y: 15,
    data: {
      targetMapId: "desert_wastes",
      targetX: 14 + i,
      targetY: 3,
    },
  })),

  // Lookout point — Havenwood visible but unreachable
  {
    id: "havenwood_vista",
    type: "trigger",
    x: 12,
    y: 10,
    data: {
      triggerType: "examine",
      message:
        "From the ridge, you can see it clearly — a village surrounded by green forest. But the path down crumbles away into sand. You can't reach it from here.",
    },
  },
  // Examine cliff edge
  {
    id: "cliff_edge",
    type: "trigger",
    x: 5,
    y: 8,
    data: {
      triggerType: "examine",
      message:
        "The ridge drops away sharply here. Below, the desert stretches to the horizon — flat and featureless. Behind you, the way forward. You don't look back.",
    },
  },
  // Examine path markings
  {
    id: "path_markings",
    type: "trigger",
    x: 15,
    y: 4,
    data: {
      triggerType: "examine",
      message:
        "Faint markings in the rock — the same strange symbols you saw near the tent. Someone has walked this path before.",
    },
  },
];

export const DESERT_RIDGE_MAP: GameMap = {
  id: "desert_ridge",
  name: "Desert Ridge",
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
  background: "/backgrounds/desert_ridge.png",
  ambientColor: "#b88a3c", // Warm amber, slightly brighter (higher elevation)
};
