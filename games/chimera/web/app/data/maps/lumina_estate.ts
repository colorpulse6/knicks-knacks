// Lumina Estate - Noble family manor (fine-grid interior)
// Home of Lady Lyra Lumina and the Lumina family archives
// Background: 1280x1024 at 32px/tile = 40x32 grid

import type { GameMap, NPC, MapEvent, StaticObject } from "../../types";

// Map dimensions — doubled from 20x16 for finer collision control at 32px tiles
const WIDTH = 40;
const HEIGHT = 32;

// Ground layer (background image handles visuals)
function createGroundLayer(): number[][] {
  const ground: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    ground.push(new Array(WIDTH).fill(0));
  }
  return ground;
}

// Create collision layer (true = walkable, false = blocked)
// Minimal boundaries: edge walls, single-tile pillars, narrow furniture
function createCollisionLayer(): boolean[][] {
  const collision: boolean[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < WIDTH; x++) {
      let walkable = true;

      // === EDGE WALLS ===
      // Top wall
      if (y === 0) walkable = false;
      // Bottom wall (with exit opening)
      if (y === HEIGHT - 1) {
        walkable = false;
        // Exit doorway at center bottom
        if (x >= 18 && x <= 21) walkable = true;
      }
      // Left wall
      if (x === 0) walkable = false;
      // Right wall
      if (x === WIDTH - 1) walkable = false;

      // === PILLAR BASES (perspective-scaled, wider toward bottom) ===
      // Left pillar 1 (top): 2 wide, 1 tall
      if ((x === 9 || x === 10) && y === 10) walkable = false;
      // Left pillar 2 (middle): 3 wide, 1 tall
      if (x >= 5 && x <= 7 && y === 15) walkable = false;
      // Left pillar 3 (bottom): 3 wide, 2 tall
      if (x >= 1 && x <= 3 && y >= 22 && y <= 23) walkable = false;
      // Right pillar 1 (top, mirrored): 2 wide, 1 tall
      if ((x === 29 || x === 30) && y === 10) walkable = false;
      // Right pillar 2 (middle, mirrored): 3 wide, 1 tall
      if (x >= 32 && x <= 34 && y === 15) walkable = false;
      // Right pillar 3 (bottom, mirrored): 3 wide, 2 tall
      if (x >= 36 && x <= 38 && y >= 22 && y <= 23) walkable = false;

      // === STUDY DESK at north end ===
      if (y >= 3 && y <= 4 && x >= 16 && x <= 23) walkable = false;

      // === BOOKSHELVES along walls ===
      // Left bookshelves: x=1-2, y=3-12
      if (x >= 1 && x <= 2 && y >= 3 && y <= 12) walkable = false;
      // Right bookshelves: x=37-38, y=3-12
      if (x >= 37 && x <= 38 && y >= 3 && y <= 12) walkable = false;

      // === EXIT DOORFRAME sides ===
      if ((x === 17 || x === 22) && y >= 29 && y <= 31) walkable = false;

      row.push(walkable);
    }
    collision.push(row);
  }
  return collision;
}

// Overhead layer (empty — background image handles visuals)
function createOverheadLayer(): number[][] {
  const overhead: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    overhead.push(new Array(WIDTH).fill(-1));
  }
  return overhead;
}

