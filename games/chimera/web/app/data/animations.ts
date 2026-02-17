// Animation definitions for battle and world exploration systems

import type { SpriteSheetConfig, ParticleConfig, WorldSpriteConfig } from "../types/animation";

// Kai sprite sheet: 1024×1024, 4×3 grid
// Row 0: Idle animation (4 frames) - standing poses with sword
// Row 1: Attack sequence (4 frames) - sword swing with blue energy
// Row 2: Cast/Hurt/Death (cast1, cast2, hurt, collapsed)
export const KAI_SPRITE_CONFIG: SpriteSheetConfig = {
  src: "/sprites/characters/kai_battle.png",
  frameWidth: 256, // 1024 / 4
  frameHeight: 341, // 1024 / 3 (rounded)
  columns: 4,
  rows: 3,
  animations: {
    idle: { row: 0, frameCount: 4, frameDuration: 200, loop: true },
    attack: { row: 1, frameCount: 4, frameDuration: 120, loop: false },
    cast: {
      row: 2,
      frameCount: 2,
      frameDuration: 200,
      loop: false,
      startFrame: 0,
    },
    hurt: {
      row: 2,
      frameCount: 1,
      frameDuration: 200,
      loop: false,
      startFrame: 2,
    },
    death: {
      row: 2,
      frameCount: 1,
      frameDuration: 500,
      loop: false,
      startFrame: 3,
    },
    victory: { row: 0, frameCount: 4, frameDuration: 250, loop: true }, // reuse idle for victory
  },
};

// Bandit sprite sheet: 1536×1024 (4×2 grid, 384×512 frames)
// Layout: Col 0=idle, Col 1=attack, Col 2=hurt, Col 3=dead (both rows same poses)
export const BANDIT_SPRITE_CONFIG: SpriteSheetConfig = {
  src: "/sprites/enemies/bandit.png",
  frameWidth: 384,
  frameHeight: 512,
  columns: 4,
  rows: 2,
  animations: {
    // Breathing: alternate between row 0 and row 1 at column 0 (slow, relaxed)
    idle: {
      row: 0,
      frameCount: 2,
      frameDuration: 1600,
      loop: true,
      startFrame: 0,
      alternateRows: true,
    },
    attack: {
      row: 0,
      frameCount: 1,
      frameDuration: 300,
      loop: false,
      startFrame: 1,
    },
    hurt: {
      row: 0,
      frameCount: 1,
      frameDuration: 300,
      loop: false,
      startFrame: 2,
    },
    death: {
      row: 0,
      frameCount: 1,
      frameDuration: 1000,
      loop: false,
      startFrame: 3,
    },
  },
};

// Character battle sprite configurations
export const CHARACTER_SPRITES: Record<string, SpriteSheetConfig> = {
  kai: KAI_SPRITE_CONFIG,
  lyra: {
    // Placeholder until lyra sprite is added
    src: "/sprites/characters/lyra_battle.png",
    frameWidth: 64,
    frameHeight: 64,
    columns: 4,
    rows: 4,
    animations: {
      idle: { row: 0, frameCount: 4, frameDuration: 250, loop: true },
      attack: { row: 1, frameCount: 4, frameDuration: 100, loop: false },
      cast: { row: 2, frameCount: 4, frameDuration: 125, loop: false },
      hurt: { row: 3, frameCount: 2, frameDuration: 150, loop: false },
      death: { row: 3, frameCount: 2, frameDuration: 300, loop: false },
      victory: { row: 0, frameCount: 4, frameDuration: 200, loop: true },
    },
  },
};

