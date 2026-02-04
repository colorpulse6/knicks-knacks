"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { BattleCharacter, Enemy } from "../../types/battle";
import type {
  AnimationEvent,
  BattleSceneState,
  AnimatedEntity,
  ParticleEffect,
} from "../../types/animation";
import {
  createBattleSceneState,
  createAnimatedEntity,
  queueAnimationEvent,
  updateAnimations,
  isAnimationComplete,
  triggerScreenFlash,
  triggerScreenShake,
} from "../../engine/animationController";
import {
  loadSpriteSheet,
  getSprite,
  drawSpriteFrame,
  drawPlaceholder,
  getFrameRect,
  calculateCurrentFrame,
} from "../../engine/spriteLoader";
import {
  CHARACTER_SPRITES,
  ENEMY_SPRITES,
  PARTICLE_PRESETS,
  getPlaceholderColor,
  BATTLE_POSITIONS,
} from "../../data/animations";

interface BattleAnimatorProps {
  party: BattleCharacter[];
  enemies: Enemy[];
  onAnimationEvent?: (event: AnimationEvent) => void;
  onAnimationComplete?: () => void;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

export default function BattleAnimator({
  party,
  enemies,
  onAnimationEvent,
  onAnimationComplete,
}: BattleAnimatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneStateRef = useRef<BattleSceneState>(createBattleSceneState());
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const animationStartTimeRef = useRef<Map<string, number>>(new Map());

  const [isReady, setIsReady] = useState(false);

  // Initialize entities and load sprites
  useEffect(() => {
    const state = createBattleSceneState();

    // Initialize party entities
    party.forEach((member, index) => {
      const pos = BATTLE_POSITIONS.party[index] ?? { x: 100, y: 150 + index * 100 };
      const entity = createAnimatedEntity(member.character.id, pos.x, pos.y);
      state.entities.set(member.character.id, entity);
      animationStartTimeRef.current.set(member.character.id, Date.now());

      // Try to load sprite
      const spriteConfig = CHARACTER_SPRITES[member.character.id];
      if (spriteConfig) {
        loadSpriteSheet(spriteConfig.src).catch(() => {
          // Sprite not found, will use placeholder
        });
      }
    });

    // Initialize enemy entities
    enemies.forEach((enemy, index) => {
      const pos = BATTLE_POSITIONS.enemies[index] ?? { x: 500, y: 150 + index * 100 };
      const entity = createAnimatedEntity(enemy.id, pos.x, pos.y);
      state.entities.set(enemy.id, entity);
      // Add random offset to animation start time so enemies don't all animate in sync
      const randomOffset = Math.random() * 1000;
      animationStartTimeRef.current.set(enemy.id, Date.now() - randomOffset);

      // Try to load sprite
      const enemyType = enemy.name.toLowerCase().replace(/\s+/g, "_");
      const spriteConfig = ENEMY_SPRITES[enemyType];
      if (spriteConfig) {
        loadSpriteSheet(spriteConfig.src).catch(() => {
          // Sprite not found, will use placeholder
        });
      }
    });

    sceneStateRef.current = state;
    setIsReady(true);
  }, [party, enemies]);

  // Update entity positions when battle state changes
  useEffect(() => {
    const state = sceneStateRef.current;

    // Update party entities
    party.forEach((member) => {
      const entity = state.entities.get(member.character.id);
      if (entity) {
        // Update opacity based on HP
        const hpRatio = member.character.stats.hp / member.character.stats.maxHp;
        if (member.character.stats.hp <= 0) {
          entity.opacity = 0.3;
          entity.currentAnimation = "death";
        }
      }
    });

    // Update enemy entities
    enemies.forEach((enemy) => {
      const entity = state.entities.get(enemy.id);
      if (entity) {
        if (enemy.stats.hp <= 0 && entity.currentAnimation !== "death") {
          // Enemy just died - set death animation and reset animation start time
          entity.opacity = 0.5;
          entity.currentAnimation = "death";
          animationStartTimeRef.current.set(enemy.id, Date.now());
        }
      }
    });
  }, [party, enemies]);

  // Queue animation event
  const queueAnimation = useCallback((event: AnimationEvent) => {
    sceneStateRef.current = queueAnimationEvent(sceneStateRef.current, event);
    onAnimationEvent?.(event);
  }, [onAnimationEvent]);

  // Screen shake function
  const triggerShake = useCallback(() => {
    sceneStateRef.current = triggerScreenShake(sceneStateRef.current, 6, 200);
  }, []);

  // Expose functions to window for external access (temporary solution)
  useEffect(() => {
    (window as unknown as { queueBattleAnimation: (event: AnimationEvent) => void }).queueBattleAnimation = queueAnimation;
    (window as unknown as { triggerBattleScreenShake: () => void }).triggerBattleScreenShake = triggerShake;
    return () => {
      delete (window as unknown as { queueBattleAnimation?: unknown }).queueBattleAnimation;
      delete (window as unknown as { triggerBattleScreenShake?: unknown }).triggerBattleScreenShake;
    };
  }, [queueAnimation, triggerShake]);

  // Main render loop
  const render = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      animationFrameRef.current = requestAnimationFrame(render);
      return;
    }

