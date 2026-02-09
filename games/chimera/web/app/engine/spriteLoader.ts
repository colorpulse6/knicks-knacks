// Sprite Loader - Handles sprite sheet loading, caching, and frame extraction

import type { SpriteSheetConfig, AnimationFrame } from "../types/animation";

// Sprite sheet cache
const spriteCache = new Map<string, HTMLImageElement>();
const loadingPromises = new Map<string, Promise<HTMLImageElement>>();

/**
 * Load a sprite sheet image
 */
export async function loadSpriteSheet(src: string): Promise<HTMLImageElement> {
  // Return cached image if available
  if (spriteCache.has(src)) {
    return spriteCache.get(src)!;
  }

  // Return existing loading promise if in progress
  if (loadingPromises.has(src)) {
    return loadingPromises.get(src)!;
  }

  // Create loading promise
  const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      spriteCache.set(src, img);
      loadingPromises.delete(src);
      resolve(img);
    };
    img.onerror = () => {
      loadingPromises.delete(src);
      reject(new Error(`Failed to load sprite: ${src}`));
    };
    img.src = src;
  });

  loadingPromises.set(src, loadPromise);
  return loadPromise;
}

/**
 * Check if a sprite sheet is loaded
 */
export function isSpriteLoaded(src: string): boolean {
  return spriteCache.has(src);
}

/**
 * Get a loaded sprite sheet (returns null if not loaded)
 */
export function getSprite(src: string): HTMLImageElement | null {
  return spriteCache.get(src) ?? null;
}

/**
 * Preload multiple sprite sheets
 */
export async function preloadSprites(sources: string[]): Promise<void> {
  await Promise.all(sources.map(loadSpriteSheet).map(p => p.catch(() => null)));
}

/**
 * Get frame coordinates from a sprite sheet config
 */
export function getFrameRect(
  config: SpriteSheetConfig,
  animationName: string,
  frameIndex: number
): { x: number; y: number; width: number; height: number } | null {
  const animation = config.animations[animationName];
  if (!animation) return null;

  const startFrame = animation.startFrame ?? 0;

  let x: number;
  let y: number;

  if (animation.alternateRows) {
    // For breathing animation: cycle through rows at the same column
    const rowIndex = frameIndex % config.rows;
    x = startFrame * config.frameWidth;
    y = rowIndex * config.frameHeight;
  } else {
    // Normal animation: cycle through columns on the same row
    const frame = (startFrame + (frameIndex % animation.frameCount));
    x = frame * config.frameWidth;
    y = animation.row * config.frameHeight;
  }

  return {
    x,
    y,
    width: config.frameWidth,
    height: config.frameHeight,
  };
}

/**
 * Get all frames for an animation
 */
export function getAnimationFrames(
  config: SpriteSheetConfig,
  animationName: string
): AnimationFrame[] {
  const animation = config.animations[animationName];
  if (!animation) return [];

  const frames: AnimationFrame[] = [];
  for (let i = 0; i < animation.frameCount; i++) {
    frames.push({
      x: i * config.frameWidth,
      y: animation.row * config.frameHeight,
      width: config.frameWidth,
      height: config.frameHeight,
      duration: animation.frameDuration,
    });
  }

  return frames;
}

// Cache for processed sprites with backgrounds removed
const processedSpriteCache = new Map<string, HTMLCanvasElement>();

/**
 * Check if a pixel is part of a checkered transparency pattern or solid background
 * Common patterns: gray (#C0C0C0 / 192,192,192) and white (#FFFFFF)
 * or gray (#808080 / 128,128,128) and lighter gray
 */
function isBackgroundPixel(r: number, g: number, b: number): boolean {
  // Check for pure gray (equal R, G, B)
  const isGray = Math.abs(r - g) < 8 && Math.abs(g - b) < 8 && Math.abs(r - b) < 8;

  if (!isGray) return false;

  const grayValue = (r + g + b) / 3;

  // Very light gray to white (common transparency indicator)
  if (grayValue >= 180 && grayValue <= 255) return true;

  // Medium gray (common in checkerboards)
  if (grayValue >= 120 && grayValue <= 170) return true;

  return false;
}

/**
 * Process a sprite to remove backgrounds (white, black, and checkerboard patterns)
 */
