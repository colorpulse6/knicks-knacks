// Dialogue System - Central export for all NPC dialogues

// Herbalist Mira - The Herbalist's Request quest
export {
  getMiraDialogue,
  MIRA_DIALOGUES,
  MIRA_QUEST_OFFER,
  MIRA_GLITCH_HINT,
  MIRA_QUEST_ACCEPT,
  MIRA_DECLINE,
  MIRA_TURN_IN,
} from "./herbalist-mira";

// Elder Morris - Main story quest giver
export {
  getMorrisDialogue,
  MORRIS_DIALOGUES,
  type MorrisDialogueState,
} from "./elder-morris";

// Captain Bren - Guard captain, bandit intelligence
export {
  getBrenDialogue,
  BREN_DIALOGUES,
  type BrenDialogueState,
} from "./captain-bren";

// Merchant Aldric - Shop owner, Lost Shipment quest
export {
  getAldricDialogue,
  ALDRIC_DIALOGUES,
  type AldricDialogueState,
} from "./merchant-aldric";

// ============================================
// DIALOGUE UTILITY FUNCTIONS
// ============================================

import type { DialogueNode } from "../../types";
import { getMiraDialogue, MIRA_DIALOGUES } from "./herbalist-mira";
import { getMorrisDialogue, MORRIS_DIALOGUES, type MorrisDialogueState } from "./elder-morris";
import { getBrenDialogue, BREN_DIALOGUES, type BrenDialogueState } from "./captain-bren";
import { getAldricDialogue, ALDRIC_DIALOGUES, type AldricDialogueState } from "./merchant-aldric";

/**
 * Get a dialogue node by ID from any character's dialogue
 */
export function getDialogueById(nodeId: string): DialogueNode | undefined {
  // Check all dialogue records
  const allDialogues = {
    ...MIRA_DIALOGUES,
    ...MORRIS_DIALOGUES,
    ...BREN_DIALOGUES,
    ...ALDRIC_DIALOGUES,
  };

  return allDialogues[nodeId];
}

/**
 * Generic interface for story state that dialogue functions need
 */
export interface StoryState {
  flags: Record<string, boolean>;
  quests: {
    active: string[];
    completed: string[];
  };
}

/**
 * Get quest status from story state
 */
export function getQuestStatus(
  questId: string,
  storyState: StoryState
): "not_started" | "active" | "completed" {
  if (storyState.quests.completed.includes(questId)) {
    return "completed";
  }
  if (storyState.quests.active.includes(questId)) {
    return "active";
  }
  return "not_started";
}

/**
 * Build Morris dialogue state from story state
 */
export function buildMorrisDialogueState(storyState: StoryState): MorrisDialogueState {
  return {
    questStatuses: {
      whispers_of_trouble: getQuestStatus("whispers_of_trouble", storyState),
      the_bandit_problem: getQuestStatus("the_bandit_problem", storyState),
      seeking_answers: getQuestStatus("seeking_answers", storyState),
    },
    flags: {
      bandit_threat_known: storyState.flags.bandit_threat_known ?? false,
      bandits_defeated: storyState.flags.bandits_defeated ?? false,
      found_mechanism: storyState.flags.found_mechanism ?? false,
      met_lyra: storyState.flags.met_lyra ?? false,
    },
  };
}

/**
 * Build Bren dialogue state from story state
 */
export function buildBrenDialogueState(storyState: StoryState): BrenDialogueState {
  return {
    questStatuses: {
      whispers_of_trouble: getQuestStatus("whispers_of_trouble", storyState),
      the_bandit_problem: getQuestStatus("the_bandit_problem", storyState),
    },
    flags: {
      talked_to_bren: storyState.flags.talked_to_bren ?? false,
      found_bandit_evidence: storyState.flags.found_bandit_evidence ?? false,
      bandits_defeated: storyState.flags.bandits_defeated ?? false,
    },
  };
}

/**
 * Build Aldric dialogue state from story state
 */
export function buildAldricDialogueState(storyState: StoryState): AldricDialogueState {
  return {
    questStatuses: {
      lost_shipment: getQuestStatus("lost_shipment", storyState),
      seeking_answers: getQuestStatus("seeking_answers", storyState),
    },
    flags: {
      outskirts_unlocked: storyState.flags.outskirts_unlocked ?? false,
      helped_aldric: storyState.flags.helped_aldric ?? false,
      asked_about_scholars: storyState.flags.asked_about_scholars ?? false,
      found_mechanism: storyState.flags.found_mechanism ?? false,
    },
  };
}

/**
 * Get dynamic dialogue for an NPC based on their ID and current story state
 */
export function getDynamicDialogue(
  npcId: string,
  storyState: StoryState,
  extraData?: Record<string, unknown>
): DialogueNode | null {
  switch (npcId) {
    case "herbalist_mira": {
      const questStatus = getQuestStatus("herbalists_request", storyState);
      const flowerCount = (extraData?.flowerCount as number) ?? 0;
      const hasEnoughFlowers = flowerCount >= 3;
      return getMiraDialogue(questStatus, hasEnoughFlowers, flowerCount);
    }

    case "elder_morris": {
      const state = buildMorrisDialogueState(storyState);
      return getMorrisDialogue(state);
    }

    case "guard_captain_bren": {
      const state = buildBrenDialogueState(storyState);
      return getBrenDialogue(state);
    }

    case "merchant_aldric": {
      const state = buildAldricDialogueState(storyState);
      return getAldricDialogue(state);
    }

    default:
      return null;
  }
}