    const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
    lastTimeRef.current = timestamp;

    // Update animations
    sceneStateRef.current = updateAnimations(sceneStateRef.current, deltaTime);

    // Check animation completion
    if (isAnimationComplete(sceneStateRef.current)) {
      onAnimationComplete?.();
    }

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Apply screen shake
    const shake = sceneStateRef.current.screenShake;
    if (shake) {
      const shakeX = (Math.random() - 0.5) * shake.intensity * 2;
      const shakeY = (Math.random() - 0.5) * shake.intensity * 2;
      ctx.translate(shakeX, shakeY);
    }

    // Draw all entities
    const state = sceneStateRef.current;

    // Draw party members (left side)
    party.forEach((member) => {
      const entity = state.entities.get(member.character.id);
      if (!entity) return;

      drawEntity(
        ctx,
        entity,
        member.character.id,
        member.character.name,
        true, // isParty
        animationStartTimeRef.current.get(member.character.id) ?? Date.now()
      );
    });

    // Draw enemies (right side)
    enemies.forEach((enemy) => {
      const entity = state.entities.get(enemy.id);
      if (!entity) return;

      drawEntity(
        ctx,
        entity,
        enemy.id,
        enemy.name,
        false, // isParty
        animationStartTimeRef.current.get(enemy.id) ?? Date.now()
      );
    });

    // Draw particles
    drawParticles(ctx, state.particles);

    // Draw screen flash
    if (state.screenFlash) {
      ctx.fillStyle = state.screenFlash.color;
      ctx.globalAlpha = state.screenFlash.opacity;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.globalAlpha = 1;
    }

    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    animationFrameRef.current = requestAnimationFrame(render);
  }, [party, enemies, onAnimationComplete]);

  // Start render loop
  useEffect(() => {
    if (!isReady) return;

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isReady, render]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="bg-transparent"
    />
  );
}

// Target display size for sprites (will scale large sprites down)
const TARGET_SPRITE_SIZE = 120;

/**
 * Draw an entity (character or enemy)
 */
function drawEntity(
  ctx: CanvasRenderingContext2D,
  entity: AnimatedEntity,
  id: string,
  name: string,
  isParty: boolean,
  animationStartTime: number
): void {
  const spriteConfig = isParty
    ? CHARACTER_SPRITES[id]
    : ENEMY_SPRITES[name.toLowerCase().replace(/\s+/g, "_")];

  const sprite = spriteConfig ? getSprite(spriteConfig.src) : null;

  // Use actual sprite config dimensions, or fallback to placeholder size
  const sourceWidth = spriteConfig?.frameWidth ?? 64;
  const sourceHeight = spriteConfig?.frameHeight ?? 64;

  // Calculate scale to fit target size while maintaining aspect ratio
  const scaleFactor = Math.min(
    TARGET_SPRITE_SIZE / sourceWidth,
    TARGET_SPRITE_SIZE / sourceHeight
  );

  const displayWidth = sourceWidth * scaleFactor;
  const displayHeight = sourceHeight * scaleFactor;

  // Calculate position with current animation offset
  const x = entity.currentX - displayWidth / 2;
  const y = entity.currentY - displayHeight / 2;

  ctx.save();

  // Apply entity transforms
  ctx.globalAlpha = entity.opacity;

  if (entity.scale !== 1) {
    ctx.translate(entity.currentX, entity.currentY);
    ctx.scale(entity.scale, entity.scale);
    ctx.translate(-entity.currentX, -entity.currentY);
  }

  if (sprite && spriteConfig) {
    // Draw sprite with proper scaling
    const animName = entity.currentAnimation ?? "idle";
    const animConfig = spriteConfig.animations[animName] ?? spriteConfig.animations.idle;

    if (animConfig) {
      const frame = calculateCurrentFrame(
        animationStartTime,
        animConfig.frameDuration,
        animConfig.frameCount,
        animConfig.loop
      );

      const frameRect = getFrameRect(spriteConfig, animName, frame);

      if (frameRect) {
        drawSpriteFrame(
          ctx,
          sprite,
          frameRect,
          x,
          y,
          scaleFactor, // Apply scale factor for large sprites
          !isParty, // Flip enemies to face left
          entity.opacity
        );
      }
    }
  } else {
    // Draw placeholder
    const color = getPlaceholderColor(id);
    drawPlaceholder(ctx, x, y, displayWidth, displayHeight, color, name.slice(0, 8));

    // Add idle bobbing animation for placeholders
    const bobOffset = Math.sin(Date.now() / 500) * 3;
    ctx.translate(0, bobOffset);
  }

  // Draw flash overlay
  if (entity.flashColor && entity.flashOpacity > 0) {
    ctx.fillStyle = entity.flashColor;
    ctx.globalAlpha = entity.flashOpacity;
    ctx.fillRect(x, y, displayWidth, displayHeight);
  }

  ctx.restore();
}

