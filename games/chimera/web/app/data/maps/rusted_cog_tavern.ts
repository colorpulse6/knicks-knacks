// The Rusted Cog Tavern - Interior map
// A cozy tavern where travelers share stories and rumors

import type { GameMap, NPC, MapEvent, StaticObject } from "../../types";

// Map dimensions - cozy tavern interior
const WIDTH = 16;
const HEIGHT = 12;

// Tile types: 0 = wood floor, 1 = darker wood (bar area)
function createGroundLayer(): number[][] {
  const ground: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: number[] = [];
    for (let x = 0; x < WIDTH; x++) {
      // Default wood floor
      let tile = 0;

      // Bar area in the back (darker wood)
      if (y <= 2 && x >= 4 && x <= 11) {
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

      // Bar counter (y = 2, x from 4 to 11)
      if (y === 2 && x >= 4 && x <= 11) {
        walkable = false;
      }

      // Tables - left side
      if ((x === 2 || x === 3) && (y === 5 || y === 8)) {
        walkable = false;
      }

      // Tables - right side
      if ((x === 12 || x === 13) && (y === 5 || y === 8)) {
        walkable = false;
      }

      // Exit door frame barrels
      if ((x === 6 || x === 8) && y === 10) {
        walkable = false;
      }

      row.push(walkable);
    }
    collision.push(row);
  }
  return collision;
}

// Create overhead layer (decorations above player)
function createOverheadLayer(): number[][] {
  const overhead: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: number[] = [];
    for (let x = 0; x < WIDTH; x++) {
      row.push(0); // No overhead tiles for tavern interior
    }
    overhead.push(row);
  }
  return overhead;
}

// Static objects - bar, tables, decorations
const STATIC_OBJECTS: StaticObject[] = [
  // Bar counter
  {
    id: "bar_counter",
    sprite: "/assets/bar_counter.png",
    x: 4,
    y: 1,
    width: 8,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 },
      { offsetX: 1, offsetY: 1 },
      { offsetX: 2, offsetY: 1 },
      { offsetX: 3, offsetY: 1 },
      { offsetX: 4, offsetY: 1 },
      { offsetX: 5, offsetY: 1 },
      { offsetX: 6, offsetY: 1 },
      { offsetX: 7, offsetY: 1 },
    ],
  },
  // Left table 1
  {
    id: "table_left_1",
    sprite: "/assets/table.png",
    x: 2,
    y: 4,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 },
      { offsetX: 1, offsetY: 1 },
    ],
  },
  // Left table 2
  {
    id: "table_left_2",
    sprite: "/assets/table.png",
    x: 2,
    y: 7,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 },
      { offsetX: 1, offsetY: 1 },
    ],
  },
  // Right table 1
  {
    id: "table_right_1",
    sprite: "/assets/table.png",
    x: 12,
    y: 4,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 },
      { offsetX: 1, offsetY: 1 },
    ],
  },
  // Right table 2
  {
    id: "table_right_2",
    sprite: "/assets/table.png",
    x: 12,
    y: 7,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 },
      { offsetX: 1, offsetY: 1 },
    ],
  },
  // Fireplace on left wall
  {
    id: "fireplace",
    sprite: "/assets/fireplace.png",
    x: 0,
    y: 4,
    width: 2,
    height: 3,
    collision: [
      { offsetX: 0, offsetY: 2 },
      { offsetX: 1, offsetY: 2 },
    ],
  },
  // Barrel decoration near bar
  {
    id: "barrel_1",
    sprite: "/assets/barrel.png",
    x: 1,
    y: 1,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
  {
    id: "barrel_2",
    sprite: "/assets/barrel.png",
    x: 14,
    y: 1,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
  // Door frame barrels - indicate exit
  {
    id: "exit_barrel_left",
    sprite: "/assets/barrel.png",
    x: 6,
    y: 9,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
  {
    id: "exit_barrel_right",
    sprite: "/assets/barrel.png",
    x: 8,
    y: 9,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
];

// NPCs in the tavern
const NPCS: NPC[] = [
  // Barkeep Greta - behind the bar
  {
    id: "barkeep_greta",
    name: "Barkeep Greta",
    x: 7,
    y: 1,
    sprite: "/sprites/characters/barkeep_greta.png",
    facing: "down",
    dialogueId: "greta_dynamic",
    movement: "static",
  },
  // Regular patron at left table
  {
    id: "tavern_patron_1",
    name: "Weary Traveler",
    x: 4,
    y: 5,
    sprite: "/sprites/characters/villager.png",
    facing: "right",
    dialogueId: "tavern_patron",
    movement: "static",
  },
  // Regular patron at right table
  {
    id: "tavern_patron_2",
    name: "Local Farmer",
    x: 11,
    y: 8,
    sprite: "/sprites/characters/villager.png",
    facing: "left",
    dialogueId: "tavern_patron",
    movement: "static",
  },
  // The Hooded Stranger - appears in corner, disappears after quest completion
  {
    id: "hooded_stranger",
    name: "Hooded Figure",
    x: 14,
    y: 5,
    sprite: "/sprites/characters/hooded_stranger.png",
    facing: "left",
    dialogueId: "hooded_stranger_dynamic",
    movement: "static",
    hiddenWhenFlag: "ai_first_contact", // Vanishes after final dialogue
  },
];

// Events in the tavern
const EVENTS: MapEvent[] = [
  // Exit to Havenwood (one tile south of tavern entrance to avoid re-trigger)
  {
    id: "tavern_exit",
    type: "teleport",
    x: 7,
    y: 11,
    data: {
      targetMapId: "havenwood",
      targetX: 36,
      targetY: 12,
      message: "Exit to Havenwood Village",
    },
  },
  // Examine fireplace
  {
    id: "fireplace_examine",
    type: "trigger",
    x: 1,
    y: 6,
    data: {
      triggerType: "examine",
      message:
        "A warm fire crackles in the hearth. The dancing flames cast long shadows across the wooden floor.",
    },
  },
  // Examine bar
  {
    id: "bar_examine",
    type: "trigger",
    x: 6,
    y: 3,
    data: {
      triggerType: "examine",
      message:
        "The bar counter is worn smooth from years of use. Mugs hang from hooks overhead, and bottles of various spirits line the shelves behind.",
    },
  },
  // Notice board on wall
  {
    id: "notice_board",
    type: "trigger",
    x: 14,
    y: 3,
    data: {
      triggerType: "examine",
      message:
        "A notice board hangs on the wall. Various job postings and warnings are pinned to it. One note mentions 'strange lights in the ruins at night.'",
    },
  },
];

export const RUSTED_COG_TAVERN_MAP: GameMap = {
  id: "rusted_cog_tavern",
  name: "The Rusted Cog",
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
  encounters: [], // No random encounters inside tavern
  connections: [], // Use teleport events for transitions
  background: "/backgrounds/rusted_cog_tavern.png",
  ambientColor: "#3d2817", // Warm, dim interior lighting
  music: "tavern_theme",
};
