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

// Barkeep Greta - The Rusted Cog Tavern, Hooded Stranger quest
export {
  getGretaDialogue,
  GRETA_DIALOGUES,
  type GretaDialogueState,
} from "./barkeep-greta";

// The Hooded Stranger - Mysterious AI avatar
export {
  getStrangerDialogue,
  STRANGER_DIALOGUES,
  type StrangerDialogueState,
} from "./hooded-stranger";

// Lady Lyra Lumina - Noble scholar, party member
export {
  getLyraDialogue,
  LYRA_DIALOGUES,
  type LyraDialogueState,
} from "./lady-lyra";

// Bandit Chief Vorn - Boss confrontation dialogue
export {
  getVornConfrontationDialogue,
  VORN_DIALOGUES,
} from "./vorn-confrontation";

// Bandit Camp Prisoners - Captured villagers
export {
  getPrisonerDialogue,
  PRISONER_DIALOGUES,
} from "./bandit-camp-prisoners";

// ============================================
// DIALOGUE UTILITY FUNCTIONS
// ============================================

import type { DialogueNode } from "../../types";
import { getMiraDialogue, MIRA_DIALOGUES } from "./herbalist-mira";
import { getMorrisDialogue, MORRIS_DIALOGUES, type MorrisDialogueState } from "./elder-morris";
import { getBrenDialogue, BREN_DIALOGUES, type BrenDialogueState } from "./captain-bren";
import { getAldricDialogue, ALDRIC_DIALOGUES, type AldricDialogueState } from "./merchant-aldric";
import { getGretaDialogue, GRETA_DIALOGUES, type GretaDialogueState } from "./barkeep-greta";
import { getStrangerDialogue, STRANGER_DIALOGUES, type StrangerDialogueState } from "./hooded-stranger";
import { getLyraDialogue, LYRA_DIALOGUES, type LyraDialogueState } from "./lady-lyra";
import { VORN_DIALOGUES } from "./vorn-confrontation";
import { getPrisonerDialogue, PRISONER_DIALOGUES } from "./bandit-camp-prisoners";
import {
  getAnnaDialogue,
  getTownCrierDialogue,
  getVillagerTomDialogue,
  getFridaDialogue,
  getWeaverHoltDialogue,
  getStreetUrchinDialogue,
  getInnkeeperRowanDialogue,
  getGrandmotherEdithDialogue,
  getCatWhiskersDialogue,
  getFishermanReedDialogue,
  getDockWorkerSalDialogue,
  getMarshHermitOrinDialogue,
  getGateGuardDialogue,
  getNobleServantDialogue,
  getEstateButlerDialogue,
  getEstateGuardDialogue,
  getTavernPatronDialogue,
} from "./havenwood-villagers";

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
    ...GRETA_DIALOGUES,
    ...STRANGER_DIALOGUES,
    ...LYRA_DIALOGUES,
    ...VORN_DIALOGUES,
    ...PRISONER_DIALOGUES,
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
      found_bandit_evidence: storyState.flags.found_bandit_evidence ?? false,
      talked_to_bren: storyState.flags.talked_to_bren ?? false,
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
 * Build Greta dialogue state from story state
 */
export function buildGretaDialogueState(storyState: StoryState): GretaDialogueState {
  return {
    questStatuses: {
      the_hooded_stranger: getQuestStatus("the_hooded_stranger", storyState),
    },
    flags: {
      met_greta: storyState.flags.met_greta ?? false,
      asked_about_stranger: storyState.flags.asked_about_stranger ?? false,
      stranger_riddle_solved: storyState.flags.stranger_riddle_solved ?? false,
    },
  };
}

/**
 * Build Stranger dialogue state from story state
 */
export function buildStrangerDialogueState(storyState: StoryState): StrangerDialogueState {
  return {
    questStatuses: {
      the_hooded_stranger: getQuestStatus("the_hooded_stranger", storyState),
    },
    flags: {
      asked_about_stranger: storyState.flags.asked_about_stranger ?? false,
      met_stranger: storyState.flags.met_stranger ?? false,
      riddle_asked: storyState.flags.riddle_asked ?? false,
      riddle_solved: storyState.flags.riddle_solved ?? false,
      found_cache: storyState.flags.found_cache ?? false,
      ai_first_contact: storyState.flags.ai_first_contact ?? false,
    },
  };
}

/**
 * Build Lyra dialogue state from story state
 */
export function buildLyraDialogueState(storyState: StoryState): LyraDialogueState {
  return {
    questStatuses: {
      seeking_answers: getQuestStatus("seeking_answers", storyState),
      the_ladys_curiosity: getQuestStatus("the_ladys_curiosity", storyState),
    },
    flags: {
      met_lyra: storyState.flags.met_lyra ?? false,
      showed_mechanism: storyState.flags.showed_mechanism ?? false,
      lyra_recruited: storyState.flags.lyra_recruited ?? false,
      lyra_saw_terminal: storyState.flags.lyra_saw_terminal ?? false,
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

    case "barkeep_greta": {
      const state = buildGretaDialogueState(storyState);
      return getGretaDialogue(state);
    }

    case "hooded_stranger": {
      const state = buildStrangerDialogueState(storyState);
      return getStrangerDialogue(state);
    }

    case "lady_lyra": {
      const state = buildLyraDialogueState(storyState);
      return getLyraDialogue(state);
    }

    // Bandit Camp Prisoners
    case "prisoner_1":
    case "prisoner_farmer": {
      const isFreed = storyState.flags.prisoner_1_freed ?? false;
      return getPrisonerDialogue("prisoner_farmer", isFreed);
    }

    case "prisoner_2":
    case "prisoner_merchant": {
      const isFreed = storyState.flags.prisoner_2_freed ?? false;
      return getPrisonerDialogue("prisoner_merchant", isFreed);
    }

    case "prisoner_3":
    case "prisoner_guard": {
      const isFreed = storyState.flags.prisoner_3_freed ?? false;
      return getPrisonerDialogue("prisoner_guard", isFreed);
    }

    // Havenwood Village NPCs
    case "villager_tom":
      return getVillagerTomDialogue();
    case "villager_anna":
      return getAnnaDialogue();
    case "town_crier":
      return getTownCrierDialogue();
    case "market_vendor_fruit":
      return getFridaDialogue();
    case "market_vendor_cloth":
      return getWeaverHoltDialogue();
    case "market_child":
      return getStreetUrchinDialogue();
    case "innkeeper_rowan":
      return getInnkeeperRowanDialogue();
    case "old_woman_edith":
      return getGrandmotherEdithDialogue();
    case "cat_whiskers":
      return getCatWhiskersDialogue();
    case "fisherman_reed":
      return getFishermanReedDialogue();
    case "dock_worker_sal":
      return getDockWorkerSalDialogue();
    case "marsh_hermit_orin":
      return getMarshHermitOrinDialogue();
    case "estate_gate_guard":
      return getGateGuardDialogue(storyState.flags.found_mechanism ?? false);
    case "noble_servant_walking":
      return getNobleServantDialogue();
    case "estate_butler":
      return getEstateButlerDialogue();
    case "estate_guard":
      return getEstateGuardDialogue();
    case "tavern_patron_1":
    case "tavern_patron_2":
      return getTavernPatronDialogue();

    // Desert prologue — silent hooded strangers
    case "desert_stranger_1":
    case "desert_stranger_2":
    case "desert_stranger_3":
      return {
        id: "desert_stranger_silent",
        speaker: "???",
        text: "...",
      };

    default:
      return null;
  }
}
