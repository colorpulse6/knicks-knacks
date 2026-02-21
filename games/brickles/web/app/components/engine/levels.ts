import {
  type Brick,
  BrickType,
  BRICK_COLS,
  BRICK_WIDTH,
  BRICK_HEIGHT,
  BRICK_PADDING,
  BRICK_OFFSET_TOP,
  BRICK_OFFSET_LEFT,
  BRICK_TYPE_HITS,
  BRICK_TYPE_COLORS,
  ROW_COLORS,
  BALL_INITIAL_SPEED,
  BALL_SPEED_INCREMENT,
  BALL_MAX_SPEED,
} from "./types";

// ─── Level Definition ────────────────────────────────────────────────

interface LevelDefinition {
  name: string;
  pattern: string[];
  ballSpeed: number;
}

// Shorthand: N=normal, T=tough, A=armored, X=indestructible, E=explosive, .=empty
type BrickCode = "N" | "T" | "A" | "X" | "E" | ".";

const CODE_MAP: Record<BrickCode, BrickType | null> = {
  N: BrickType.NORMAL,
  T: BrickType.TOUGH,
  A: BrickType.ARMORED,
  X: BrickType.INDESTRUCTIBLE,
  E: BrickType.EXPLOSIVE,
  ".": null,
};

// ─── Level Layouts ───────────────────────────────────────────────────

const LEVELS: LevelDefinition[] = [
  {
    name: "First Contact",
    ballSpeed: BALL_INITIAL_SPEED,
    pattern: [
      "............",
      "............",
      "NNNNNNNNNNNN",
      "NNNNNNNNNNNN",
      "NNNNNNNNNNNN",
      "NNNNNNNNNNNN",
      "............",
      "............",
    ],
  },
  {
    name: "Diamond",
    ballSpeed: BALL_INITIAL_SPEED + BALL_SPEED_INCREMENT,
    pattern: [
      ".....NN.....",
      "....NNNN....",
      "...NTTTTN...",
      "..NNTTTTNN..",
      "...NTTTTN...",
      "....NNNN....",
      ".....NN.....",
      "............",
    ],
  },
  {
    name: "Space Invader",
    ballSpeed: BALL_INITIAL_SPEED + BALL_SPEED_INCREMENT * 2,
    pattern: [
      "..N......N..",
      "...N....N...",
      "..NNNNNNNN..",
      ".NNN.NN.NNN.",
      "NNNNNNNNNNNN",
      "N.NNNNNNNN.N",
      "N.N......N.N",
      "...NN..NN...",
    ],
  },
  {
    name: "Fortress",
    ballSpeed: BALL_INITIAL_SPEED + BALL_SPEED_INCREMENT * 3,
    pattern: [
      "XXXXXXXXXXXX",
      "X.NNNNNNNN.X",
      "X.NNNNNNNN.X",
      "X.NNTTNNNN.X",
      "X.NNTTNNNN.X",
      "X.NNNNNNNN.X",
      "X.NNNNNNNN.X",
      "XXXXXXXXXXXX",
    ],
  },
  {
    name: "Minefield",
    ballSpeed: BALL_INITIAL_SPEED + BALL_SPEED_INCREMENT * 4,
    pattern: [
      "NNN.EN.NNN.E",
      "N.NNNN.E.NNN",
      "ENNE.NNNNN.N",
      "NNN.NNNE.NNN",
      "N.ENNN.NNN.E",
      "NNN.E.NNNNNN",
      "E.NNN.ENNN.N",
      "NNN.NNNNE.NN",
    ],
  },
  {
    name: "Spiral",
    ballSpeed: BALL_INITIAL_SPEED + BALL_SPEED_INCREMENT * 5,
    pattern: [
      "TTTTTTTTTTTT",
      "............",
      "AATTTTTTTT..",
      "AA.........",
      "..........AA",
      "..TTTTTTTTAA",
      "............",
      "TTTTTTTTTTTT",
    ],
  },
  {
    name: "Checkerboard",
    ballSpeed: BALL_INITIAL_SPEED + BALL_SPEED_INCREMENT * 6,
    pattern: [
      "X.N.X.N.X.N.",
      ".N.X.N.X.N.X",
      "X.N.X.N.X.N.",
      ".N.X.N.X.N.X",
      "X.N.X.N.X.N.",
      ".N.X.N.X.N.X",
      "X.N.X.N.X.N.",
      ".N.X.N.X.N.X",
    ],
  },
  {
    name: "Pyramid",
    ballSpeed: BALL_INITIAL_SPEED + BALL_SPEED_INCREMENT * 7,
    pattern: [
      ".....TT.....",
      "....TAAT....",
      "...TAAAAT...",
      "..TNAAAANT..",
      ".TNNAAAANNT.",
      "TNNNNAANNNT.",
      "NNNNNNNNNNNN",
      "............",
    ],
  },
  {
    name: "The Wall",
    ballSpeed: BALL_INITIAL_SPEED + BALL_SPEED_INCREMENT * 8,
    pattern: [
      "XXXXXXXXXXXX",
      "............",
      "TTTTTTTTTTTT",
      "NNNNNNNNNNNN",
      "NNNNENNENNNN",
      "NNNNNNNNNNNN",
      "TTTTTTTTTTTT",
      "............",
    ],
  },
  {
    name: "Gauntlet",
    ballSpeed: BALL_INITIAL_SPEED + BALL_SPEED_INCREMENT * 9,
    pattern: [
      "XAETTAETXAET",
      "TANXNETNAXNE",
      "ENNTAXENNTAN",
      "NAETNNXAETNN",
      "TNNEANNTNNEA",
      "XNETANXNETAN",
      "ATNNENNATNNE",
      "ENNXATTENNXA",
    ],
  },
];