// Enemy sprite configurations
export const ENEMY_SPRITES: Record<string, SpriteSheetConfig> = {
  bandit: BANDIT_SPRITE_CONFIG,
  // Giant Rat: 1536×1024 (4×2 grid, 384×512 frames)
  // Layout: Col 0=idle, Col 1=attack, Col 2=hurt, Col 3=dead (both rows same poses)
  giant_rat: {
    src: "/sprites/enemies/giant_rat.png",
    frameWidth: 384,
    frameHeight: 512,
    columns: 4,
    rows: 2,
    animations: {
      // Breathing: alternate between row 0 and row 1 at column 0 (slow, relaxed)
      idle: {
        row: 0,
        frameCount: 2,
        frameDuration: 1500,
        loop: true,
        startFrame: 0,
        alternateRows: true,
      },
      attack: {
        row: 0,
        frameCount: 1,
        frameDuration: 300,
        loop: false,
        startFrame: 1,
      },
      hurt: {
        row: 0,
        frameCount: 1,
        frameDuration: 300,
        loop: false,
        startFrame: 2,
      },
      death: {
        row: 0,
        frameCount: 1,
        frameDuration: 1000,
        loop: false,
        startFrame: 3,
      },
    },
  },
  // Wild Wolf: 1536×1024 (4×2 grid, 384×512 frames)
  // Layout: Col 0=idle, Col 1=attack, Col 2=hurt, Col 3=dead (both rows same poses)
  wild_wolf: {
    src: "/sprites/enemies/wolf.png",
    frameWidth: 384,
    frameHeight: 512,
    columns: 4,
    rows: 2,
    animations: {
      // Breathing: alternate between row 0 and row 1 at column 0 (slow, relaxed)
      idle: {
        row: 0,
        frameCount: 2,
        frameDuration: 1800,
        loop: true,
        startFrame: 0,
        alternateRows: true,
      },
      attack: {
        row: 0,
        frameCount: 1,
        frameDuration: 300,
        loop: false,
        startFrame: 1,
      },
      hurt: {
        row: 0,
        frameCount: 1,
        frameDuration: 300,
        loop: false,
        startFrame: 2,
      },
      death: {
        row: 0,
        frameCount: 1,
        frameDuration: 1000,
        loop: false,
        startFrame: 3,
      },
    },
  },
  // Corrupted Sprite: 1536×1024 (4×2 grid, 384×512 frames)
  corrupted_sprite: {
    src: "/sprites/enemies/corrupted_sprite.png",
    frameWidth: 384,
    frameHeight: 512,
    columns: 4,
    rows: 2,
    animations: {
      idle: {
        row: 0,
        frameCount: 2,
        frameDuration: 1200,
        loop: true,
        startFrame: 0,
        alternateRows: true,
      },
      attack: {
        row: 0,
        frameCount: 1,
        frameDuration: 300,
        loop: false,
        startFrame: 1,
      },
      hurt: {
        row: 0,
        frameCount: 1,
        frameDuration: 300,
        loop: false,
        startFrame: 2,
      },
      death: {
        row: 0,
        frameCount: 1,
        frameDuration: 1000,
        loop: false,
        startFrame: 3,
      },
    },
  },
  // Rogue Knight: 1536×1024 (4×2 grid, 384×512 frames)
  rogue_knight: {
    src: "/sprites/enemies/rogue_knight.png",
    frameWidth: 384,
    frameHeight: 512,
    columns: 4,
    rows: 2,
    animations: {
      idle: {
        row: 0,
        frameCount: 2,
        frameDuration: 2000,
        loop: true,
        startFrame: 0,
        alternateRows: true,
      },
      attack: {
        row: 0,
        frameCount: 1,
        frameDuration: 300,
        loop: false,
        startFrame: 1,
      },
      hurt: {
        row: 0,
        frameCount: 1,
        frameDuration: 300,
        loop: false,
        startFrame: 2,
      },
      death: {
        row: 0,
        frameCount: 1,
        frameDuration: 1000,
        loop: false,
        startFrame: 3,
      },
    },
  },
  // Static Wraith: 1536×1024 (4×2 grid, 384×512 frames)
  // Layout: Col 0=idle, Col 1=attack, Col 2=hurt, Col 3=dead (both rows same poses)
  static_wraith: {
    src: "/sprites/enemies/static_wraith.png",
    frameWidth: 384,
    frameHeight: 512,
    columns: 4,
    rows: 2,
    animations: {
      idle: {
        row: 0,
        frameCount: 2,
        frameDuration: 1400,
        loop: true,
        startFrame: 0,
        alternateRows: true,
      },
      attack: {
        row: 0,
        frameCount: 1,
        frameDuration: 300,
        loop: false,
        startFrame: 1,
      },
      hurt: {
        row: 0,
        frameCount: 1,
        frameDuration: 300,
        loop: false,
        startFrame: 2,
      },
      death: {
        row: 0,
        frameCount: 1,
        frameDuration: 1000,
        loop: false,
        startFrame: 3,
      },
    },
  },
  // Flickering Hound: 1536×1024 (4×2 grid, 384×512 frames) - glitched wolf
  // Layout: Col 0=idle, Col 1=attack, Col 2=hurt, Col 3=dead (both rows same poses)
  flickering_hound: {
    src: "/sprites/enemies/flickering_hound.png",
    frameWidth: 384,
    frameHeight: 512,
    columns: 4,
    rows: 2,
    animations: {
      idle: {
        row: 0,
        frameCount: 2,
        frameDuration: 800,
        loop: true,
        startFrame: 0,
        alternateRows: true,
      },
      attack: {
        row: 0,
        frameCount: 1,
        frameDuration: 300,
        loop: false,
        startFrame: 1,
      },
      hurt: {
        row: 0,
        frameCount: 1,
        frameDuration: 300,
        loop: false,
        startFrame: 2,
      },
      death: {
        row: 0,
        frameCount: 1,
        frameDuration: 1000,
        loop: false,
        startFrame: 3,
      },
    },
  },
  // System Agent: 1536×1024 (4×2 grid, 384×512 frames) - mini-boss
  // Layout: Col 0=idle, Col 1=attack, Col 2=hurt, Col 3=dead (both rows same poses)
  system_agent: {
    src: "/sprites/enemies/system_agent.png",
    frameWidth: 384,
    frameHeight: 512,
    columns: 4,
    rows: 2,
    animations: {
      idle: {
        row: 0,
        frameCount: 2,
        frameDuration: 1000,
        loop: true,
        startFrame: 0,
        alternateRows: true,
      },
      attack: {
        row: 0,
        frameCount: 1,
        frameDuration: 300,
        loop: false,
        startFrame: 1,
      },
      hurt: {
        row: 0,
        frameCount: 1,
        frameDuration: 300,
        loop: false,
        startFrame: 2,
      },
      death: {
        row: 0,
        frameCount: 1,
        frameDuration: 1000,
        loop: false,
        startFrame: 3,
      },
    },
  },
  // Bandit Chief Vorn: 1536×1024 (4×2 grid, 384×512 frames) - Bandit Camp boss
  // Layout: Col 0=idle, Col 1=attack, Col 2=hurt, Col 3=dead (both rows same poses)
  bandit_chief_vorn: {
    src: "/sprites/enemies/bandit_chief.png",
    frameWidth: 384,
    frameHeight: 512,
    columns: 4,
    rows: 2,
    animations: {
      idle: {
        row: 0,
        frameCount: 2,
        frameDuration: 1500,
        loop: true,
        startFrame: 0,
        alternateRows: true,
      },
      attack: {
        row: 0,
        frameCount: 1,
        frameDuration: 300,
        loop: false,
        startFrame: 1,
      },
      hurt: {
        row: 0,
        frameCount: 1,
        frameDuration: 300,
        loop: false,
        startFrame: 2,
      },
      death: {
        row: 0,
        frameCount: 1,
        frameDuration: 1000,
        loop: false,
        startFrame: 3,
      },
    },
  },
};

