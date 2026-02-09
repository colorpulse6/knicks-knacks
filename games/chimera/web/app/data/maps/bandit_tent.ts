// Bandit Tent - Vorn's tent interior with boss fight and hidden cellar
// The final confrontation before discovering the underground secrets

import type { GameMap, MapEvent, StaticObject } from "../../types";

// Map dimensions (tent interior - small but detailed)
const WIDTH = 12;
const HEIGHT = 10;

// Tile types: 0 = dirt floor, 1 = rug/carpet, 2 = tent fabric (wall), 3 = wood planks
function createGroundLayer(): number[][] {
  const ground: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: number[] = [];
    for (let x = 0; x < WIDTH; x++) {
      // Default tent fabric walls
      let tile = 2;

      // Main floor area
      if (x >= 1 && x <= 10 && y >= 1 && y <= 8) {
        tile = 0; // Dirt floor
      }

      // Central rug/carpet where Vorn stands
      if (x >= 4 && x <= 7 && y >= 3 && y <= 6) {
        tile = 1;
      }

      // Entrance area (wood planks)
      if (x >= 5 && x <= 6 && y >= 7 && y <= 8) {
        tile = 3;
      }

      // Back area where treasure/cellar is
      if (x >= 2 && x <= 9 && y >= 1 && y <= 2) {
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
      // Tent fabric walls (2) block movement
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

// Static objects - Vorn's possessions and the hidden cellar
const STATIC_OBJECTS: StaticObject[] = [
  // === VORN'S THRONE/CHAIR ===
  {
    id: "vorn_chair",
    sprite: "/assets/throne.png",
    x: 5,
    y: 2,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },

  // === WEAPON RACK with strange weapons ===
  {
    id: "tent_weapons",
    sprite: "/assets/weapon_rack.png",
    x: 2,
    y: 4,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },

  // === TREASURE CHEST (Vorn's personal stash) ===
  {
    id: "vorn_stash",
    sprite: "/assets/chest_closed.png",
    x: 9,
    y: 2,
    width: 1,
    height: 1,
    collision: [],
  },

  // === DESK with maps and plans ===
  {
    id: "planning_desk",
    sprite: "/assets/desk.png",
    x: 8,
    y: 4,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },

  // === TRAPDOOR (hidden cellar entrance) ===
  {
    id: "cellar_trapdoor",
    sprite: "/assets/trapdoor.png",
    x: 3,
    y: 2,
    width: 1,
    height: 1,
    collision: [], // Walkable
  },

  // === TORCH HOLDERS ===
  {
    id: "tent_torch_1",
    sprite: "/assets/wall_torch.png",
    x: 1,
    y: 3,
    width: 1,
    height: 2,
    collision: [],
  },
  {
    id: "tent_torch_2",
    sprite: "/assets/wall_torch.png",
    x: 10,
    y: 3,
    width: 1,
    height: 2,
    collision: [],
  },

  // === BARRELS (stolen goods) ===
  {
    id: "tent_barrels",
    sprite: "/assets/barrels.png",
    x: 1,
    y: 6,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },
];

// Events
const EVENTS: MapEvent[] = [
  // === EXIT back to camp ===
  {
    id: "tent_exit",
    type: "teleport",
    x: 5,
    y: 8,
    data: {
      targetMapId: "bandit_camp",
      targetX: 14,
      targetY: 9,
      message: "Leave the tent?",
    },
  },
  {
    id: "tent_exit_2",
    type: "teleport",
    x: 6,
    y: 8,
    data: {
      targetMapId: "bandit_camp",
      targetX: 14,
      targetY: 9,
      message: "Leave the tent?",
    },
  },

  // === BOSS BATTLE - Bandit Chief Vorn ===
  // Triggers when player approaches Vorn's position
  {
    id: "boss_vorn",
    type: "battle",
    x: 5,
    y: 4, // Vorn stands in front of his chair
    data: {
      enemies: ["bandit_chief_vorn"],
      isBoss: true,
      oneTime: true,
      preBattleDialogue: "vorn_confrontation",
      postBattleFlag: "vorn_defeated",
    },
    triggered: false,
  },
  // Additional trigger point for the battle (wider area)
  {
    id: "boss_vorn_2",
    type: "battle",
    x: 6,
    y: 4,
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
    type: "teleport",
    x: 3,
    y: 2,
    data: {
      targetMapId: "bandit_cellar",
      targetX: 5,
      targetY: 8,
      message: "Descend into the hidden cellar?",
      requiredFlag: "vorn_defeated",
      notMetMessage: "There's a trapdoor here, but it's blocked by heavy crates. You'll need to deal with Vorn first.",
    },
  },

  // === VORN'S TREASURE CHEST ===
  {
    id: "vorn_treasure",
    type: "treasure",
    x: 9,
    y: 2,
    data: {
      items: [
        { itemId: "theriac_electuary", quantity: 2 },
        { itemId: "speed_tonic", quantity: 1 },
        { itemId: "lightning_shard", quantity: 1 },
      ],
      gold: 500,
      requiredFlag: "vorn_defeated",
      notMetMessage: "Best not to touch the chief's belongings while he's still around...",
    },
    triggered: false,
  },

  // === INVESTIGATION POINTS ===
  // Strange weapons
  {
    id: "strange_weapons_examine",
    type: "trigger",
    x: 2,
    y: 5,
    data: {
      triggerType: "examine",
      requiredFlag: "vorn_defeated",
      message: "Among the ordinary swords and axes, you find several weapons that spark with strange energy. Where did the bandits get these?",
      alreadyTriggeredMessage: "The strange weapons hum with dormant energy.",
      onTrigger: {
        setFlags: ["saw_lightning_weapons"],
      },
    },
  },

  // Planning desk - contains Vorn's orders (key story item)
  {
    id: "desk_examine",
    type: "trigger",
    x: 8,
    y: 5,
    data: {
      triggerType: "examine",
      requiredFlag: "vorn_defeated",
      flag: "found_vorns_orders", // One-time trigger
      message: "Among the maps and ledgers, you find a thin metal slate. Strange glowing text shifts across its surface... These are Vorn's orders! Someone was paying him to kidnap villagers.\n\n*Obtained: Vorn's Orders*",
      alreadyTriggeredMessage: "The planning desk. You've already taken the important documents.",
      onTrigger: {
        setFlags: ["found_kidnapping_evidence", "found_vorns_orders"],
        giveItem: "vorns_orders",
      },
    },
    triggered: false,
  },
];

export const BANDIT_TENT_MAP: GameMap = {
  id: "bandit_tent",
  name: "Vorn's Tent",
  width: WIDTH,
  height: HEIGHT,
  tileSize: 32,
  layers: {
    ground: createGroundLayer(),
    collision: createCollisionLayer(),
    overhead: createOverheadLayer(),
  },
  events: EVENTS,
  npcs: [], // Vorn is handled as a battle event, not an NPC
  staticObjects: STATIC_OBJECTS,
  encounters: [], // No random encounters in boss tent
  connections: [
    {
      id: "to_camp",
      targetMapId: "bandit_camp",
      sourcePosition: { x: 5, y: 8 },
      targetPosition: { x: 14, y: 9 },
      type: "door",
    },
  ],
  ambientColor: "#2a1810", // Dark tent interior
  music: "tension_theme",
  requiredFlags: ["prisoner_1_freed", "prisoner_2_freed", "prisoner_3_freed"],
};
