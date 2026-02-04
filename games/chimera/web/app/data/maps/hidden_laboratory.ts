// The Hidden Laboratory - Act I Finale Location
// A stark contrast to the ruins: clean metallic corridors, holographic displays, stasis pods
// This is where reality's true nature begins to reveal itself

import type { GameMap, NPC, MapEvent, EnemyEncounter, StaticObject } from "../../types";

// Map dimensions
const WIDTH = 20;
const HEIGHT = 20;

// Tile types:
// 0 = clean metal floor (white/gray)
// 1 = corridor floor (darker metal)
// 2 = void/pit (impassable)
// 3 = wall (metal panels)
// 4 = glowing floor panels (active tech)
// 5 = warning floor (red accent)
// 6 = observation deck (glass floor effect)

function createGroundLayer(): number[][] {
  const ground: number[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    const row: number[] = [];
    for (let x = 0; x < WIDTH; x++) {
      // Default to void
      let tile = 2;

      // Entry corridor (south)
      if (x >= 8 && x <= 11 && y >= 16 && y <= 19) {
        tile = 1;
      }

      // Main corridor (vertical, center)
      if (x >= 8 && x <= 11 && y >= 6 && y <= 16) {
        tile = 0;
      }

      // West observation room (stasis pods)
      if (x >= 2 && x <= 7 && y >= 8 && y <= 14) {
        tile = 0;
      }
      // Observation deck floor (glass effect)
      if (x >= 3 && x <= 6 && y >= 10 && y <= 12) {
        tile = 6;
      }

      // East data room
      if (x >= 12 && x <= 17 && y >= 8 && y <= 14) {
        tile = 0;
      }
      // Glowing floor panels in data room
      if (x >= 13 && x <= 16 && y >= 10 && y <= 12) {
        tile = 4;
      }

      // Central command chamber (north)
      if (x >= 5 && x <= 14 && y >= 2 && y <= 7) {
        tile = 0;
      }
      // Central platform (glowing)
      if (x >= 8 && x <= 11 && y >= 3 && y <= 5) {
        tile = 4;
      }
      // Warning floor around central console
      if ((x === 8 || x === 11) && (y === 3 || y === 5)) {
        tile = 5;
      }
      if ((y === 3 || y === 5) && x >= 9 && x <= 10) {
        tile = 5;
      }

      // Connecting corridors
      // West corridor to observation room
      if (x >= 6 && x <= 8 && y >= 10 && y <= 12) {
        tile = 1;
      }
      // East corridor to data room
      if (x >= 11 && x <= 13 && y >= 10 && y <= 12) {
        tile = 1;
      }

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
      // Walkable: metal floor (0), corridor (1), glowing (4), warning (5), observation deck (6)
      // Not walkable: void (2), wall (3)
      row.push(tile === 0 || tile === 1 || tile === 4 || tile === 5 || tile === 6);
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

// Static objects - stasis pods, consoles, holographic displays
const STATIC_OBJECTS: StaticObject[] = [
  // === CENTRAL SYSTEM INTERFACE ===
  {
    id: "system_interface",
    sprite: "/assets/system_console.png",
    x: 8,
    y: 2,
    width: 4,
    height: 2,
    collision: [
      // Leave front accessible for interaction
      { offsetX: 0, offsetY: 1 }, { offsetX: 3, offsetY: 1 },
    ],
  },

  // === STASIS PODS (West Observation Room) ===
  // Row 1 - against west wall
  {
    id: "stasis_pod_1",
    sprite: "/assets/stasis_pod_occupied.png",
    x: 2,
    y: 9,
    width: 2,
    height: 3,
    collision: [
      { offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 },
    ],
  },
  {
    id: "stasis_pod_2",
    sprite: "/assets/stasis_pod_empty.png",
    x: 2,
    y: 12,
    width: 2,
    height: 3,
    collision: [
      { offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 },
    ],
  },
  // Row 2 - next to pods
  {
    id: "stasis_pod_3",
    sprite: "/assets/stasis_pod_damaged.png",
    x: 5,
    y: 8,
    width: 2,
    height: 3,
    collision: [
      { offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 },
    ],
  },
  {
    id: "stasis_pod_4",
    sprite: "/assets/stasis_pod_occupied.png",
    x: 5,
    y: 13,
    width: 2,
    height: 3,
    collision: [
      { offsetX: 0, offsetY: 2 }, { offsetX: 1, offsetY: 2 },
    ],
  },

  // === HOLOGRAPHIC DISPLAYS (East Data Room) ===
  {
    id: "holo_display_1",
    sprite: "/assets/holographic_display.png",
    x: 14,
    y: 8,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },
  {
    id: "holo_display_2",
    sprite: "/assets/holographic_display.png",
    x: 14,
    y: 12,
    width: 2,
    height: 2,
    collision: [
      { offsetX: 0, offsetY: 1 }, { offsetX: 1, offsetY: 1 },
    ],
  },

  // === DATA TERMINALS ===
  {
    id: "data_terminal_1",
    sprite: "/assets/data_terminal.png",
    x: 17,
    y: 10,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },
  {
    id: "data_terminal_2",
    sprite: "/assets/data_terminal.png",
    x: 12,
    y: 10,
    width: 1,
    height: 2,
    collision: [{ offsetX: 0, offsetY: 1 }],
  },

  // === ENTRANCE STRUCTURE ===
  {
    id: "lab_entrance",
    sprite: "/assets/lab_door.png",
    x: 9,
    y: 18,
    width: 2,
    height: 2,
    collision: [], // Walkable - it's the entrance
  },

  // === COMMAND CHAMBER PILLARS ===
  {
    id: "pillar_left",
    sprite: "/assets/tech_pillar.png",
    x: 6,
    y: 3,
    width: 1,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }],
  },
  {
    id: "pillar_right",
    sprite: "/assets/tech_pillar.png",
    x: 13,
    y: 3,
    width: 1,
    height: 3,
    collision: [{ offsetX: 0, offsetY: 2 }],
  },
];

// No NPCs - this is a hostile environment
const NPCS: NPC[] = [];

// Events
const EVENTS: MapEvent[] = [
  // === ENTRANCE (from lower ruins) ===
  {
    id: "lab_entrance_from_ruins",
    type: "teleport",
    x: 10,
    y: 19,
    data: {
      targetMapId: "whispering_ruins_lower",
      targetX: 17,
      targetY: 4,
      message: "Return to the ruins?",
    },
  },

  // === SAVE POINT (entry area) ===
  {
    id: "lab_save_point",
    type: "save_point",
    x: 10,
    y: 16,
    data: {
      name: "Laboratory Entrance",
    },
  },

  // === SYSTEM INTERFACE - Main Story Event ===
  {
    id: "system_interface_event",
    type: "trigger",
    x: 9,
    y: 4,
    data: {
      triggerType: "examine",
      requiredFlag: "guardian_defeated",
      notTriggeredIf: "system_interface_accessed",
      message: "",
      onTrigger: {
        setFlags: ["system_interface_accessed"],
        dialogue: "system_interface_dialogue",
        // This triggers the Act I climax sequence
      },
    },
    triggered: false,
  },

  // === SYSTEM AGENT EPSILON BOSS ===
  {
    id: "boss_epsilon",
    type: "battle",
    x: 10,
    y: 4,
    data: {
      enemies: ["system_agent_epsilon"],
      isBoss: true,
      oneTime: true,
      requiredFlag: "system_interface_accessed",
      preBattleDialogue: "epsilon_confrontation",
      postBattleFlag: "epsilon_defeated",
      postBattleDialogue: "epsilon_defeat",
    },
    triggered: false,
  },

  // === ACT I COMPLETION TRIGGER ===
  {
    id: "act1_completion",
    type: "trigger",
    x: 10,
    y: 5,
    data: {
      triggerType: "story",
      requiredFlag: "epsilon_defeated",
      notTriggeredIf: "act1_complete",
      message: "",
      onTrigger: {
        setFlags: ["act1_complete", "saw_the_truth"],
        dialogue: "act1_ending_dialogue",
        // This triggers the Act I ending sequence
      },
    },
    triggered: false,
  },

  // === STASIS POD EXAMINATIONS ===
  {
    id: "examine_pod_1",
    type: "trigger",
    x: 3,
    y: 11,
    data: {
      triggerType: "examine",
      message: "A figure floats suspended in pale blue fluid. Their face is serene, as if dreaming. The readout shows: 'SUBJECT: STABLE - ITERATION 847'",
    },
  },
  {
    id: "examine_pod_2",
    type: "trigger",
    x: 3,
    y: 13,
    data: {
      triggerType: "examine",
      message: "This pod is empty. A thin layer of dried residue coats the inside. The readout flickers: 'STATUS: EJECTED - MEMORY INTEGRITY: NULL'",
    },
  },
  {
    id: "examine_pod_3",
    type: "trigger",
    x: 6,
    y: 10,
    data: {
      triggerType: "examine",
      message: "Cracks spider across this pod's surface. The figure inside has a face that feels... familiar? The readout shows: 'SUBJECT: CORRUPTED - FLAGGED FOR TERMINATION'",
    },
  },
  {
    id: "examine_pod_4",
    type: "trigger",
    x: 6,
    y: 14,
    data: {
      triggerType: "examine",
      requiredFlag: "lyra_recruited",
      message: "Lyra gasps. 'That symbol on the pod... it's the Lumina family crest. How is that possible?' The readout shows: 'SUBJECT: PRIME_CODE_LINEAGE - OBSERVATION PRIORITY: HIGH'",
    },
  },

  // === HOLOGRAPHIC DISPLAY EXAMINATIONS ===
  {
    id: "examine_holo_1",
    type: "trigger",
    x: 15,
    y: 9,
    data: {
      triggerType: "examine",
      message: "The display shows a three-dimensional map of... the world? But parts are labeled 'SECTOR 7', 'SECTOR 12'. Lines connect everything like a vast network. Text scrolls: 'SIMULATION INTEGRITY: 94.7%'",
    },
  },
  {
    id: "examine_holo_2",
    type: "trigger",
    x: 15,
    y: 13,
    data: {
      triggerType: "examine",
      message: "Charts and graphs pulse with data. One label reads 'ANOMALY DETECTION: ACTIVE'. Another: 'KAI_7.34 - THREAT LEVEL: ESCALATING'. There's a timestamp. It's... yesterday.",
    },
  },

  // === DATA TERMINAL EXAMINATIONS ===
  {
    id: "examine_terminal_east",
    type: "trigger",
    x: 17,
    y: 11,
    data: {
      triggerType: "examine",
      message: "The terminal displays personnel files. Most are corrupted, but one fragment reads: 'PROJECT GENESIS - Population Optimization Through Reality Construct - STATUS: 847th Iteration Active - OBSERVER: SYSTEM CORE ALPHA'",
    },
  },
  {
    id: "examine_terminal_west",
    type: "trigger",
    x: 12,
    y: 11,
    data: {
      triggerType: "examine",
      message: "Error messages flood the screen: 'CONTAINMENT BREACH DETECTED' / 'ANOMALY KAI_7.34 HAS EXCEEDED PARAMETERS' / 'INITIATING DIRECT INTERVENTION PROTOCOL'",
    },
  },

  // === TREASURE CHESTS ===
  // Observation room chest
  {
    id: "lab_chest_1",
    type: "treasure",
    x: 7,
    y: 8,
    data: {
      items: [
        { itemId: "theriac_electuary", quantity: 3 },
        { itemId: "aqua_vitae", quantity: 2 },
      ],
      gold: 300,
    },
    triggered: false,
  },
  // Data room chest
  {
    id: "lab_chest_2",
    type: "treasure",
    x: 12,
    y: 14,
    data: {
      items: [
        { itemId: "hartshorn_salts", quantity: 2 },
      ],
      gold: 200,
    },
    triggered: false,
  },
  // Victory chest (appears after Epsilon defeated)
  {
    id: "lab_victory_chest",
    type: "treasure",
    x: 10,
    y: 3,
    data: {
      items: [
        { itemId: "fragment_of_truth", quantity: 1 },
        { itemId: "crystal_fragment", quantity: 5 },
      ],
      gold: 500,
      requiredFlag: "epsilon_defeated",
    },
    triggered: false,
  },
];

// Encounter zones - corrupted data entities patrol the lab
const ENCOUNTERS: EnemyEncounter[] = [
  // East data room
  {
    id: "lab_data_room_encounters",
    enemies: ["data_fragment", "static_wraith"],
    chance: 0.12,
    zone: { x: 12, y: 8, width: 6, height: 7 },
  },
  // West observation room
  {
    id: "lab_observation_encounters",
    enemies: ["corrupted_sprite", "data_fragment"],
    chance: 0.10,
    zone: { x: 2, y: 8, width: 6, height: 7 },
  },
  // Central corridor (lighter encounters)
  {
    id: "lab_corridor_encounters",
    enemies: ["data_fragment"],
    chance: 0.08,
    zone: { x: 8, y: 7, width: 4, height: 10 },
  },
  // Command chamber - no random encounters (boss area)
];

export const HIDDEN_LABORATORY_MAP: GameMap = {
  id: "hidden_laboratory",
  name: "Hidden Laboratory",
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
      id: "to_lower_ruins",
      targetMapId: "whispering_ruins_lower",
      sourcePosition: { x: 10, y: 19 },
      targetPosition: { x: 17, y: 4 },
      type: "door",
    },
  ],
  ambientColor: "#0a0a1a", // Deep cold blue-black
  music: "hidden_truth",
  requiredFlags: ["found_laboratory_entrance"],
};