// World object sprite configurations
export const OBJECT_SPRITES: Record<string, SpriteSheetConfig> = {
  // Save Point: 1024×1536 single image, scaled down for display
  save_point: {
    src: "/sprites/ui/save_point.png",
    frameWidth: 1024,
    frameHeight: 1536,
    columns: 1,
    rows: 1,
    // Display size after scaling (fits in ~2 tiles width, ~3 tiles height)
    displayWidth: 64,
    displayHeight: 96,
    animations: {
      idle: { row: 0, frameCount: 1, frameDuration: 1000, loop: true },
    },
  },
};

// UI icon configurations (for reference)
export const UI_ICONS = {
  save_icon: "/sprites/ui/save_icon.png", // 32×32 save button
  load_icon: "/sprites/ui/load_icon.png", // 32×32 load button
  save_slot_empty: "/sprites/ui/save_slot_empty.png", // 32×32 empty slot indicator
  save_slot_frame: "/sprites/ui/save_slot_frame.png", // 320×80 slot frame (optional)
  // Combined sprite sheet: 1024×1536, two icons side by side
  // Left (0-512): delete/cancel (X), Right (512-1024): confirm (checkmark)
  save_icons: "/sprites/ui/save_icons.png",
};

// Particle effect presets
export const PARTICLE_PRESETS: Record<string, ParticleConfig> = {
  // Physical hit effect
  hit: {
    count: 8,
    spread: Math.PI,
    speed: { min: 100, max: 200 },
    size: { min: 3, max: 6 },
    life: { min: 200, max: 400 },
    colors: ["#ffffff", "#ffff00", "#ff8800"],
    gravity: 200,
    fadeOut: true,
  },

  // Critical hit effect
  critical: {
    count: 15,
    spread: Math.PI * 2,
    speed: { min: 150, max: 300 },
    size: { min: 4, max: 10 },
    life: { min: 300, max: 600 },
    colors: ["#ffff00", "#ff8800", "#ff0000"],
    gravity: 100,
    fadeOut: true,
  },

  // Healing effect
  heal: {
    count: 12,
    spread: Math.PI / 3,
    speed: { min: 30, max: 80 },
    size: { min: 4, max: 8 },
    life: { min: 500, max: 900 },
    colors: ["#00ff00", "#88ff88", "#ffffff"],
    gravity: -80,
    fadeOut: true,
  },

  // Fire magic
  fire: {
    count: 20,
    spread: Math.PI / 2,
    speed: { min: 50, max: 150 },
    size: { min: 5, max: 12 },
    life: { min: 400, max: 700 },
    colors: ["#ff0000", "#ff4400", "#ff8800", "#ffff00"],
    gravity: -50,
    fadeOut: true,
  },

  // Ice magic
  ice: {
    count: 15,
    spread: Math.PI / 2,
    speed: { min: 40, max: 100 },
    size: { min: 3, max: 8 },
    life: { min: 500, max: 800 },
    colors: ["#00ffff", "#88ffff", "#ffffff", "#8888ff"],
    gravity: 30,
    fadeOut: true,
  },

  // Lightning magic
  lightning: {
    count: 25,
    spread: Math.PI * 2,
    speed: { min: 200, max: 400 },
    size: { min: 2, max: 5 },
    life: { min: 100, max: 300 },
    colors: ["#ffff00", "#ffffff", "#88ffff"],
    gravity: 0,
    fadeOut: true,
  },

  // Death/defeat
  death: {
    count: 30,
    spread: Math.PI * 2,
    speed: { min: 20, max: 60 },
    size: { min: 2, max: 6 },
    life: { min: 600, max: 1200 },
    colors: ["#444444", "#666666", "#888888"],
    gravity: -20,
    fadeOut: true,
  },

  // Glitch effect (sci-fi)
  glitch: {
    count: 10,
    spread: Math.PI * 2,
    speed: { min: 100, max: 250 },
    size: { min: 4, max: 12 },
    life: { min: 150, max: 350 },
    colors: ["#00ffff", "#ff00ff", "#00ff00"],
    gravity: 0,
    fadeOut: true,
  },

  // Victory sparkles
  victory: {
    count: 25,
    spread: Math.PI * 2,
    speed: { min: 50, max: 150 },
    size: { min: 3, max: 8 },
    life: { min: 800, max: 1500 },
    colors: ["#ffff00", "#ffffff", "#88ffff", "#ff88ff"],
    gravity: -30,
    fadeOut: true,
  },
};

