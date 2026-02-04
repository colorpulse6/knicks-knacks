// Bandit Camp - Story dungeon for "The Bandit Problem" quest
// Features: Palisade walls, tents, prison area, leader's tent, hidden cellar

import type { GameMap, NPC, MapEvent, EnemyEncounter, StaticObject } from "../../types";

// Map dimensions
const WIDTH = 30;
const HEIGHT = 30;

// Tile types: 0 = dirt, 1 = grass, 2 = wood planks, 3 = stone, 4 = palisade (wall)
function createGroundLayer(): number[][] {
  const ground: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: number[] = [];
    for (let x = 0; x < WIDTH; x++) {
      // Default dirt inside camp
      let tile = 0;

      // Grass outside camp walls
      if (x <= 3 || x >= 26 || y <= 3 || y >= 26) {
        tile = 1;
      }

      // Palisade walls around camp perimeter
      if ((x === 4 || x === 25) && y >= 4 && y <= 25) {
        tile = 4;
      }
      if ((y === 4 || y === 25) && x >= 4 && x <= 25) {
        tile = 4;
      }

      // Central bonfire area (stone circle)
      if (x >= 13 && x <= 16 && y >= 13 && y <= 16) {
        tile = 3;
      }

      // Wood plank flooring under tents and important areas
      // Leader's tent area (north)
      if (x >= 11 && x <= 18 && y >= 5 && y <= 9) {
        tile = 2;
      }
      // Prison area (east)
      if (x >= 20 && x <= 24 && y >= 10 && y <= 18) {
        tile = 2;
      }
      // Supply area (west)
      if (x >= 5 && x <= 9 && y >= 10 && y <= 14) {
        tile = 2;
      }

      // Gate entrance (south wall gap)
      if (y === 25 && x >= 13 && x <= 16) {
        tile = 0; // Open dirt
      }
      // Western entrance (small)
      if (x === 4 && y >= 11 && y <= 13) {
        tile = 0;
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
      // Palisade walls (4) block movement
      row.push(tile !== 4);
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

// Static objects - tents, cages, bonfire, barrels
const STATIC_OBJECTS: StaticObject[] = [
  // === LEADER'S TENT (large, north center) ===
  {
    id: "leader_tent",
    sprite: "/assets/tent_large.png",
    x: 12,
    y: 5,
    width: 6,
    height: 4,
    collision: [
      // Back wall
      { offsetX: 0, offsetY: 3 }, { offsetX: 1, offsetY: 3 },
      { offsetX: 4, offsetY: 3 }, { offsetX: 5, offsetY: 3 },
      // Leave center open for entrance
    ],
  },

  // === REGULAR TENTS (scattered) ===
  // Southwest tent
  {
    id: "tent_sw",
    sprite: "/assets/tent_small.png",
    x: 6,
    y: 18,
    width: 3,
    height: 3,
    collision: [
      { offsetX: 0, offsetY: 2 }, { offsetX: 2, offsetY: 2 },
    ],
  },
  // Southeast tent
  {
    id: "tent_se",
    sprite: "/assets/tent_small.png",
    x: 20,
    y: 20,
    width: 3,
    height: 3,
    collision: [
      { offsetX: 0, offsetY: 2 }, { offsetX: 2, offsetY: 2 },
    ],
  },
  // West tent
  {
    id: "tent_w",
    sprite: "/assets/tent_small.png",
    x: 6,
    y: 6,
    width: 3,
    height: 3,
    collision: [
      { offsetX: 0, offsetY: 2 }, { offsetX: 2, offsetY: 2 },
    ],
  },

  // === PRISON CAGES ===
  {
    id: "cage_1",
    sprite: "/assets/cage.png",
    x: 21,
    y: 11,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },
  {
    id: "cage_2",
    sprite: "/assets/cage.png",
    x: 21,
    y: 14,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },
  {
    id: "cage_3",
    sprite: "/assets/cage.png",
    x: 21,
    y: 17,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },

  // === BONFIRE (central) ===
  {
    id: "bonfire",
    sprite: "/assets/bonfire.png",
    x: 14,
    y: 14,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },

  // === SUPPLY AREA ===
  // Barrels
  {
    id: "barrels_1",
    sprite: "/assets/barrels.png",
    x: 6,
    y: 10,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },
  {
    id: "barrels_2",
    sprite: "/assets/barrels.png",
    x: 8,
    y: 12,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },
  // Crates
  {
    id: "crates_1",
    sprite: "/assets/crates.png",
    x: 5,
    y: 13,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },

  // === WEAPON RACK ===
  {
    id: "weapon_rack",
    sprite: "/assets/weapon_rack.png",
    x: 10,
    y: 11,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },

  // === HIDDEN CELLAR ENTRANCE (in leader's tent area) ===
  {
    id: "cellar_door",
    sprite: "/assets/trapdoor.png",
    x: 15,
    y: 7,
    width: 1,
    height: 1,
    collision: [], // Walkable - it's a trapdoor
  },

  // === WATCHTOWER (by gate) ===
  {
    id: "watchtower",
    sprite: "/assets/watchtower.png",
    x: 11,
    y: 22,
    width: 2,
    height: 3,
    collision: [
      { offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 },
    ],
  },

  // === GATE POSTS ===
  {
    id: "gate_post_left",
    sprite: "/assets/gate_post.png",
    x: 12,
    y: 24,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
  {
    id: "gate_post_right",
    sprite: "/assets/gate_post.png",
    x: 17,
    y: 24,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
];

// NPCs - captured villagers and one bandit informant
const NPCS: NPC[] = [
  // Captured villagers (in cages)
  {
    id: "prisoner_1",
    name: "Captured Farmer",
    x: 21,
    y: 11,
    sprite: "/sprites/characters/villager_prisoner.png",
    facing: "left",
    dialogueId: "prisoner_farmer",
    movement: "static",
  },
  {
    id: "prisoner_2",
    name: "Captured Merchant",
    x: 21,
    y: 14,
    sprite: "/sprites/characters/merchant_prisoner.png",
    facing: "left",
    dialogueId: "prisoner_merchant",
    movement: "static",
  },
  {
    id: "prisoner_3",
    name: "Captured Guard",
    x: 21,
    y: 17,
    sprite: "/sprites/characters/guard_prisoner.png",
    facing: "left",
    dialogueId: "prisoner_guard",
    movement: "static",
  },
];

// Events
const EVENTS: MapEvent[] = [
  // === SAVE POINT (hidden, after clearing some enemies) ===
  {
    id: "camp_save_point",
    type: "save_point",
    x: 7,
    y: 7,
    data: {
      name: "Bandit Camp - West Tent",
    },
  },

  // === EXIT back to outskirts ===
  {
    id: "camp_exit",
    type: "teleport",
    x: 2,
    y: 12,
    data: {
      targetMapId: "havenwood_outskirts",
      targetX: 33,
      targetY: 11,
      message: "Leave the bandit camp?",
    },
  },

  // === PRISONER RESCUE EVENTS ===
  {
    id: "rescue_prisoner_1",
    type: "trigger",
    x: 22,
    y: 11,
    data: {
      triggerType: "rescue",
      flag: "prisoner_1_freed",
      message: "You break open the cage lock!",
      onTrigger: {
        setFlags: ["prisoner_1_freed"],
      },
    },
    triggered: false,
  },
  {
    id: "rescue_prisoner_2",
    type: "trigger",
    x: 22,
    y: 14,
    data: {
      triggerType: "rescue",
      flag: "prisoner_2_freed",
      message: "The merchant is free!",
      onTrigger: {
        setFlags: ["prisoner_2_freed"],
      },
    },
    triggered: false,
  },
  {
    id: "rescue_prisoner_3",
    type: "trigger",
    x: 22,
    y: 17,
    data: {
      triggerType: "rescue",
      flag: "prisoner_3_freed",
      message: "The guard staggers out, grateful.",
      onTrigger: {
        setFlags: ["prisoner_3_freed"],
      },
    },
    triggered: false,
  },

  // === BOSS BATTLE - Bandit Chief Vorn ===
  {
    id: "boss_vorn",
    type: "battle",
    x: 14,
    y: 7,
    data: {
      enemies: ["bandit_chief_vorn"],
      isBoss: true,
      oneTime: true,
      preBattleDialogue: "vorn_confrontation",
      postBattleFlag: "vorn_defeated",
    },
    triggered: false,
  },

  // === HIDDEN CELLAR (after defeating Vorn) ===
  {
    id: "cellar_entrance",
    type: "trigger",
    x: 15,
    y: 7,
    data: {
      triggerType: "examine",
      requiredFlag: "vorn_defeated",
      message: "A hidden trapdoor! It leads to a dark cellar below...",
      onTrigger: {
        setFlags: ["found_cellar"],
        teleport: {
          mapId: "bandit_cellar",
          x: 5,
          y: 8,
        },
      },
    },
  },

  // === TREASURE CHESTS ===
  // Supply area
  {
    id: "supply_chest",
    type: "treasure",
    x: 6,
    y: 12,
    data: {
      items: [
        { itemId: "sanguine_draught", quantity: 3 },
        { itemId: "herb_bundle", quantity: 5 },
      ],
      gold: 150,
    },
    triggered: false,
  },
  // In a tent
  {
    id: "tent_chest",
    type: "treasure",
    x: 7,
    y: 19,
    data: {
      items: [
        { itemId: "iron_sword", quantity: 1 },
        { itemId: "leather_armor", quantity: 1 },
      ],
    },
    triggered: false,
  },
  // Near weapon rack (better loot)
  {
    id: "weapon_chest",
    type: "treasure",
    x: 10,
    y: 12,
    data: {
      items: [
        { itemId: "steel_longsword", quantity: 1 },
      ],
      gold: 100,
    },
    triggered: false,
  },
  // Leader's tent (requires boss defeat)
  {
    id: "vorn_chest",
    type: "treasure",
    x: 16,
    y: 6,
    data: {
      items: [
        { itemId: "theriac_electuary", quantity: 2 },
        { itemId: "speed_tonic", quantity: 1 },
      ],
      gold: 300,
      requiredFlag: "vorn_defeated",
    },
    triggered: false,
  },

  // === INVESTIGATION POINTS ===
  // Examine the strange weapon
  {
    id: "strange_weapon_examine",
    type: "trigger",
    x: 11,
    y: 11,
    data: {
      triggerType: "examine",
      requiredFlag: "vorn_defeated",
      message: "Among the weapons, you notice something unusual... a metal rod that sparks with energy. This is no ordinary weapon.",
      onTrigger: {
        setFlags: ["saw_lightning_rod"],
      },
    },
  },
];

// Encounter zones - bandit patrols
const ENCOUNTERS: EnemyEncounter[] = [
  // Gate area
  {
    id: "gate_patrol",
    enemies: ["bandit"],
    chance: 0.15,
    zone: { x: 10, y: 20, width: 10, height: 6 },
  },
  // Central camp
  {
    id: "camp_patrol",
    enemies: ["bandit", "bandit"],
    chance: 0.12,
    zone: { x: 10, y: 10, width: 10, height: 10 },
  },
  // Supply area guards
  {
    id: "supply_guards",
    enemies: ["bandit", "rogue_knight"],
    chance: 0.18,
    zone: { x: 5, y: 9, width: 6, height: 8 },
  },
  // Prison guards (tough)
  {
    id: "prison_guards",
    enemies: ["rogue_knight"],
    chance: 0.20,
    zone: { x: 19, y: 10, width: 6, height: 10 },
  },
];

export const BANDIT_CAMP_MAP: GameMap = {
  id: "bandit_camp",
  name: "Bandit Camp",
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
      sourcePosition: { x: 2, y: 12 },
      targetPosition: { x: 33, y: 11 },
      type: "edge",
    },
  ],
  ambientColor: "#8b7355", // Dusty camp brown
  music: "danger_theme",
  requiredFlags: ["bandit_camp_discovered"],
};
