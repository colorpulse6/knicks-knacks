import type { BoardingMap, BoardingTileType, FPNPC, FPEnemy, FirstPersonState } from "./types";

const T = 32;

// ─── Settlement Map ─────────────────────────────────────────────────
// A small outpost on a planet surface. Open central area with buildings.

function parseMap(lines: string[]): BoardingMap {
  const tiles = lines.map((line) =>
    line.split("").map((ch): BoardingTileType => {
      switch (ch) {
        case "#": return "wall";
        case ".": return "floor";
        case "D": return "door";
        case "S": return "spawn";
        case "G": return "goal";
        default: return "empty";
      }
    })
  );
  return {
    width: tiles[0]?.length ?? 0,
    height: tiles.length,
    tileSize: T,
    tiles,
  };
}

// 25×25 settlement map
const SETTLEMENT_MAP = parseMap([
  "#########################",  // 0
  "#.......................#",  // 1
  "#.......................#",  // 2
  "#..####..........####..#",  // 3
  "#..#..#..........#..#..#",  // 4
  "#..#..D..........D..#..#",  // 5
  "#..####..........####..#",  // 6
  "#.......................#",  // 7
  "#.......................#",  // 8
  "#........S...G..........#", // 9
  "#.......................#",  // 10
  "#.......................#",  // 11
  "#..######....######....#",  // 12
  "#..#....#....#....#....#",  // 13
  "#..D....D....D....D....#",  // 14
  "#..#....#....#....#....#",  // 15
  "#..######....######....#",  // 16
  "#.......................#",  // 17
  "#.......................#",  // 18
  "#....####.....####.....#",  // 19
  "#....#..D.....D..#.....#",  // 20
  "#....#..#.....#..#.....#",  // 21
  "#....####.....####.....#",  // 22
  "#.......................#",  // 23
  "#########################",  // 24
]);

// ─── NPCs ───────────────────────────────────────────────────────────

const SETTLEMENT_NPCS: FPNPC[] = [
  {
    id: 1,
    x: 6.5, y: 5.5,   // Inside left top building
    name: "Commander Voss",
    type: "quest",
    color: "#44ccff",
    interacted: false,
    dialog: [
      { speaker: "VOSS", text: "Pilot. Good to see you in one piece." },
      { speaker: "VOSS", text: "We've set up a forward outpost here. The locals are... cooperative, for now." },
      { speaker: "VOSS", text: "Reyes has supplies at the market. Talk to Doc Kael if you need intel on the area." },
      { speaker: "VOSS", text: "Stay sharp. The Hollow have patrols nearby." },
    ],
  },
  {
    id: 2,
    x: 18.5, y: 5.5,  // Inside right top building
    name: "Doc Kael",
    type: "lore",
    color: "#44ff88",
    interacted: false,
    dialog: [
      { speaker: "KAEL", text: "Ah, you made it down safely. Let me show you what I've found." },
      { speaker: "KAEL", text: "The readings here are... unusual. The biological signatures don't match any Hollow patterns we've seen." },
      { speaker: "KAEL", text: "I think something lived here before the Hollow arrived. Something human." },
      { speaker: "KAEL", text: "The Kepler colonists. They were here. Two thousand years ago." },
      { speaker: "KAEL", text: "Whatever happened to them... it started in that structure to the south." },
    ],
  },
  {
    id: 3,
    x: 5.5, y: 14.5,  // Inside left bottom building
    name: "Lt. Reyes",
    type: "merchant",
    color: "#ffaa44",
    interacted: false,
    dialog: [
      { speaker: "REYES", text: "Welcome to the market, such as it is." },
      { speaker: "REYES", text: "I've scavenged what I can from the wreckage. Take a look." },
    ],
    shopItems: [
      { id: "hull-repair", name: "Hull Repair Kit", description: "Restore 1 HP", cost: 100, type: "consumable", itemId: "hull-repair-kit" },
      { id: "shield-charge", name: "Shield Charge", description: "Temporary shield", cost: 200, type: "consumable", itemId: "shield-charge" },
      { id: "scanner", name: "Scanner Pulse", description: "Reveal enemy affinities", cost: 150, type: "consumable", itemId: "scanner-pulse" },
      { id: "bio-fiber", name: "Bio-Fiber Sample", description: "Rare crafting material", cost: 500, type: "material", itemId: "bio-fiber" },
    ],
  },
  {
    id: 4,
    x: 15.5, y: 14.5, // Inside right bottom building
    name: "Survivor",
    type: "lore",
    color: "#aa88ff",
    interacted: false,
    dialog: [
      { speaker: "???", text: "..." },
      { speaker: "???", text: "You... you're from the Coalition?" },
      { speaker: "SURVIVOR", text: "I've been hiding here for weeks. The others... they didn't make it." },
      { speaker: "SURVIVOR", text: "There's something in the ruins to the south. Something that whispers." },
      { speaker: "SURVIVOR", text: "Don't go there. Please. It changes you." },
      { speaker: "SURVIVOR", text: "...but if you must, take this. I found it near the entrance." },
    ],
  },
  {
    id: 5,
    x: 7.5, y: 20.5,  // Near south building
    name: "Scavenger",
    type: "merchant",
    color: "#ccaa44",
    interacted: false,
    dialog: [
      { speaker: "SCAVENGER", text: "Psst. Hey. You look like you need some firepower." },
      { speaker: "SCAVENGER", text: "I've got the good stuff. No questions asked." },
    ],
    shopItems: [
      { id: "weapon-charge", name: "Weapon Overcharge", description: "+1 weapon level for next mission", cost: 300, type: "consumable", itemId: "weapon-overcharge" },
      { id: "cryo-charge", name: "Cryo Charge", description: "Freeze nearby enemies", cost: 250, type: "consumable", itemId: "cryo-charge" },
      { id: "ember-shard", name: "Ember Shard", description: "Rare material — from a Hollow wreck", cost: 1000, type: "material", itemId: "ember-shard" },
    ],
  },
];

// ─── State Creation ─────────────────────────────────────────────────

export function createExplorationState(): FirstPersonState {
  // Find spawn
  let spawnX = 9.5;
  let spawnY = 9.5;
  for (let r = 0; r < SETTLEMENT_MAP.height; r++) {
    for (let c = 0; c < SETTLEMENT_MAP.width; c++) {
      if (SETTLEMENT_MAP.tiles[r][c] === "spawn") {
        spawnX = c + 0.5;
        spawnY = r + 0.5;
      }
    }
  }

  return {
    map: SETTLEMENT_MAP,
    posX: spawnX,
    posY: spawnY,
    dirX: 0,
    dirY: 1, // Facing south toward buildings
    planeX: 0.66,
    planeY: 0,
    moveSpeed: 0.06,
    rotSpeed: 0.04,
    goalReached: false,
    enemies: [],         // No enemies in the settlement (peaceful)
    gunFireTimer: 0,
    gunCooldown: 0,
    npcs: SETTLEMENT_NPCS.map((n) => ({ ...n })),
    dialogState: null,
  };
}
