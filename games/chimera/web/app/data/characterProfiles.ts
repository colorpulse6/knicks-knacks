// Character profile data - backstories, quotes, and lore details

export interface CharacterProfile {
  id: string;
  title: string;           // Character title/epithet
  quote: string;           // Signature quote
  backstory: string;       // Main backstory text
  traits: string[];        // Personality traits
  secrets: string[];       // Hidden lore (revealed as story progresses)
  illustration: string;    // Path to full illustration
  systemDesignation?: string;  // AI designation (sci-fi layer)
  element?: string;        // Elemental affinity
  hometown?: string;       // Place of origin
}

export const CHARACTER_PROFILES: Record<string, CharacterProfile> = {
  kai: {
    id: "kai",
    title: "The Anomaly",
    quote: "These cracks in reality... they're not flaws. They're windows.",
    backstory: `Kai arrived in Havenwood with nothing but fragmented memories and a burning need to find his missing sister, Elara. The villagers know him as a capable young swordsman, quick to help but slow to trust.

What Kai himself struggles to understand are his abilities—moments when reality seems to flicker around him, when he glimpses patterns and "seams" that others cannot see. These visions come unbidden, like static interference in an otherwise clear picture.

His search for Elara has led him to the Whispering Ruins, where ancient secrets stir. What he discovers there may shatter everything he believes about himself and the world around him.`,
    traits: [
      "Determined",
      "Questioning",
      "Direct",
      "Protective",
      "Anomalous"
    ],
    secrets: [
      "Designated as Anomaly KAI_7.34 in System records",
      "Unlinked to the Lumina genetic control protocols",
      "Glitch manifestation indicates reality perception beyond normal parameters",
      "Sister Elara disappeared under similar anomalous circumstances"
    ],
    illustration: "/sprites/characters/illustrations/kai_1.png",
    systemDesignation: "ANOMALY_KAI_7.34",
    element: "Temporal",
    hometown: "Unknown (Memories fragmented)"
  },

  lyra: {
    id: "lyra",
    title: "Lady of the Lumina",
    quote: "Fortune favors those who refuse to surrender to fate.",
    backstory: `Lady Lyra Lumina descends from one of the great houses—keepers of ancient knowledge passed down through generations. Yet she has always felt out of place among the nobility, more drawn to dusty archives than courtly intrigue.

Her "unusual luck" is whispered about in noble circles. Dice fall her way. Accidents miss her by inches. Some call it blessing; others, suspicion. Lyra herself wonders if luck is truly random, or if something watches over her.

When she encountered Kai near the Whispering Ruins, she sensed something familiar—a kindred spirit touched by forces beyond the ordinary. Against her family's wishes, she chose to join his quest, seeking answers to questions she's carried all her life.`,
    traits: [
      "Curious",
      "Diplomatic",
      "Unusually Lucky",
      "Scholarly",
      "Compassionate"
    ],
    secrets: [
      "Bears the Lumina Mark—a genetic imprint of the Prime Code Lineage",
      "Her luck may be a subtle System intervention or protection protocol",
      "Family archives contain forbidden knowledge about the world's true nature",
      "Drawn to anomalies, possibly due to latent code resonance"
    ],
    illustration: "/sprites/characters/illustrations/lyra.png",
    systemDesignation: "LUMINA_SCION_L7.19",
    element: "Fortune",
    hometown: "Lumina Estate, Western Reaches"
  }
};

export function getCharacterProfile(id: string): CharacterProfile | undefined {
  return CHARACTER_PROFILES[id];
}

// Get secrets based on system awareness level
export function getRevealedSecrets(
  profile: CharacterProfile,
  systemAwareness: number
): string[] {
  // Each secret requires higher awareness to unlock
  const thresholds = [15, 35, 60, 85];
  return profile.secrets.filter((_, index) =>
    systemAwareness >= thresholds[index]
  );
}
