// Lumina Estate - Noble family manor
// Home of Lady Lyra Lumina and the Lumina family archives

import type { GameMap, NPC, MapEvent, StaticObject } from "../../types";

// Map dimensions - elegant manor interior
const WIDTH = 20;
const HEIGHT = 16;

// Tile types: 0 = marble floor, 1 = carpet (red), 2 = wood paneling
function createGroundLayer(): number[][] {
  const ground: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: number[] = [];
    for (let x = 0; x < WIDTH; x++) {
      // Default marble floor
      let tile = 0;

      // Red carpet runner down the center
      if (x >= 9 && x <= 10 && y >= 4 && y <= 14) {
        tile = 1;
      }

      // Carpet in front of throne/study area
      if (y >= 1 && y <= 3 && x >= 7 && x <= 12) {
        tile = 1;
      }

      row.push(tile);
    }
    ground.push(row);
  }
  return ground;
}

// Create collision layer (true = walkable, false = blocked)
function createCollisionLayer(): boolean[][] {
  const collision: boolean[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < WIDTH; x++) {
      let walkable = true;

      // Walls around the edge
      if (x === 0 || x === WIDTH - 1 || y === 0) {
        walkable = false;
      }

      // Pillars
      if ((x === 3 || x === 16) && (y === 4 || y === 8 || y === 12)) {
        walkable = false;
      }

      // Study desk at the north end
      if (y === 2 && x >= 8 && x <= 11) {
        walkable = false;
      }

      // Bookshelf walls on sides
      if (x === 1 && y >= 2 && y <= 6) {
        walkable = false;
      }
      if (x === 18 && y >= 2 && y <= 6) {
        walkable = false;
      }

      // Exit doorway frame (sides blocked, center walkable)
      if ((x === 8 || x === 11) && (y === 14 || y === 15)) {
        walkable = false;
      }

      row.push(walkable);
    }
    collision.push(row);
  }
  return collision;
}

// Create overhead layer
function createOverheadLayer(): number[][] {
  const overhead: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: number[] = [];
    for (let x = 0; x < WIDTH; x++) {
      row.push(0);
    }
    overhead.push(row);
  }
  return overhead;
}

