/**
 * Battle background configuration
 * Maps map IDs to their corresponding battle background images
 */

export interface BattleBackgroundConfig {
  image: string;
  fallbackColor: string;
  overlayOpacity: number;
}

export const BATTLE_BACKGROUNDS: Record<string, BattleBackgroundConfig> = {
  // Havenwood Village - forest encounters
  havenwood: {
    image: "/assets/battle/forest_bg.png",
    fallbackColor: "#1a2e1a", // Dark forest green
    overlayOpacity: 0.3,
  },
  // Whispering Ruins - ancient ruins encounters
  whispering_ruins: {
    image: "/assets/battle/ruins_bg.png",
    fallbackColor: "#1a1a2e", // Dark blue-gray
    overlayOpacity: 0.25,
  },
};

// Default background for unknown maps
export const DEFAULT_BATTLE_BACKGROUND: BattleBackgroundConfig = {
  image: "",
  fallbackColor: "#0a0a0a",
  overlayOpacity: 0.3,
};

/**
 * Get the battle background configuration for a given map
 */
export function getBattleBackground(mapId: string | undefined): BattleBackgroundConfig {
  if (!mapId) return DEFAULT_BATTLE_BACKGROUND;
  return BATTLE_BACKGROUNDS[mapId] ?? DEFAULT_BATTLE_BACKGROUND;
}
