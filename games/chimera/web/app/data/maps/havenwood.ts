// Havenwood Village - Starting area with static objects

import type { GameMap, NPC, MapEvent, StaticObject } from "../../types";

// Map dimensions - larger village area
const WIDTH = 30;
const HEIGHT = 25;

// Tile types: 0 = grass, 1 = path, 2 = water
// Create ground layer (grass with paths)
function createGroundLayer(): number[][] {
  const ground: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: number[] = [];
    for (let x = 0; x < WIDTH; x++) {
      // Default grass
      let tile = 0;

      // Main horizontal path through village
      if (y >= 11 && y <= 13 && x >= 3 && x <= 26) {
        tile = 1;
      }

      // Vertical path to north
      if (x >= 14 && x <= 16 && y <= 11) {
        tile = 1;
      }

      // Pond in southeast corner
      if (x >= 22 && x <= 26 && y >= 18 && y <= 22) {
        tile = 2;
      }

      row.push(tile);
    }
    ground.push(row);
  }
  return ground;
}

// Static objects - buildings, trees, rocks with explicit collision
const STATIC_OBJECTS: StaticObject[] = [
  // === BUILDINGS ===
  // Inn - large building on the left side of village
  // Sprite drawn at (4,2), collision one row up from bottom
  {
    id: "inn",
    sprite: "/assets/inn.png",
    x: 4,
    y: 2,
    width: 5,
    height: 6,
    collision: [
      // Block row at offsetY: 4 (y=6)
      { offsetX: 0, offsetY: 4 }, { offsetX: 1, offsetY: 4 }, { offsetX: 2, offsetY: 4 },
      { offsetX: 3, offsetY: 4 }, { offsetX: 4, offsetY: 4 },
    ],
  },
  // Shop - medium building on the right side
  // Sprite drawn at (13,4), door is at the center - door at (14, 6)
  {
    id: "shop",
    sprite: "/assets/shop.png",
    x: 13,
    y: 4,
    width: 3,
    height: 4,
    collision: [
      // Block walls at offsetY: 2 (y=6), leave center (door) open
      { offsetX: 0, offsetY: 2 }, { offsetX: 2, offsetY: 2 },
    ],
  },
  // Cottage - small house near the pond
  {
    id: "cottage",
    sprite: "/assets/cottage.png",
    x: 17,
    y: 15,
    width: 3,
    height: 4,
    collision: [
      // Block at offsetY: 2 (y=17), leave center door open
      { offsetX: 0, offsetY: 2 }, { offsetX: 2, offsetY: 2 },
    ],
  },

  // === TREES ===
  // Northwest trees
  {
    id: "tree_nw_1",
    sprite: "/assets/tree.png",
    x: 0,
    y: 0,
    width: 2,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }],
  },
  {
    id: "tree_nw_2",
    sprite: "/assets/tree.png",
    x: 1,
    y: 4,
    width: 2,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }],
  },
  // North edge trees
  {
    id: "tree_n_1",
    sprite: "/assets/tree.png",
    x: 10,
    y: 0,
    width: 2,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }],
  },
  {
    id: "tree_n_2",
    sprite: "/assets/tree.png",
    x: 26,
    y: 0,
    width: 2,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }],
  },
  // South edge trees
  {
    id: "tree_s_1",
    sprite: "/assets/tree.png",
    x: 2,
    y: 20,
    width: 2,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }],
  },
  {
    id: "tree_s_2",
    sprite: "/assets/tree.png",
    x: 6,
    y: 21,
    width: 2,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }],
  },
  {
    id: "tree_s_3",
    sprite: "/assets/tree.png",
    x: 11,
    y: 19,
    width: 2,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }],
  },

  // === ROCKS ===
  // Rock near west edge
  {
    id: "rock_1",
    sprite: "/assets/rock_large.png",
    x: 0,
    y: 14,
    width: 2,
    height: 1,
    collision: [{ offsetX: 0, offsetY: 0 }, { offsetX: 1, offsetY: 0 }],
  },
  // Rock near east edge
  {
    id: "rock_2",
    sprite: "/assets/rock_small.png",
    x: 28,
    y: 16,
    width: 1,
    height: 1,
    collision: [{ offsetX: 0, offsetY: 0 }],
  },
  // Rock cluster south
  {
    id: "rock_3",
    sprite: "/assets/rock_large.png",
    x: 13,
    y: 22,
    width: 2,
    height: 1,
    collision: [{ offsetX: 0, offsetY: 0 }, { offsetX: 1, offsetY: 0 }],
  },

  // === CAVE ENTRANCE ===
  // Cave leading to Whispering Ruins (north edge)
  {
    id: "cave_entrance",
    sprite: "/assets/cave.png",
    x: 14,
    y: 0,
    width: 3,
    height: 2,
    collision: [
      // Block sides, leave center open for passage
      { offsetX: 0, offsetY: 1 },
      { offsetX: 2, offsetY: 1 },
    ],
  },
];

