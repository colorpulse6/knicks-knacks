// Animation Controller - Manages animation state machine and timing

import type {
  AnimationEvent,
  AnimatedEntity,
  BattleSceneState,
  QueuedAnimation,
  TweenAnimation,
  ParticleEffect,
  Particle,
  ParticleConfig,
  EasingFunction,
  EASING_FUNCTIONS,
} from "../types/animation";
import { ANIMATION_TIMING } from "../types/animation";

// Import easing functions
const easings: Record<EasingFunction, (t: number) => number> = {
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

/**
 * Create initial battle scene state
 */
export function createBattleSceneState(): BattleSceneState {
  return {
    entities: new Map(),
    particles: [],
    screenFlash: null,
    screenShake: null,
    isAnimating: false,
    queue: [],
  };
}

/**
 * Initialize an animated entity
 */
export function createAnimatedEntity(
  id: string,
  x: number,
  y: number
): AnimatedEntity {
  return {
    id,
    baseX: x,
    baseY: y,
    currentX: x,
    currentY: y,
    scale: 1,
    opacity: 1,
    rotation: 0,
    flashColor: null,
    flashOpacity: 0,
    currentAnimation: "idle",
    spriteFrame: 0,
  };
}

/**
 * Queue an animation event for processing
 */
export function queueAnimationEvent(
  state: BattleSceneState,
  event: AnimationEvent
): BattleSceneState {
  const queuedAnimation = createAnimationsForEvent(event, state);

  return {
    ...state,
    queue: [...state.queue, queuedAnimation],
    isAnimating: true,
  };
}

/**
 * Create animation sequence for an event
 */
function createAnimationsForEvent(
  event: AnimationEvent,
  state: BattleSceneState
): QueuedAnimation {
  const id = `anim_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const animations: TweenAnimation[] = [];
  const particles: ParticleEffect[] = [];

  const actor = state.entities.get(event.actorId);
  const targetId = Array.isArray(event.targetId) ? event.targetId[0] : event.targetId;
  const target = targetId ? state.entities.get(targetId) : null;

  switch (event.type) {
    case "attack_start":
      if (actor && target) {
        // Slide actor toward target
        const dx = target.baseX - actor.baseX;
        const slideDistance = dx > 0 ? 80 : -80;
        animations.push({
          id: `${id}_slide_forward`,
          type: "slide",
          targetId: event.actorId,
          duration: ANIMATION_TIMING.SLIDE_FORWARD,
          easing: "ease-out",
          properties: {
            x: { from: actor.baseX, to: actor.baseX + slideDistance },
          },
        });
      }
      break;

    case "attack_hit":
      if (target) {
        // Shake target on impact
        animations.push({
          id: `${id}_shake`,
          type: "shake",
          targetId: targetId!,
          duration: ANIMATION_TIMING.HIT_SHAKE,
          easing: "ease-in-out",
          properties: {
            x: { from: target.baseX - 5, to: target.baseX + 5 },
          },
        });
        // Slash effect particles - diagonal streak
        particles.push(createSlashEffect(target.baseX, target.baseY));
        // Impact spark particles
        particles.push(createParticleEffect(
          target.baseX,
          target.baseY,
          {
            count: 12,
            spread: Math.PI * 2,
            speed: { min: 80, max: 200 },
            size: { min: 2, max: 6 },
            life: { min: 150, max: 350 },
            colors: ["#ffffff", "#ffff00", "#ff8800"],
            gravity: 50,
            fadeOut: true,
          }
        ));
      }
      break;

    case "attack_end":
      if (actor) {
        // Slide actor back
        animations.push({
          id: `${id}_slide_back`,
          type: "slide",
          targetId: event.actorId,
          duration: ANIMATION_TIMING.SLIDE_BACK,
          easing: "ease-in",
          properties: {
            x: { from: actor.currentX, to: actor.baseX },
          },
        });
      }
      break;

    case "magic_start":
      if (actor) {
        // Set cast animation
        animations.push({
          id: `${id}_cast_pose`,
          type: "cast",
          targetId: event.actorId,
          duration: ANIMATION_TIMING.MAGIC_CAST,
          easing: "ease-out",
          properties: {},
        });
      }
      break;

    case "magic_effect":
      if (target) {
        // Spawn particles at target
        particles.push(createParticleEffect(
          target.baseX,
          target.baseY,
          {
            count: 20,
            spread: Math.PI * 2,
            speed: { min: 50, max: 150 },
            size: { min: 3, max: 8 },
            life: { min: 300, max: 600 },
            colors: ["#00ffff", "#ff00ff", "#ffff00"],
            gravity: -50,
            fadeOut: true,
          }
        ));
      }
      break;

    case "damage":
      // Handled by damage numbers component
      break;

    case "heal":
      if (target) {
        // Green particles rising
        particles.push(createParticleEffect(
          target.baseX,
          target.baseY,
          {
            count: 15,
            spread: Math.PI / 4,
            speed: { min: 30, max: 80 },
            size: { min: 4, max: 10 },
            life: { min: 500, max: 800 },
            colors: ["#00ff00", "#88ff88", "#ffffff"],
            gravity: -100,
            fadeOut: true,
          }
        ));
      }
      break;

    case "death":
      if (target) {
        // Fade out and scale down
        animations.push({
          id: `${id}_death_fade`,
          type: "fade",
          targetId: targetId!,
          duration: ANIMATION_TIMING.DEATH_FADE,
          easing: "ease-in",
          properties: {
            opacity: { from: 1, to: 0 },
            scale: { from: 1, to: 0.5 },
          },
        });
      }
      break;

    case "victory":
      // Make all party members jump
      animations.push({
        id: `${id}_victory_jump`,
        type: "victory",
        targetId: event.actorId,
        duration: ANIMATION_TIMING.VICTORY_JUMP,
        easing: "bounce",
        properties: {
          y: { from: actor?.baseY ?? 0, to: (actor?.baseY ?? 0) - 30 },
        },
      });
      break;

    case "critical":
      if (target) {
        // Big X-slash effect for critical hits
        particles.push(createCriticalSlashEffect(target.baseX, target.baseY));
        // Extra impact sparks
        particles.push(createParticleEffect(
          target.baseX,
          target.baseY,
          {
            count: 20,
            spread: Math.PI * 2,
            speed: { min: 100, max: 300 },
            size: { min: 3, max: 8 },
            life: { min: 200, max: 500 },
            colors: ["#ffff00", "#ff8800", "#ff0000", "#ffffff"],
            gravity: 30,
            fadeOut: true,
          }
        ));
      }
      break;

    case "miss":
      // Show "Miss" text (handled by damage numbers)
      break;

    case "defend":
      // Brief scale up to show defending
      if (actor) {
        animations.push({
          id: `${id}_defend`,
          type: "idle",
          targetId: event.actorId,
          duration: 300,
          easing: "ease-out",
          properties: {
            scale: { from: 1, to: 1.1 },
          },
        });
      }
      break;
  }

  return {
    id,
    event,
    animations,
    particles,
    status: "pending",
  };
}

/**
 * Create a particle effect
 */
function createParticleEffect(
  x: number,
  y: number,
  config: ParticleConfig
): ParticleEffect {
  const particles: Particle[] = [];

  for (let i = 0; i < config.count; i++) {
    const angle = Math.random() * config.spread - config.spread / 2 - Math.PI / 2;
    const speed = config.speed.min + Math.random() * (config.speed.max - config.speed.min);
    const life = config.life.min + Math.random() * (config.life.max - config.life.min);

    particles.push({
      id: `particle_${i}`,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: config.size.min + Math.random() * (config.size.max - config.size.min),
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      opacity: 1,
      life,
      maxLife: life,
    });
  }

  return {
    id: `effect_${Date.now()}`,
    x,
    y,
    particles,
    emitting: false,
    config,
  };
}

/**
 * Create a slash visual effect (diagonal line of particles)
 */
function createSlashEffect(x: number, y: number): ParticleEffect {
  const particles: Particle[] = [];
  const slashLength = 60;
  const particleCount = 12;
  const slashAngle = -Math.PI / 4; // Diagonal from top-right to bottom-left

  for (let i = 0; i < particleCount; i++) {
    const progress = i / particleCount;
    const offsetX = Math.cos(slashAngle) * slashLength * (progress - 0.5);
    const offsetY = Math.sin(slashAngle) * slashLength * (progress - 0.5);

    // Stagger the spawn times by using different life values
    const lifeOffset = i * 20;

    particles.push({
      id: `slash_${i}`,
      x: x + offsetX,
      y: y + offsetY,
      vx: Math.cos(slashAngle) * 50, // Slight movement along slash direction
      vy: Math.sin(slashAngle) * 50,
      size: 4 + (particleCount / 2 - Math.abs(i - particleCount / 2)) * 0.8, // Thicker in the middle
      color: i % 2 === 0 ? "#ffffff" : "#aaddff",
      opacity: 1,
      life: 200 + lifeOffset,
      maxLife: 200 + lifeOffset,
    });
  }

  // Add trailing sparkles
  for (let i = 0; i < 6; i++) {
    const angle = slashAngle + (Math.random() - 0.5) * 0.5;
    const dist = (Math.random() - 0.5) * slashLength;

    particles.push({
      id: `spark_${i}`,
      x: x + Math.cos(slashAngle) * dist,
      y: y + Math.sin(slashAngle) * dist,
      vx: (Math.random() - 0.5) * 100,
      vy: (Math.random() - 0.5) * 100,
      size: 2 + Math.random() * 3,
      color: "#ffff88",
      opacity: 1,
      life: 150 + Math.random() * 150,
      maxLife: 300,
    });
  }

  return {
    id: `slash_effect_${Date.now()}`,
    x,
    y,
    particles,
    emitting: false,
    config: {
      count: particleCount + 6,
      spread: Math.PI / 4,
      speed: { min: 30, max: 60 },
      size: { min: 3, max: 6 },
      life: { min: 150, max: 300 },
      colors: ["#ffffff", "#aaddff", "#ffff88"],
      gravity: 0,
      fadeOut: true,
    },
  };
}

/**
 * Create an X-shaped slash effect for critical hits
 */
function createCriticalSlashEffect(x: number, y: number): ParticleEffect {
  const particles: Particle[] = [];
  const slashLength = 80; // Bigger than normal
  const particleCount = 16;

  // Two diagonal slashes forming an X
  const angles = [-Math.PI / 4, Math.PI / 4];

  for (const slashAngle of angles) {
    for (let i = 0; i < particleCount; i++) {
      const progress = i / particleCount;
      const offsetX = Math.cos(slashAngle) * slashLength * (progress - 0.5);
      const offsetY = Math.sin(slashAngle) * slashLength * (progress - 0.5);
      const lifeOffset = i * 15;

      particles.push({
        id: `crit_slash_${slashAngle}_${i}`,
        x: x + offsetX,
        y: y + offsetY,
        vx: Math.cos(slashAngle) * 80,
        vy: Math.sin(slashAngle) * 80,
        size: 5 + (particleCount / 2 - Math.abs(i - particleCount / 2)) * 1.2,
        color: i % 3 === 0 ? "#ffff00" : i % 3 === 1 ? "#ff8800" : "#ffffff",
        opacity: 1,
        life: 250 + lifeOffset,
        maxLife: 250 + lifeOffset,
      });
    }
  }

  // Add burst of sparkles at center
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const speed = 60 + Math.random() * 100;

    particles.push({
      id: `crit_burst_${i}`,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 3 + Math.random() * 4,
      color: ["#ffff00", "#ff8800", "#ff0000", "#ffffff"][Math.floor(Math.random() * 4)],
      opacity: 1,
      life: 200 + Math.random() * 200,
      maxLife: 400,
    });
  }

  return {
    id: `critical_effect_${Date.now()}`,
    x,
    y,
    particles,
    emitting: false,
    config: {
      count: particleCount * 2 + 12,
      spread: Math.PI * 2,
      speed: { min: 60, max: 100 },
      size: { min: 3, max: 8 },
      life: { min: 200, max: 400 },
      colors: ["#ffff00", "#ff8800", "#ff0000", "#ffffff"],
      gravity: 0,
      fadeOut: true,
    },
  };
}

/**
 * Update animation state for one frame
 */
export function updateAnimations(
  state: BattleSceneState,
  deltaTime: number
): BattleSceneState {
  if (!state.isAnimating && state.queue.length === 0) {
    return state;
  }

  let newState = { ...state };
  const now = Date.now();

  // Process current animation in queue
  if (newState.queue.length > 0) {
    const current = newState.queue[0];

    if (current.status === "pending") {
      // Start animation
      current.startTime = now;
      current.status = "playing";
    }

    if (current.status === "playing") {
      const elapsed = now - (current.startTime ?? now);

      // Update tweens
      let allComplete = true;
      for (const tween of current.animations) {
        const progress = Math.min(elapsed / tween.duration, 1);
        const easedProgress = easings[tween.easing](progress);

        const entity = newState.entities.get(tween.targetId);
        if (entity) {
          const updated = { ...entity };

          if (tween.properties.x) {
            updated.currentX = lerp(
              tween.properties.x.from,
              tween.properties.x.to,
              easedProgress
            );
          }
          if (tween.properties.y) {
            updated.currentY = lerp(
              tween.properties.y.from,
              tween.properties.y.to,
              easedProgress
            );
          }
          if (tween.properties.scale) {
            updated.scale = lerp(
              tween.properties.scale.from,
              tween.properties.scale.to,
              easedProgress
            );
          }
          if (tween.properties.opacity) {
            updated.opacity = lerp(
              tween.properties.opacity.from,
              tween.properties.opacity.to,
              easedProgress
            );
          }

          // Handle shake animation
          if (tween.type === "shake" && progress < 1) {
            const shakeOffset = Math.sin(progress * Math.PI * 8) * 5 * (1 - progress);
            updated.currentX = updated.baseX + shakeOffset;
          }

          // Handle flash
          if (tween.type === "flash") {
            updated.flashColor = "#ffffff";
            updated.flashOpacity = 1 - progress;
          }

          newState.entities.set(tween.targetId, updated);
        }

        if (progress < 1) {
          allComplete = false;
        }
      }

      // Update particles
      newState.particles = updateParticles(
        [...(current.particles ?? []), ...newState.particles],
        deltaTime
      );

      // Check if animation sequence is complete
      const maxDuration = Math.max(...current.animations.map(a => a.duration), 0);
      if (elapsed >= maxDuration && allComplete) {
        current.status = "completed";
        newState.queue = newState.queue.slice(1);
      }
    }
  }

  // Update remaining particles
  newState.particles = updateParticles(newState.particles, deltaTime);

  // Update screen effects
  if (newState.screenFlash) {
    newState.screenFlash.opacity -= deltaTime / 200;
    if (newState.screenFlash.opacity <= 0) {
      newState.screenFlash = null;
    }
  }

  if (newState.screenShake) {
    newState.screenShake.duration -= deltaTime;
    if (newState.screenShake.duration <= 0) {
      newState.screenShake = null;
    }
  }

  // Check if all animations are done
  newState.isAnimating = newState.queue.length > 0 || newState.particles.length > 0;

  return newState;
}

/**
 * Update particle effects
 */
function updateParticles(
  effects: ParticleEffect[],
  deltaTime: number
): ParticleEffect[] {
  return effects
    .map(effect => {
      const updatedParticles = effect.particles
        .map(p => {
          const dt = deltaTime / 1000;
          return {
            ...p,
            x: p.x + p.vx * dt,
            y: p.y + p.vy * dt + (effect.config.gravity ?? 0) * dt,
            life: p.life - deltaTime,
            opacity: effect.config.fadeOut
              ? p.life / p.maxLife
              : p.opacity,
          };
        })
        .filter(p => p.life > 0);

      return {
        ...effect,
        particles: updatedParticles,
      };
    })
    .filter(effect => effect.particles.length > 0);
}

/**
 * Linear interpolation
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Trigger screen flash
 */
export function triggerScreenFlash(
  state: BattleSceneState,
  color: string = "#ffffff"
): BattleSceneState {
  return {
    ...state,
    screenFlash: { color, opacity: 0.5 },
  };
}

/**
 * Trigger screen shake
 */
export function triggerScreenShake(
  state: BattleSceneState,
  intensity: number = 5,
  duration: number = 300
): BattleSceneState {
  return {
    ...state,
    screenShake: { intensity, duration },
  };
}

/**
 * Check if animations are complete
 */
export function isAnimationComplete(state: BattleSceneState): boolean {
  return !state.isAnimating && state.queue.length === 0;
}

/**
 * Reset entity to base position
 */
export function resetEntityPosition(
  state: BattleSceneState,
  entityId: string
): BattleSceneState {
  const entity = state.entities.get(entityId);
  if (!entity) return state;

  const updated = new Map(state.entities);
  updated.set(entityId, {
    ...entity,
    currentX: entity.baseX,
    currentY: entity.baseY,
    scale: 1,
    opacity: 1,
    rotation: 0,
    flashColor: null,
    flashOpacity: 0,
  });

  return { ...state, entities: updated };
}
