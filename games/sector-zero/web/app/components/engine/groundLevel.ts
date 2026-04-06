import type { TileMap, GroundEntity, GroundState, Bullet } from "./types";
import { GROUND_TILE_SIZE } from "./groundPhysics";

const T = GROUND_TILE_SIZE;

function parseMap(lines: string[]): TileMap {
  const tiles = lines.map((line) =>
    line.split("").map((ch): "empty" | "solid" | "platform" | "spawn" | "goal" => {
      switch (ch) {
        case "#": return "solid";
        case "=": return "platform";
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

// 40 chars wide × 22 rows tall (~704px, fits in GAME_AREA_HEIGHT of 714)
const TEST_GROUND_MAP = parseMap([
  "........................................",
  "........................................",
  "........................................",
  "........................................",
  "........................................",
  "........................................",
  "........................................",
  "........................................",
  "........................................",
  "........................................",
  "..............====......................",
  "........................................",
  "........====........====..........====.",
  "........................................",
  "..S.............===..................G..",
  "........................................",
  "....====..........====......====.......",
  "........................................",
  "........................................",
  "........................................",
  "........................................",
  "########################################",
]);

// Enemies placed on ground floor (row 21 is solid, so put them on row 20)
const GROUND_Y = 20 * T - 32;

const TEST_GROUND_ENEMIES: Omit<GroundEntity, "id">[] = [
  {
    x: 12 * T, y: GROUND_Y, width: 24, height: 32,
    vx: 0, vy: 0, hp: 2, maxHp: 2,
    type: "turret", onGround: true, facingRight: false,
    fireTimer: 60, classId: "heavy-mech",
  },
  {
    x: 20 * T, y: GROUND_Y, width: 24, height: 32,
    vx: 1, vy: 0, hp: 1, maxHp: 1,
    type: "patrol", onGround: true, facingRight: true,
    fireTimer: 0, classId: "swarm",
  },
  {
    x: 28 * T, y: GROUND_Y, width: 24, height: 32,
    vx: 0, vy: 0, hp: 3, maxHp: 3,
    type: "turret", onGround: true, facingRight: false,
    fireTimer: 90, classId: "armored",
  },
  {
    x: 35 * T, y: GROUND_Y, width: 24, height: 32,
    vx: 2, vy: 0, hp: 2, maxHp: 2,
    type: "jumper", onGround: true, facingRight: false,
    fireTimer: 0, classId: "bio-organic",
  },
];

let groundEntityId = 0;

export function createTestGroundState(): GroundState {
  groundEntityId = 0;
  return {
    tileMap: TEST_GROUND_MAP,
    cameraX: 0,
    groundEnemies: TEST_GROUND_ENEMIES.map((e) => ({ ...e, id: ++groundEntityId })),
    groundBullets: [],
    playerOnGround: false,
    playerVY: 0,
    playerFacingRight: true,
    goalReached: false,
  };
}

export function getSpawnPosition(map: TileMap): { x: number; y: number } {
  for (let row = 0; row < map.height; row++) {
    for (let col = 0; col < map.width; col++) {
      if (map.tiles[row][col] === "spawn") {
        return { x: col * map.tileSize, y: (row - 1) * map.tileSize };
      }
    }
  }
  return { x: 64, y: 400 };
}

export function getGoalPosition(map: TileMap): { x: number; y: number } {
  for (let row = 0; row < map.height; row++) {
    for (let col = 0; col < map.width; col++) {
      if (map.tiles[row][col] === "goal") {
        return { x: col * map.tileSize, y: row * map.tileSize };
      }
    }
  }
  return { x: 1200, y: 400 };
}