// Static objects - furniture, decorations
const STATIC_OBJECTS: StaticObject[] = [
  // Grand desk at the study area
  {
    id: "study_desk",
    sprite: "/assets/desk.png",
    x: 8,
    y: 1,
    width: 4,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 },
      { offsetX: 1, offsetY: 1 },
      { offsetX: 2, offsetY: 1 },
      { offsetX: 3, offsetY: 1 },
    ],
  },
  // Left bookshelf
  {
    id: "bookshelf_left",
    sprite: "/assets/bookshelf.png",
    x: 1,
    y: 1,
    width: 2,
    height: 6,
    collision: [
      { offsetX: 0, offsetY: 5 },
      { offsetX: 1, offsetY: 5 },
    ],
  },
  // Right bookshelf
  {
    id: "bookshelf_right",
    sprite: "/assets/bookshelf.png",
    x: 17,
    y: 1,
    width: 2,
    height: 6,
    collision: [
      { offsetX: 0, offsetY: 5 },
      { offsetX: 1, offsetY: 5 },
    ],
  },
  // Pillars
  {
    id: "pillar_left_1",
    sprite: "/assets/pillar.png",
    x: 3,
    y: 3,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
  {
    id: "pillar_left_2",
    sprite: "/assets/pillar.png",
    x: 3,
    y: 7,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
  {
    id: "pillar_left_3",
    sprite: "/assets/pillar.png",
    x: 3,
    y: 11,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
  {
    id: "pillar_right_1",
    sprite: "/assets/pillar.png",
    x: 16,
    y: 3,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
  {
    id: "pillar_right_2",
    sprite: "/assets/pillar.png",
    x: 16,
    y: 7,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
  {
    id: "pillar_right_3",
    sprite: "/assets/pillar.png",
    x: 16,
    y: 11,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
  // Decorative armor stands
  {
    id: "armor_left",
    sprite: "/assets/armor_stand.png",
    x: 5,
    y: 2,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
  {
    id: "armor_right",
    sprite: "/assets/armor_stand.png",
    x: 14,
    y: 2,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
  // Chandelier visual marker (no collision)
  {
    id: "chandelier",
    sprite: "/assets/chandelier.png",
    x: 9,
    y: 7,
    width: 2,
    height: 2,
    collision: [],
  },
  // Grand entrance doorway
  {
    id: "exit_doorway",
    sprite: "/assets/door_ornate.png",
    x: 8,
    y: 12,
    width: 4,
    height: 4,
    collision: [
      { offsetX: 0, offsetY: 2 },
      { offsetX: 0, offsetY: 3 },
      { offsetX: 3, offsetY: 2 },
      { offsetX: 3, offsetY: 3 },
    ],
  },
];

// NPCs in the estate
const NPCS: NPC[] = [
  // Lady Lyra Lumina - at the study desk
  {
    id: "lady_lyra",
    name: "Lady Lyra Lumina",
    x: 10,
    y: 3,
    sprite: "/sprites/characters/lyra.png",
    facing: "down",
    dialogueId: "lyra_dynamic",
    movement: "static",
  },
  // Butler/Servant
  {
    id: "estate_butler",
    name: "Sebastian",
    x: 6,
    y: 10,
    sprite: "/sprites/characters/butler.png",
    facing: "right",
    dialogueId: "butler_estate",
    movement: "static",
  },
  // Guard at entrance
  {
    id: "estate_guard",
    name: "Estate Guard",
    x: 9,
    y: 13,
    sprite: "/sprites/characters/guard.png",
    facing: "down",
    dialogueId: "estate_guard",
    movement: "static",
  },
];

// Events in the estate
const EVENTS: MapEvent[] = [
  // Exit to Havenwood
  {
    id: "estate_exit",
    type: "teleport",
    x: 9,
    y: 15,
    data: {
      targetMapId: "havenwood",
      targetX: 15,
      targetY: 12,
      message: "Return to Havenwood Village",
    },
  },
  // Examine bookshelves - left
  {
    id: "bookshelf_examine_left",
    type: "trigger",
    x: 2,
    y: 4,
    data: {
      triggerType: "examine",
      message:
        "Ancient tomes line the shelves. Titles include 'The Lineage of Light', 'Precursor Myths', and 'Anomalies in the Historical Record'. The Lumina family has collected knowledge for generations.",
    },
  },
  // Examine bookshelves - right
  {
    id: "bookshelf_examine_right",
    type: "trigger",
    x: 17,
    y: 4,
    data: {
      triggerType: "examine",
      message:
        "These shelves contain more technical texts. You spot 'The Nature of Temporal Distortions', 'Energy Without Flame', and a locked journal simply labeled 'Project Genesis'.",
    },
  },
  // Examine the desk
  {
    id: "desk_examine",
    type: "trigger",
    x: 10,
    y: 2,
    data: {
      triggerType: "examine",
      requiredFlag: "met_lyra",
      message:
        "Papers are scattered across the desk. One diagram shows the mechanism you found, with annotations: 'Self-repairing polymer? Crystalline data storage? Tech level inconsistent with known history.'",
    },
  },
  // Family portrait
  {
    id: "portrait_examine",
    type: "trigger",
    x: 10,
    y: 1,
    data: {
      triggerType: "examine",
      message:
        "A large portrait hangs above the desk. It shows three generations of the Lumina family. Their eyes seem to catch the light strangely... almost glowing. Lady Lyra stands in the front, a child in the painting.",
    },
  },
  // Armor stands
  {
    id: "armor_examine",
    type: "trigger",
    x: 5,
    y: 3,
    data: {
      triggerType: "examine",
      message:
        "Ornate ceremonial armor. The craftsmanship is exquisite, but something about the metalwork feels... wrong. Too precise. Too perfect. As if made by something other than human hands.",
    },
  },
  // Save point
  {
    id: "estate_save",
    type: "save_point",
    x: 14,
    y: 10,
    data: {
      message: "A sense of calm washes over you in this grand hall.",
    },
  },
];

export const LUMINA_ESTATE_MAP: GameMap = {
  id: "lumina_estate",
  name: "Lumina Estate",
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
  encounters: [], // No random encounters in the estate
  connections: [], // Use teleport events for transitions
  ambientColor: "#e8dcc8", // Warm, elegant lighting
  music: "noble_theme",
};
