// Vorn Confrontation Dialogue - Pre-battle dialogue for Bandit Chief Vorn
// Triggers when player interacts with the boss battle event at the tent entrance

import type { DialogueNode } from "../../types";

// ============================================
// PRE-BATTLE CONFRONTATION
// ============================================

const VORN_NOTICE: DialogueNode = {
  id: "vorn_notice",
  speaker: "",
  portrait: "",
  text: "*You approach the leader's tent. A massive figure steps out from the shadows, blocking your path.*",
  next: "vorn_intro",
};

const VORN_INTRO: DialogueNode = {
  id: "vorn_intro",
  speaker: "Bandit Chief Vorn",
  portrait: "vorn",
  text: "Well, well... another hero come to play the savior. You've made quite a mess of my camp.",
  next: "vorn_threaten",
};

const VORN_THREATEN: DialogueNode = {
  id: "vorn_threaten",
  speaker: "Bandit Chief Vorn",
  portrait: "vorn",
  text: "*He hefts a strange rod that crackles with blue energy* This? A gift from my... benefactors. They promised me power, and they delivered.",
  next: "vorn_taunt",
};

const VORN_TAUNT: DialogueNode = {
  id: "vorn_taunt",
  speaker: "Bandit Chief Vorn",
  portrait: "vorn",
  text: "You village rats cling to your little lives, never asking where the road leads. I've seen what waits at the end of it. And I chose the winning side.",
  next: "vorn_battle_start",
};

const VORN_BATTLE_START: DialogueNode = {
  id: "vorn_battle_start",
  speaker: "",
  portrait: "",
  text: "*Vorn raises his lightning rod, electricity arcing through the air!*",
  // This node triggers the battle - handled by the dialogue system
  onComplete: {
    startBattle: true,
  },
};

// ============================================
// POST-BATTLE VICTORY
// ============================================

export const VORN_DEFEATED: DialogueNode = {
  id: "vorn_defeated",
  speaker: "",
  portrait: "",
  text: "*Vorn collapses, the lightning rod clattering to the ground. Its glow fades to nothing.*",
  next: "vorn_dying_words",
};

export const VORN_DYING_WORDS: DialogueNode = {
  id: "vorn_dying_words",
  speaker: "Bandit Chief Vorn",
  portrait: "vorn",
  text: "*coughs* You think... you won something? The rod was just a taste. There's a whole cellar full of... *trails off*",
  next: "vorn_final",
};

export const VORN_FINAL: DialogueNode = {
  id: "vorn_final",
  speaker: "",
  portrait: "",
  text: "*His eyes go dark. In the silence that follows, you notice a trapdoor beneath where he stood...*",
};

// ============================================
// DIALOGUE RECORDS
// ============================================

export const VORN_DIALOGUES: Record<string, DialogueNode> = {
  vorn_notice: VORN_NOTICE,
  vorn_intro: VORN_INTRO,
  vorn_threaten: VORN_THREATEN,
  vorn_taunt: VORN_TAUNT,
  vorn_battle_start: VORN_BATTLE_START,
  vorn_defeated: VORN_DEFEATED,
  vorn_dying_words: VORN_DYING_WORDS,
  vorn_final: VORN_FINAL,
};

/**
 * Get the starting dialogue node for Vorn confrontation
 */
export function getVornConfrontationDialogue(): DialogueNode {
  return VORN_NOTICE;
}
