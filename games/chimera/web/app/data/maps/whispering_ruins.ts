// Whispering Ruins - First dungeon area with encounters

import type { GameMap, NPC, MapEvent, EnemyEncounter, StaticObject } from "../../types";

// Map dimensions
const WIDTH = 25;
const HEIGHT = 20;

// Tile types for this map (indices)
// 0 = stone floor, 1 = path, 2 = void/pit, 3 = wall, 4 = rubble, 5 = glowing tiles

// Create ground layer (ruins with pathways)
function createGroundLayer(): number[][] {
  const ground: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: number[] = [];
    for (let x = 0; x < WIDTH; x++) {
      // Default to void (pit)
      let tile = 2;

      // Main entrance area (south)
      if (y >= 14 && y <= 19 && x >= 3 && x <= 8) {
        tile = 0; // Stone floor
      }

      // Central path to ruins
      if (y >= 8 && y < 14 && x >= 4 && x <= 7) {
        tile = 1; // Path
      }

      // Western corridor
      if (y >= 6 && y <= 12 && x >= 0 && x <= 4) {
        tile = 0;
      }

      // Central chamber
      if (y >= 4 && y <= 10 && x >= 8 && x <= 16) {
        tile = 0;
      }

      // Eastern corridor
      if (y >= 5 && y <= 11 && x >= 17 && x <= 24) {
        tile = 0;
      }

      // Northern secret area
      if (y >= 0 && y <= 4 && x >= 10 && x <= 14) {
        tile = 5; // Glowing tiles (special area)
      }

      // Walls around edges
      if (x === 0 || x === WIDTH - 1 || y === 0 || y === HEIGHT - 1) {
        // Keep void/pit at edges
        if (tile === 0 || tile === 1) {
          tile = 3; // Wall
        }
      }

      // Add rubble scatter (decorative only, doesn't block movement)
      // Rubble is now walkable to avoid random blocking

      row.push(tile);
    }
    ground.push(row);
  }
  return ground;
}

// Create collision layer
function createCollisionLayer(): boolean[][] {
  const collision: boolean[][] = [];
  const ground = createGroundLayer();

  for (let y = 0; y < HEIGHT; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < WIDTH; x++) {
      const tile = ground[y][x];
      // Walkable: stone floor (0), path (1), glowing (5)
      // Not walkable: void (2), wall (3), rubble (4)
      row.push(tile === 0 || tile === 1 || tile === 5);
    }
    collision.push(row);
  }
  return collision;
}

// Create overhead layer (empty for now)
function createOverheadLayer(): number[][] {
  const overhead: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    overhead.push(new Array(WIDTH).fill(-1));
  }
  return overhead;
}

// NPCs in ruins
const NPCS: NPC[] = [
  {
    id: "mysterious_figure",
    name: "???",
    x: 12,
    y: 2,
    sprite: "/sprites/characters/mysterious.png",
    facing: "down",
    dialogueId: "mysterious_intro",
    movement: "static",
  },
];

// Events in ruins
const EVENTS: MapEvent[] = [
  {
    id: "ruins_save_point",
    type: "save_point",
    x: 5,
    y: 15,
    data: {
      name: "Ruins Entrance",
    },
  },
  {
    id: "outskirts_exit",
    type: "teleport",
    x: 5,
    y: 18,
    data: {
      targetMapId: "havenwood_outskirts",
      targetX: 17,
      targetY: 1,
      message: "Return to the Havenwood Outskirts?",
    },
  },
  {
    id: "ruins_chest_1",
    type: "treasure",
    x: 2,
    y: 7,
    data: {
      itemId: "ether",
      quantity: 1,
    },
    triggered: false,
  },
  {
    id: "ruins_chest_2",
    type: "treasure",
    x: 23,
    y: 7,
    data: {
      itemId: "hi_potion",
      quantity: 1,
    },
    triggered: false,
  },
  {
    id: "boss_trigger",
    type: "battle",
    x: 12,
    y: 4,
    data: {
      enemies: ["system_agent"],
      isBoss: true,
      oneTime: true,
    },
    triggered: false,
  },
  // Entrance to lower level (unlocked after Lyra joins)
  {
    id: "to_lower_ruins",
    type: "teleport",
    x: 12,
    y: 5,
    data: {
      targetMapId: "whispering_ruins_lower",
      targetX: 17,
      targetY: 27,
      message: "Descend deeper into the ruins?",
      requiredFlag: "lyra_recruited",
    },
  },
];