function getProcessedSprite(
  sprite: HTMLImageElement,
  frameRect: { x: number; y: number; width: number; height: number }
): HTMLCanvasElement {
  const cacheKey = `${sprite.src}_${frameRect.x}_${frameRect.y}`;

  if (processedSpriteCache.has(cacheKey)) {
    return processedSpriteCache.get(cacheKey)!;
  }

  // Create offscreen canvas for this frame
  const offscreen = document.createElement("canvas");
  offscreen.width = frameRect.width;
  offscreen.height = frameRect.height;
  const offCtx = offscreen.getContext("2d")!;

  // Draw the frame
  offCtx.drawImage(
    sprite,
    frameRect.x,
    frameRect.y,
    frameRect.width,
    frameRect.height,
    0,
    0,
    frameRect.width,
    frameRect.height
  );

  // Get image data and make background pixels transparent
  const imageData = offCtx.getImageData(0, 0, frameRect.width, frameRect.height);
  const data = imageData.data;
  const width = frameRect.width;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check if pixel is white or very light (threshold: 240+)
    if (r > 240 && g > 240 && b > 240) {
      data[i + 3] = 0; // Make fully transparent
    }
    // Check for gray background / checkerboard transparency pattern
    else if (isBackgroundPixel(r, g, b)) {
      // Check neighbors to confirm it's a background, not actual gray content
      const pixelIndex = i / 4;
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);

      // Sample a few neighbors to see if they also match the pattern
      let checkerCount = 0;
      const neighbors = [
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
      ];

      for (const { dx, dy } of neighbors) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < frameRect.height) {
          const ni = (ny * width + nx) * 4;
          const nr = data[ni];
          const ng = data[ni + 1];
          const nb = data[ni + 2];

          // Neighbor is white or another checkerboard color
          if ((nr > 240 && ng > 240 && nb > 240) || isBackgroundPixel(nr, ng, nb)) {
            checkerCount++;
          }
        }
      }

      // If most neighbors are also background colors, this is likely background
      if (checkerCount >= 2) {
        data[i + 3] = 0; // Make fully transparent
      }
    }
    // Fade near-white pixels (threshold: 220-240)
    else if (r > 220 && g > 220 && b > 220) {
      const avg = (r + g + b) / 3;
      const fadeAmount = (avg - 220) / 35; // 0 to 1
      data[i + 3] = Math.floor(data[i + 3] * (1 - fadeAmount));
    }
    // Check if pixel is black or very dark (threshold: 15-)
    else if (r < 15 && g < 15 && b < 15) {
      data[i + 3] = 0; // Make fully transparent
    }
    // Fade near-black pixels (threshold: 15-35)
    else if (r < 35 && g < 35 && b < 35) {
      const avg = (r + g + b) / 3;
      const fadeAmount = 1 - (avg / 35); // 1 to 0
      data[i + 3] = Math.floor(data[i + 3] * (1 - fadeAmount));
    }
  }

  offCtx.putImageData(imageData, 0, 0);
  processedSpriteCache.set(cacheKey, offscreen);

  return offscreen;
}

/**
 * Draw a sprite frame to canvas
 */
export function drawSpriteFrame(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLImageElement,
  frameRect: { x: number; y: number; width: number; height: number },
  destX: number,
  destY: number,
  scale: number = 1,
  flipX: boolean = false,
  opacity: number = 1,
  removeWhiteBackground: boolean = true
): void {
  ctx.save();

  ctx.globalAlpha = opacity;

  const destWidth = frameRect.width * scale;
  const destHeight = frameRect.height * scale;

  if (flipX) {
    ctx.translate(destX + destWidth / 2, destY);
    ctx.scale(-1, 1);
    ctx.translate(-destWidth / 2, 0);
  } else {
    ctx.translate(destX, destY);
  }

  if (removeWhiteBackground) {
    // Use processed sprite with white removed
    const processed = getProcessedSprite(sprite, frameRect);
    ctx.drawImage(processed, 0, 0, destWidth, destHeight);
  } else {
    ctx.drawImage(
      sprite,
      frameRect.x,
      frameRect.y,
      frameRect.width,
      frameRect.height,
      0,
      0,
      destWidth,
      destHeight
    );
  }

  ctx.restore();
}

/**
 * Draw a placeholder rectangle when sprite not available
 */
export function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  label?: string
): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  if (label) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";

    // Truncate label if it's too wide for the box
    const maxWidth = width - 8; // 4px padding on each side
    let displayLabel = label;
    let textWidth = ctx.measureText(displayLabel).width;

    if (textWidth > maxWidth) {
      // Try to fit by truncating with ellipsis
      while (textWidth > maxWidth && displayLabel.length > 3) {
        displayLabel = displayLabel.slice(0, -1);
        textWidth = ctx.measureText(displayLabel + "...").width;
      }
      displayLabel += "...";
    }

    ctx.fillText(displayLabel, x + width / 2, y + height / 2 + 4);
  }
}

// Default sprite sheet configurations

export const CHARACTER_SPRITE_CONFIG: Omit<SpriteSheetConfig, "src"> = {
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
  },
};

export const ENEMY_SPRITE_CONFIG: Omit<SpriteSheetConfig, "src"> = {
  frameWidth: 64,
  frameHeight: 64,
  columns: 4,
  rows: 2,
  animations: {
    idle: { row: 0, frameCount: 4, frameDuration: 300, loop: true },
    attack: { row: 1, frameCount: 2, frameDuration: 150, loop: false },
    hurt: { row: 1, frameCount: 1, frameDuration: 200, loop: false },
    death: { row: 1, frameCount: 1, frameDuration: 500, loop: false },
  },
};

export const FIELD_SPRITE_CONFIG: Omit<SpriteSheetConfig, "src"> = {
  frameWidth: 32,
  frameHeight: 32,
  columns: 4,
  rows: 4,
  animations: {
    walk_down: { row: 0, frameCount: 4, frameDuration: 150, loop: true },
    walk_left: { row: 1, frameCount: 4, frameDuration: 150, loop: true },
    walk_right: { row: 2, frameCount: 4, frameDuration: 150, loop: true },
    walk_up: { row: 3, frameCount: 4, frameDuration: 150, loop: true },
    idle_down: { row: 0, frameCount: 1, frameDuration: 1000, loop: true },
    idle_left: { row: 1, frameCount: 1, frameDuration: 1000, loop: true },
    idle_right: { row: 2, frameCount: 1, frameDuration: 1000, loop: true },
    idle_up: { row: 3, frameCount: 1, frameDuration: 1000, loop: true },
  },
};

/**
 * Animation frame calculator for time-based animation
 */
export function calculateCurrentFrame(
  startTime: number,
  frameDuration: number,
  frameCount: number,
  loop: boolean
): number {
  const elapsed = Date.now() - startTime;
  const totalDuration = frameDuration * frameCount;

  if (loop) {
    return Math.floor((elapsed % totalDuration) / frameDuration);
  } else {
    const frame = Math.floor(elapsed / frameDuration);
    return Math.min(frame, frameCount - 1);
  }
}

/**
 * Clear sprite cache (useful for hot reloading)
 */
export function clearSpriteCache(): void {
  spriteCache.clear();
  loadingPromises.clear();
}
