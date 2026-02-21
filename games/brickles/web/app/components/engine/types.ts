// ─── Canvas Dimensions ───────────────────────────────────────────────
export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 700;

// ─── Brick Grid ──────────────────────────────────────────────────────
export const BRICK_ROWS = 8;
export const BRICK_COLS = 12;
export const BRICK_WIDTH = 62;
export const BRICK_HEIGHT = 20;
export const BRICK_PADDING = 4;
export const BRICK_OFFSET_TOP = 80;
export const BRICK_OFFSET_LEFT =
  (CANVAS_WIDTH - BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING) /
  2;

// ─── Paddle ──────────────────────────────────────────────────────────
export const PADDLE_WIDTH = 120;
export const PADDLE_HEIGHT = 14;
export const PADDLE_Y = CANVAS_HEIGHT - 50;
export const PADDLE_SPEED = 10;
export const PADDLE_LERP = 0.18;

// ─── Ball ────────────────────────────────────────────────────────────
export const BALL_RADIUS = 7;
export const BALL_INITIAL_SPEED = 5;
export const BALL_MAX_SPEED = 12;
export const BALL_SPEED_INCREMENT = 0.3;
export const BALL_TRAIL_LENGTH = 8;

// ─── Power-ups ───────────────────────────────────────────────────────
export const POWER_UP_SIZE = 24;
export const POWER_UP_FALL_SPEED = 2.5;
export const POWER_UP_DROP_CHANCE = 0.15;
export const POWER_UP_DURATION = 600; // ~10s at 60fps

// ─── Particles ───────────────────────────────────────────────────────
export const PARTICLES_PER_BRICK = 12;
export const PARTICLE_LIFETIME = 40;
export const PARTICLE_GRAVITY = 0.12;
export const MAX_PARTICLES = 300;

// ─── Screen Shake ────────────────────────────────────────────────────
export const SHAKE_DURATION = 4;
export const SHAKE_INTENSITY_NORMAL = 2;
export const SHAKE_INTENSITY_EXPLOSIVE = 6;

// ─── Scoring ─────────────────────────────────────────────────────────
export const SCORE_NORMAL = 10;
export const SCORE_TOUGH = 25;
export const SCORE_ARMORED = 40;
export const SCORE_EXPLOSIVE = 15;
export const COMBO_MULTIPLIER_THRESHOLD = 3;

// ─── Laser ───────────────────────────────────────────────────────────
export const LASER_SPEED = 10;
export const LASER_COOLDOWN = 15;
export const LASER_WIDTH = 3;
export const LASER_HEIGHT = 12;

// ─── Level Transition ────────────────────────────────────────────────
export const LEVEL_TRANSITION_FRAMES = 120;

// ─── Interfaces ──────────────────────────────────────────────────────

export interface Vector2 {
  x: number;
  y: number;
}

export enum BrickType {
  NORMAL = "normal",
  TOUGH = "tough",
  ARMORED = "armored",
  INDESTRUCTIBLE = "indestructible",
  EXPLOSIVE = "explosive",
}

export interface Brick {
  id: number;
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: BrickType;
  hitsRemaining: number;
  color: string;
  alive: boolean;
  entranceProgress: number;
}

export interface Ball {
  id: number;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  fireball: boolean;
  stuck: boolean;
  stuckOffset: number;
  trail: Vector2[];
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  targetX: number;
  magnetActive: boolean;
  laserCooldown: number;
}

export interface Laser {
  id: number;
  position: Vector2;
  velocity: Vector2;
}

export enum PowerUpType {
  MULTI_BALL = "multi_ball",
  EXPAND_PADDLE = "expand_paddle",
  SHRINK_PADDLE = "shrink_paddle",
  FIREBALL = "fireball",
  MAGNET = "magnet",
  SLOW_MOTION = "slow_motion",
  EXTRA_LIFE = "extra_life",
  LASER = "laser",
}

export interface PowerUp {
  id: number;
  type: PowerUpType;
  position: Vector2;
  color: string;
  symbol: string;
}

export interface ActivePowerUp {
  type: PowerUpType;
  remainingFrames: number;
}

export interface Particle {
  position: Vector2;
  velocity: Vector2;
  color: string;
  lifetime: number;
  maxLifetime: number;
  size: number;
}

export interface ScreenShake {
  duration: number;
  intensity: number;
}

