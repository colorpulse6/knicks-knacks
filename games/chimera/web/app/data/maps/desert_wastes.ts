// Desert Wastes - Open expanse of sand and wind-carved rock
// A vast, empty space between worlds. Shimmer patches hint at Temporal Distortions.
// No encounters — safe, contemplative space.

import type { GameMap, NPC, MapEvent, StaticObject } from "../../types";

// Map dimensions — large open area
const WIDTH = 28;
const HEIGHT = 20;

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

      // Large open walkable area
      if (y >= 2 && y <= 17 && x >= 2 && x <= 25) walkable = true;

      // Rock formations scattered throughout
      if (y >= 4 && y <= 5 && x >= 5 && x <= 7) walkable = false;
      if (y >= 9 && y <= 11 && x >= 20 && x <= 22) walkable = false;
      if (y >= 14 && y <= 15 && x >= 10 && x <= 11) walkable = false;
      if (y === 7 && x >= 14 && x <= 15) walkable = false;

      // West exit back to plateau
      if (y >= 9 && y <= 11 && x >= 0 && x <= 1) walkable = true;

      // East exit to ridge
      if (y >= 9 && y <= 11 && x >= 26 && x <= 27) walkable = true;

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
  // West exit back to plateau
  {
    id: "to_plateau",
    type: "teleport",
    x: 0,
    y: 10,
    data: {
      targetMapId: "desert_plateau",
      targetX: 22,
      targetY: 9,
    },
  },
  {
    id: "to_plateau_2",
    type: "teleport",
    x: 0,
    y: 9,
    data: {
      targetMapId: "desert_plateau",
      targetX: 22,
      targetY: 8,
    },
  },
  {
    id: "to_plateau_3",
    type: "teleport",
    x: 0,
    y: 11,
    data: {
      targetMapId: "desert_plateau",
      targetX: 22,
      targetY: 10,
    },
  },

  // Shimmer patches — echoes of Temporal Distortions
  {
    id: "shimmer_1",
    type: "trigger",
    x: 8,
    y: 5,
    data: {
      triggerType: "examine",
      message:
        "The air shimmers here, bending light like heat off metal. For a split second you see... something else. A corridor? Then it's gone.",
    },
  },
  {
    id: "shimmer_2",
    type: "trigger",
    x: 18,
    y: 14,
    data: {
      triggerType: "examine",
      message:
        "Another shimmer. This one hums at a frequency you feel more than hear. The sand beneath it is fused into glass.",
    },
  },
  {
    id: "shimmer_3",
    type: "trigger",
    x: 24,
    y: 4,
    data: {
      triggerType: "examine",
      message:
        "A patch of air that refuses to stay still. Colors that don't belong here flicker in its depths — sterile white, cold blue. It makes your head ache.",
    },
  },

  // East exit to ridge (completing the triangle loop)
  ...Array.from({ length: 3 }, (_, i) => ({
    id: i === 0 ? "to_ridge" : `to_ridge_${i + 1}`,
    type: "teleport" as const,
    x: 27,
    y: 9 + i,
    data: {
      targetMapId: "desert_ridge",
      targetX: 6,
      targetY: 8 + i,
    },
  })),

  // Environmental details
  {
    id: "rock_formation",
    type: "trigger",
    x: 13,
    y: 8,
    data: {
      triggerType: "examine",
      message:
        "Wind-carved rock formations rise from the sand like frozen waves. This place feels ancient — older than anything you can name.",
    },
  },
  {
    id: "sand_patterns",
    type: "trigger",
    x: 5,
    y: 15,
    data: {
      triggerType: "examine",
      message:
        "The wind has etched perfect geometric spirals in the sand. Too perfect. Nature doesn't draw straight lines.",
    },
  },
];

export const DESERT_WASTES_MAP: GameMap = {
  id: "desert_wastes",
  name: "Desert Wastes",
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
  background: "/backgrounds/desert_wastes.png",
  ambientColor: "#a07830", // Warm desert amber
};
