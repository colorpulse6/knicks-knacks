// ─── Canvas ──────────────────────────────────────────────────────────
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 854;
export const DASHBOARD_HEIGHT = 140;
export const GAME_AREA_HEIGHT = CANVAS_HEIGHT - DASHBOARD_HEIGHT; // 714
export const DASHBOARD_Y = GAME_AREA_HEIGHT;

// ─── Game States ─────────────────────────────────────────────────────
export enum GameScreen {
  LOADING = "LOADING",
  MENU = "MENU",
  MAP = "MAP",
  BRIEFING = "BRIEFING",
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
  BOSS_INTRO = "BOSS_INTRO",
  BOSS_FIGHT = "BOSS_FIGHT",
  LEVEL_COMPLETE = "LEVEL_COMPLETE",
  GAME_OVER = "GAME_OVER",
  ENDING = "ENDING",
  CREDITS = "CREDITS",
}

// ─── Directions ──────────────────────────────────────────────────────
export type Direction = "up" | "down" | "left" | "right";

// ─── Player ──────────────────────────────────────────────────────────
export const PLAYER_WIDTH = 48;
export const PLAYER_HEIGHT = 48;
export const PLAYER_SPEED = 5;
export const PLAYER_MAX_HP = 3;
export const PLAYER_INVINCIBLE_FRAMES = 90; // 1.5s at 60fps
export const PLAYER_FIRE_RATE = 8; // frames between shots

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speed: number;
  weaponLevel: number;
  invincibleTimer: number;
  fireTimer: number;
  energy: number;
  maxEnergy: number;
  /** -1 = banking left, 0 = center, 1 = banking right */
  bankDir: number;
}

// ─── Bullets ─────────────────────────────────────────────────────────
export const BULLET_SPEED = 10;
export const ENEMY_BULLET_SPEED = 4;

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
  isPlayer: boolean;
  piercing: boolean;
}

// ─── Enemy Types ─────────────────────────────────────────────────────
export enum EnemyType {
  SCOUT = "SCOUT",
  DRONE = "DRONE",
  GUNNER = "GUNNER",
  SHIELDER = "SHIELDER",
  BOMBER = "BOMBER",
  SWARM = "SWARM",
  TURRET = "TURRET",
  CLOAKER = "CLOAKER",
  ELITE = "ELITE",
  MINE = "MINE",
  WRAITH = "WRAITH",
  ECHO = "ECHO",
  MIRROR = "MIRROR",
}

export interface EnemyDefinition {
  type: EnemyType;
  hp: number;
  speed: number;
  width: number;
  height: number;
  score: number;
  shoots: boolean;
  fireRate: number;
}

export const ENEMY_DEFS: Record<EnemyType, EnemyDefinition> = {
  [EnemyType.SCOUT]: {
    type: EnemyType.SCOUT,
    hp: 1, speed: 3, width: 40, height: 40, score: 100,
    shoots: false, fireRate: 0,
  },
  [EnemyType.DRONE]: {
    type: EnemyType.DRONE,
    hp: 1, speed: 4, width: 32, height: 32, score: 150,
    shoots: true, fireRate: 120,
  },
  [EnemyType.GUNNER]: {
    type: EnemyType.GUNNER,
    hp: 3, speed: 1.5, width: 48, height: 48, score: 250,
    shoots: true, fireRate: 60,
  },
  [EnemyType.SHIELDER]: {
    type: EnemyType.SHIELDER,
    hp: 5, speed: 1.5, width: 56, height: 48, score: 350,
    shoots: true, fireRate: 90,
  },
  [EnemyType.BOMBER]: {
    type: EnemyType.BOMBER,
    hp: 2, speed: 5, width: 36, height: 48, score: 200,
    shoots: false, fireRate: 0,
  },
  [EnemyType.SWARM]: {
    type: EnemyType.SWARM,
    hp: 1, speed: 4.5, width: 24, height: 24, score: 50,
    shoots: false, fireRate: 0,
  },
  [EnemyType.TURRET]: {
    type: EnemyType.TURRET,
    hp: 6, speed: 0, width: 48, height: 48, score: 400,
    shoots: true, fireRate: 45,
  },
  [EnemyType.CLOAKER]: {
    type: EnemyType.CLOAKER,
    hp: 3, speed: 3, width: 44, height: 44, score: 300,
    shoots: true, fireRate: 90,
  },
  [EnemyType.ELITE]: {
    type: EnemyType.ELITE,
    hp: 8, speed: 3, width: 48, height: 48, score: 1000,
    shoots: true, fireRate: 40,
  },
  [EnemyType.MINE]: {
    type: EnemyType.MINE,
    hp: 1, speed: 0.5, width: 32, height: 32, score: 75,
    shoots: false, fireRate: 0,
  },
  [EnemyType.WRAITH]: {
    type: EnemyType.WRAITH,
    hp: 4, speed: 2.5, width: 48, height: 44, score: 400,
    shoots: true, fireRate: 80,
  },
  [EnemyType.ECHO]: {
    type: EnemyType.ECHO,
    hp: 3, speed: 3, width: 36, height: 36, score: 300,
    shoots: true, fireRate: 90,
  },
  [EnemyType.MIRROR]: {
    type: EnemyType.MIRROR,
    hp: 3, speed: 4, width: 48, height: 48, score: 350,
    shoots: true, fireRate: 60,
  },
};

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speed: number;
  vx: number;
  vy: number;
  score: number;
  fireTimer: number;
  fireRate: number;
  shoots: boolean;
  behavior: EnemyBehavior;
  behaviorTimer: number;
  cloaked: boolean;
}

