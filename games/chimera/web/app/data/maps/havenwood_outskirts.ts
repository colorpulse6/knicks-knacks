// Havenwood Outskirts - Connecting area between village and wilderness
// Features paths to: Whispering Ruins (north), Bandit Camp (east), Havenwood (south)

import type { GameMap, NPC, MapEvent, EnemyEncounter, StaticObject } from "../../types";

// Map dimensions
const WIDTH = 35;
const HEIGHT = 25;

// Tile types: 0 = grass, 1 = dirt path, 2 = rocky ground, 3 = water/stream, 4 = dense brush (blocking)
function createGroundLayer(): number[][] {
  const ground: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: number[] = [];
    for (let x = 0; x < WIDTH; x++) {
      // Default grass
      let tile = 0;

      // Main dirt road running north-south through center
      if (x >= 16 && x <= 18 && y >= 0 && y <= 24) {
        tile = 1;
      }

      // Eastern branch path to Bandit Camp
      if (y >= 10 && y <= 12 && x >= 18 && x <= 34) {
        tile = 1;
      }

      // Wider entrance area at south (coming from village)
      if (y >= 22 && x >= 14 && x <= 20) {
        tile = 1;
      }

      // Rocky clearing in northwest (old watchtower area)
      if (x >= 3 && x <= 8 && y >= 3 && y <= 8) {
        tile = 2;
      }

      // Small stream cutting through west side
      if (x >= 6 && x <= 8 && y >= 12 && y <= 18) {
        tile = 3;
      }
      // Stream continuation
      if (y === 15 && x >= 4 && x <= 6) {
        tile = 3;
      }

      // Dense brush areas (blocking terrain)
      // Western forest edge
      if (x <= 2 && y >= 10 && y <= 20) {
        tile = 4;
      }
      // Northern forest edge
      if (y <= 1 && (x <= 10 || x >= 24)) {
        tile = 4;
      }

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
      // Walkable: grass (0), dirt path (1), rocky ground (2)
      // Not walkable: water/stream (3), dense brush (4)
      row.push(tile !== 3 && tile !== 4);
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

// Static objects - trees, rocks, old watchtower
const STATIC_OBJECTS: StaticObject[] = [
  // === OLD WATCHTOWER (ruined) ===
  {
    id: "watchtower_ruins",
    sprite: "/assets/ruins_tower.png",
    x: 4,
    y: 3,
    width: 4,
    height: 5,
    collision: [
      // Collapsed walls create partial blocking
      { offsetX: 0, offsetY: 4 }, { offsetX: 1, offsetY: 4 },
      { offsetX: 2, offsetY: 4 }, { offsetX: 3, offsetY: 4 },
      { offsetX: 0, offsetY: 3 }, { offsetX: 3, offsetY: 3 },
    ],
  },

  // === TREES scattered around ===
  // Northwest trees near watchtower
  {
    id: "tree_outskirts_1",
    sprite: "/assets/tree.png",
    x: 0,
    y: 2,
    width: 2,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }],
  },
  {
    id: "tree_outskirts_2",
    sprite: "/assets/tree.png",
    x: 10,
    y: 0,
    width: 2,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }],
  },
  // Trees along western edge
  {
    id: "tree_outskirts_3",
    sprite: "/assets/tree.png",
    x: 0,
    y: 7,
    width: 2,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }],
  },
  // Trees near stream
  {
    id: "tree_outskirts_4",
    sprite: "/assets/tree.png",
    x: 3,
    y: 12,
    width: 2,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }],
  },
  {
    id: "tree_outskirts_5",
    sprite: "/assets/tree.png",
    x: 9,
    y: 16,
    width: 2,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }],
  },
  // Eastern trees
  {
    id: "tree_outskirts_6",
    sprite: "/assets/tree.png",
    x: 26,
    y: 3,
    width: 2,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }],
  },
  {
    id: "tree_outskirts_7",
    sprite: "/assets/tree.png",
    x: 30,
    y: 6,
    width: 2,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }],
  },
  {
    id: "tree_outskirts_8",
    sprite: "/assets/tree.png",
    x: 24,
    y: 18,
    width: 2,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }],
  },
  // Southern trees near village entrance
  {
    id: "tree_outskirts_9",
    sprite: "/assets/tree.png",
    x: 8,
    y: 20,
    width: 2,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }],
  },
  {
    id: "tree_outskirts_10",
    sprite: "/assets/tree.png",
    x: 24,
    y: 21,
    width: 2,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }],
  },

  // === ROCKS ===
  // Near watchtower ruins
  {
    id: "rock_outskirts_1",
    sprite: "/assets/rock_large.png",
    x: 9,
    y: 5,
    width: 2,
    height: 1,
    collision: [{ offsetX: 0, offsetY: 0 }, { offsetX: 1, offsetY: 0 }],
  },
  // Along the stream
  {
    id: "rock_outskirts_2",
    sprite: "/assets/rock_small.png",
    x: 5,
    y: 11,
    width: 1,
    height: 1,
    collision: [{ offsetX: 0, offsetY: 0 }],
  },
  // Eastern area rocks
  {
    id: "rock_outskirts_3",
    sprite: "/assets/rock_large.png",
    x: 28,
    y: 14,
    width: 2,
    height: 1,
    collision: [{ offsetX: 0, offsetY: 0 }, { offsetX: 1, offsetY: 0 }],
  },

  // === BRIDGE over stream ===
  {
    id: "wooden_bridge",
    sprite: "/assets/bridge.png",
    x: 6,
    y: 14,
    width: 3,
    height: 3,
    collision: [], // Bridge is walkable
  },

  // === OLD WELL ===
  {
    id: "old_well",
    sprite: "/assets/well.png",
    x: 12,
    y: 8,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },

  // === ROADSIDE SHRINE ===
  {
    id: "roadside_shrine",
    sprite: "/assets/shrine.png",
    x: 20,
    y: 6,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },

  // === SIGNPOST at crossroads ===
  {
    id: "signpost",
    sprite: "/assets/signpost.png",
    x: 19,
    y: 10,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
];

