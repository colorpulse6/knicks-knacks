// Havenwood Alley - Narrow back alley connecting the rooftops to the village square
// Kai's entry point into Havenwood proper after descending from the rooftops.
// Dark, narrow, atmospheric. A few barrels, a stray cat, closed doors.

import type { GameMap, NPC, MapEvent, StaticObject } from "../../types";

const WIDTH = 14;
const HEIGHT = 22;

function createGroundLayer(): number[][] {
  const ground: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    ground.push(new Array(WIDTH).fill(0));
  }
  return ground;
}

function createCollisionLayer(): boolean[][] {
  const collision: boolean[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < WIDTH; x++) {
      let walkable = false;

      // Building walls (left and right)
      if (x <= 1 || x >= 12) walkable = false;

      // Main alley path (narrow center)
      if (y >= 1 && y <= 20 && x >= 4 && x <= 9) walkable = true;

      // Wider area near rooftop entry (top)
      if (y >= 1 && y <= 3 && x >= 3 && x <= 10) walkable = true;

      // Barrel cluster left
      if (y >= 6 && y <= 7 && x >= 3 && x <= 4) walkable = false;

      // Crate stack right
      if (y >= 10 && y <= 11 && x >= 9 && x <= 10) walkable = false;

      // Puddle area (walkable but examine-able)
      // y=14, x=5-7 is walkable (already covered by main path)

      // Wider area near exit (bottom)
      if (y >= 18 && y <= 21 && x >= 3 && x <= 10) walkable = true;

      // South exit to havenwood square
      if (y === 21 && x >= 5 && x <= 8) walkable = true;

      // Top wall (except ladder entry)
      if (y === 0) walkable = false;

      row.push(walkable);
    }
    collision.push(row);
  }
  return collision;
}

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
  // Ladder up to rooftops
  {
    id: "to_rooftops",
    type: "teleport",
    x: 6,
    y: 1,
    data: {
      targetMapId: "havenwood_rooftops_east",
      targetX: 21,
      targetY: 16,
      message: "Climb back up to the rooftops?",
    },
  },
  {
    id: "to_rooftops_2",
    type: "teleport",
    x: 7,
    y: 1,
    data: {
      targetMapId: "havenwood_rooftops_east",
      targetX: 22,
      targetY: 16,
      message: "Climb back up to the rooftops?",
    },
  },

  // South exit to havenwood square
  ...Array.from({ length: 4 }, (_, i) => ({
    id: i === 0 ? "to_square" : `to_square_${i + 1}`,
    type: "teleport" as const,
    x: 5 + i,
    y: 21,
    data: {
      targetMapId: "havenwood",
      targetX: 30 + i,
      targetY: 5,
    },
  })),

  // Examine barrels
  {
    id: "barrels_examine",
    type: "trigger",
    x: 5,
    y: 6,
    data: {
      triggerType: "examine",
      message:
        "Old wooden barrels stacked against the wall. They smell of vinegar and salt. Merchant storage, left here and forgotten.",
    },
  },
  // Examine crates
  {
    id: "crates_examine",
    type: "trigger",
    x: 8,
    y: 10,
    data: {
      triggerType: "examine",
      message:
        "Crates stamped with a gear inside a circle. The ink looks fresh, but the wood smells like it's a thousand years old.",
    },
  },
  // Examine puddle
  {
    id: "puddle_examine",
    type: "trigger",
    x: 6,
    y: 14,
    data: {
      triggerType: "examine",
      message:
        "My face... I recognize the red hair, but my eyes look like they belong to a stranger. They're too bright.",
    },
  },
  // Examine locked door (left)
  {
    id: "door_locked",
    type: "trigger",
    x: 3,
    y: 12,
    data: {
      triggerType: "examine",
      message:
        "A heavy wooden door, bolted from the inside. No handle on this side. Someone doesn't want visitors.",
    },
  },
  // Examine alley graffiti
  {
    id: "graffiti_examine",
    type: "trigger",
    x: 10,
    y: 16,
    data: {
      triggerType: "examine",
      message:
        "An eye inside a triangle. It looks hurried, like a warning scratched in secret.",
    },
  },
  // Examine exit view
  {
    id: "exit_view",
    type: "trigger",
    x: 7,
    y: 20,
    data: {
      triggerType: "examine",
      message:
        "Ahead, the alley opens into a sunlit square. You can hear voices, the splash of a fountain, the creak of cart wheels. Civilization.",
    },
  },
];

export const HAVENWOOD_ALLEY_MAP: GameMap = {
  id: "havenwood_alley",
  name: "Back Alley",
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
  encounters: [],
  connections: [],
  background: "/backgrounds/havenwood_alley.png",
  ambientColor: "#8a9070", // Dim, muted green — shadowy alley
};