// Static objects - rocks and rubble in the ruins
const STATIC_OBJECTS: StaticObject[] = [
  // Western corridor rocks
  {
    id: "ruins_rock_1",
    sprite: "/assets/rock_large.png",
    x: 1,
    y: 10,
    width: 2,
    height: 1,
    collision: [{ offsetX: 0, offsetY: 0 }, { offsetX: 1, offsetY: 0 }],
  },
  // Central chamber rocks
  {
    id: "ruins_rock_2",
    sprite: "/assets/rock_small.png",
    x: 9,
    y: 6,
    width: 1,
    height: 1,
    collision: [{ offsetX: 0, offsetY: 0 }],
  },
  {
    id: "ruins_rock_3",
    sprite: "/assets/rock_small.png",
    x: 15,
    y: 9,
    width: 1,
    height: 1,
    collision: [{ offsetX: 0, offsetY: 0 }],
  },
  // Eastern corridor rocks
  {
    id: "ruins_rock_4",
    sprite: "/assets/rock_large.png",
    x: 20,
    y: 8,
    width: 2,
    height: 1,
    collision: [{ offsetX: 0, offsetY: 0 }, { offsetX: 1, offsetY: 0 }],
  },
  {
    id: "ruins_rock_5",
    sprite: "/assets/rock_small.png",
    x: 22,
    y: 10,
    width: 1,
    height: 1,
    collision: [{ offsetX: 0, offsetY: 0 }],
  },
  // Entrance area rock
  {
    id: "ruins_rock_6",
    sprite: "/assets/rock_small.png",
    x: 7,
    y: 17,
    width: 1,
    height: 1,
    collision: [{ offsetX: 0, offsetY: 0 }],
  },

  // === CAVE EXIT ===
  // Cave leading back to Havenwood (south edge)
  {
    id: "cave_exit",
    sprite: "/assets/cave.png",
    x: 4,
    y: 18,
    width: 3,
    height: 2,
    collision: [
      // Block sides, leave center open for passage
      { offsetX: 0, offsetY: 1 },
      { offsetX: 2, offsetY: 1 },
    ],
  },
];

// Encounter zones in the ruins
const ENCOUNTERS: EnemyEncounter[] = [
  {
    id: "western_corridor",
    enemies: ["bandit"],
    chance: 0.15, // 15% chance per step
    zone: { x: 0, y: 6, width: 5, height: 7 },
  },
  {
    id: "central_chamber",
    enemies: ["corrupted"],
    chance: 0.12,
    zone: { x: 8, y: 4, width: 9, height: 7 },
  },
  {
    id: "eastern_corridor",
    enemies: ["corrupted"],
    chance: 0.18,
    zone: { x: 17, y: 5, width: 8, height: 7 },
  },
  {
    id: "entrance_path",
    enemies: ["bandit"],
    chance: 0.08, // Lower chance near entrance
    zone: { x: 4, y: 8, width: 4, height: 6 },
  },
];

export const WHISPERING_RUINS_MAP: GameMap = {
  id: "whispering_ruins",
  name: "Whispering Ruins",
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
  encounters: ENCOUNTERS,
  connections: [
    {
      id: "to_outskirts",
      targetMapId: "havenwood_outskirts",
      sourcePosition: { x: 5, y: 18 },
      targetPosition: { x: 17, y: 1 },
      type: "edge",
    },
    {
      id: "to_lower_ruins",
      targetMapId: "whispering_ruins_lower",
      sourcePosition: { x: 12, y: 5 },
      targetPosition: { x: 17, y: 27 },
      type: "stairs",
    },
  ],
  ambientColor: "#2a2a3d", // Dark purple-ish
  music: "dungeon_mystery",
};