export type EnemyBehavior =
  | "formation"
  | "dive"
  | "zigzag"
  | "orbit"
  | "chase"
  | "static"
  | "cloak"
  | "kamikaze"
  | "drift"
  | "phase"
  | "mirror";

// ─── Formation Types ─────────────────────────────────────────────────
export type FormationType =
  | "v-shape"
  | "line"
  | "grid"
  | "circle"
  | "scatter"
  | "single-file";

// ─── Waves ───────────────────────────────────────────────────────────
export interface WaveDefinition {
  enemies: { type: EnemyType; count: number; formation: FormationType }[];
  delay: number;
  spawnPattern: "top" | "sides" | "formation" | "scatter";
}

export interface Wave {
  definition: WaveDefinition;
  spawned: boolean;
  enemiesRemaining: number;
}

// ─── Power-Ups ───────────────────────────────────────────────────────
export enum PowerUpType {
  SHIELD = "SHIELD",
  SPEED = "SPEED",
  BOMB = "BOMB",
  MAGNET = "MAGNET",
  SIDE_GUNNERS = "SIDE_GUNNERS",
  RAPID_FIRE = "RAPID_FIRE",
  WEAPON_UP = "WEAPON_UP",
}

export interface PowerUp {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  remainingFrames: number;
  totalFrames: number;
}

export const POWER_UP_COLORS: Record<PowerUpType, string> = {
  [PowerUpType.SHIELD]: "#4488ff",
  [PowerUpType.SPEED]: "#ffdd00",
  [PowerUpType.BOMB]: "#ff3333",
  [PowerUpType.MAGNET]: "#aa44ff",
  [PowerUpType.SIDE_GUNNERS]: "#44ff44",
  [PowerUpType.RAPID_FIRE]: "#ff8800",
  [PowerUpType.WEAPON_UP]: "#ffffff",
};

export const POWER_UP_SYMBOLS: Record<PowerUpType, string> = {
  [PowerUpType.SHIELD]: "S",
  [PowerUpType.SPEED]: ">>",
  [PowerUpType.BOMB]: "B",
  [PowerUpType.MAGNET]: "M",
  [PowerUpType.SIDE_GUNNERS]: "+",
  [PowerUpType.RAPID_FIRE]: "R",
  [PowerUpType.WEAPON_UP]: "W",
};

export const POWER_UP_DURATION: Record<PowerUpType, number> = {
  [PowerUpType.SHIELD]: 600,   // 10s
  [PowerUpType.SPEED]: 480,    // 8s
  [PowerUpType.BOMB]: 1,       // instant
  [PowerUpType.MAGNET]: 720,   // 12s
  [PowerUpType.SIDE_GUNNERS]: 900, // 15s
  [PowerUpType.RAPID_FIRE]: 600,   // 10s
  [PowerUpType.WEAPON_UP]: 1,      // permanent within level
};

// ─── Particles ───────────────────────────────────────────────────────
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: "spark" | "smoke" | "trail" | "explosion";
}

// ─── Bosses ──────────────────────────────────────────────────────────
export interface BossPart {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  isWeakPoint: boolean;
  vulnerable: boolean;
}