/**
 * Draw particle effects
 */
function drawParticles(ctx: CanvasRenderingContext2D, effects: ParticleEffect[]): void {
  for (const effect of effects) {
    for (const particle of effect.particles) {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.opacity;
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * Hook to trigger animations from battle screen
 */
export function useBattleAnimations() {
  const triggerAttack = useCallback((actorId: string, targetId: string) => {
    const queueFn = (window as unknown as { queueBattleAnimation?: (event: AnimationEvent) => void }).queueBattleAnimation;
    const triggerShake = (window as unknown as { triggerBattleScreenShake?: () => void }).triggerBattleScreenShake;
    if (queueFn) {
      queueFn({ type: "attack_start", actorId, targetId });
      setTimeout(() => {
        queueFn({ type: "attack_hit", actorId, targetId });
        // Trigger screen shake on impact
        triggerShake?.();
      }, 300);
      setTimeout(() => queueFn({ type: "attack_end", actorId, targetId }), 600);
    }
  }, []);

  const triggerMagic = useCallback((actorId: string, targetId: string, abilityId: string) => {
    const queueFn = (window as unknown as { queueBattleAnimation?: (event: AnimationEvent) => void }).queueBattleAnimation;
    if (queueFn) {
      queueFn({ type: "magic_start", actorId });
      setTimeout(() => queueFn({ type: "magic_effect", actorId, targetId, abilityId }), 500);
      setTimeout(() => queueFn({ type: "magic_end", actorId }), 900);
    }
  }, []);

  const triggerDamage = useCallback((targetId: string, damage: number, isCritical: boolean = false) => {
    const queueFn = (window as unknown as { queueBattleAnimation?: (event: AnimationEvent) => void }).queueBattleAnimation;
    if (queueFn) {
      queueFn({ type: "damage", actorId: targetId, value: damage, isCritical });
      if (isCritical) {
        queueFn({ type: "critical", actorId: targetId });
      }
    }
  }, []);

  const triggerDeath = useCallback((targetId: string) => {
    const queueFn = (window as unknown as { queueBattleAnimation?: (event: AnimationEvent) => void }).queueBattleAnimation;
    if (queueFn) {
      queueFn({ type: "death", actorId: targetId, targetId });
    }
  }, []);

  const triggerVictory = useCallback((partyIds: string[]) => {
    const queueFn = (window as unknown as { queueBattleAnimation?: (event: AnimationEvent) => void }).queueBattleAnimation;
    if (queueFn) {
      partyIds.forEach((id, index) => {
        setTimeout(() => queueFn({ type: "victory", actorId: id }), index * 200);
      });
    }
  }, []);

  const triggerCritical = useCallback((targetId: string) => {
    const queueFn = (window as unknown as { queueBattleAnimation?: (event: AnimationEvent) => void }).queueBattleAnimation;
    const triggerShake = (window as unknown as { triggerBattleScreenShake?: () => void }).triggerBattleScreenShake;
    if (queueFn) {
      queueFn({ type: "critical", actorId: targetId, targetId });
      // Extra screen shake for crits
      triggerShake?.();
    }
  }, []);

  return {
    triggerAttack,
    triggerMagic,
    triggerDamage,
    triggerDeath,
    triggerVictory,
    triggerCritical,
  };
}
