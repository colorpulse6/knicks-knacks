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

// Boss-specific battle backgrounds
export const BOSS_BATTLE_BACKGROUNDS: Record<string, BattleBackgroundConfig> = {
  // Bandit Chief Vorn - inside his tent with futuristic artifacts
  bandit_chief_vorn: {
    image: "/assets/battle/vorn_tent_bg.png",
    fallbackColor: "#1a1510", // Dark tent interior
    overlayOpacity: 0.2,
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
 * @param mapId - The current map ID
 * @param bossId - Optional boss enemy ID for boss-specific backgrounds
 */
export function getBattleBackground(
  mapId: string | undefined,
  bossId?: string
): BattleBackgroundConfig {
  // Check for boss-specific background first
  if (bossId && BOSS_BATTLE_BACKGROUNDS[bossId]) {
    return BOSS_BATTLE_BACKGROUNDS[bossId];
  }

  if (!mapId) return DEFAULT_BATTLE_BACKGROUND;
  return BATTLE_BACKGROUNDS[mapId] ?? DEFAULT_BATTLE_BACKGROUND;
}
