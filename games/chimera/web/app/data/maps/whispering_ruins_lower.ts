// Whispering Ruins - Lower Level
// Deeper dungeon area unlocked after Lyra joins
// Features: The Terminal, ancient machinery, Corrupted Guardian boss

import type { GameMap, NPC, MapEvent, EnemyEncounter, StaticObject } from "../../types";

// Map dimensions
const WIDTH = 35;
const HEIGHT = 30;

// Tile types:
// 0 = ancient stone floor
// 1 = metal grating (walkable, shows depth below)
// 2 = void/pit (impassable)
// 3 = wall
// 4 = glowing conduit floor (active tech)
// 5 = inactive terminal floor (dark tech)
// 6 = collapsed rubble (impassable)

function createGroundLayer(): number[][] {
  const ground: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: number[] = [];
    for (let x = 0; x < WIDTH; x++) {
      // Default to void
      let tile = 2;

      // Entrance corridor (south)
      if (x >= 15 && x <= 19 && y >= 25 && y <= 29) {
        tile = 0;
      }

      // Main antechamber
      if (x >= 10 && x <= 24 && y >= 18 && y <= 25) {
        tile = 0;
      }

      // West machinery corridor
      if (x >= 2 && x <= 10 && y >= 10 && y <= 20) {
        tile = 0;
      }
      // West corridor has metal grating sections
      if (x >= 4 && x <= 8 && y >= 12 && y <= 14) {
        tile = 1;
      }

      // East machinery corridor
      if (x >= 24 && x <= 32 && y >= 10 && y <= 20) {
        tile = 0;
      }
      // East corridor has metal grating
      if (x >= 26 && x <= 30 && y >= 16 && y <= 18) {
        tile = 1;
      }

      // Central chamber (the Terminal room)
      if (x >= 12 && x <= 22 && y >= 6 && y <= 18) {
        tile = 0;
      }

      // Glowing conduits leading to Terminal
      if (x === 17 && y >= 10 && y <= 16) {
        tile = 4;
      }
      if (y === 10 && x >= 14 && x <= 20) {
        tile = 4;
      }

      // Terminal platform (north center)
      if (x >= 14 && x <= 20 && y >= 2 && y <= 8) {
        tile = 5; // Inactive until approached
      }
      // Active core around terminal
      if (x >= 16 && x <= 18 && y >= 4 && y <= 6) {
        tile = 4;
      }

      // Collapsed sections
      if (x >= 6 && x <= 8 && y >= 6 && y <= 8) {
        tile = 6;
      }
      if (x >= 26 && x <= 28 && y >= 6 && y <= 8) {
        tile = 6;
      }

      // Side alcoves (treasure locations)
      // West alcove
      if (x >= 2 && x <= 4 && y >= 4 && y <= 8) {
        tile = 0;
      }
      // East alcove
      if (x >= 30 && x <= 32 && y >= 4 && y <= 8) {
        tile = 0;
      }

      // Walls at boundaries of walkable areas
      // (Handled by collision layer more than ground layer)

      row.push(tile);
    }
    ground.push(row);
  }
  return ground;
}

function createCollisionLayer(): boolean[][] {
  const collision: boolean[][] = [];
  const ground = createGroundLayer();

  for (let y = 0; y < HEIGHT; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < WIDTH; x++) {
      const tile = ground[y][x];
      // Walkable: stone floor (0), metal grating (1), glowing conduit (4), inactive terminal (5)
      // Not walkable: void (2), wall (3), rubble (6)
      row.push(tile === 0 || tile === 1 || tile === 4 || tile === 5);
    }
    collision.push(row);
  }

  return collision;
}

function createOverheadLayer(): number[][] {
  const overhead: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    overhead.push(new Array(WIDTH).fill(-1));
  }
  return overhead;
}