export interface Boss {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  phase: number;
  maxPhases: number;
  parts: BossPart[];
  fireTimer: number;
  behaviorTimer: number;
  defeated: boolean;
  velocityX: number;
  velocityY: number;
  mouthOpen: boolean;
  mouthTimer: number;
  chargeState: "none" | "winding" | "charging" | "recovering";
  chargeTimer: number;
  spawnTimer: number;
}

// ─── Combo ───────────────────────────────────────────────────────────
export const COMBO_WINDOW = 90; // 1.5s at 60fps
export const COMBO_MAX = 10;

// ─── Scoring ─────────────────────────────────────────────────────────
export interface LevelResult {
  score: number;
  kills: number;
  totalEnemies: number;
  deaths: number;
  stars: number;
  xpEarned: number;
}

// ─── Star Map ────────────────────────────────────────────────────────
export interface WorldNode {
  id: number;
  name: string;
  theme: string;
  x: number;
  y: number;
  levels: number[];
  unlocked: boolean;
}

// ─── Background ──────────────────────────────────────────────────────
export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
}

export interface BackgroundLayer {
  stars: Star[];
  scrollY: number;
  speed: number;
}

// ─── Input ───────────────────────────────────────────────────────────
export interface Keys {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  shoot: boolean;
  bomb: boolean;
}

// ─── Audio Events ────────────────────────────────────────────────────
export enum AudioEvent {
  PLAYER_SHOOT = "PLAYER_SHOOT",
  PLAYER_HIT = "PLAYER_HIT",
  PLAYER_DEATH = "PLAYER_DEATH",
  ENEMY_HIT = "ENEMY_HIT",
  ENEMY_DESTROY = "ENEMY_DESTROY",
  ENEMY_SHOOT = "ENEMY_SHOOT",
  BOSS_HIT = "BOSS_HIT",
  BOSS_PHASE = "BOSS_PHASE",
  BOSS_DEFEAT = "BOSS_DEFEAT",
  POWER_UP_COLLECT = "POWER_UP_COLLECT",
  BOMB_ACTIVATE = "BOMB_ACTIVATE",
  COMBO = "COMBO",
  LEVEL_COMPLETE = "LEVEL_COMPLETE",
  GAME_OVER = "GAME_OVER",
  MENU_SELECT = "MENU_SELECT",
  SHIELD_HIT = "SHIELD_HIT",
  // Cockpit hub events
  COCKPIT_NAV = "COCKPIT_NAV",
  COCKPIT_OPEN = "COCKPIT_OPEN",
  COCKPIT_BACK = "COCKPIT_BACK",
  UPGRADE_PURCHASE = "UPGRADE_PURCHASE",
  UPGRADE_DENIED = "UPGRADE_DENIED",
  QUEST_ACCEPT = "QUEST_ACCEPT",
  QUEST_ABANDON = "QUEST_ABANDON",
  DIALOG_ADVANCE = "DIALOG_ADVANCE",
  DIALOG_CLOSE = "DIALOG_CLOSE",
}

// ─── Dialog System ──────────────────────────────────────────────────

export interface DialogLine {
  speaker: string;
  portraitKey: string;
  text: string;
  duration: number;
  color?: string;
}

export interface DialogState {
  queue: DialogLine[];
  currentLine: DialogLine | null;
  timer: number;
  fadeIn: number;
  fadeOut: number;
}

export type DialogTriggerEvent =
  | { type: "level_start" }
  | { type: "wave_start"; wave: number }
  | { type: "wave_clear"; wave: number }
  | { type: "boss_intro" }
  | { type: "boss_phase"; phase: number }
  | { type: "boss_defeat" }
  | { type: "level_complete" };

export interface DialogTrigger {
  event: DialogTriggerEvent;
  lines: DialogLine[];
  once: boolean;
  triggered?: boolean;
}

