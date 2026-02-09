// Herbalist Mira's Dialogue - The Herbalist's Request Quest

import type { DialogueNode } from "../../types";

/**
 * Get Mira's dialogue based on current quest state
 * This function should be called from the game store when interacting with Mira
 */
export function getMiraDialogue(
  questStatus: "not_started" | "active" | "completed" | "failed",
  hasEnoughFlowers: boolean,
  flowerCount: number
): DialogueNode {
  // Quest not started - offer the quest
  if (questStatus === "not_started") {
    return MIRA_QUEST_INTRO;
  }

  // Quest active but doesn't have flowers yet
  if (questStatus === "active" && !hasEnoughFlowers) {
    return getMiraWaitingDialogue(flowerCount);
  }

  // Quest active and has all flowers - turn in
  if (questStatus === "active" && hasEnoughFlowers) {
    return MIRA_TURN_IN;
  }

  // Quest completed
  if (questStatus === "completed") {
    return MIRA_POST_QUEST;
  }

  // Default fallback
  return MIRA_DEFAULT;
}

// Initial dialogue - quest not started
const MIRA_QUEST_INTRO: DialogueNode = {
  id: "mira_intro",
  speaker: "Herbalist Mira",
  text: "Ah, a traveler! Blessings upon you. I am Mira, the village herbalist. Forgive my worried expression—I've run terribly low on Moonpetal Flowers for my healing salves.",
  portrait: "herbalist_mira",
  choices: [
    {
      text: "I could help gather some flowers.",
      nextNodeId: "mira_quest_offer",
    },
    {
      text: "That sounds like your problem.",
      nextNodeId: "mira_decline",
    },
  ],
};

// Quest offer details
export const MIRA_QUEST_OFFER: DialogueNode = {
  id: "mira_quest_offer",
  speaker: "Herbalist Mira",
  text: "You would? Bless you! I need three Moonpetal Flowers—they grow in the shadowed corners around the village. But do be careful. Lately, the forest has grown... strange. Patches where the air shimmers and things don't quite look right.",
  portrait: "herbalist_mira",
  choices: [
    {
      text: "Strange how? What have you seen?",
      nextNodeId: "mira_glitch_hint",
    },
    {
      text: "I'll bring you those flowers.",
      nextNodeId: "mira_quest_accept",
    },
  ],
};

// Glitch hint - foreshadowing
export const MIRA_GLITCH_HINT: DialogueNode = {
  id: "mira_glitch_hint",
  speaker: "Herbalist Mira",
  text: "It's hard to describe. The edges of things... ripple. Like looking through water. Some folk have seen trees that weren't there a moment before, or heard sounds from nowhere. Old superstitions say the veil between worlds grows thin in such places. But I'm a woman of herbs and humors—I deal in what I can touch.",
  portrait: "herbalist_mira",
  choices: [
    {
      text: "Interesting. I'll keep my eyes open.",
      nextNodeId: "mira_quest_accept",
    },
  ],
};

// Quest accepted
export const MIRA_QUEST_ACCEPT: DialogueNode = {
  id: "mira_quest_accept",
  speaker: "Herbalist Mira",
  text: "Thank you, truly. The flowers glow faintly—you'll recognize them by their silver-white petals. When you return with three, I'll reward you handsomely—gold, and some of my finest Sanguine Draughts. Safe travels!",
  portrait: "herbalist_mira",
};

// Declined the quest
export const MIRA_DECLINE: DialogueNode = {
  id: "mira_decline",
  speaker: "Herbalist Mira",
  text: "I... understand. Everyone has their own troubles. Should you change your mind, you know where to find me.",
  portrait: "herbalist_mira",
};

// Waiting for flowers (dynamic based on progress)
function getMiraWaitingDialogue(flowerCount: number): DialogueNode {
  if (flowerCount === 0) {
    return {
      id: "mira_waiting_0",
      speaker: "Herbalist Mira",
      text: "Any luck finding those Moonpetal Flowers? They grow in the shadowed areas around the village edges. Be wary of the shimmering patches...",
      portrait: "herbalist_mira",
    };
  } else if (flowerCount === 1) {
    return {
      id: "mira_waiting_1",
      speaker: "Herbalist Mira",
      text: "You've found one already! Wonderful. Two more should be enough for my salves. Keep looking in the shaded corners of the village.",
      portrait: "herbalist_mira",
    };
  } else {
    return {
      id: "mira_waiting_2",
      speaker: "Herbalist Mira",
      text: "Two flowers! You're nearly there. Just one more Moonpetal Flower and you'll have all I need.",
      portrait: "herbalist_mira",
    };
  }
}

// Turn in the quest
export const MIRA_TURN_IN: DialogueNode = {
  id: "mira_turn_in",
  speaker: "Herbalist Mira",
  text: "Oh! You found them all! Three perfect Moonpetal Flowers—their petals still glow with that ethereal light. You've saved many lives this day, traveler. Here, take this reward as promised.",
  portrait: "herbalist_mira",
};

// Post-quest friendly dialogue
const MIRA_POST_QUEST: DialogueNode = {
  id: "mira_post_quest",
  speaker: "Herbalist Mira",
  text: "Thanks to you, my stores are replenished. If you ever need remedies, I've set aside my finest draughts for you at a fair price. May the humors stay balanced within you, friend.",
  portrait: "herbalist_mira",
};

// Default fallback
const MIRA_DEFAULT: DialogueNode = {
  id: "mira_default",
  speaker: "Herbalist Mira",
  text: "May the Four Humors guide you, traveler.",
  portrait: "herbalist_mira",
};

// All dialogue nodes for reference
export const MIRA_DIALOGUES: Record<string, DialogueNode> = {
  mira_intro: MIRA_QUEST_INTRO,
  mira_quest_offer: MIRA_QUEST_OFFER,
  mira_glitch_hint: MIRA_GLITCH_HINT,
  mira_quest_accept: MIRA_QUEST_ACCEPT,
  mira_decline: MIRA_DECLINE,
  mira_turn_in: MIRA_TURN_IN,
  mira_post_quest: MIRA_POST_QUEST,
  mira_default: MIRA_DEFAULT,
};