export enum AudioEvent {
  PADDLE_HIT = "paddle_hit",
  WALL_HIT = "wall_hit",
  BRICK_HIT = "brick_hit",
  BRICK_DESTROY = "brick_destroy",
  EXPLOSIVE_DESTROY = "explosive_destroy",
  POWER_UP_COLLECT = "power_up_collect",
  POWER_UP_NEGATIVE = "power_up_negative",
  EXTRA_LIFE = "extra_life",
  BALL_LOST = "ball_lost",
  LEVEL_COMPLETE = "level_complete",
  GAME_OVER = "game_over",
  COMBO = "combo",
  LASER_FIRE = "laser_fire",
}

export interface GameState {
  paddle: Paddle;
  balls: Ball[];
  bricks: Brick[];
  powerUps: PowerUp[];
  activePowerUps: ActivePowerUp[];
  lasers: Laser[];
  particles: Particle[];
  screenShake: ScreenShake;
  score: number;
  lives: number;
  level: number;
  combo: number;
  maxCombo: number;
  gameOver: boolean;
  paused: boolean;
  levelComplete: boolean;
  levelTransitionTimer: number;
  ballLaunched: boolean;
  audioEvents: AudioEvent[];
  entranceAnimating: boolean;
  frameCount: number;
}

export interface Keys {
  left: boolean;
  right: boolean;
  space: boolean;
}

// ─── Color Palette ───────────────────────────────────────────────────

export const NEON_COLORS = {
  cyan: "#00FFFF",
  magenta: "#FF00FF",
  yellow: "#FFD700",
  lime: "#39FF14",
  orange: "#FF6600",
  pink: "#FF1493",
  blue: "#4169E1",
  red: "#FF3333",
  white: "#FFFFFF",
  purple: "#9B59B6",
} as const;

export const ROW_COLORS = [
  NEON_COLORS.red,
  NEON_COLORS.orange,
  NEON_COLORS.yellow,
  NEON_COLORS.lime,
  NEON_COLORS.cyan,
  NEON_COLORS.blue,
  NEON_COLORS.purple,
  NEON_COLORS.magenta,
];

export const BRICK_TYPE_COLORS: Record<BrickType, string> = {
  [BrickType.NORMAL]: "", // uses ROW_COLORS
  [BrickType.TOUGH]: "#5588CC",
  [BrickType.ARMORED]: "#8B8B8B",
  [BrickType.INDESTRUCTIBLE]: "#444444",
  [BrickType.EXPLOSIVE]: NEON_COLORS.red,
};

export const BRICK_TYPE_HITS: Record<BrickType, number> = {
  [BrickType.NORMAL]: 1,
  [BrickType.TOUGH]: 2,
  [BrickType.ARMORED]: 3,
  [BrickType.INDESTRUCTIBLE]: 999,
  [BrickType.EXPLOSIVE]: 1,
};

export const POWER_UP_CONFIG: Record<
  PowerUpType,
  { color: string; symbol: string }
> = {
  [PowerUpType.MULTI_BALL]: { color: "#00FFFF", symbol: "M" },
  [PowerUpType.EXPAND_PADDLE]: { color: "#39FF14", symbol: "+" },
  [PowerUpType.SHRINK_PADDLE]: { color: "#FF3333", symbol: "-" },
  [PowerUpType.FIREBALL]: { color: "#FF6600", symbol: "F" },
  [PowerUpType.MAGNET]: { color: "#9B59B6", symbol: "G" },
  [PowerUpType.SLOW_MOTION]: { color: "#FFD700", symbol: "S" },
  [PowerUpType.EXTRA_LIFE]: { color: "#FF1493", symbol: "1" },
  [PowerUpType.LASER]: { color: "#FF00FF", symbol: "L" },
};

// Weighted power-up drop table (index-matched arrays)
export const POWER_UP_WEIGHTS: { type: PowerUpType; weight: number }[] = [
  { type: PowerUpType.MULTI_BALL, weight: 20 },
  { type: PowerUpType.EXPAND_PADDLE, weight: 18 },
  { type: PowerUpType.FIREBALL, weight: 12 },
  { type: PowerUpType.LASER, weight: 12 },
  { type: PowerUpType.MAGNET, weight: 10 },
  { type: PowerUpType.SLOW_MOTION, weight: 10 },
  { type: PowerUpType.EXTRA_LIFE, weight: 8 },
  { type: PowerUpType.SHRINK_PADDLE, weight: 10 },
];
