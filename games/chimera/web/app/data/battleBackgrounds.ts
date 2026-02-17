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
  // Bandit Camp - outdoor palisade encampment at dusk
  bandit_camp: {
    image: "/assets/battle/bandit_camp_bg.png",
    fallbackColor: "#2a1e14", // Dark earthy brown
    overlayOpacity: 0.2,
  },
  // Whispering Ruins Lower - deep ancient tech dungeon
  whispering_ruins_lower: {
    image: "/assets/battle/ruins_bg.png",
    fallbackColor: "#1a1a2e", // Deep dark blue
    overlayOpacity: 0.2,
  },
  // Hidden Laboratory - sterile sci-fi facility
  hidden_laboratory: {
    image: "/assets/battle/ruins_bg.png",
    fallbackColor: "#0a0a1a", // Deep cold blue-black
    overlayOpacity: 0.15,
  },
  // Havenwood Outskirts - wilderness clearing at golden hour
  havenwood_outskirts: {
    image: "/assets/battle/outskirts_bg.png",
    fallbackColor: "#2a3520", // Dark olive green
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
