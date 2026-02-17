// Havenwood Rooftops West - Clay tile rooftops on the western side of Havenwood
// Kai descends from the palace garden through here.
// Narrow walkways between roof peaks, chimneys, dormers.
// Can see the village streets below but can't reach them.

import type { GameMap, MapEvent, StaticObject } from "../../types";

const WIDTH = 24;
const HEIGHT = 18;

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

      // Ladder entry from garden (top-left area)
      if (y >= 1 && y <= 3 && x >= 1 && x <= 4) walkable = true;

      // Main walkable roof path — west rooftop
      if (y >= 3 && y <= 7 && x >= 3 && x <= 10) walkable = true;

      // Chimney 1
      if (y >= 4 && y <= 5 && x >= 6 && x <= 7) walkable = false;

      // Bridge between rooftops (narrow plank)
      if (y >= 7 && y <= 9 && x >= 9 && x <= 11) walkable = true;

      // Central rooftop area
      if (y >= 8 && y <= 13 && x >= 8 && x <= 18) walkable = true;

      // Chimney 2
      if (y >= 9 && y <= 10 && x >= 14 && x <= 15) walkable = false;

      // Dormer window
      if (y === 11 && x >= 10 && x <= 11) walkable = false;

      // East passage to rooftops east
      if (y >= 10 && y <= 12 && x >= 19 && x <= 23) walkable = true;

      // Small balcony south
      if (y >= 14 && y <= 16 && x >= 12 && x <= 16) walkable = true;

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
  // Ladder up to palace garden
  {
    id: "to_garden",
    type: "teleport",
    x: 2,
    y: 1,
    data: {
      targetMapId: "palace_garden",
      targetX: 17,
      targetY: 14,
      message: "Climb back up to the garden?",
    },
  },
  {
    id: "to_garden_2",
    type: "teleport",
    x: 3,
    y: 1,
    data: {
      targetMapId: "palace_garden",
      targetX: 18,
      targetY: 14,
      message: "Climb back up to the garden?",
    },
  },

  // East exit to rooftops east
  ...Array.from({ length: 3 }, (_, i) => ({
    id: i === 0 ? "to_rooftops_east" : `to_rooftops_east_${i + 1}`,
    type: "teleport" as const,
    x: 23,
    y: 10 + i,
    data: {
      targetMapId: "havenwood_rooftops_east",
      targetX: 1,
      targetY: 8 + i,
    },
  })),

  // Examine chimney
  {
    id: "chimney_examine",
    type: "trigger",
    x: 5,
    y: 5,
    data: {
      triggerType: "examine",
      message:
        "The smell of baking bread and pine wood. Life is happening just a few feet below my boots.",
    },
  },
  // Examine view down
  {
    id: "street_view",
    type: "trigger",
    x: 8,
    y: 3,
    data: {
      triggerType: "examine",
      message:
        "I can see a merchant arguing over a crate of apples. He's used the same gesture three times in a row.",
    },
  },
  // Examine dormer
  {
    id: "dormer_examine",
    type: "trigger",
    x: 10,
    y: 12,
    data: {
      triggerType: "examine",
      message:
        "A dormer window, shuttered from inside. You could knock, but something tells you not to draw attention to yourself up here.",
    },
  },
  // Examine weathervane
  {
    id: "weathervane_examine",
    type: "trigger",
    x: 16,
    y: 9,
    data: {
      triggerType: "examine",
      message:
        "The iron rooster is spinning wildly, but there isn't a breath of wind on my face.",
    },
  },
  // Examine balcony view
  {
    id: "balcony_view",
    type: "trigger",
    x: 14,
    y: 16,
    data: {
      triggerType: "examine",
      message:
        "From this balcony, you can see the whole village laid out below. A fountain in the center square. Green trees. It feels impossibly alive after the desert.",
    },
  },
];

export const HAVENWOOD_ROOFTOPS_WEST_MAP: GameMap = {
  id: "havenwood_rooftops_west",
  name: "Havenwood Rooftops",
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
  background: "/backgrounds/havenwood_rooftops_west.png",
  ambientColor: "#d4c4a0", // Warm clay rooftop tones
};
