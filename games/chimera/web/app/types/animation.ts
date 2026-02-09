// Animation types for Chimera's battle system

export type EasingFunction =
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "bounce";

export type AnimationType =
  | "idle"
  | "attack"
  | "cast"
  | "hurt"
  | "death"
  | "victory"
  | "slide"
  | "shake"
  | "flash"
  | "fade"
  | "particle";

export interface AnimationFrame {
  x: number;      // Frame x position in sprite sheet
  y: number;      // Frame y position in sprite sheet
  width: number;  // Frame width
  height: number; // Frame height
  duration: number; // How long to show this frame (ms)
}

export interface SpriteAnimation {
  name: string;
  frames: AnimationFrame[];
  loop: boolean;
  onComplete?: () => void;
}

export interface SpriteSheetConfig {
  src: string;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
  displayWidth?: number;  // Optional scaled display width
  displayHeight?: number; // Optional scaled display height
  animations: Record<string, {
    row: number;
    frameCount: number;
    frameDuration: number;
    loop: boolean;
    startFrame?: number; // Starting column index (default 0)
    alternateRows?: boolean; // Cycle through all rows at same column for breathing effect
  }>;
}

// Procedural animation definition
export interface TweenAnimation {
  id: string;
  type: AnimationType;
  targetId: string;
  duration: number;
  easing: EasingFunction;
  properties: {
    x?: { from: number; to: number };
    y?: { from: number; to: number };
    scale?: { from: number; to: number };
    opacity?: { from: number; to: number };
    rotation?: { from: number; to: number };
  };
  onStart?: () => void;
  onComplete?: () => void;
}

// Particle effect
export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;  // velocity x
  vy: number;  // velocity y
  size: number;
  color: string;
  opacity: number;
  life: number;     // remaining life in ms
  maxLife: number;
}

export interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  particles: Particle[];
  emitting: boolean;
  config: ParticleConfig;
}

export interface ParticleConfig {
  count: number;
  spread: number;        // Angle spread in radians
  speed: { min: number; max: number };
  size: { min: number; max: number };
  life: { min: number; max: number };
  colors: string[];
  gravity?: number;
  fadeOut?: boolean;
}

// Animation events emitted by battle engine
export type AnimationEventType =
  | "attack_start"
  | "attack_hit"
  | "attack_end"
  | "magic_start"
  | "magic_effect"
  | "magic_end"
  | "damage"
  | "heal"
  | "death"
  | "victory"
  | "defeat"
  | "critical"
  | "miss"
  | "defend";

export interface AnimationEvent {
  type: AnimationEventType;
  actorId: string;
  targetId?: string | string[];
  value?: number;
  isCritical?: boolean;
  abilityId?: string;
}

// Animation queue item
export interface QueuedAnimation {
  id: string;
  event: AnimationEvent;
  animations: TweenAnimation[];
  particles?: ParticleEffect[];
  startTime?: number;
  status: "pending" | "playing" | "completed";
}

// Animated entity state
export interface AnimatedEntity {
  id: string;
  baseX: number;
  baseY: number;
  currentX: number;
  currentY: number;
  scale: number;
  opacity: number;
  rotation: number;
  flashColor: string | null;
  flashOpacity: number;
  currentAnimation: string | null;
  spriteFrame: number;
}

// Battle scene state for animation
export interface BattleSceneState {
  entities: Map<string, AnimatedEntity>;
  particles: ParticleEffect[];
  screenFlash: { color: string; opacity: number } | null;
  screenShake: { intensity: number; duration: number } | null;
  isAnimating: boolean;
  queue: QueuedAnimation[];
}

// Easing functions
export const EASING_FUNCTIONS: Record<EasingFunction, (t: number) => number> = {
  linear: (t) => t,
  "ease-in": (t) => t * t,
  "ease-out": (t) => t * (2 - t),
  "ease-in-out": (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  bounce: (t) => {
    if (t < 0.5) return 8 * t * t * t * t;
    const f = t - 1;
    return 1 - 8 * f * f * f * f;
  },
};

// Default animation timings (in ms)
export const ANIMATION_TIMING = {
  SLIDE_FORWARD: 300,
  ATTACK_SWING: 200,
  HIT_FLASH: 100,
  HIT_SHAKE: 200,
  SLIDE_BACK: 300,
  MAGIC_CAST: 500,
  SPELL_EFFECT: 400,
  DEATH_FADE: 600,
  VICTORY_JUMP: 400,
  IDLE_FRAME: 250,
} as const;