// ─── Full Game State ─────────────────────────────────────────────────
export interface GameState {
  screen: GameScreen;
  player: Player;
  playerBullets: Bullet[];
  enemyBullets: Bullet[];
  enemies: Enemy[];
  boss: Boss | null;
  powerUps: PowerUp[];
  activePowerUps: ActivePowerUp[];
  particles: Particle[];
  background: BackgroundLayer[];
  score: number;
  combo: number;
  comboTimer: number;
  maxCombo: number;
  lives: number;
  bombs: number;
  bombCooldown: number;
  currentWorld: number;
  currentLevel: number;
  currentWave: number;
  totalWaves: number;
  waves: Wave[];
  waveDelay: number;
  kills: number;
  totalEnemies: number;
  deaths: number;
  frameCount: number;
  screenShake: number;
  audioEvents: AudioEvent[];
  bossIntroTimer: number;
  briefingTimer: number;
  levelCompleteTimer: number;
  devInvincible: boolean;
  dialog: DialogState;
  dialogTriggers: DialogTrigger[];
  xp: number;
  hpWarningTriggered: boolean;
  // Planet mission state (optional — only set for planet side missions)
  planetId?: PlanetId;
  objective?: ObjectiveState;
  escort?: EscortEntity;
  defendStructure?: DefendStructure;
  /** Incendiary bomb enhancement: frames remaining */
  incendiaryTimer?: number;
  /** Survive missions: loop back to this wave index when exhausted */
  loopFromWave?: number;
}

// ─── Ship Upgrades ──────────────────────────────────────────────────
export interface ShipUpgrades {
  hullPlating: number;     // 0-3: +1 maxHp per level (3→6)
  engineBoost: number;     // 0-3: +0.5 speed per level (5→6.5)
  weaponCore: number;      // 0-2: +1 starting weapon level (1→3)
  munitionsBay: number;    // 0-3: +1 starting bomb (2→5)
  fireControl: number;     // 0-2: -1 fire rate frames (8→6)
  shieldGenerator: number; // 0-2: +200 shield duration frames per level
}

export const DEFAULT_UPGRADES: ShipUpgrades = {
  hullPlating: 0,
  engineBoost: 0,
  weaponCore: 0,
  munitionsBay: 0,
  fireControl: 0,
  shieldGenerator: 0,
};

// ─── Planet Missions ─────────────────────────────────────────────────

export type ObjectiveType = "collect" | "survive" | "escort" | "defend";

export interface ObjectiveState {
  type: ObjectiveType;
  /** Collect: items gathered / Survive: frames elapsed / Escort & Defend: unused */
  progress: number;
  /** Collect: target count / Survive: target frames / Escort & Defend: unused */
  target: number;
  /** Escort / Defend: HP of the protected entity */
  entityHp: number;
  entityMaxHp: number;
  /** Survive: current intensity tier (0-based) */
  intensityTier: number;
  /** Collect: collectible nodes on screen */
  collectibles: Collectible[];
  /** Whether objective has been completed */
  completed: boolean;
  /** Whether objective has been failed (escort/defend entity destroyed) */
  failed: boolean;
}

export interface Collectible {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  lifetime: number;    // frames remaining before despawn
  maxLifetime: number;
}

export interface EscortEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speed: number;
  /** Waypoint index for pathing */
  waypointIndex: number;
}

export interface DefendStructure {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
}

export type MaterialId =
  | "bio-fiber"
  | "cryogenic-alloy"
  | "molten-core"
  | "ruin-shard"
  | "abyssal-plating"
  | "desert-glass"
  | "phase-crystal"
  | "genesis-seed"
  | "neon-circuitry"
  | "ferro-steel";

export type ConsumableId =
  | "hull-repair"
  | "cryo-charge"
  | "shield-charge"
  | "weapon-overcharge"
  | "scanner-pulse";

export type EnhancementId =
  | "reinforced-shield"
  | "incendiary-bombs"
  | "extended-magnet"
  | "homing-gunners"
  | "resonance-field";

export type PlanetId =
  | "verdania"
  | "glaciem"
  | "pyraxis"
  | "ossuary"
  | "abyssia"
  | "ashfall"
  | "prismara"
  | "genesis"
  | "luminos"
  | "bastion";

// ─── Save Data ───────────────────────────────────────────────────────
export interface SaveData {
  currentWorld: number;
  levels: Record<string, { completed: boolean; stars: number; highScore: number }>;
  credits: number;
  totalStars: number;
  totalScore: number;
  xp: number;
  introSeen?: boolean;
  upgrades: ShipUpgrades;
  unlockedCodex: string[];
  viewedCodex: string[];
  viewedConversations: string[];
  completedQuests: string[];
  activeQuests: string[];
  // Planet mission data
  completedPlanets: PlanetId[];
  materials: MaterialId[];
  consumableInventory: Partial<Record<ConsumableId, number>>;
  equippedConsumables: ConsumableId[];
  unlockedEnhancements: EnhancementId[];
}
