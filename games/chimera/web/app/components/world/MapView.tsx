"use client";

import { useRef, useEffect, useCallback } from "react";
import { useGameStore } from "../../stores/gameStore";
import type { CollectibleContents, StaticObject } from "../../types/map";
import { getVisibleNpcs, getVisibleStaticObjects } from "../../types/map";
import { getQuestsByGiver, QUESTS } from "../../data/quests";
import { OBJECT_SPRITES } from "../../data/animations";

// Cache for loaded sprite/tileset images
const spriteCache = new Map<string, HTMLImageElement | null>();

/**
 * Load a sprite image and cache it
 */
function loadSprite(src: string): HTMLImageElement | null {
  // Return from cache if already loaded
  if (spriteCache.has(src)) {
    return spriteCache.get(src) ?? null;
  }

  // Start loading (set null to indicate loading in progress)
  spriteCache.set(src, null);

  const img = new Image();
  img.onload = () => {
    spriteCache.set(src, img);
  };
  img.onerror = () => {
    // Keep null in cache to prevent retrying
    console.warn(`Failed to load sprite: ${src}`);
  };
  img.src = src;

  return null; // Return null while loading
}

// Tile colors for placeholder rendering (legacy maps)
const TILE_COLORS: Record<number, string> = {
  0: "#4a7c4e", // Grass - forest green
  1: "#8b7355", // Path - dirt brown
  2: "#4a90a4", // Water - blue
  3: "#6b5b4f", // Wall - stone gray
  4: "#8b6914", // Floor - wood brown
  5: "#5c4033", // Door - dark wood
};

// Render tile size
const TILE_SIZE = 32;
const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;
const TILES_X = Math.ceil(VIEWPORT_WIDTH / TILE_SIZE) + 2;
const TILES_Y = Math.ceil(VIEWPORT_HEIGHT / TILE_SIZE) + 2;

/**
 * Draw a static object (building, tree, rock with explicit sprite and collision)
 */
function drawStaticObject(
  ctx: CanvasRenderingContext2D,
  obj: StaticObject,
  cameraX: number,
  cameraY: number
): void {
  const screenX = obj.x * TILE_SIZE - cameraX;
  const screenY = obj.y * TILE_SIZE - cameraY;
  const drawWidth = obj.width * TILE_SIZE;
  const drawHeight = obj.height * TILE_SIZE;

  // Skip if off-screen
  if (
    screenX + drawWidth < 0 ||
    screenY + drawHeight < 0 ||
    screenX > VIEWPORT_WIDTH ||
    screenY > VIEWPORT_HEIGHT
  ) {
    return;
  }

  // Try to load sprite
  const sprite = loadSprite(obj.sprite);

  if (sprite) {
    // Draw from sprite sheet with source rectangle
    const sx = obj.sourceX ?? 0;
    const sy = obj.sourceY ?? 0;
    const sw = obj.sourceWidth ?? sprite.width;
    const sh = obj.sourceHeight ?? sprite.height;

    ctx.drawImage(
      sprite,
      sx,
      sy,
      sw,
      sh,
      screenX,
      screenY,
      drawWidth,
      drawHeight
    );
  } else {
    // Fallback: draw placeholder rectangle while loading
    ctx.fillStyle = "rgba(100, 80, 60, 0.5)";
    ctx.fillRect(screenX, screenY, drawWidth, drawHeight);
    ctx.strokeStyle = "rgba(60, 40, 20, 0.7)";
    ctx.strokeRect(screenX, screenY, drawWidth, drawHeight);
  }
}

