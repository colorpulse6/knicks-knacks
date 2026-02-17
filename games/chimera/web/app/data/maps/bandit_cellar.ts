// Bandit Cellar - Hidden underground area with strange artifacts
// This is where Kai discovers the first clear evidence of advanced technology

import type { GameMap, MapEvent, StaticObject } from "../../types";

// Map dimensions (small underground space)
const WIDTH = 15;
const HEIGHT = 12;

// Tile types: 0 = stone floor, 1 = dirt, 2 = wall, 3 = glowing floor (tech hint)
function createGroundLayer(): number[][] {
  const ground: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: number[] = [];
    for (let x = 0; x < WIDTH; x++) {
      // Default walls
      let tile = 2;

      // Main cellar room
      if (x >= 2 && x <= 12 && y >= 2 && y <= 9) {
        tile = 0; // Stone floor
      }

      // Entrance area (dirt)
      if (x >= 4 && x <= 6 && y >= 7 && y <= 10) {
        tile = 1;
      }

      // Strange glowing section in the back (the discovery)
      if (x >= 8 && x <= 11 && y >= 3 && y <= 5) {
        tile = 3;
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
      // Walls (2) block movement
      row.push(tile !== 2);
    }
    collision.push(row);
  }

  return collision;
}

// Create overhead layer
function createOverheadLayer(): number[][] {
  const overhead: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    overhead.push(new Array(WIDTH).fill(-1));
  }
  return overhead;
}

// Static objects
const STATIC_OBJECTS: StaticObject[] = [
  // === STOLEN GOODS ===
  {
    id: "crates_cellar",
    sprite: "/assets/crates.png",
    x: 3,
    y: 3,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },
  {
    id: "barrels_cellar",
    sprite: "/assets/barrels.png",
    x: 3,
    y: 6,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },

  // === STRANGE DEVICE (the artifact) ===
  {
    id: "strange_device",
    sprite: "/assets/artifact_device.png",
    x: 9,
    y: 3,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },

  // === LADDER back up ===
  {
    id: "ladder_up",
    sprite: "/assets/ladder.png",
    x: 5,
    y: 8,
    width: 1,
    height: 2,
    collision: [], // Walkable
  },

  // === TORCH HOLDERS ===
  {
    id: "torch_1",
    sprite: "/assets/wall_torch.png",
    x: 2,
    y: 4,
    width: 1,
    height: 2,
    collision: [],
  },
  {
    id: "torch_2",
    sprite: "/assets/wall_torch.png",
    x: 12,
    y: 4,
    width: 1,
    height: 2,
    collision: [],
  },
];

// Events
const EVENTS: MapEvent[] = [
  // === EXIT back to Vorn's tent ===
  {
    id: "cellar_exit",
    type: "teleport",
    x: 5,
    y: 9,
    data: {
      targetMapId: "bandit_tent",
      targetX: 3,
      targetY: 3,
      message: "Climb back up to the tent?",
    },
  },

  // === THE ARTIFACT - key discovery ===
  {
    id: "artifact_examine",
    type: "trigger",
    x: 10,
    y: 4,
    data: {
      triggerType: "story",
      message: "",
      onTrigger: {
        setFlags: ["found_mechanism", "strange_tech_seen"],
        dialogue: "artifact_discovery",
        giveItem: "broken_mechanism",
      },
    },
    triggered: false,
  },

  // === STOLEN DOCUMENTS (lore) ===
  {
    id: "stolen_documents",
    type: "trigger",
    x: 3,
    y: 4,
    data: {
      triggerType: "examine",
      message: "Stolen trade documents and merchant ledgers. The bandits have been intercepting shipments for months.",
      onTrigger: {
        setFlags: ["found_stolen_documents"],
      },
    },
  },

  // === TREASURE ===
  {
    id: "cellar_treasure",
    type: "treasure",
    x: 6,
    y: 3,
    data: {
      items: [
        { itemId: "ancient_coin", quantity: 3 },
        { itemId: "sanguine_draught", quantity: 2 },
      ],
      gold: 250,
    },
    triggered: false,
  },

  // === INVESTIGATION - glowing floor ===
  {
    id: "glowing_floor_examine",
    type: "trigger",
    x: 9,
    y: 4,
    data: {
      triggerType: "examine",
      message: "The floor here has a faint glow... as if something beneath is still powered after all these years. The stone is warm to the touch.",
    },
  },
];

export const BANDIT_CELLAR_MAP: GameMap = {
  id: "bandit_cellar",
  name: "Hidden Cellar",
  width: WIDTH,
  height: HEIGHT,
  tileSize: 32,
  layers: {
    ground: createGroundLayer(),
    collision: createCollisionLayer(),
    overhead: createOverheadLayer(),
  },
  events: EVENTS,
  npcs: [], // No NPCs in the cellar
  staticObjects: STATIC_OBJECTS,
  encounters: [], // No random encounters
  connections: [
    {
      id: "to_tent",
      targetMapId: "bandit_tent",
      sourcePosition: { x: 5, y: 9 },
      targetPosition: { x: 3, y: 3 },
      type: "stairs",
    },
  ],
  background: "/backgrounds/bandit_cellar.png",
  ambientColor: "#1a1a2e", // Dark mysterious blue
  music: "mystery_discovery",
  // No requiredFlags - access is controlled by the tent's cellar entrance
};
