"use client";

import { useRef, useEffect, useCallback } from "react";
import { useGameStore } from "../../stores/gameStore";
import type { CollectibleContents, StaticObject } from "../../types/map";
import { getVisibleNpcs, getVisibleStaticObjects } from "../../types/map";
import { getQuestsByGiver, QUESTS } from "../../data/quests";
import { OBJECT_SPRITES, WORLD_SPRITE_CONFIGS, NPC_SPRITE_CONFIGS } from "../../data/animations";
import type { WorldSpriteConfig } from "../../types/animation";
import { getTileset, getTilePath, type Tileset } from "../../data/tilesets";

// Cache for loaded sprite/tileset images
type DrawableImage = HTMLImageElement | HTMLCanvasElement;
const spriteCache = new Map<string, DrawableImage | null>();

/**
 * Remove baked-in checkered background and auto-crop to content bounds.
 * Returns a canvas trimmed to just the character content (no empty space).
 */
function removeCheckerBackground(img: HTMLImageElement): HTMLCanvasElement {
  const w = img.width;
  const h = img.height;

  // Draw onto temp canvas
  const tmp = document.createElement("canvas");
  tmp.width = w;
  tmp.height = h;
  const tmpCtx = tmp.getContext("2d")!;
  tmpCtx.drawImage(img, 0, 0);

  const imageData = tmpCtx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Pass 1: remove checkerboard pixels and find vertical content bounds
  let minY = h;
  let maxY = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Detect near-white/gray pixels (checkerboard background)
    const isGray = Math.abs(r - g) < 20 && Math.abs(g - b) < 20;
    if (isGray && r > 170) {
      data[i + 3] = 0;
    } else if (data[i + 3] > 10) {
      // Track Y bounds of actual content
      const y = Math.floor((i / 4) / w);
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  tmpCtx.putImageData(imageData, 0, 0);

  // Pass 2: auto-crop vertically to content bounds (with small padding)
  const pad = 2;
  const cropY = Math.max(0, minY - pad);
  const cropH = Math.min(h, maxY + pad + 1) - cropY;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = cropH > 0 ? cropH : h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(tmp, 0, cropY, w, cropH, 0, 0, w, cropH);

  return canvas;
}

/**
 * Remove baked-in background from a sprite sheet using edge flood fill.
 * Works for any background color (dark gradients, light checkered, etc.)
 * by following connected similar-color pixels inward from the image edges.
 * Does NOT auto-crop — preserves original dimensions so frame grid stays valid.
 */
function removeSheetBackground(img: HTMLImageElement, threshold = 35): HTMLCanvasElement {
  const w = img.width;
  const h = img.height;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // BFS flood fill from all edge pixels — marks connected similar-color regions as background
  const isBackground = new Uint8Array(w * h);
  const visited = new Uint8Array(w * h);
  const queue: number[] = [];

  // Seed: all edge pixels
  for (let x = 0; x < w; x++) {
    const top = x;
    const bottom = (h - 1) * w + x;
    if (!visited[top]) { visited[top] = 1; isBackground[top] = 1; queue.push(top); }
    if (!visited[bottom]) { visited[bottom] = 1; isBackground[bottom] = 1; queue.push(bottom); }
  }
  for (let y = 1; y < h - 1; y++) {
    const left = y * w;
    const right = y * w + w - 1;
    if (!visited[left]) { visited[left] = 1; isBackground[left] = 1; queue.push(left); }
    if (!visited[right]) { visited[right] = 1; isBackground[right] = 1; queue.push(right); }
  }

  // BFS: expand from edges, following similar colors
  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    const px = idx * 4;
    const r = data[px], g = data[px + 1], b = data[px + 2];

    const x = idx % w;
    const y = (idx - x) / w;

    // Check 4-connected neighbors
    const neighbors: number[] = [];
    if (x > 0) neighbors.push(idx - 1);
    if (x < w - 1) neighbors.push(idx + 1);
    if (y > 0) neighbors.push(idx - w);
    if (y < h - 1) neighbors.push(idx + w);

    for (const n of neighbors) {
      if (visited[n]) continue;
      visited[n] = 1;

      const np = n * 4;
      const dr = data[np] - r;
      const dg = data[np + 1] - g;
      const db = data[np + 2] - b;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);

      if (dist < threshold) {
        isBackground[n] = 1;
        queue.push(n);
      }
    }
  }

  // Remove background pixels — add soft edge by checking neighbor background count
  for (let i = 0; i < w * h; i++) {
    if (isBackground[i]) {
      data[i * 4 + 3] = 0;
    } else {
      // Anti-alias: if this foreground pixel borders background, soften the edge
      const x = i % w;
      const y = (i - x) / w;
      let bgNeighbors = 0;
      let totalNeighbors = 0;
      if (x > 0) { totalNeighbors++; if (isBackground[i - 1]) bgNeighbors++; }
      if (x < w - 1) { totalNeighbors++; if (isBackground[i + 1]) bgNeighbors++; }
      if (y > 0) { totalNeighbors++; if (isBackground[i - w]) bgNeighbors++; }
      if (y < h - 1) { totalNeighbors++; if (isBackground[i + w]) bgNeighbors++; }
      if (bgNeighbors > 0 && totalNeighbors > 0) {
        // Scale alpha by fraction of non-background neighbors for soft edges
        const fgFraction = 1 - (bgNeighbors / totalNeighbors) * 0.5;
        data[i * 4 + 3] = Math.round(data[i * 4 + 3] * fgFraction);
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Load a sprite image and cache it
 */
function loadSprite(src: string): DrawableImage | null {
  // Return from cache if already loaded
  if (spriteCache.has(src)) {
    return spriteCache.get(src) ?? null;
  }

  // Start loading (set null to indicate loading in progress)
  spriteCache.set(src, null);

  const img = new Image();
  img.onload = () => {
    // Process player sprites to remove checkered background
    if (src.includes("/sprites/characters/kai_")) {
      spriteCache.set(src, removeCheckerBackground(img));
    } else {
      spriteCache.set(src, img);
    }
  };
  img.onerror = () => {
    // Remove from cache so it retries on next request (file may appear later)
    spriteCache.delete(src);
    console.warn(`Failed to load sprite: ${src}`);
  };
  img.src = src;

  return null; // Return null while loading
}

// Cache for loaded world sprite sheets (walk cycle sheets)
const worldSheetCache = new Map<string, {
  image: DrawableImage;
  frameWidth: number;
  frameHeight: number;
} | null>();

/**
 * Load a world sprite sheet and compute frame dimensions from actual image size.
 * Returns null while loading (same pattern as loadSprite).
 */
function loadWorldSheet(config: WorldSpriteConfig): {
  image: DrawableImage;
  frameWidth: number;
  frameHeight: number;
} | null {
  if (worldSheetCache.has(config.src)) {
    return worldSheetCache.get(config.src) ?? null;
  }

  worldSheetCache.set(config.src, null);

  const img = new Image();
  img.onload = () => {
    const frameWidth = Math.floor(img.width / config.columns);
    const frameHeight = Math.floor(img.height / config.rows);

    let finalImage: DrawableImage = img;
    if (config.removeBackground) {
      finalImage = removeSheetBackground(img);
    }

    worldSheetCache.set(config.src, { image: finalImage, frameWidth, frameHeight });
  };
  img.onerror = () => {
    worldSheetCache.delete(config.src);
    console.warn(`Failed to load world sprite sheet: ${config.src}`);
  };
  img.src = config.src;

  return null;
}

/**
 * Draw a single frame from a world sprite sheet.
 * Handles flipX for mirrored directions (e.g., right from left row).
 */
function drawWorldSpriteFrame(
  ctx: CanvasRenderingContext2D,
  sheet: { image: DrawableImage; frameWidth: number; frameHeight: number },
  row: number,
  frameIndex: number,
  destX: number,
  destY: number,
  destW: number,
  destH: number,
  flipX: boolean = false,
): void {
  const srcX = frameIndex * sheet.frameWidth;
  const srcY = row * sheet.frameHeight;

  if (flipX) {
    ctx.save();
    ctx.translate(destX + destW, destY);
    ctx.scale(-1, 1);
    ctx.drawImage(
      sheet.image,
      srcX, srcY, sheet.frameWidth, sheet.frameHeight,
      0, 0, destW, destH
    );
    ctx.restore();
  } else {
    ctx.drawImage(
      sheet.image,
      srcX, srcY, sheet.frameWidth, sheet.frameHeight,
      destX, destY, destW, destH
    );
  }
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

// Render tile size — set dynamically per-map from map.tileSize (default 64)
let TILE_SIZE = 64;
// Base size for sprite rendering — keeps characters the same visual size
// regardless of collision grid resolution (32px vs 64px tiles)
const SPRITE_BASE_SIZE = 64;
const VIEWPORT_WIDTH = 1600; // TODO: revert to 1280 after collision tuning
const VIEWPORT_HEIGHT = 1600; // TODO: revert to 832 after collision tuning

// Perspective depth scaling — characters at the top (far) appear smaller,
// characters at the bottom (near) appear larger (FF9-style)
const PERSPECTIVE_MIN_SCALE = 0.78;
const PERSPECTIVE_MAX_SCALE = 1.12;
function getPerspectiveScale(y: number, mapHeight: number): number {
  const t = mapHeight > 1 ? y / (mapHeight - 1) : 0.5;
  const eased = t * t * (3 - 2 * t); // smoothstep
  return PERSPECTIVE_MIN_SCALE + (PERSPECTIVE_MAX_SCALE - PERSPECTIVE_MIN_SCALE) * eased;
}

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

/**
 * Fill a tile with soft edges where it borders different tile types.
 * Same-type neighbors stay flush; different-type neighbors get rounded corners,
 * a small inset (so the grass background peeks through), and a subtle shadow.
 */
function fillTileSoft(
  ctx: CanvasRenderingContext2D,
  screenX: number, screenY: number,
  tileIndex: number,
  mapX: number, mapY: number,
  groundLayer: number[][],
) {
  const inset = 3;
  const radius = 6;

  // Check which neighbors are a different tile type
  const topDiff = (groundLayer[mapY - 1]?.[mapX] ?? 0) !== tileIndex;
  const bottomDiff = (groundLayer[mapY + 1]?.[mapX] ?? 0) !== tileIndex;
  const leftDiff = (groundLayer[mapY]?.[mapX - 1] ?? 0) !== tileIndex;
  const rightDiff = (groundLayer[mapY]?.[mapX + 1] ?? 0) !== tileIndex;

  // Inset only on edges bordering different tiles
  const t = topDiff ? inset : 0;
  const b = bottomDiff ? inset : 0;
  const l = leftDiff ? inset : 0;
  const r = rightDiff ? inset : 0;

  // Round corners only where both adjacent edges border different tiles
  const tl = (topDiff && leftDiff) ? radius : 0;
  const tr = (topDiff && rightDiff) ? radius : 0;
  const br = (bottomDiff && rightDiff) ? radius : 0;
  const bl = (bottomDiff && leftDiff) ? radius : 0;

  ctx.beginPath();
  ctx.roundRect(
    screenX + l, screenY + t,
    TILE_SIZE - l - r, TILE_SIZE - t - b,
    [tl, tr, br, bl]
  );
  ctx.fill();
}

// Player sprite: individual frame images per direction
// Files: /sprites/characters/kai_{direction}_{frameIndex}.png
const PLAYER_SPRITE_LEGACY = {
  framePath: (dir: string, frame: number) =>
    `/sprites/characters/kai_${dir}_${frame}.png`,
  directions: {
    down:  { frames: 6, idleFrame: 0 },
    left:  { frames: 6, idleFrame: 0 },
    right: { frames: 6, idleFrame: 0 },
    up:    { frames: 6, idleFrame: 0 },
  } as Record<string, { frames: number; idleFrame: number }>,
};

/**
 * Convert a set of overhead tile keys ("x,y") into rectangular regions
 * with auto-calculated baseY (bottom edge of each region).
 * Uses greedy rectangle merging: scan top-to-bottom, left-to-right,
 * expand each unvisited tile into the widest possible rectangle.
 */
function buildOverheadRegions(
  tiles: Set<string>
): { x: number; y: number; width: number; height: number; baseY: number }[] {
  if (tiles.size === 0) return [];

  const visited = new Set<string>();
  const regions: { x: number; y: number; width: number; height: number; baseY: number }[] = [];

  // Collect all tile coords and sort by y then x
  const coords: { x: number; y: number }[] = [];
  for (const key of tiles) {
    const [x, y] = key.split(",").map(Number);
    coords.push({ x, y });
  }
  coords.sort((a, b) => a.y - b.y || a.x - b.x);

  for (const { x: sx, y: sy } of coords) {
    const key = `${sx},${sy}`;
    if (visited.has(key)) continue;

    // Expand right as far as possible
    let maxX = sx;
    while (tiles.has(`${maxX + 1},${sy}`) && !visited.has(`${maxX + 1},${sy}`)) {
      maxX++;
    }

    // Expand down as far as possible (all columns in range must be present)
    let maxY = sy;
    let canExpand = true;
    while (canExpand) {
      for (let cx = sx; cx <= maxX; cx++) {
        if (!tiles.has(`${cx},${maxY + 1}`) || visited.has(`${cx},${maxY + 1}`)) {
          canExpand = false;
          break;
        }
      }
      if (canExpand) maxY++;
    }

    // Mark all tiles in this rectangle as visited
    for (let ry = sy; ry <= maxY; ry++) {
      for (let rx = sx; rx <= maxX; rx++) {
        visited.add(`${rx},${ry}`);
      }
    }

    regions.push({
      x: sx,
      y: sy,
      width: maxX - sx + 1,
      height: maxY - sy + 1,
      baseY: maxY + 1, // baseY = first row below the region (where characters stand "in front")
    });
  }

  return regions;
}

// NPC wander state — tracks current positions for NPCs that move
interface NpcWanderState {
  x: number;
  y: number;
  facing: "down" | "left" | "right" | "up";
  nextMoveTime: number;
}
const npcWanderStates = new Map<string, NpcWanderState>();

// Track player movement for animation
let lastPlayerX = -1;
let lastPlayerY = -1;
let lastMoveTime = 0;
let walkFrame = 0;
let walkFrameTime = 0;
const WALK_FRAME_DURATION = 120; // ms per frame
const WALK_LINGER_MS = 80; // Tiny bridge for key-repeat gaps, stops near-instantly on release

export default function MapView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentMap, playerPosition, party, openedChests, getQuestStatus, hasActiveQuest, story, quests, showCollisionDebug, desertTimerStart, desertCollapsing, triggerDesertCollapse, gardenAwakeningPhase, setGardenAwakeningPhase } = useGameStore();

  // === Collision paint editor state ===
  const paintModeRef = useRef(false);
  const isPaintingRef = useRef(false);
  const paintValueRef = useRef(true); // true = painting walkable, false = painting blocked
  const cameraRef = useRef({ x: 0, y: 0 }); // updated each frame so mouse handlers can use it
  const tileSizeRef = useRef(64); // updated each frame
  // Paint layer: "collision" paints walkable/blocked, "overhead" paints walk-behind regions
  const paintLayerRef = useRef<"collision" | "overhead">("collision");
  // Overhead tile set: tracks which tiles are overhead regions (key = "x,y")
  const overheadTilesRef = useRef<Set<string>>(new Set());
  // Track whether overhead tiles have been initialized from current map
  const overheadInitMapRef = useRef<string>("");

  // Desert collapse animation
  const collapseStartRef = useRef<number | null>(null);
  const collapseTriggeredRef = useRef(false);

  // Garden awakening camera pan
  const gardenPanStartRef = useRef<number | null>(null);
  const DESERT_TIMER_MS = 120_000; // 2 minutes
  const DESERT_EXTERIORS = ["desert_plateau", "desert_wastes", "desert_ridge"];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentMap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set TILE_SIZE from current map (indoor maps use 32px, outdoor use 64px)
    TILE_SIZE = currentMap.tileSize ?? 64;
    const TILES_X = Math.ceil(VIEWPORT_WIDTH / TILE_SIZE) + 2;
    const TILES_Y = Math.ceil(VIEWPORT_HEIGHT / TILE_SIZE) + 2;

    // Disable image smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;

    // Clear canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Calculate camera offset (center on player)
    const cameraX =
      playerPosition.x * TILE_SIZE - VIEWPORT_WIDTH / 2 + TILE_SIZE / 2;
    let cameraY =
      playerPosition.y * TILE_SIZE - VIEWPORT_HEIGHT / 2 + TILE_SIZE / 2;

    // Garden awakening: animate camera pan from top of map down to player
    if (gardenAwakeningPhase === "pan") {
      if (!gardenPanStartRef.current) gardenPanStartRef.current = Date.now();
      const elapsed = Date.now() - gardenPanStartRef.current;
      const PAN_DURATION = 3000;
      const t = Math.min(elapsed / PAN_DURATION, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const startY = -VIEWPORT_HEIGHT / 2; // top of map
      const endY = playerPosition.y * TILE_SIZE - VIEWPORT_HEIGHT / 2 + TILE_SIZE / 2;
      cameraY = startY + (endY - startY) * ease;

      if (t >= 1) {
        setGardenAwakeningPhase("text");
        gardenPanStartRef.current = null;
      }
    }

    // Store camera + tile size for mouse handlers
    cameraRef.current = { x: cameraX, y: cameraY };
    tileSizeRef.current = TILE_SIZE;

    // Calculate visible tile range
    const startTileX = Math.max(0, Math.floor(cameraX / TILE_SIZE));
    const startTileY = Math.max(0, Math.floor(cameraY / TILE_SIZE));
    const endTileX = Math.min(currentMap.width, startTileX + TILES_X);
    const endTileY = Math.min(currentMap.height, startTileY + TILES_Y);

    // Check for pre-rendered background (FF9-style painted interiors)
    const backgroundImage = currentMap.background ? loadSprite(currentMap.background) : null;

    if (backgroundImage) {
      // Pre-rendered background mode: single image replaces all tile rendering
      ctx.drawImage(
        backgroundImage,
        -cameraX, -cameraY,
        currentMap.width * TILE_SIZE,
        currentMap.height * TILE_SIZE
      );
    } else {
      // Tile rendering mode (outdoor maps, fallback when background not loaded)
      const tileset: Tileset = getTileset(currentMap.tileset ?? "outdoor");
      const animationFrame = Math.floor(Date.now() / 400) % 3;

      // Draw seamless grass field as a continuous pattern (no tile grid)
      const grassImg = loadSprite("/tiles/grass_seamless.png");
      if (grassImg) {
        const srcElem = grassImg instanceof HTMLCanvasElement ? grassImg : grassImg as HTMLImageElement;
        const pattern = ctx.createPattern(srcElem, "repeat");
        if (pattern) {
          ctx.save();
          const offsetX = -(cameraX % srcElem.width);
          const offsetY = -(cameraY % srcElem.height);
          ctx.translate(offsetX, offsetY);
          ctx.fillStyle = pattern;
          ctx.fillRect(
            -offsetX, -offsetY,
            VIEWPORT_WIDTH + srcElem.width,
            VIEWPORT_HEIGHT + srcElem.height
          );
          ctx.restore();
        }
      } else {
        ctx.fillStyle = TILE_COLORS[0] ?? "#4a7c4e";
        ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      }

      // Set up seamless dirt pattern for paths (aligned to world coordinates)
      const dirtImg = loadSprite("/tiles/path_dirt_seamless.png");
      let dirtPattern: CanvasPattern | null = null;
      if (dirtImg) {
        const dirtSrc = dirtImg instanceof HTMLCanvasElement ? dirtImg : dirtImg as HTMLImageElement;
        dirtPattern = ctx.createPattern(dirtSrc, "repeat");
        if (dirtPattern) {
          const matrix = new DOMMatrix();
          matrix.translateSelf(-cameraX, -cameraY);
          dirtPattern.setTransform(matrix);
        }
      }

      // Set up seamless water pattern with slow scroll for flow animation
      const waterImg = loadSprite("/tiles/water_seamless.png");
      let waterPattern: CanvasPattern | null = null;
      if (waterImg) {
        const waterSrc = waterImg instanceof HTMLCanvasElement ? waterImg : waterImg as HTMLImageElement;
        waterPattern = ctx.createPattern(waterSrc, "repeat");
        if (waterPattern) {
          const waterFlow = (Date.now() * 0.015) % waterSrc.width;
          const matrix = new DOMMatrix();
          matrix.translateSelf(-cameraX + waterFlow, -cameraY + waterFlow * 0.6);
          waterPattern.setTransform(matrix);
        }
      }

      // Set up seamless stone wall pattern (scaled down for smaller blocks)
      const wallImg = loadSprite("/tiles/stone_wall_seamless.png");
      let wallPattern: CanvasPattern | null = null;
      if (wallImg) {
        const wallSrc = wallImg instanceof HTMLCanvasElement ? wallImg : wallImg as HTMLImageElement;
        wallPattern = ctx.createPattern(wallSrc, "repeat");
        if (wallPattern) {
          const wallScale = 0.5;
          const matrix = new DOMMatrix();
          matrix.scaleSelf(wallScale, wallScale);
          matrix.translateSelf(-cameraX / wallScale, -cameraY / wallScale);
          wallPattern.setTransform(matrix);
        }
      }

      // Set up seamless wood floor pattern (scaled down for smaller planks)
      const floorImg = loadSprite("/tiles/wood_floor_seamless.png");
      let floorPattern: CanvasPattern | null = null;
      if (floorImg) {
        const floorSrc = floorImg instanceof HTMLCanvasElement ? floorImg : floorImg as HTMLImageElement;
        floorPattern = ctx.createPattern(floorSrc, "repeat");
        if (floorPattern) {
          const floorScale = 0.5;
          const matrix = new DOMMatrix();
          matrix.scaleSelf(floorScale, floorScale);
          matrix.translateSelf(-cameraX / floorScale, -cameraY / floorScale);
          floorPattern.setTransform(matrix);
        }
      }

      // Draw non-grass ground tiles (paths, water, etc.)
      for (let y = startTileY; y < endTileY; y++) {
        for (let x = startTileX; x < endTileX; x++) {
          const tileIndex = currentMap.layers.ground[y]?.[x] ?? 0;
          if (tileIndex === 0) continue;

          const screenX = x * TILE_SIZE - cameraX;
          const screenY = y * TILE_SIZE - cameraY;

          if (tileIndex === 1 && dirtPattern) {
            ctx.fillStyle = dirtPattern;
            fillTileSoft(ctx, screenX, screenY, tileIndex, x, y, currentMap.layers.ground);
            continue;
          }

          if (tileIndex === 2 && waterPattern) {
            ctx.fillStyle = waterPattern;
            fillTileSoft(ctx, screenX, screenY, tileIndex, x, y, currentMap.layers.ground);
            continue;
          }

          if (tileIndex === 3 && wallPattern) {
            ctx.fillStyle = wallPattern;
            fillTileSoft(ctx, screenX, screenY, tileIndex, x, y, currentMap.layers.ground);
            continue;
          }

          if ((tileIndex === 4 || tileIndex === 5) && floorPattern) {
            ctx.fillStyle = floorPattern;
            fillTileSoft(ctx, screenX, screenY, tileIndex, x, y, currentMap.layers.ground);
            continue;
          }

          const tilePath = getTilePath(tileIndex, tileset, x, y, animationFrame);
          if (tilePath) {
            const tileSprite = loadSprite(tilePath);
            if (tileSprite) {
              ctx.drawImage(tileSprite, screenX, screenY, TILE_SIZE, TILE_SIZE);
            } else {
              ctx.fillStyle = TILE_COLORS[tileIndex] ?? "#000";
              ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            }
          } else {
            ctx.fillStyle = TILE_COLORS[tileIndex] ?? "#000";
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }

    // Draw static objects (buildings, trees, rocks with explicit sprites)
    // Skip on background maps — furniture/pillars are baked into the painted background
    if (!backgroundImage && currentMap.staticObjects && currentMap.staticObjects.length > 0) {
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
            // Draw closed chest sprite
            const chestSprite = loadSprite("/assets/chest_closed.png");
            if (chestSprite) {
              ctx.drawImage(chestSprite, screenX + 4, screenY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            }
            // Add sparkle effect
            const sparkle = Math.sin(Date.now() / 300 + event.x + event.y) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 215, 0, ${sparkle * 0.6})`;
            ctx.beginPath();
            ctx.arc(screenX + TILE_SIZE / 2, screenY + 6, 3, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Draw open chest sprite
            const openChestSprite = loadSprite("/assets/chest_open.png");
            if (openChestSprite) {
              ctx.drawImage(openChestSprite, screenX + 4, screenY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            }
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

    // ========== NPC WANDER UPDATE ==========
    // Move wandering NPCs to adjacent walkable tiles periodically
    const wanderNow = Date.now();
    const WANDER_DIRECTIONS: ("down" | "left" | "right" | "up")[] = ["down", "left", "right", "up"];
    const WANDER_DX: Record<string, number> = { down: 0, up: 0, left: -1, right: 1 };
    const WANDER_DY: Record<string, number> = { down: 1, up: -1, left: 0, right: 0 };

    // Build a set of occupied tiles (player + all NPC wander positions)
    const occupiedTiles = new Set<string>();
    occupiedTiles.add(`${playerPosition.x},${playerPosition.y}`);

    const visibleNpcs = getVisibleNpcs(currentMap.npcs, story.flags);

    // Collect current positions of all wandering NPCs
    for (const npc of visibleNpcs) {
      const ws = npcWanderStates.get(npc.id);
      occupiedTiles.add(`${ws ? ws.x : npc.x},${ws ? ws.y : npc.y}`);
    }

    for (const npc of visibleNpcs) {
      if (npc.movement !== "wander") continue;

      // Initialize wander state if not present
      if (!npcWanderStates.has(npc.id)) {
        npcWanderStates.set(npc.id, {
          x: npc.x,
          y: npc.y,
          facing: npc.facing,
          nextMoveTime: wanderNow + 800 + Math.random() * 1000,
        });
      }

      const ws = npcWanderStates.get(npc.id)!;

      // Check if it's time to move
      if (wanderNow >= ws.nextMoveTime) {
        // Pick a random direction
        const dir = WANDER_DIRECTIONS[Math.floor(Math.random() * 4)];
        const nx = ws.x + WANDER_DX[dir];
        const ny = ws.y + WANDER_DY[dir];
        const tileKey = `${nx},${ny}`;

        // Check walkable and unoccupied (remove self from occupied check)
        const selfKey = `${ws.x},${ws.y}`;
        const isWalkable = nx >= 0 && ny >= 0 &&
          nx < currentMap.width && ny < currentMap.height &&
          currentMap.layers.collision[ny]?.[nx];
        const isOccupied = tileKey !== selfKey && occupiedTiles.has(tileKey);

        if (isWalkable && !isOccupied) {
          // Move NPC
          occupiedTiles.delete(selfKey);
          ws.x = nx;
          ws.y = ny;
          ws.facing = dir;
          occupiedTiles.add(tileKey);
        } else {
          // Couldn't move, just change facing
          ws.facing = dir;
        }

        // Next move in 0.8–1.8s
        ws.nextMoveTime = wanderNow + 800 + Math.random() * 1000;
      }
    }

    // Draw NPCs (filter by story flags)
    visibleNpcs.forEach((npc) => {
      // Use wander position if available, otherwise original position
      const wanderState = npcWanderStates.get(npc.id);
      const drawX = wanderState ? wanderState.x : npc.x;
      const drawY = wanderState ? wanderState.y : npc.y;
      const screenX = drawX * TILE_SIZE - cameraX;
      const screenY = drawY * TILE_SIZE - cameraY;

      // Only draw if visible
      if (
        screenX < -TILE_SIZE ||
        screenY < -TILE_SIZE ||
        screenX > VIEWPORT_WIDTH ||
        screenY > VIEWPORT_HEIGHT
      ) {
        return;
      }

      // Check if NPC has an animated sprite sheet
      const npcWorldConfig = NPC_SPRITE_CONFIGS[npc.id];
      const npcSheet = npcWorldConfig ? loadWorldSheet(npcWorldConfig) : null;
      const perspScale = getPerspectiveScale(drawY, currentMap.height);
      const npcFacing = wanderState ? wanderState.facing : npc.facing;

      if (npcWorldConfig) {
        // Animated sprite sheet mode
        if (!npcSheet) return; // Sheet still loading — skip (don't show full sheet as fallback)

        const dirConfig = npcWorldConfig.directions[npcFacing] ?? npcWorldConfig.directions.down;
        const isNpcMoving = npc.movement === "wander" || npc.movement === "patrol";
        const npcFrame = isNpcMoving
          ? Math.floor(Date.now() / WALK_FRAME_DURATION) % dirConfig.frames
          : dirConfig.idleFrame;

        const npcScale = (npc.scale ?? 1.5) * perspScale;
        const aspectRatio = npcSheet.frameWidth / npcSheet.frameHeight;
        const npcH = (SPRITE_BASE_SIZE + 16) * npcScale;
        const npcW = npcH * aspectRatio;
        const npcDestX = screenX + TILE_SIZE / 2 - npcW / 2;
        const npcDestY = screenY + TILE_SIZE - npcH;

        drawWorldSpriteFrame(
          ctx, npcSheet, dirConfig.row, npcFrame,
          npcDestX, npcDestY, npcW, npcH,
          dirConfig.flipX ?? false
        );
      } else if (npc.sprite) {
        // Static sprite mode (single image)
        const sprite = loadSprite(npc.sprite);
        if (sprite) {
          const npcScale = (npc.scale ?? 1.5) * perspScale;
          const npcW = SPRITE_BASE_SIZE * npcScale;
          const npcH = (SPRITE_BASE_SIZE + 16) * npcScale;
          const npcX = screenX + TILE_SIZE / 2 - npcW / 2;
          const npcY = screenY + TILE_SIZE - npcH;
          ctx.drawImage(
            sprite,
            0, 0, sprite.width, sprite.height,
            npcX, npcY,
            npcW, npcH
          );
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
    const playerScreenX = playerPosition.x * TILE_SIZE - cameraX;
    const playerScreenY = playerPosition.y * TILE_SIZE - cameraY;

    // Detect position changes for walk animation
    const now = Date.now();
    const positionChanged = playerPosition.x !== lastPlayerX || playerPosition.y !== lastPlayerY;

    if (positionChanged) {
      lastMoveTime = now;
      lastPlayerX = playerPosition.x;
      lastPlayerY = playerPosition.y;
    }

    // Determine which sprite system to use for the player
    const activeCharId = (party.find((c) => c.id === "kai") ?? party[0])?.id ?? "kai";
    const worldConfig = WORLD_SPRITE_CONFIGS[activeCharId];
    const worldSheet = worldConfig ? loadWorldSheet(worldConfig) : null;
    const facing = playerPosition.facing ?? "down";
    const activeChar = party.find((c) => c.id === activeCharId) ?? party[0];

    // Perspective scale for player based on Y position
    const playerPerspScale = getPerspectiveScale(playerPosition.y, currentMap.height);

    // Animate only while actively moving (tiny linger bridges key-repeat gaps)
    const isWalking = now - lastMoveTime < WALK_LINGER_MS;

    // ========== LYING SPRITE (desert collapse or garden awakening) ==========
    if (desertCollapsing || gardenAwakeningPhase) {
      const lyingSprite = loadSprite("/sprites/characters/kai_lying.png");
      if (lyingSprite) {
        const lyingH = TILE_SIZE * 1.2 * playerPerspScale;
        const lyingW = lyingH * (lyingSprite.width / lyingSprite.height);
        const lyingX = playerScreenX + TILE_SIZE / 2 - lyingW / 2;
        const lyingY = playerScreenY + TILE_SIZE - lyingH * 0.6;
        ctx.drawImage(lyingSprite, lyingX, lyingY, lyingW, lyingH);
      }
    } else {
    // Player shadow (scaled by perspective)
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(
      playerScreenX + TILE_SIZE / 2,
      playerScreenY + TILE_SIZE - 4,
      (TILE_SIZE / 3) * playerPerspScale,
      (TILE_SIZE / 6) * playerPerspScale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    if (worldSheet && worldConfig) {
      // === SPRITE SHEET MODE ===
      const sheetDirConfig = worldConfig.directions[facing] ?? worldConfig.directions.down;

      if (isWalking) {
        if (now - walkFrameTime > WALK_FRAME_DURATION) {
          walkFrame = (walkFrame + 1) % sheetDirConfig.frames;
          walkFrameTime = now;
        }
      } else {
        walkFrame = sheetDirConfig.idleFrame;
      }

      const frameIndex = isWalking ? walkFrame : sheetDirConfig.idleFrame;
      const aspectRatio = worldSheet.frameWidth / worldSheet.frameHeight;
      const drawH = (SPRITE_BASE_SIZE + 16) * playerPerspScale;
      const drawW = drawH * aspectRatio;
      const drawX = playerScreenX + TILE_SIZE / 2 - drawW / 2;
      const drawY = playerScreenY + TILE_SIZE - drawH;

      drawWorldSpriteFrame(
        ctx, worldSheet,
        sheetDirConfig.row, frameIndex,
        drawX, drawY, drawW, drawH,
        sheetDirConfig.flipX ?? false
      );

      // Glitch effect for anomaly characters
      if (activeChar?.isGlitched && Math.random() < 0.03) {
        ctx.fillStyle = "rgba(0, 255, 255, 0.4)";
        ctx.fillRect(
          drawX + (Math.random() - 0.5) * 4,
          drawY + Math.random() * drawH,
          drawW,
          2
        );
      }
    } else {
      // === LEGACY INDIVIDUAL-FILE MODE ===
      const legacyDirConfig = PLAYER_SPRITE_LEGACY.directions[facing]
        ?? PLAYER_SPRITE_LEGACY.directions.down;

      if (isWalking) {
        if (now - walkFrameTime > WALK_FRAME_DURATION) {
          walkFrame = (walkFrame + 1) % legacyDirConfig.frames;
          walkFrameTime = now;
        }
      } else {
        walkFrame = 0;
      }

      const frameIndex = isWalking ? walkFrame : legacyDirConfig.idleFrame;
      const framePath = PLAYER_SPRITE_LEGACY.framePath(facing, frameIndex);
      const playerSprite = loadSprite(framePath);

      if (playerSprite) {
        const aspectRatio = playerSprite.width / playerSprite.height;
        const drawH = (SPRITE_BASE_SIZE + 16) * playerPerspScale;
        const drawW = drawH * aspectRatio;
        const drawX = playerScreenX + TILE_SIZE / 2 - drawW / 2;
        const drawY = playerScreenY + TILE_SIZE - drawH;
        ctx.drawImage(
          playerSprite,
          0, 0, playerSprite.width, playerSprite.height,
          drawX, drawY,
          drawW, drawH
        );

        // Glitch effect for anomaly characters
        if (activeChar?.isGlitched && Math.random() < 0.03) {
          ctx.fillStyle = "rgba(0, 255, 255, 0.4)";
          ctx.fillRect(
            drawX + (Math.random() - 0.5) * 4,
            drawY + Math.random() * drawH,
            drawW,
            2
          );
        }
      } else {
        // Fallback: colored rectangle while sprite loads
        ctx.fillStyle = activeChar?.isGlitched ? "#6b8cff" : "#4080ff";
        ctx.fillRect(
          playerScreenX + 6,
          playerScreenY + 4,
          TILE_SIZE - 12,
          TILE_SIZE - 8
        );
      }
    }
    } // end else (not collapsing)

    // ========== OVERHEAD PASS: re-draw background regions over characters ==========
    // This creates the "walk behind" effect for pillars, archways, etc.
    // Each region has an optional baseY — the Y where the object's solid base sits.
    // Characters at or south of baseY are "in front" and should NOT be clipped.
    // We use canvas evenodd clipping to punch out the player sprite when in front.
    if (backgroundImage && currentMap.overheadRegions) {
      for (const region of currentMap.overheadRegions) {
        // Map tile coordinates to source rectangle in the background image
        const srcX = (region.x / currentMap.width) * backgroundImage.width;
        const srcY = (region.y / currentMap.height) * backgroundImage.height;
        const srcW = (region.width / currentMap.width) * backgroundImage.width;
        const srcH = (region.height / currentMap.height) * backgroundImage.height;

        // Destination on screen
        const destX = region.x * TILE_SIZE - cameraX;
        const destY = region.y * TILE_SIZE - cameraY;
        const destW = region.width * TILE_SIZE;
        const destH = region.height * TILE_SIZE;

        // Skip if off-screen
        if (destX + destW < 0 || destY + destH < 0 ||
            destX > VIEWPORT_WIDTH || destY > VIEWPORT_HEIGHT) {
          continue;
        }

        ctx.save();

        // If region has a baseY, clip out entities that are "in front" (at or below base)
        if (region.baseY !== undefined) {
          ctx.beginPath();
          // Start with the full overhead rectangle
          ctx.rect(destX, destY, destW, destH);

          // Punch out the player sprite if they're in front of this object
          if (playerPosition.y >= region.baseY) {
            // Calculate player draw rect from whichever sprite system is active
            let pAspect = 1;
            if (worldSheet) {
              pAspect = worldSheet.frameWidth / worldSheet.frameHeight;
            } else {
              const legacySprite = loadSprite(PLAYER_SPRITE_LEGACY.framePath(facing, 0));
              if (legacySprite) pAspect = legacySprite.width / legacySprite.height;
              else pAspect = 0; // no sprite loaded yet, skip punch-out
            }
            if (pAspect > 0) {
              const pH = (SPRITE_BASE_SIZE + 16) * playerPerspScale;
              const pW = pH * pAspect;
              const pX = playerScreenX + TILE_SIZE / 2 - pW / 2;
              const pY = playerScreenY + TILE_SIZE - pH;
              ctx.rect(pX, pY, pW, pH);
            }
          }

          ctx.clip("evenodd");
        }

        ctx.drawImage(
          backgroundImage,
          srcX, srcY, srcW, srcH,
          destX, destY, destW, destH
        );

        ctx.restore();
      }
    }

    // ========== AMBIENT LIGHT FLICKER ==========
    if (currentMap.flickerLight) {
      // Simulate firelight with layered sine waves for organic flicker
      const t = Date.now() / 1000;
      const flicker = 0.06 + 0.04 * Math.sin(t * 1.7) + 0.03 * Math.sin(t * 3.1) + 0.02 * Math.sin(t * 7.3);
      ctx.fillStyle = `rgba(0, 0, 0, ${flicker})`;
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    }

    // ========== DESERT COLLAPSE TIMER CHECK ==========
    if (
      desertTimerStart !== null &&
      !desertCollapsing &&
      !collapseTriggeredRef.current &&
      DESERT_EXTERIORS.includes(currentMap.id) &&
      !story.flags.desert_collapse_happened &&
      Date.now() - desertTimerStart >= DESERT_TIMER_MS
    ) {
      collapseTriggeredRef.current = true;
      collapseStartRef.current = Date.now();
      triggerDesertCollapse();
    }

    // ========== DESERT COLLAPSE DARKENING OVERLAY ==========
    if (desertCollapsing && collapseStartRef.current) {
      const elapsed = Date.now() - collapseStartRef.current;
      const progress = Math.min(elapsed / 3000, 1); // 0→1 over 3 seconds
      ctx.fillStyle = `rgba(0, 0, 0, ${progress * 0.85})`;
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    }

    // ========== COLLISION DEBUG OVERLAY ==========
    if (showCollisionDebug) {
      // Initialize overhead tiles from current map's overheadRegions (once per map)
      if (currentMap.id !== overheadInitMapRef.current) {
        overheadTilesRef.current.clear();
        if (currentMap.overheadRegions) {
          for (const region of currentMap.overheadRegions) {
            for (let ry = region.y; ry < region.y + region.height; ry++) {
              for (let rx = region.x; rx < region.x + region.width; rx++) {
                overheadTilesRef.current.add(`${rx},${ry}`);
              }
            }
          }
        }
        overheadInitMapRef.current = currentMap.id;
      }

      ctx.save();
      ctx.globalAlpha = 0.35;

      for (let ty = startTileY; ty < endTileY; ty++) {
        for (let tx = startTileX; tx < endTileX; tx++) {
          const sx = tx * TILE_SIZE - cameraX;
          const sy = ty * TILE_SIZE - cameraY;
          const walkable = currentMap.layers.collision[ty]?.[tx] ?? false;

          ctx.fillStyle = walkable ? "#00ff00" : "#ff0000";
          ctx.fillRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);

          // Overhead region overlay (blue tint on top)
          if (overheadTilesRef.current.has(`${tx},${ty}`)) {
            ctx.fillStyle = "#4488ff";
            ctx.fillRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          }
        }
      }

      // Grid lines
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      for (let ty = startTileY; ty <= endTileY; ty++) {
        const sy = ty * TILE_SIZE - cameraY;
        ctx.beginPath();
        ctx.moveTo(startTileX * TILE_SIZE - cameraX, sy);
        ctx.lineTo(endTileX * TILE_SIZE - cameraX, sy);
        ctx.stroke();
      }
      for (let tx = startTileX; tx <= endTileX; tx++) {
        const sx = tx * TILE_SIZE - cameraX;
        ctx.beginPath();
        ctx.moveTo(sx, startTileY * TILE_SIZE - cameraY);
        ctx.lineTo(sx, endTileY * TILE_SIZE - cameraY);
        ctx.stroke();
      }

      ctx.restore();

      // NPC positions (blue markers)
      const debugNpcs = getVisibleNpcs(currentMap.npcs, story.flags);
      debugNpcs.forEach((npc) => {
        const nx = npc.x * TILE_SIZE - cameraX;
        const ny = npc.y * TILE_SIZE - cameraY;
        ctx.fillStyle = "rgba(0, 100, 255, 0.6)";
        ctx.fillRect(nx + 4, ny + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        ctx.fillStyle = "#fff";
        ctx.font = "9px monospace";
        ctx.fillText(npc.id.slice(0, 8), nx + 2, ny + TILE_SIZE - 4);
      });

      // Event positions (yellow markers)
      currentMap.events.forEach((evt) => {
        const ex = evt.x * TILE_SIZE - cameraX;
        const ey = evt.y * TILE_SIZE - cameraY;
        const color = evt.type === "teleport" ? "rgba(255, 100, 0, 0.6)" : "rgba(255, 255, 0, 0.5)";
        ctx.fillStyle = color;
        ctx.fillRect(ex + 6, ey + 6, TILE_SIZE - 12, TILE_SIZE - 12);
        ctx.fillStyle = "#fff";
        ctx.font = "8px monospace";
        ctx.fillText(evt.type.slice(0, 4), ex + 4, ey + TILE_SIZE - 6);
      });

      // HUD: player tile coordinates + map info + paint mode
      const hudHeight = paintModeRef.current ? 96 : 52;
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(4, 4, 310, hudHeight);
      ctx.fillStyle = "#0f0";
      ctx.font = "12px monospace";
      ctx.fillText(`Tile: (${playerPosition.x}, ${playerPosition.y})`, 10, 20);
      ctx.fillText(`Map: ${currentMap.id} [${currentMap.width}x${currentMap.height}]`, 10, 36);
      ctx.fillText(`Grid px: ${currentMap.width * TILE_SIZE}x${currentMap.height * TILE_SIZE}`, 10, 52);
      if (paintModeRef.current) {
        const layerName = paintLayerRef.current === "collision" ? "COLLISION" : "OVERHEAD";
        const layerColor = paintLayerRef.current === "collision" ? "#FFD700" : "#4488ff";
        ctx.fillStyle = layerColor;
        ctx.fillText(`PAINT: ${layerName} [E=toggle, R=layer, X=export]`, 10, 68);
        ctx.fillStyle = "#aaa";
        ctx.fillText(`Click/drag to paint  |  Layer: ${layerName}`, 10, 82);
        if (paintLayerRef.current === "overhead") {
          ctx.fillStyle = "#4488ff";
          ctx.fillText(`Blue tiles = walk-behind (drawn over characters)`, 10, 96);
        }
      }

      // Quick-access legend (bottom-left)
      const keyToMapId: Record<string, string> = {
        "1": "havenwood", "2": "whispering_ruins", "3": "havenwood_market",
        "4": "havenwood_residential", "5": "havenwood_waterfront",
        "6": "havenwood_estate_road", "7": "havenwood_outskirts",
        "8": "lumina_estate", "9": "rusted_cog_tavern",
        "f": "bandit_camp", "g": "bandit_tent", "h": "bandit_cellar",
        "j": "hidden_laboratory", "k": "whispering_ruins_lower",
        "l": "stranger_tent", "n": "desert_plateau",
        "o": "palace_garden", "i": "havenwood_rooftops_west",
        "t": "havenwood_rooftops_east", "u": "havenwood_alley",
      };
      type LegendEntry = { text: string; key?: string; color?: string };
      const legendSections: { header: string; color: string; entries: LegendEntry[] }[] = [
        {
          header: "CONTROLS",
          color: "#88ccff",
          entries: [
            { text: "Arrows/WASD: Move" },
            { text: "Enter/Space: Interact" },
            { text: "Esc/M: Menu  P: Pause" },
          ],
        },
        {
          header: "TELEPORT",
          color: "#0f0",
          entries: [
            { text: "1: Village Square", key: "1" },
            { text: "2: Whispering Ruins", key: "2" },
            { text: "3: Market Row", key: "3" },
            { text: "4: Residential Lane", key: "4" },
            { text: "5: Waterfront", key: "5" },
            { text: "6: Estate Road", key: "6" },
            { text: "7: Outskirts", key: "7" },
            { text: "8: Lumina Estate", key: "8" },
            { text: "9: Rusted Cog Tavern", key: "9" },
            { text: "F: Bandit Camp", key: "f" },
            { text: "G: Bandit Tent", key: "g" },
            { text: "H: Bandit Cellar", key: "h" },
            { text: "J: Hidden Laboratory", key: "j" },
            { text: "K: Ruins Lower", key: "k" },
            { text: "L: Stranger Tent", key: "l" },
            { text: "N: Desert Plateau", key: "n" },
            { text: "O: Palace Garden", key: "o" },
            { text: "I: Rooftops West", key: "i" },
            { text: "T: Rooftops East", key: "t" },
            { text: "U: Alley", key: "u" },
          ],
        },
        {
          header: "DEBUG",
          color: "#FFD700",
          entries: [
            { text: "`: Admin Mode" },
            { text: "0: Collision Debug" },
            { text: "B: Test Battle" },
            { text: "E: Paint  R: Layer  X: Export" },
          ],
        },
      ];
      const lineH = 13;
      let totalLines = 0;
      for (const section of legendSections) {
        totalLines += 1; // header
        totalLines += section.entries.length;
      }
      const legendH = totalLines * lineH + (legendSections.length - 1) * 4 + 10;
      const legendY = canvas.height - legendH - 4;
      const legendW = 230;
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(4, legendY, legendW, legendH);
      ctx.font = "11px monospace";
      ctx.textAlign = "left";
      let drawY2 = legendY + 12;
      for (let si = 0; si < legendSections.length; si++) {
        const section = legendSections[si];
        // Section header
        ctx.fillStyle = section.color;
        ctx.font = "bold 11px monospace";
        ctx.fillText(`-- ${section.header} --`, 10, drawY2);
        ctx.font = "11px monospace";
        drawY2 += lineH;
        // Entries
        for (const entry of section.entries) {
          if (entry.key && keyToMapId[entry.key] === currentMap.id) {
            ctx.fillStyle = "#FFD700";
          } else {
            ctx.fillStyle = section.color;
          }
          ctx.fillText(entry.text, 14, drawY2);
          drawY2 += lineH;
        }
        if (si < legendSections.length - 1) drawY2 += 4; // gap between sections
      }
    }
  }, [currentMap, playerPosition, party, openedChests, getQuestStatus, hasActiveQuest, story, quests, showCollisionDebug, desertTimerStart, desertCollapsing, triggerDesertCollapse, gardenAwakeningPhase, setGardenAwakeningPhase]);

  // Clear stale null entries and preload sprites on mount
  useEffect(() => {
    // Flush any cached failures so they retry with fresh file checks
    for (const [key, val] of spriteCache.entries()) {
      if (val === null) spriteCache.delete(key);
    }
    for (const [key, val] of worldSheetCache.entries()) {
      if (val === null) worldSheetCache.delete(key);
    }

    // Preload map background if present, otherwise preload tile textures
    if (currentMap?.background) {
      loadSprite(currentMap.background);
    } else {
      loadSprite("/tiles/grass_seamless.png");
      loadSprite("/tiles/path_dirt_seamless.png");
      loadSprite("/tiles/water_seamless.png");
      loadSprite("/tiles/stone_wall_seamless.png");
      loadSprite("/tiles/wood_floor_seamless.png");
    }

    // Preload player world sprite sheet (preferred) or individual frame files (fallback)
    const activeCharId = "kai";
    const worldConfig = WORLD_SPRITE_CONFIGS[activeCharId];
    if (worldConfig) {
      loadWorldSheet(worldConfig);
    }
    // Always preload legacy frames as fallback
    for (const [dir, config] of Object.entries(PLAYER_SPRITE_LEGACY.directions)) {
      for (let i = 0; i < config.frames; i++) {
        loadSprite(PLAYER_SPRITE_LEGACY.framePath(dir, i));
      }
    }

    // Reset collapse/awakening refs and NPC wander states on map change
    collapseTriggeredRef.current = false;
    collapseStartRef.current = null;
    gardenPanStartRef.current = null;
    npcWanderStates.clear();
    if (currentMap && (DESERT_EXTERIORS.includes(currentMap.id) || currentMap.id === "palace_garden")) {
      loadSprite("/sprites/characters/kai_lying.png");
    }

    // Preload NPC sprite sheets for current map
    if (currentMap) {
      for (const npc of currentMap.npcs) {
        const npcConfig = NPC_SPRITE_CONFIGS[npc.id];
        if (npcConfig) {
          loadWorldSheet(npcConfig);
        } else if (npc.sprite) {
          loadSprite(npc.sprite);
        }
      }
    }
  }, [currentMap]);

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

  // === Collision paint editor: mouse → tile conversion ===
  const screenToTile = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentMap) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX + cameraRef.current.x;
    const py = (e.clientY - rect.top) * scaleY + cameraRef.current.y;
    const tx = Math.floor(px / tileSizeRef.current);
    const ty = Math.floor(py / tileSizeRef.current);
    if (tx < 0 || ty < 0 || tx >= currentMap.width || ty >= currentMap.height) return null;
    return { tx, ty };
  }, [currentMap]);

  const paintTile = useCallback((tx: number, ty: number) => {
    if (!currentMap) return;
    if (paintLayerRef.current === "collision") {
      currentMap.layers.collision[ty][tx] = paintValueRef.current;
    } else {
      // Overhead layer painting
      const key = `${tx},${ty}`;
      if (paintValueRef.current) {
        overheadTilesRef.current.add(key);
      } else {
        overheadTilesRef.current.delete(key);
      }
      // Rebuild overheadRegions from the tile set for live preview
      currentMap.overheadRegions = buildOverheadRegions(overheadTilesRef.current);
    }
  }, [currentMap]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!paintModeRef.current || !showCollisionDebug) return;
    const tile = screenToTile(e);
    if (!tile) return;
    // First click sets paint value: toggle the clicked tile
    if (paintLayerRef.current === "collision") {
      const current = currentMap?.layers.collision[tile.ty]?.[tile.tx] ?? false;
      paintValueRef.current = !current;
    } else {
      const key = `${tile.tx},${tile.ty}`;
      paintValueRef.current = !overheadTilesRef.current.has(key);
    }
    paintTile(tile.tx, tile.ty);
    isPaintingRef.current = true;
  }, [screenToTile, paintTile, showCollisionDebug, currentMap]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPaintingRef.current || !paintModeRef.current) return;
    const tile = screenToTile(e);
    if (!tile) return;
    paintTile(tile.tx, tile.ty);
  }, [screenToTile, paintTile]);

  const handleCanvasMouseUp = useCallback(() => {
    isPaintingRef.current = false;
  }, []);

  // === Collision paint editor: keyboard shortcuts (E=toggle paint, R=switch layer, X=export) ===
  useEffect(() => {
    const handlePaintKeys = (e: KeyboardEvent) => {
      if (e.key === "e" || e.key === "E") {
        if (showCollisionDebug) {
          paintModeRef.current = !paintModeRef.current;
          isPaintingRef.current = false;
          const canvas = canvasRef.current;
          if (canvas) canvas.style.cursor = paintModeRef.current ? 'crosshair' : '';
        }
      }
      // R: toggle between collision and overhead paint layers
      if (e.key === "r" || e.key === "R") {
        if (showCollisionDebug && paintModeRef.current) {
          paintLayerRef.current = paintLayerRef.current === "collision" ? "overhead" : "collision";
          isPaintingRef.current = false;
        }
      }
      if ((e.key === "x" || e.key === "X") && showCollisionDebug && currentMap) {
        const lines: string[] = [];
        lines.push(`// Export for ${currentMap.id} (${currentMap.width}x${currentMap.height}, ${currentMap.tileSize}px tiles)`);
        lines.push(`// Generated by collision paint editor`);

        // === COLLISION EXPORT ===
        lines.push(``);
        lines.push(`// === COLLISION LAYER ===`);

        type Range = { xMin: number; xMax: number };
        const rowRanges: (Range[] | null)[] = [];

        for (let y = 0; y < currentMap.height; y++) {
          const ranges: Range[] = [];
          let inRange = false;
          let xMin = 0;
          for (let x = 0; x < currentMap.width; x++) {
            const w = currentMap.layers.collision[y][x];
            if (w && !inRange) {
              xMin = x;
              inRange = true;
            } else if (!w && inRange) {
              ranges.push({ xMin, xMax: x - 1 });
              inRange = false;
            }
          }
          if (inRange) ranges.push({ xMin, xMax: currentMap.width - 1 });
          rowRanges.push(ranges.length > 0 ? ranges : null);
        }

        let y = 0;
        while (y < currentMap.height) {
          const ranges = rowRanges[y];
          if (!ranges) { y++; continue; }

          let yEnd = y;
          while (yEnd + 1 < currentMap.height) {
            const next = rowRanges[yEnd + 1];
            if (!next || next.length !== ranges.length) break;
            if (!ranges.every((r, i) => r.xMin === next[i].xMin && r.xMax === next[i].xMax)) break;
            yEnd++;
          }

          const yCondition = y === yEnd
            ? `y === ${y} `
            : `y >= ${y} && y <= ${yEnd}`;

          for (const r of ranges) {
            const xCondition = r.xMin === r.xMax
              ? `x === ${r.xMin}`
              : `x >= ${r.xMin} && x <= ${r.xMax}`;
            lines.push(`      if (${yCondition} && ${xCondition}) walkable = true;`);
          }

          y = yEnd + 1;
        }

        // ASCII grid
        lines.push(``);
        lines.push(`// ASCII grid (. = walkable, # = blocked):`);
        const xTens = Array.from({ length: currentMap.width }, (_, i) => Math.floor(i / 10)).join('');
        const xOnes = Array.from({ length: currentMap.width }, (_, i) => i % 10).join('');
        lines.push(`// x_tens:${xTens}`);
        lines.push(`// x_ones:${xOnes}`);
        for (let row = 0; row < currentMap.height; row++) {
          const rowStr = currentMap.layers.collision[row].map((w: boolean) => w ? '.' : '#').join('');
          lines.push(`// y=${String(row).padStart(2, '0')}  ${rowStr}`);
        }

        // === OVERHEAD REGIONS EXPORT ===
        const overheadRegions = buildOverheadRegions(overheadTilesRef.current);
        if (overheadRegions.length > 0) {
          lines.push(``);
          lines.push(`// === OVERHEAD REGIONS (walk-behind) ===`);
          lines.push(`const OVERHEAD_REGIONS: { x: number; y: number; width: number; height: number; baseY?: number }[] = [`);
          for (const r of overheadRegions) {
            lines.push(`  { x: ${r.x}, y: ${r.y}, width: ${r.width}, height: ${r.height}, baseY: ${r.baseY} },`);
          }
          lines.push(`];`);
        }

        const output = lines.join('\n');
        console.log(output);

        navigator.clipboard?.writeText(output).then(() => {
          console.log('%c[Paint Editor] Copied to clipboard!', 'color: #0f0; font-weight: bold');
        }).catch(() => {
          console.log('%c[Paint Editor] Output logged above (clipboard unavailable)', 'color: #ff0');
        });
      }
    };
    window.addEventListener("keydown", handlePaintKeys);
    return () => window.removeEventListener("keydown", handlePaintKeys);
  }, [showCollisionDebug, currentMap]);

  return (
    <div className="flex items-center justify-center w-full h-full bg-black">
      <canvas
        ref={canvasRef}
        width={VIEWPORT_WIDTH}
        height={VIEWPORT_HEIGHT}
        className="border border-gray-800"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        style={{ cursor: 'default' }}
      />
    </div>
  );
}
