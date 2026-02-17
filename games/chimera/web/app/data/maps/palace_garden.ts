// Palace Garden - Isolated rooftop garden atop the Lumina Estate
// Kai wakes up here after collapsing in the desert.
// Not connected to the main Lumina Estate interior — accessible only from the rooftops.
// A hidden, overgrown space. No NPCs. Quiet and strange.

import type { GameMap, MapEvent, StaticObject } from "../../types";

const WIDTH = 20;
const HEIGHT = 16;

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

      // Stone walls on all edges
      if (x === 0 || x === WIDTH - 1 || y === 0) walkable = false;

      // Main garden area
      if (y >= 1 && y <= 14 && x >= 1 && x <= 18) walkable = true;

      // Central fountain (dry)
      if (y >= 6 && y <= 8 && x >= 8 && x <= 11) walkable = false;

      // Flower bed left
      if (y >= 3 && y <= 4 && x >= 2 && x <= 4) walkable = false;

      // Flower bed right
      if (y >= 3 && y <= 4 && x >= 15 && x <= 17) walkable = false;

      // Stone bench (north center — where Kai wakes up)
      if (y >= 1 && y <= 2 && x >= 8 && x <= 11) walkable = false;

      // Hedge row south
      if (y === 12 && x >= 3 && x <= 7) walkable = false;
      if (y === 12 && x >= 12 && x <= 16) walkable = false;

      // Bottom wall (with ladder opening)
      if (y === 15) {
        walkable = false;
        // Ladder down to rooftops at east side
        if (x >= 17 && x <= 18) walkable = true;
      }

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

const EVENTS: MapEvent[] = [
  // Ladder down to rooftops
  {
    id: "to_rooftops",
    type: "teleport",
    x: 17,
    y: 15,
    data: {
      targetMapId: "havenwood_rooftops_west",
      targetX: 2,
      targetY: 2,
      message: "A wooden ladder leads down to the rooftops below. Climb down?",
    },
  },
  {
    id: "to_rooftops_2",
    type: "teleport",
    x: 18,
    y: 15,
    data: {
      targetMapId: "havenwood_rooftops_west",
      targetX: 3,
      targetY: 2,
      message: "A wooden ladder leads down to the rooftops below. Climb down?",
    },
  },

  // Examine fountain
  {
    id: "fountain_examine",
    type: "trigger",
    x: 10,
    y: 5,
    data: {
      triggerType: "examine",
      message:
        "A stone maiden holds an empty pitcher. The basin is bone-dry, but the moss around it is lush and vibrant.",
    },
  },
  // Examine stone bench (where Kai woke up — placed here by Lyra)
  {
    id: "bench_examine",
    type: "trigger",
    x: 10,
    y: 3,
    data: {
      triggerType: "examine",
      message:
        "The moss is flattened here. A folded cloth and an empty water flask sit beside where I was lying. Someone brought me here... and stayed long enough to leave these.",
    },
  },
  // Examine flowers
  {
    id: "flowers_examine",
    type: "trigger",
    x: 3,
    y: 3,
    data: {
      triggerType: "examine",
      message:
        "These petals... they don't sway in the wind. They pulse, like a slow, heavy heartbeat.",
    },
  },
  // Examine garden wall
  {
    id: "wall_examine",
    type: "trigger",
    x: 10,
    y: 1,
    data: {
      triggerType: "examine",
      message:
        "There are no gates. No doors. It's as if this place was built to be seen by the sky, and nothing else.",
    },
  },
  // Examine view over the wall
  {
    id: "view_examine",
    type: "trigger",
    x: 1,
    y: 8,
    data: {
      triggerType: "examine",
      message:
        "The village looks like a toy set from up here. Smoke rises in perfect, straight lines from every chimney.",
    },
  },
  // Examine ladder
  {
    id: "ladder_examine",
    type: "trigger",
    x: 16,
    y: 14,
    data: {
      triggerType: "examine",
      message:
        "A crude ladder. It feels out of place against such pristine stonework. Someone left this for me.",
    },
  },
];

export const PALACE_GARDEN_MAP: GameMap = {
  id: "palace_garden",
  name: "Palace Garden",
  width: WIDTH,
  height: HEIGHT,
  tileSize: 32,
  layers: {
    ground: createGroundLayer(),
    collision: createCollisionLayer(),
    overhead: createOverheadLayer(),
  },
  events: EVENTS,
  npcs: [],
  staticObjects: STATIC_OBJECTS,
  encounters: [],
  connections: [],
  background: "/backgrounds/palace_garden.png",
  ambientColor: "#c8d8b0", // Soft green — contrasts with desert amber
};
