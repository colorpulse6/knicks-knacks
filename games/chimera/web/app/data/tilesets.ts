/**
 * Tileset Definitions for Map Rendering
 *
 * Maps tile indices to sprite paths. Supports:
 * - Single tile: string path
 * - Variants: array of paths (randomly selected per tile position)
 * - Animated: array of paths (cycled through for animation)
 */

export type TilesetEntry = string | string[];

export interface Tileset {
  name: string;
  tiles: Record<number, TilesetEntry>;
  animated?: number[]; // Tile indices that should animate (cycle through array)
}

/**
 * Outdoor tileset - villages, fields, forests
 * Tile indices: 0=grass, 1=path, 2=water, 3=wall, 4=floor, 5=door
 */
export const OUTDOOR_TILESET: Tileset = {
  name: "outdoor",
  tiles: {
    0: "/tiles/grass_seamless.png", // Seamless grass (rendered via pattern fill in MapView)
    1: "/tiles/path_dirt_seamless.png", // Seamless dirt path (rendered via pattern fill in MapView)
    2: "/tiles/water_seamless.png", // Seamless water (rendered via scrolling pattern fill in MapView)
    3: "/tiles/stone_wall_seamless.png", // Seamless stone wall (rendered via pattern fill in MapView)
    4: "/tiles/wood_floor_seamless.png", // Seamless wood floor (rendered via pattern fill in MapView)
    5: "/tiles/wood_floor_seamless.png", // Door (uses seamless wood floor pattern)
  },
  animated: [2], // Water tiles animate
};

/**
 * Cave/dungeon tileset
 */
export const CAVE_TILESET: Tileset = {
  name: "cave",
  tiles: {
    0: "/tiles/cave_floor.png", // Cave floor
    1: "/tiles/path_dirt.png", // Path through cave
    2: ["/tiles/water_01.png", "/tiles/water_02.png", "/tiles/water_03.png"], // Underground water
    3: "/tiles/cave_wall.png", // Cave wall
    4: "/tiles/stone_floor.png", // Stone floor area
    5: "/tiles/cave_floor.png", // Door area
  },
  animated: [2],
};

/**
 * Interior tileset - taverns, houses, shops
 */
export const INTERIOR_TILESET: Tileset = {
  name: "interior",
  tiles: {
    0: "/tiles/wood_floor.png", // Wood floor
    1: "/tiles/path_cobble.png", // Cobblestone
    2: ["/tiles/water_01.png", "/tiles/water_02.png", "/tiles/water_03.png"], // Water feature
    3: "/tiles/stone_wall.png", // Wall
    4: "/tiles/wood_floor.png", // Floor
    5: "/tiles/wood_floor.png", // Door
  },
  animated: [2],
};

/**
 * Ruins tileset - ancient temples, System facilities
 */
export const RUINS_TILESET: Tileset = {
  name: "ruins",
  tiles: {
    0: "/tiles/ruins_floor.png", // Ancient stone floor
    1: "/tiles/path_cobble.png", // Worn path
    2: ["/tiles/water_01.png", "/tiles/water_02.png", "/tiles/water_03.png"], // Stagnant water
    3: "/tiles/stone_wall.png", // Crumbling wall
    4: "/tiles/ruins_floor.png", // Floor
    5: "/tiles/ruins_floor.png", // Door area
  },
  animated: [2],
};

/**
 * Glitched/corrupted tileset - System breakdown areas
 */
export const GLITCH_TILESET: Tileset = {
  name: "glitch",
  tiles: {
    0: "/tiles/glitch_floor.png", // Corrupted floor
    1: "/tiles/glitch_floor.png", // Corrupted path
    2: ["/tiles/water_01.png", "/tiles/water_02.png", "/tiles/water_03.png"], // Glitched water
    3: "/tiles/stone_wall.png", // Wall
    4: "/tiles/glitch_floor.png", // Floor
    5: "/tiles/glitch_floor.png", // Door
  },
  animated: [2],
};

/**
 * Get tileset by name
 */
export function getTileset(name: string): Tileset {
  const tilesets: Record<string, Tileset> = {
    outdoor: OUTDOOR_TILESET,
    cave: CAVE_TILESET,
    interior: INTERIOR_TILESET,
    ruins: RUINS_TILESET,
    glitch: GLITCH_TILESET,
  };
  return tilesets[name] ?? OUTDOOR_TILESET;
}

/**
 * Get the tile sprite path for a given tile index
 * Handles variants (picks based on position for consistency) and animation
 *
 * @param tileIndex - The tile type index (0-5)
 * @param tileset - The tileset to use
 * @param x - Tile x position (for variant selection)
 * @param y - Tile y position (for variant selection)
 * @param animationFrame - Current animation frame (for animated tiles)
 */
export function getTilePath(
  tileIndex: number,
  tileset: Tileset,
  x: number,
  y: number,
  animationFrame: number = 0
): string | null {
  const entry = tileset.tiles[tileIndex];
  if (!entry) return null;

  // Single tile
  if (typeof entry === "string") {
    return entry;
  }

  // Array of tiles
  if (Array.isArray(entry)) {
    // Check if this tile type animates
    if (tileset.animated?.includes(tileIndex)) {
      // Cycle through frames for animation
      return entry[animationFrame % entry.length];
    } else {
      // Pick variant in organic clusters (~4×4 tiles) instead of per-tile
      const clusterSize = 4;
      const cx = Math.floor(x / clusterSize);
      const cy = Math.floor(y / clusterSize);
      // Large primes create a non-obvious repeating pattern
      const h = (cx * 374761393 + cy * 668265263 + (cx ^ cy) * 39916801);
      const hash = ((h >>> 0) % entry.length);
      return entry[hash];
    }
  }

  return null;
}