// Static objects - ancient machinery, conduits, the Terminal
const STATIC_OBJECTS: StaticObject[] = [
  // === THE TERMINAL (central north) ===
  {
    id: "the_terminal",
    sprite: "/assets/ancient_terminal.png",
    x: 15,
    y: 3,
    width: 5,
    height: 4,
    collision: [
      // Leave front accessible for interaction
      { offsetX: 0, offsetY: 3 }, { offsetX: 4, offsetY: 3 },
      { offsetX: 0, offsetY: 2 }, { offsetX: 4, offsetY: 2 },
    ],
  },

  // === MACHINERY BANKS (west corridor) ===
  {
    id: "machinery_west_1",
    sprite: "/assets/ancient_machine.png",
    x: 2,
    y: 11,
    width: 2,
    height: 3,
    collision: [
      { offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 },
    ],
  },
  {
    id: "machinery_west_2",
    sprite: "/assets/ancient_machine.png",
    x: 2,
    y: 16,
    width: 2,
    height: 3,
    collision: [
      { offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 },
    ],
  },

  // === MACHINERY BANKS (east corridor) ===
  {
    id: "machinery_east_1",
    sprite: "/assets/ancient_machine.png",
    x: 31,
    y: 11,
    width: 2,
    height: 3,
    collision: [
      { offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 },
    ],
  },
  {
    id: "machinery_east_2",
    sprite: "/assets/ancient_machine.png",
    x: 31,
    y: 16,
    width: 2,
    height: 3,
    collision: [
      { offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 },
    ],
  },

  // === CONDUIT PILLARS (central chamber) ===
  {
    id: "conduit_pillar_1",
    sprite: "/assets/conduit_pillar.png",
    x: 13,
    y: 8,
    width: 1,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }],
  },
  {
    id: "conduit_pillar_2",
    sprite: "/assets/conduit_pillar.png",
    x: 21,
    y: 8,
    width: 1,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }],
  },
  {
    id: "conduit_pillar_3",
    sprite: "/assets/conduit_pillar.png",
    x: 13,
    y: 14,
    width: 1,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }],
  },
  {
    id: "conduit_pillar_4",
    sprite: "/assets/conduit_pillar.png",
    x: 21,
    y: 14,
    width: 1,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }],
  },

  // === COLLAPSED DEBRIS ===
  {
    id: "rubble_west",
    sprite: "/assets/rubble_pile.png",
    x: 6,
    y: 6,
    width: 3,
    height: 3,
    collision: [
      { offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }, { offsetX: 2, offsetY: 2 },
      { offsetX: 1, offsetY: 1 },
    ],
  },
  {
    id: "rubble_east",
    sprite: "/assets/rubble_pile.png",
    x: 26,
    y: 6,
    width: 3,
    height: 3,
    collision: [
      { offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 }, { offsetX: 2, offsetY: 2 },
      { offsetX: 1, offsetY: 1 },
    ],
  },

  // === ENTRANCE STAIRS ===
  {
    id: "entrance_stairs",
    sprite: "/assets/stone_stairs_down.png",
    x: 16,
    y: 27,
    width: 3,
    height: 2,
    collision: [], // Walkable
  },

  // === STASIS POD PREVIEW (hints at Hidden Laboratory) ===
  {
    id: "damaged_pod",
    sprite: "/assets/stasis_pod_damaged.png",
    x: 3,
    y: 5,
    width: 2,
    height: 3,
    collision: [
      { offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 },
    ],
  },

  // === HIDDEN PASSAGE (revealed after defeating guardian) ===
  {
    id: "hidden_passage_entrance",
    sprite: "/assets/secret_passage.png",
    x: 16,
    y: 2,
    width: 3,
    height: 3,
    collision: [], // Walkable - leads to trigger
    visibleWhenFlag: "guardian_defeated",
  },
];

// NPCs - Lyra accompanies you here during the quest
const NPCS: NPC[] = [
  // Lyra will appear here during the_ladys_curiosity quest
  // Her presence is handled by quest state, not static NPC
];