// Create collision layer based on terrain and static objects
function createCollisionLayer(): boolean[][] {
  const collision: boolean[][] = [];
  const ground = createGroundLayer();

  // Start with terrain collision
  for (let y = 0; y < HEIGHT; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < WIDTH; x++) {
      const tile = ground[y][x];
      // Walkable: grass (0), path (1)
      // Not walkable: water (2)
      row.push(tile !== 2);
    }
    collision.push(row);
  }

  // Add static object collision
  for (const obj of STATIC_OBJECTS) {
    if (obj.collision) {
      for (const block of obj.collision) {
        const bx = obj.x + block.offsetX;
        const by = obj.y + block.offsetY;
        if (by >= 0 && by < HEIGHT && bx >= 0 && bx < WIDTH) {
          collision[by][bx] = false;
        }
      }
    }
  }

  return collision;
}

// NPCs in Havenwood
const NPCS: NPC[] = [
  {
    id: "elder_morris",
    name: "Elder Morris",
    x: 12,
    y: 10,
    sprite: "/sprites/characters/elder.png",
    facing: "down",
    dialogueId: "elder_morris_dynamic",
    movement: "static",
  },
  {
    id: "merchant_aldric",
    name: "Aldric",
    x: 22,
    y: 10,
    sprite: "/sprites/characters/merchant.png",
    facing: "down",
    dialogueId: "merchant_aldric_dynamic",
    movement: "static",
  },
  {
    id: "villager_tom",
    name: "Tom",
    x: 8,
    y: 15,
    sprite: "/sprites/characters/villager.png",
    facing: "right",
    dialogueId: "villager_rumors",
    movement: "wander",
  },
  {
    id: "herbalist_mira",
    name: "Herbalist Mira",
    x: 5,
    y: 14,
    sprite: "/sprites/characters/herbalist.png",
    facing: "down",
    dialogueId: "mira_dynamic",
    movement: "static",
  },
  {
    id: "guard_captain_bren",
    name: "Captain Bren",
    x: 18,
    y: 10,
    sprite: "/sprites/characters/guard_captain_bren.png",
    facing: "down",
    dialogueId: "bren_dynamic",
    movement: "static",
  },
];

// Events in Havenwood
const EVENTS: MapEvent[] = [
  {
    id: "save_point_1",
    type: "save_point",
    x: 15,
    y: 12,
    data: {
      name: "Havenwood Square",
    },
  },
  {
    id: "to_outskirts",
    type: "teleport",
    x: 15,
    y: 0,
    data: {
      targetMapId: "havenwood_outskirts",
      targetX: 17,
      targetY: 23,
      message: "Travel to the Havenwood Outskirts?",
    },
  },
  // Shop Entrance (at the door of the shop building at x=13, door at center x=14)
  {
    id: "aldric_shop_entrance",
    type: "shop",
    x: 14,
    y: 6,
    data: {
      shopId: "aldric_provisions",
      message: "Enter Aldric's Provisions?",
    },
  },
  // Inn Entrance (west side of village)
  {
    id: "havenwood_inn",
    type: "inn",
    x: 6,
    y: 6,
    data: {
      innName: "The Weary Wanderer",
      message: "Enter the inn?",
    },
  },
  // Treasure Chests
  {
    id: "chest_healing",
    type: "treasure",
    x: 3,
    y: 18,
    data: {
      items: [
        { itemId: "sanguine_draught", quantity: 3 },
        { itemId: "mithridate", quantity: 1 },
      ],
    },
    triggered: false,
  },
  {
    id: "chest_weapon",
    type: "treasure",
    x: 27,
    y: 5,
    data: {
      items: [{ itemId: "steel_longsword", quantity: 1 }],
      gold: 100,
    },
    triggered: false,
  },
  {
    id: "chest_shard",
    type: "treasure",
    x: 27,
    y: 23,
    data: {
      shards: ["crimson_shard"],
      gold: 50,
    },
    triggered: false,
  },
  // Quest Collectibles - Moonpetal Flowers
  {
    id: "moonpetal_1",
    type: "collectible",
    x: 2,
    y: 2,
    data: {
      itemId: "moonpetal_flower",
      quantity: 1,
      requiredQuest: "herbalists_request",
      message: "Found a Moonpetal Flower glowing softly in the shade.",
    },
    triggered: false,
  },
  {
    id: "moonpetal_2",
    type: "collectible",
    x: 26,
    y: 3,
    data: {
      itemId: "moonpetal_flower",
      quantity: 1,
      requiredQuest: "herbalists_request",
      message: "A delicate Moonpetal Flower\u2014its petals shimmer like captured starlight.",
    },
    triggered: false,
  },
  {
    id: "moonpetal_3",
    type: "collectible",
    x: 14,
    y: 23,
    data: {
      itemId: "moonpetal_flower",
      quantity: 1,
      requiredQuest: "herbalists_request",
      message: "The final Moonpetal Flower! Mira will be pleased.",
    },
    triggered: false,
  },
];

// Create overhead layer (empty for now)
function createOverheadLayer(): number[][] {
  const overhead: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    overhead.push(new Array(WIDTH).fill(-1));
  }
  return overhead;
}

export const HAVENWOOD_MAP: GameMap = {
  id: "havenwood",
  name: "Havenwood Village",
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
  encounters: [], // No random encounters in the village
  connections: [
    {
      id: "to_outskirts",
      targetMapId: "havenwood_outskirts",
      sourcePosition: { x: 15, y: 0 },
      targetPosition: { x: 17, y: 23 },
      type: "edge",
    },
  ],
  ambientColor: "#f4e4c1",
  music: "peaceful_village",
};