// Placeholder colors for entities without sprites
export const PLACEHOLDER_COLORS: Record<string, string> = {
  // Characters
  kai: "#4488ff",
  lyra: "#ff88ff",

  // Enemies
  bandit: "#cc6600",
  giant_rat: "#8B4513",
  wild_wolf: "#666666",
  wolf: "#666666",
  rogue_knight: "#4a4a6a",
  corrupted_sprite: "#aa00ff",
  static_wraith: "#8888cc",
  flickering_hound: "#886644",
  system_agent: "#00cccc",

  // Default
  default: "#888888",
};

// Get placeholder color for an entity
export function getPlaceholderColor(entityId: string): string {
  // Check for direct match
  if (PLACEHOLDER_COLORS[entityId]) {
    return PLACEHOLDER_COLORS[entityId];
  }

  // Check for type match (e.g., "bandit_12345" -> "bandit")
  for (const [key, color] of Object.entries(PLACEHOLDER_COLORS)) {
    if (entityId.toLowerCase().includes(key)) {
      return color;
    }
  }

  return PLACEHOLDER_COLORS.default;
}

// Battle positions (for party members and enemies)
export const BATTLE_POSITIONS = {
  party: [
    { x: 100, y: 150 },
    { x: 80, y: 250 },
    { x: 100, y: 350 },
    { x: 80, y: 450 },
  ],
  enemies: [
    { x: 500, y: 150 },
    { x: 550, y: 250 },
    { x: 500, y: 350 },
    { x: 550, y: 450 },
  ],
};