// ─── Level Access ────────────────────────────────────────────────────

export function getLevelDefinition(level: number): LevelDefinition {
  const idx = (level - 1) % LEVELS.length;
  const def = LEVELS[idx];
  // For levels beyond the first cycle, increase ball speed further
  const cycle = Math.floor((level - 1) / LEVELS.length);
  return {
    ...def,
    ballSpeed: Math.min(
      def.ballSpeed + cycle * BALL_SPEED_INCREMENT * 3,
      BALL_MAX_SPEED
    ),
  };
}

export function getLevelName(level: number): string {
  return getLevelDefinition(level).name;
}

export function getLevelBallSpeed(level: number): number {
  return getLevelDefinition(level).ballSpeed;
}

export function isBossLevel(level: number): boolean {
  // Level 9 is the first boss, then every 10 levels
  return level % 10 === 9;
}

// ─── Brick Creation ──────────────────────────────────────────────────

let nextBrickId = 0;

export function resetBrickIds(): void {
  nextBrickId = 0;
}

export function createLevelBricks(level: number): Brick[] {
  const def = getLevelDefinition(level);
  const bricks: Brick[] = [];

  for (let row = 0; row < def.pattern.length; row++) {
    const rowStr = def.pattern[row];
    for (let col = 0; col < Math.min(rowStr.length, BRICK_COLS); col++) {
      const code = rowStr[col] as BrickCode;
      const type = CODE_MAP[code];
      if (type === null || type === undefined) continue;

      const x = BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING);
      const y = BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING);

      let color: string;
      if (type === BrickType.NORMAL) {
        color = ROW_COLORS[row % ROW_COLORS.length];
      } else {
        color = BRICK_TYPE_COLORS[type];
      }

      bricks.push({
        id: nextBrickId++,
        row,
        col,
        x,
        y,
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        type,
        hitsRemaining: BRICK_TYPE_HITS[type],
        color,
        alive: true,
        entranceProgress: 0,
      });
    }
  }

  return bricks;
}

// ─── Boss Row Update ─────────────────────────────────────────────────

export function updateBossRow(
  bricks: Brick[],
  frameCount: number
): Brick[] {
  return bricks.map((brick) => {
    if (brick.type !== BrickType.INDESTRUCTIBLE || !brick.alive) return brick;
    // Oscillate horizontally
    const baseX =
      BRICK_OFFSET_LEFT + brick.col * (BRICK_WIDTH + BRICK_PADDING);
    const offset = Math.sin(frameCount * 0.02) * 40;
    return { ...brick, x: baseX + offset };
  });
}