// NPCs in outskirts
const NPCS: NPC[] = [
  // Traveling merchant on the road
  {
    id: "traveling_merchant",
    name: "Peddler",
    x: 15,
    y: 15,
    sprite: "/sprites/characters/pedler.png",
    facing: "right",
    dialogueId: "peddler_outskirts",
    movement: "wander",
  },
  // Guard patrolling the road
  {
    id: "road_guard",
    name: "Guard",
    x: 17,
    y: 20,
    sprite: "/sprites/characters/guard.png",
    facing: "up",
    dialogueId: "guard_outskirts",
    movement: "patrol",
    patrolPath: [
      { x: 17, y: 20 },
      { x: 17, y: 14 },
      { x: 17, y: 20 },
    ],
  },
];

// Events in outskirts
const EVENTS: MapEvent[] = [
  // === SAVE POINT at shrine ===
  {
    id: "outskirts_save_point",
    type: "save_point",
    x: 20,
    y: 7,
    data: {
      name: "Roadside Shrine",
    },
  },

  // === TELEPORT to Havenwood (south exit) ===
  {
    id: "to_havenwood",
    type: "teleport",
    x: 17,
    y: 24,
    data: {
      targetMapId: "havenwood",
      targetX: 15,
      targetY: 1,
      message: "Return to Havenwood Village?",
    },
  },

  // === TELEPORT to Whispering Ruins (north) ===
  {
    id: "to_ruins",
    type: "teleport",
    x: 17,
    y: 0,
    data: {
      targetMapId: "whispering_ruins",
      targetX: 5,
      targetY: 17,
      message: "Enter the Whispering Ruins?",
    },
  },

  // === TELEPORT to Bandit Camp (east) - LOCKED initially ===
  {
    id: "to_bandit_camp",
    type: "teleport",
    x: 34,
    y: 11,
    data: {
      targetMapId: "bandit_camp",
      targetX: 2,
      targetY: 12,
      message: "The path leads to a suspicious camp...",
      requiredFlag: "bandit_camp_discovered",
    },
  },

  // === TREASURE in watchtower ruins ===
  {
    id: "watchtower_chest",
    type: "treasure",
    x: 6,
    y: 6,
    data: {
      items: [
        { itemId: "sanguine_draught", quantity: 2 },
        { itemId: "antidote_draught", quantity: 1 },
      ],
      gold: 75,
    },
    triggered: false,
  },

  // === COLLECTIBLE at old well (story item) ===
  {
    id: "well_item",
    type: "collectible",
    x: 12,
    y: 7,
    data: {
      itemId: "rusty_key",
      quantity: 1,
      message: "You found a rusty key at the bottom of the well. What could it unlock?",
    },
    triggered: false,
  },

  // === EVIDENCE of bandits (investigation trigger) ===
  {
    id: "bandit_campfire",
    type: "trigger",
    x: 25,
    y: 8,
    data: {
      triggerType: "investigation",
      flag: "found_bandit_evidence",
      message: "The remains of a recent campfire. Someone was watching the road from here...",
      onTrigger: {
        setFlags: ["found_bandit_evidence"],
        dialogue: "campfire_investigation",
      },
    },
    triggered: false,
  },

  // === SIGNPOST interaction ===
  {
    id: "signpost_interaction",
    type: "trigger",
    x: 19,
    y: 11,
    data: {
      triggerType: "examine",
      message: "North: Whispering Ruins (DANGER)\nSouth: Havenwood Village\nEast: Old Mill Road",
    },
  },
];

// Encounter zones - light encounters on the outskirts
const ENCOUNTERS: EnemyEncounter[] = [
  // Wolf packs in grassy areas
  {
    id: "outskirts_wolves",
    enemies: ["wild_wolf"],
    chance: 0.08,
    zone: { x: 0, y: 10, width: 12, height: 12 },
  },
  // Bandits near eastern path
  {
    id: "outskirts_bandits",
    enemies: ["bandit"],
    chance: 0.10,
    zone: { x: 22, y: 5, width: 12, height: 10 },
  },
  // Mixed encounters near ruins entrance
  {
    id: "outskirts_north",
    enemies: ["wild_wolf", "bandit"],
    chance: 0.12,
    zone: { x: 12, y: 0, width: 10, height: 8 },
  },
];

export const HAVENWOOD_OUTSKIRTS_MAP: GameMap = {
  id: "havenwood_outskirts",
  name: "Havenwood Outskirts",
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
      id: "to_havenwood",
      targetMapId: "havenwood",
      sourcePosition: { x: 17, y: 24 },
      targetPosition: { x: 15, y: 1 },
      type: "edge",
    },
    {
      id: "to_ruins",
      targetMapId: "whispering_ruins",
      sourcePosition: { x: 17, y: 0 },
      targetPosition: { x: 5, y: 17 },
      type: "edge",
    },
    {
      id: "to_bandit_camp",
      targetMapId: "bandit_camp",
      sourcePosition: { x: 34, y: 11 },
      targetPosition: { x: 2, y: 12 },
      type: "edge",
    },
  ],
  ambientColor: "#d4c4a8", // Dusty outdoor color
  music: "outskirts_theme",
  // This area unlocks after talking to Elder Morris about bandits
  requiredFlags: ["outskirts_unlocked"],
};
