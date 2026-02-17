// Stranger's Tent - Desert prologue interior
// Kai wakes here after the Disruption, tended by silent hooded strangers

import type { GameMap, NPC, MapEvent, StaticObject } from "../../types";

// Map dimensions - small tent interior
const WIDTH = 12;
const HEIGHT = 14;

// Ground layer — all tile 0 (background image handles visuals)
function createGroundLayer(): number[][] {
  const ground: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    ground.push(new Array(WIDTH).fill(0));
  }
  return ground;
}

// Create collision layer (true = walkable, false = blocked)
// Painted via collision editor — upper tent (cot, supplies) blocked, floor walkable
// ASCII grid (. = walkable, # = blocked):
// y=00  ############
// y=01  ############
// y=02  ###.########
// y=03  ############
// y=04  ############
// y=05  ############
// y=06  ####......##
// y=07  ...........#
// y=08  ............
// y=09  ............
// y=10  ............
// y=11  ............
// y=12  ............
// y=13  ............
function createCollisionLayer(): boolean[][] {
  const collision: boolean[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < WIDTH; x++) {
      let walkable = false;

      if (y === 2 && x === 3) walkable = true;
      if (y === 6 && x >= 4 && x <= 9) walkable = true;
      if (y === 7 && x >= 0 && x <= 10) walkable = true;
      if (y >= 8 && y <= 13) walkable = true;

      row.push(walkable);
    }
    collision.push(row);
  }
  return collision;
}

// Create overhead layer (empty — background image handles visuals)
function createOverheadLayer(): number[][] {
  const overhead: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    overhead.push(new Array(WIDTH).fill(0));
  }
  return overhead;
}

// No static objects — background image renders interior details
const STATIC_OBJECTS: StaticObject[] = [];

// NPCs — silent hooded strangers (wander the tent floor)
const NPCS: NPC[] = [
  // Hooded Stranger 1 — left side of floor
  {
    id: "desert_stranger_1",
    name: "Hooded Figure",
    x: 1,
    y: 8,
    sprite: "/sprites/characters/hooded_stranger_walk.png",
    facing: "right",
    dialogueId: "desert_stranger_silent",
    movement: "wander",
    scale: 0.9,
  },
  // Hooded Stranger 2 — right side of floor
  {
    id: "desert_stranger_2",
    name: "Hooded Figure",
    x: 9,
    y: 8,
    sprite: "/sprites/characters/hooded_stranger_walk.png",
    facing: "left",
    dialogueId: "desert_stranger_silent",
    movement: "wander",
    scale: 0.9,
  },
  // Hooded Stranger 3 — near entrance
  {
    id: "desert_stranger_3",
    name: "Hooded Figure",
    x: 5,
    y: 11,
    sprite: "/sprites/characters/hooded_stranger_walk.png",
    facing: "up",
    dialogueId: "desert_stranger_silent",
    movement: "wander",
    scale: 0.9,
  },
];

// Events — examine triggers and tent exit
const EVENTS: MapEvent[] = [
  // Exit to desert plateau
  {
    id: "tent_exit",
    type: "teleport",
    x: 5,
    y: 13,
    data: {
      targetMapId: "desert_plateau",
      targetX: 4,
      targetY: 8,
      message: "Step outside into the desert?",
    },
  },
  {
    id: "tent_exit_2",
    type: "teleport",
    x: 6,
    y: 13,
    data: {
      targetMapId: "desert_plateau",
      targetX: 4,
      targetY: 8,
      message: "Step outside into the desert?",
    },
  },
  // Examine water bowl
  {
    id: "water_bowl",
    type: "trigger",
    x: 2,
    y: 6,
    data: {
      triggerType: "examine",
      message:
        "A clay bowl filled with murky water. Someone placed it here recently. The surface still ripples faintly.",
    },
  },
  // Examine carved totem
  {
    id: "carved_totem",
    type: "trigger",
    x: 9,
    y: 6,
    data: {
      triggerType: "examine",
      message:
        "A small carved figure made of bone or stone. The markings are unlike anything you recognize. It feels warm to the touch.",
    },
  },
  // Examine the cot
  {
    id: "cot_examine",
    type: "trigger",
    x: 5,
    y: 5,
    data: {
      triggerType: "examine",
      message:
        "A crude wooden cot with rough animal hides for bedding. You were lying here moments ago. The indentation is still warm.",
    },
  },
  // Examine tent wall (player at (1,7) facing left toward wall)
  {
    id: "tent_wall",
    type: "trigger",
    x: 0,
    y: 8,
    data: {
      triggerType: "examine",
      message:
        "Hide and cloth walls, patched together from mismatched materials. Light bleeds through the gaps, casting amber lines across the sandy floor.",
    },
  },
];

export const STRANGER_TENT_MAP: GameMap = {
  id: "stranger_tent",
  name: "Stranger's Tent",
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
  encounters: [], // No encounters — safe prologue space
  connections: [],
  background: "/backgrounds/stranger_tent.png",
  ambientColor: "#2a1a0a", // Warm, dim amber interior
  flickerLight: true,
};