// Static objects — furniture & decorations (coordinates doubled for 32px grid)
const STATIC_OBJECTS: StaticObject[] = [
  {
    id: "study_desk",
    sprite: "/assets/desk.png",
    x: 16,
    y: 2,
    width: 8,
    height: 3,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
      { offsetX: 2, offsetY: 1 }, { offsetX: 3, offsetY: 1 },
      { offsetX: 4, offsetY: 1 }, { offsetX: 5, offsetY: 1 },
      { offsetX: 6, offsetY: 1 }, { offsetX: 7, offsetY: 1 },
    ],
  },
  {
    id: "bookshelf_left",
    sprite: "/assets/bookshelf.png",
    x: 1,
    y: 2,
    width: 2,
    height: 11,
    collision: [],
  },
  {
    id: "bookshelf_right",
    sprite: "/assets/bookshelf.png",
    x: 37,
    y: 2,
    width: 2,
    height: 11,
    collision: [],
  },
  {
    id: "pillar_left_1",
    sprite: "/assets/pillar.png",
    x: 9,
    y: 5,
    width: 2,
    height: 6,
    collision: [
      { offsetX: 0, offsetY: 5 }, { offsetX: 1, offsetY: 5 },
    ],
  },
  {
    id: "pillar_left_2",
    sprite: "/assets/pillar.png",
    x: 6,
    y: 10,
    width: 3,
    height: 6,
    collision: [
      { offsetX: 0, offsetY: 5 }, { offsetX: 1, offsetY: 5 }, { offsetX: 2, offsetY: 5 },
    ],
  },
  {
    id: "pillar_left_3",
    sprite: "/assets/pillar.png",
    x: 1,
    y: 16,
    width: 3,
    height: 8,
    collision: [
      { offsetX: 0, offsetY: 6 }, { offsetX: 1, offsetY: 6 }, { offsetX: 2, offsetY: 6 },
      { offsetX: 0, offsetY: 7 }, { offsetX: 1, offsetY: 7 }, { offsetX: 2, offsetY: 7 },
    ],
  },
  {
    id: "pillar_right_1",
    sprite: "/assets/pillar.png",
    x: 29,
    y: 5,
    width: 2,
    height: 6,
    collision: [
      { offsetX: 0, offsetY: 5 }, { offsetX: 1, offsetY: 5 },
    ],
  },
  {
    id: "pillar_right_2",
    sprite: "/assets/pillar.png",
    x: 31,
    y: 10,
    width: 3,
    height: 6,
    collision: [
      { offsetX: 0, offsetY: 5 }, { offsetX: 1, offsetY: 5 }, { offsetX: 2, offsetY: 5 },
    ],
  },
  {
    id: "pillar_right_3",
    sprite: "/assets/pillar.png",
    x: 36,
    y: 16,
    width: 3,
    height: 8,
    collision: [
      { offsetX: 0, offsetY: 6 }, { offsetX: 1, offsetY: 6 }, { offsetX: 2, offsetY: 6 },
      { offsetX: 0, offsetY: 7 }, { offsetX: 1, offsetY: 7 }, { offsetX: 2, offsetY: 7 },
    ],
  },
  {
    id: "armor_left",
    sprite: "/assets/armor_stand.png",
    x: 10,
    y: 4,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
  {
    id: "armor_right",
    sprite: "/assets/armor_stand.png",
    x: 29,
    y: 4,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
  {
    id: "chandelier",
    sprite: "/assets/chandelier.png",
    x: 18,
    y: 14,
    width: 4,
    height: 4,
    collision: [],
  },
  {
    id: "exit_doorway",
    sprite: "/assets/door_ornate.png",
    x: 16,
    y: 26,
    width: 8,
    height: 6,
    collision: [
      { offsetX: 0, offsetY: 4 }, { offsetX: 0, offsetY: 5 },
      { offsetX: 7, offsetY: 4 }, { offsetX: 7, offsetY: 5 },
    ],
  },
];

// NPCs in the estate (coordinates doubled for 32px grid)
const NPCS: NPC[] = [
  {
    id: "lady_lyra",
    name: "Lady Lyra Lumina",
    x: 20,
    y: 6,
    sprite: "/sprites/characters/lyra.png",
    facing: "down",
    dialogueId: "lyra_dynamic",
    movement: "static",
  },
  {
    id: "estate_butler",
    name: "Sebastian",
    x: 12,
    y: 20,
    sprite: "/sprites/characters/butler.png",
    facing: "right",
    dialogueId: "butler_estate",
    movement: "static",
  },
  {
    id: "estate_guard",
    name: "Estate Guard",
    x: 24,
    y: 26,
    sprite: "/sprites/characters/guard.png",
    facing: "left",
    dialogueId: "estate_guard",
    movement: "static",
  },
];

// Events in the estate (coordinates doubled for 32px grid)
const EVENTS: MapEvent[] = [
  // Exit to Estate Road
  {
    id: "estate_exit",
    type: "teleport",
    x: 19,
    y: 31,
    data: {
      targetMapId: "havenwood_estate_road",
      targetX: 21,
      targetY: 9,
      message: "Return to Estate Road",
    },
  },
  {
    id: "estate_exit_2",
    type: "teleport",
    x: 20,
    y: 31,
    data: {
      targetMapId: "havenwood_estate_road",
      targetX: 21,
      targetY: 9,
      message: "Return to Estate Road",
    },
  },
  // Examine bookshelves - left
  {
    id: "bookshelf_examine_left",
    type: "trigger",
    x: 3,
    y: 7,
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
    x: 36,
    y: 7,
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
    x: 20,
    y: 4,
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
    x: 20,
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
    x: 10,
    y: 6,
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
    x: 28,
    y: 20,
    data: {
      message: "A sense of calm washes over you in this grand hall.",
    },
  },
];

// Overhead regions — portions of the background re-drawn ON TOP of characters
// so sprites appear to walk behind pillars, bookshelves, etc.
// Each region covers the upper portion of a tall object (above its base).
// Characters south of the object don't overlap these tiles, so they stay visible.
const OVERHEAD_REGIONS: { x: number; y: number; width: number; height: number; baseY?: number }[] = [
  // Left pillars — overhead covers the column visual above each base
  // baseY = the Y where the solid base sits; characters at or below appear IN FRONT
  { x: 9, y: 5, width: 2, height: 5, baseY: 10 },    // pillar 1: y=5..9 above base y=10
  { x: 5, y: 10, width: 3, height: 5, baseY: 15 },   // pillar 2: y=10..14 above base y=15
  { x: 1, y: 16, width: 3, height: 6, baseY: 22 },   // pillar 3: y=16..21 above base y=22
  // Right pillars (mirrored)
  { x: 29, y: 5, width: 2, height: 5, baseY: 10 },   // pillar 1
  { x: 32, y: 10, width: 3, height: 5, baseY: 15 },  // pillar 2
  { x: 36, y: 16, width: 3, height: 6, baseY: 22 },  // pillar 3
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
  overheadRegions: OVERHEAD_REGIONS,
  encounters: [],
  connections: [],
  background: "/backgrounds/lumina_estate.png",
  ambientColor: "#e8dcc8",
  music: "noble_theme",
};