// Events
const EVENTS: MapEvent[] = [
  // === SAVE POINT (antechamber) ===
  {
    id: "lower_ruins_save",
    type: "save_point",
    x: 17,
    y: 22,
    data: {
      name: "Ruins Depths",
    },
  },

  // === EXIT back to upper ruins ===
  {
    id: "to_upper_ruins",
    type: "teleport",
    x: 17,
    y: 28,
    data: {
      targetMapId: "whispering_ruins",
      targetX: 12,
      targetY: 5,
      message: "Return to the upper ruins?",
    },
  },

  // === THE TERMINAL - Triggers Guardian Boss ===
  {
    id: "terminal_guardian_battle",
    type: "battle",
    x: 17,
    y: 6,
    data: {
      enemies: ["corrupted_guardian"],
      isBoss: true,
      oneTime: true,
      requiredFlags: ["showed_mechanism"], // Lyra is with you
      preBattleDialogue: "guardian_awakens",
      postBattleFlag: "guardian_defeated",
      notMetMessage: "The terminal hums with dormant energy. You sense you shouldn't approach alone...",
    },
    triggered: false,
  },

  // === HIDDEN PASSAGE (to Hidden Laboratory) ===
  {
    id: "hidden_passage",
    type: "trigger",
    x: 17,
    y: 4,
    data: {
      triggerType: "examine",
      requiredFlag: "guardian_defeated",
      message: "A section of the wall has shifted, revealing a passage behind the Terminal. Cold, sterile air flows from within...",
      onTrigger: {
        setFlags: ["found_laboratory_entrance"],
        teleport: {
          mapId: "hidden_laboratory",
          x: 10,
          y: 18,
        },
      },
    },
  },

  // === TREASURE CHESTS ===
  // West alcove
  {
    id: "lower_chest_west",
    type: "treasure",
    x: 3,
    y: 6,
    data: {
      items: [
        { itemId: "theriac_electuary", quantity: 2 },
        { itemId: "aqua_vitae", quantity: 2 },
      ],
      gold: 200,
    },
    triggered: false,
  },
  // East alcove
  {
    id: "lower_chest_east",
    type: "treasure",
    x: 31,
    y: 6,
    data: {
      items: [
        { itemId: "steel_longsword", quantity: 1 },
      ],
      gold: 150,
    },
    triggered: false,
  },
  // Hidden chest (requires defeating guardian)
  {
    id: "guardian_chest",
    type: "treasure",
    x: 17,
    y: 8,
    data: {
      items: [
        { itemId: "ancient_core", quantity: 1 },
        { itemId: "crystal_fragment", quantity: 3 },
      ],
      requiredFlag: "guardian_defeated",
    },
    triggered: false,
  },

  // === LORE TRIGGERS ===
  // Examine damaged stasis pod
  {
    id: "examine_pod",
    type: "trigger",
    x: 3,
    y: 6,
    data: {
      triggerType: "examine",
      message: "A strange glass cylinder, cracked and dark. Something was once kept inside, but whatever it was is long gone. The technology is unlike anything you've seen... or is it? Something about it feels familiar.",
    },
  },
  // Examine machinery
  {
    id: "examine_machinery_west",
    type: "trigger",
    x: 3,
    y: 13,
    data: {
      triggerType: "examine",
      message: "Banks of metal boxes covered in blinking lights and humming quietly. The lights pulse in patterns that almost seem like breathing.",
    },
  },
  // Examine glowing floor
  {
    id: "examine_conduit",
    type: "trigger",
    x: 17,
    y: 12,
    data: {
      triggerType: "examine",
      message: "The floor here glows with an inner light. Thin lines of energy pulse along channels carved into the stone—no, not carved. Grown? The material feels warm, almost alive.",
    },
  },
];

// Encounter zones - corrupted creatures protect the lower ruins
const ENCOUNTERS: EnemyEncounter[] = [
  // West corridor
  {
    id: "lower_west_encounters",
    enemies: ["data_fragment", "corrupted_sprite"],
    chance: 0.15,
    zone: { x: 2, y: 10, width: 9, height: 11 },
  },
  // East corridor
  {
    id: "lower_east_encounters",
    enemies: ["data_fragment", "static_wraith"],
    chance: 0.15,
    zone: { x: 24, y: 10, width: 9, height: 11 },
  },
  // Antechamber (lighter encounters)
  {
    id: "lower_antechamber_encounters",
    enemies: ["data_fragment"],
    chance: 0.10,
    zone: { x: 10, y: 18, width: 15, height: 8 },
  },
  // Central chamber (no encounters - boss area)
];

export const WHISPERING_RUINS_LOWER_MAP: GameMap = {
  id: "whispering_ruins_lower",
  name: "Whispering Ruins - Depths",
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
      id: "to_upper_ruins",
      targetMapId: "whispering_ruins",
      sourcePosition: { x: 17, y: 28 },
      targetPosition: { x: 12, y: 5 },
      type: "stairs",
    },
  ],
  background: "/backgrounds/whispering_ruins_lower.png",
  ambientColor: "#1a1a2e", // Deep dark blue
  music: "ancient_depths",
  requiredFlags: ["showed_mechanism"], // Lyra has agreed to join expedition
};