export default function MapView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentMap, playerPosition, party, openedChests, getQuestStatus, hasActiveQuest, story, quests } = useGameStore();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentMap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Disable image smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;

    // Clear canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Calculate camera offset (center on player)
    const cameraX =
      playerPosition.x * TILE_SIZE - VIEWPORT_WIDTH / 2 + TILE_SIZE / 2;
    const cameraY =
      playerPosition.y * TILE_SIZE - VIEWPORT_HEIGHT / 2 + TILE_SIZE / 2;

    // Calculate visible tile range
    const startTileX = Math.max(0, Math.floor(cameraX / TILE_SIZE));
    const startTileY = Math.max(0, Math.floor(cameraY / TILE_SIZE));
    const endTileX = Math.min(currentMap.width, startTileX + TILES_X);
    const endTileY = Math.min(currentMap.height, startTileY + TILES_Y);

    // Draw ground tiles (colored tiles)
    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        const tileIndex = currentMap.layers.ground[y]?.[x] ?? 0;
        const screenX = x * TILE_SIZE - cameraX;
        const screenY = y * TILE_SIZE - cameraY;

        // Draw tile
        ctx.fillStyle = TILE_COLORS[tileIndex] ?? "#000";
        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

        // Add grid lines (subtle)
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
        ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

        // Add texture pattern for grass
        if (tileIndex === 0) {
          ctx.fillStyle = "rgba(0, 100, 0, 0.3)";
          for (let i = 0; i < 3; i++) {
            const grassX = screenX + ((x * 7 + i * 11) % TILE_SIZE);
            const grassY = screenY + ((y * 13 + i * 7) % TILE_SIZE);
            ctx.fillRect(grassX, grassY, 2, 4);
          }
        }

        // Add water ripple effect
        if (tileIndex === 2) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
          ctx.beginPath();
          const time = Date.now() / 500;
          const waveOffset = Math.sin(time + x + y) * 2;
          ctx.moveTo(screenX + 5, screenY + TILE_SIZE / 2 + waveOffset);
          ctx.lineTo(screenX + TILE_SIZE - 5, screenY + TILE_SIZE / 2 + waveOffset);
          ctx.stroke();
        }
      }
    }

    // Draw static objects (buildings, trees, rocks with explicit sprites)
    if (currentMap.staticObjects && currentMap.staticObjects.length > 0) {
      // Filter by story flags and sort by y position for correct draw order
      const visibleObjects = getVisibleStaticObjects(currentMap.staticObjects, story.flags);
      const sortedObjects = [...visibleObjects].sort(
        (a, b) => (a.y + a.height) - (b.y + b.height)
      );

      for (const obj of sortedObjects) {
        drawStaticObject(ctx, obj, cameraX, cameraY);
      }
    }

    // Draw events (save points, chests, etc.)
    currentMap.events.forEach((event) => {
      const screenX = event.x * TILE_SIZE - cameraX;
      const screenY = event.y * TILE_SIZE - cameraY;

      // Only draw if visible
      if (
        screenX < -TILE_SIZE ||
        screenY < -TILE_SIZE ||
        screenX > VIEWPORT_WIDTH ||
        screenY > VIEWPORT_HEIGHT
      ) {
        return;
      }

      switch (event.type) {
        case "save_point": {
          // Try to use sprite if available
          const shrineConfig = OBJECT_SPRITES.save_point;
          const shrineSprite = loadSprite(shrineConfig.src);

          // Use display dimensions if set, otherwise use frame dimensions
          const displayW = shrineConfig.displayWidth ?? shrineConfig.frameWidth;
          const displayH = shrineConfig.displayHeight ?? shrineConfig.frameHeight;

          if (shrineSprite) {
            // Draw save point sprite, scaled and centered on tile
            const spriteX = screenX + TILE_SIZE / 2 - displayW / 2;
            const spriteY = screenY + TILE_SIZE - displayH;

            // Add glow effect behind sprite
            const glowIntensity = Math.sin(Date.now() / 300) * 0.2 + 0.4;
            ctx.shadowColor = "rgba(0, 255, 255, 0.8)";
            ctx.shadowBlur = 15 + glowIntensity * 10;

            ctx.drawImage(
              shrineSprite,
              0, 0,
              shrineConfig.frameWidth,
              shrineConfig.frameHeight,
              spriteX,
              spriteY,
              displayW,
              displayH
            );

            ctx.shadowBlur = 0;
          } else {
            // Fallback: Draw glowing save point (Temporal Distortion)
            const gradient = ctx.createRadialGradient(
              screenX + TILE_SIZE / 2,
              screenY + TILE_SIZE / 2,
              0,
              screenX + TILE_SIZE / 2,
              screenY + TILE_SIZE / 2,
              TILE_SIZE / 2
            );
            gradient.addColorStop(0, "rgba(0, 255, 255, 0.8)");
            gradient.addColorStop(0.5, "rgba(0, 150, 255, 0.4)");
            gradient.addColorStop(1, "rgba(0, 100, 200, 0)");
            ctx.fillStyle = gradient;
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

            // Shimmer effect
            const shimmer = Math.sin(Date.now() / 200) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${shimmer * 0.5})`;
            ctx.beginPath();
            ctx.arc(
              screenX + TILE_SIZE / 2,
              screenY + TILE_SIZE / 2,
              6,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
          break;
        }

        case "treasure": {
          const isOpened = event.triggered || openedChests.has(event.id);
          if (!isOpened) {
            // Draw closed chest
            ctx.fillStyle = "#8B4513";
            ctx.fillRect(screenX + 4, screenY + 8, TILE_SIZE - 8, TILE_SIZE - 12);
            ctx.fillStyle = "#DAA520";
            ctx.fillRect(screenX + 8, screenY + 12, TILE_SIZE - 16, 4);
            // Add sparkle effect
            const sparkle = Math.sin(Date.now() / 300 + event.x + event.y) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 215, 0, ${sparkle * 0.6})`;
            ctx.beginPath();
            ctx.arc(screenX + TILE_SIZE / 2, screenY + 6, 3, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Draw open/empty chest
            ctx.fillStyle = "#5C4033";
            ctx.fillRect(screenX + 4, screenY + 12, TILE_SIZE - 8, TILE_SIZE - 16);
            ctx.fillStyle = "#4A3728";
            ctx.fillRect(screenX + 6, screenY + 14, TILE_SIZE - 12, 2);
          }
          break;
        }

        case "collectible": {
          const isCollected = event.triggered || openedChests.has(event.id);
          if (isCollected) break;

          const collectData = event.data as unknown as CollectibleContents;
          // Only show if quest is active (or no quest required)
          const questRequired = collectData.requiredQuest;
          const questActive = questRequired ? hasActiveQuest(questRequired) : true;

          if (!questActive) break;

          // Draw glowing flower collectible
          const glowTime = Date.now() / 400;
          const glowIntensity = Math.sin(glowTime + event.x * 2 + event.y * 3) * 0.3 + 0.7;

          // Outer glow
          const glowGradient = ctx.createRadialGradient(
            screenX + TILE_SIZE / 2,
            screenY + TILE_SIZE / 2,
            0,
            screenX + TILE_SIZE / 2,
            screenY + TILE_SIZE / 2,
            TILE_SIZE / 2
          );
          glowGradient.addColorStop(0, `rgba(200, 180, 255, ${glowIntensity * 0.6})`);
          glowGradient.addColorStop(0.5, `rgba(180, 160, 230, ${glowIntensity * 0.3})`);
          glowGradient.addColorStop(1, "rgba(150, 130, 200, 0)");
          ctx.fillStyle = glowGradient;
          ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

          // Flower shape (simple)
          ctx.fillStyle = `rgba(220, 210, 255, ${glowIntensity})`;
          ctx.beginPath();
          ctx.arc(
            screenX + TILE_SIZE / 2,
            screenY + TILE_SIZE / 2,
            6,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Petals
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + glowTime * 0.2;
            const petalX = screenX + TILE_SIZE / 2 + Math.cos(angle) * 8;
            const petalY = screenY + TILE_SIZE / 2 + Math.sin(angle) * 8;
            ctx.fillStyle = `rgba(240, 235, 255, ${glowIntensity * 0.9})`;
            ctx.beginPath();
            ctx.arc(petalX, petalY, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
      }
    });

    // Draw NPCs (filter by story flags)
    const visibleNpcs = getVisibleNpcs(currentMap.npcs, story.flags);
    visibleNpcs.forEach((npc) => {
      const screenX = npc.x * TILE_SIZE - cameraX;
      const screenY = npc.y * TILE_SIZE - cameraY;

      // Only draw if visible
      if (
        screenX < -TILE_SIZE ||
        screenY < -TILE_SIZE ||
        screenX > VIEWPORT_WIDTH ||
        screenY > VIEWPORT_HEIGHT
      ) {
        return;
      }

      // Try to load and draw sprite
      const sprite = npc.sprite ? loadSprite(npc.sprite) : null;

      if (sprite) {
        // Draw actual sprite image
        ctx.drawImage(sprite, screenX, screenY, TILE_SIZE, TILE_SIZE);
      } else {
        // Fallback: Draw NPC placeholder (colored circle with direction indicator)
        ctx.fillStyle = "#e0a060";
        ctx.beginPath();
        ctx.arc(
          screenX + TILE_SIZE / 2,
          screenY + TILE_SIZE / 2,
          TILE_SIZE / 3,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Draw facing direction indicator
        ctx.fillStyle = "#000";
        let eyeX = screenX + TILE_SIZE / 2;
        let eyeY = screenY + TILE_SIZE / 2;
        switch (npc.facing) {
          case "up":
            eyeY -= 6;
            break;
          case "down":
            eyeY += 6;
            break;
          case "left":
            eyeX -= 6;
            break;
          case "right":
            eyeX += 6;
            break;
        }
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw quest marker above NPC
      let markerType: "available" | "in_progress" | "objective" | null = null;

      // Check if NPC gives any quests
      const npcQuests = getQuestsByGiver(npc.id);
      for (const quest of npcQuests) {
        const status = getQuestStatus(quest.id);

        // Check if required flags are met for not_started quests
        if (status === "not_started") {
          const hasRequiredFlags = !quest.requiredFlags ||
            quest.requiredFlags.every(flag => story.flags[flag]);
          if (hasRequiredFlags) {
            markerType = "available";
            break; // Available quest takes priority
          }
        } else if (status === "active") {
          markerType = "in_progress";
        }
      }

      // If no marker yet, check if NPC is an objective target for any active quest
      if (!markerType) {
        for (const quest of Object.values(QUESTS)) {
          const status = getQuestStatus(quest.id);
          if (status === "active") {
            // Find the quest progress from active quests array
            const questProgress = quests.active.find((q) => q.questId === quest.id);
            for (const objective of quest.objectives) {
              // Check if this objective targets this NPC (for talk/deliver types)
              if (objective.targetId === npc.id) {
                // Check if objective is not yet complete
                const objProgress = questProgress?.objectives.find(
                  (o) => o.objectiveId === objective.id
                );
                if (!objProgress?.isComplete) {
                  markerType = "objective";
                  break;
                }
              }
            }
            if (markerType) break;
          }
        }
      }

      if (markerType) {
        const markerY = screenY - 8;
        const bounce = Math.sin(Date.now() / 200) * 2;

        if (markerType === "available") {
          // Yellow "!" for available quest
          ctx.fillStyle = "#FFD700";
          ctx.font = "bold 16px Arial";
          ctx.textAlign = "center";
          ctx.fillText("!", screenX + TILE_SIZE / 2, markerY + bounce);
        } else if (markerType === "objective") {
          // Cyan "!" for quest objective target
          ctx.fillStyle = "#00BFFF";
          ctx.font = "bold 16px Arial";
          ctx.textAlign = "center";
          ctx.fillText("!", screenX + TILE_SIZE / 2, markerY + bounce);
        } else {
          // Silver "?" for quest in progress (turn-in)
          ctx.fillStyle = "#C0C0C0";
          ctx.font = "bold 14px Arial";
          ctx.textAlign = "center";
          ctx.fillText("?", screenX + TILE_SIZE / 2, markerY + bounce);
        }
      }
    });

    // Draw player
    const playerScreenX =
      playerPosition.x * TILE_SIZE - cameraX;
    const playerScreenY =
      playerPosition.y * TILE_SIZE - cameraY;

    // Player shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(
      playerScreenX + TILE_SIZE / 2,
      playerScreenY + TILE_SIZE - 4,
      TILE_SIZE / 3,
      TILE_SIZE / 6,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Player body (placeholder - colored rectangle)
    const activeChar = party.find((c) => c.id === "kai") ?? party[0];
    ctx.fillStyle = activeChar?.isGlitched ? "#6b8cff" : "#4080ff";
    ctx.fillRect(
      playerScreenX + 6,
      playerScreenY + 4,
      TILE_SIZE - 12,
      TILE_SIZE - 8
    );

    // Player direction indicator (simple eye)
    ctx.fillStyle = "#000";
    let playerEyeX = playerScreenX + TILE_SIZE / 2;
    let playerEyeY = playerScreenY + TILE_SIZE / 2;
    switch (playerPosition.facing) {
      case "up":
        playerEyeY -= 6;
        break;
      case "down":
        playerEyeY += 6;
        break;
      case "left":
        playerEyeX -= 6;
        break;
      case "right":
        playerEyeX += 6;
        break;
    }
    ctx.beginPath();
    ctx.arc(playerEyeX, playerEyeY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Glitch effect for player (subtle)
    if (activeChar?.isGlitched && Math.random() < 0.02) {
      ctx.fillStyle = "rgba(0, 255, 255, 0.3)";
      ctx.fillRect(
        playerScreenX + (Math.random() - 0.5) * 4,
        playerScreenY,
        TILE_SIZE,
        2
      );
    }
  }, [currentMap, playerPosition, party, openedChests, getQuestStatus, hasActiveQuest, story, quests]);

  // Animation loop
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      draw();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [draw]);

  return (
    <div className="flex items-center justify-center w-full h-full bg-black">
      <canvas
        ref={canvasRef}
        width={VIEWPORT_WIDTH}
        height={VIEWPORT_HEIGHT}
        className="border border-gray-800"
      />
    </div>
  );
}
