// Havenwood Rooftops East - Eastern rooftop area overlooking the village
// Continues from rooftops west. A ladder here leads down to the alley.
// Tighter spaces, steeper roofs. Can see the harbor from here.

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

      // West entry from rooftops west
      if (y >= 7 && y <= 10 && x >= 0 && x <= 2) walkable = true;

      // Northern rooftop
      if (y >= 3 && y <= 8 && x >= 3 && x <= 12) walkable = true;

      // Chimney cluster
      if (y >= 4 && y <= 5 && x >= 8 && x <= 9) walkable = false;

      // Connection path
      if (y >= 8 && y <= 11 && x >= 10 && x <= 14) walkable = true;

      // Southern rooftop
      if (y >= 10 && y <= 15 && x >= 12 && x <= 20) walkable = true;

      // Large chimney south
      if (y >= 12 && y <= 13 && x >= 17 && x <= 18) walkable = false;

      // Skylight
      if (y === 11 && x >= 15 && x <= 16) walkable = false;

      // Ladder down to alley (southeast corner)
      if (y >= 15 && y <= 17 && x >= 20 && x <= 22) walkable = true;

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
  // West exit to rooftops west
  ...Array.from({ length: 3 }, (_, i) => ({
    id: i === 0 ? "to_rooftops_west" : `to_rooftops_west_${i + 1}`,
    type: "teleport" as const,
    x: 0,
    y: 8 + i,
    data: {
      targetMapId: "havenwood_rooftops_west",
      targetX: 22,
      targetY: 10 + i,
    },
  })),

  // Ladder down to alley
  {
    id: "to_alley",
    type: "teleport",
    x: 21,
    y: 17,
    data: {
      targetMapId: "havenwood_alley",
      targetX: 6,
      targetY: 2,
      message: "A ladder leads down into a narrow alley. Climb down?",
    },
  },
  {
    id: "to_alley_2",
    type: "teleport",
    x: 22,
    y: 17,
    data: {
      targetMapId: "havenwood_alley",
      targetX: 7,
      targetY: 2,
      message: "A ladder leads down into a narrow alley. Climb down?",
    },
  },

  // Examine harbor view
  {
    id: "harbor_view",
    type: "trigger",
    x: 6,
    y: 3,
    data: {
      triggerType: "examine",
      message:
        "From up here you can see the harbor. Fishing boats bob gently. The water catches the sunlight like broken glass. It's beautiful.",
    },
  },
  // Examine skylight
  {
    id: "skylight_examine",
    type: "trigger",
    x: 15,
    y: 12,
    data: {
      triggerType: "examine",
      message:
        "A dim room filled with books. A candle burns on a desk, but the flame doesn't flicker. It's perfectly still.",
    },
  },
  // Examine bird nest
  {
    id: "bird_nest",
    type: "trigger",
    x: 19,
    y: 11,
    data: {
      triggerType: "examine",
      message:
        "A small brown bird sits on her eggs. She doesn't chirp. She just watches me with a cold, glassy eye.",
    },
  },
  // Examine chimney cluster
  {
    id: "chimney_cluster",
    type: "trigger",
    x: 7,
    y: 5,
    data: {
      triggerType: "examine",
      message:
        "A cluster of chimneys, each a slightly different shade of brick. The smoke from each one rises at exactly the same angle. Exactly.",
    },
  },
  // Examine loose tile
  {
    id: "loose_tile",
    type: "trigger",
    x: 13,
    y: 14,
    data: {
      triggerType: "examine",
      message:
        "This tile is chipped. Beneath the clay, there's something cold and grey. It feels harder than any stone I know.",
    },
  },
];

export const HAVENWOOD_ROOFTOPS_EAST_MAP: GameMap = {
  id: "havenwood_rooftops_east",
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
  background: "/backgrounds/havenwood_rooftops_east.png",
  ambientColor: "#d4c4a0",
};