// Animation sequence definitions for complex animations
export const ANIMATION_SEQUENCES = {
  attack: {
    phases: [
      { name: "prepare", duration: 100 },
      { name: "lunge", duration: 200 },
      { name: "strike", duration: 100 },
      { name: "return", duration: 300 },
    ],
  },
  magic: {
    phases: [
      { name: "cast_start", duration: 200 },
      { name: "cast_hold", duration: 300 },
      { name: "release", duration: 100 },
      { name: "effect", duration: 400 },
    ],
  },
  item: {
    phases: [
      { name: "prepare", duration: 150 },
      { name: "use", duration: 200 },
      { name: "effect", duration: 300 },
    ],
  },
  victory: {
    phases: [
      { name: "initial_jump", duration: 300 },
      { name: "pose", duration: 500 },
      { name: "celebrate", duration: 1000 },
    ],
  },
};

// ============================================
// WORLD EXPLORATION SPRITE CONFIGS
// ============================================

// Kai world sprite sheet: 5 columns x 3 rows (GPT/Gemini format)
// Row 0: Down (front-facing), Row 1: Side (left), Row 2: Up (back-facing)
// Right direction uses left row with flipX
export const KAI_WORLD_CONFIG: WorldSpriteConfig = {
  src: "/sprites/characters/kai_walk.png",
  columns: 5,
  rows: 3,
  directions: {
    down:  { row: 0, frames: 5, idleFrame: 0 },
    left:  { row: 1, frames: 5, idleFrame: 0 },
    right: { row: 1, frames: 5, idleFrame: 0, flipX: true },
    up:    { row: 2, frames: 5, idleFrame: 0 },
  },
  removeBackground: true,
};

// Player character world sprite configs (keyed by character ID)
// Characters not in this registry fall back to individual-file sprites
export const WORLD_SPRITE_CONFIGS: Record<string, WorldSpriteConfig> = {
  // kai: KAI_WORLD_CONFIG,  // Uncomment when kai_walk.png sprite sheet exists
};

// Hooded Stranger world sprite sheet: 5 columns x 4 rows (1024x1536)
// Row 0: Down (front-facing), Row 1: Left, Row 2: Right, Row 3: Up
// Has explicit right-facing row (no flipX needed)
const HOODED_STRANGER_WORLD_CONFIG: WorldSpriteConfig = {
  src: "/sprites/characters/hooded_stranger_walk.png",
  columns: 5,
  rows: 4,
  directions: {
    down:  { row: 0, frames: 5, idleFrame: 0 },
    left:  { row: 1, frames: 5, idleFrame: 0 },
    right: { row: 2, frames: 5, idleFrame: 0 },
    up:    { row: 3, frames: 5, idleFrame: 0 },
  },
  removeBackground: true,
};

// NPC world sprite configs — for NPCs with animated walk cycle sheets
// Most NPCs use a single static sprite; only NPCs here get walk animation
export const NPC_SPRITE_CONFIGS: Record<string, WorldSpriteConfig> = {
  hooded_stranger: HOODED_STRANGER_WORLD_CONFIG,
  desert_stranger_1: HOODED_STRANGER_WORLD_CONFIG,
  desert_stranger_2: HOODED_STRANGER_WORLD_CONFIG,
  desert_stranger_3: HOODED_STRANGER_WORLD_CONFIG,
};
