// Captain Bren's Dialogue - Guard Captain, Bandit Intelligence
// Provides briefings for Whispers of Trouble quest

import type { DialogueNode } from "../../types";

export interface BrenDialogueState {
  questStatuses: {
    whispers_of_trouble: "not_started" | "active" | "completed";
    the_bandit_problem: "not_started" | "active" | "completed";
  };
  flags: {
    talked_to_bren: boolean;
    found_bandit_evidence: boolean;
    bandits_defeated: boolean;
  };
}

/**
 * Get Captain Bren's dialogue based on current story state
 */
export function getBrenDialogue(state: BrenDialogueState): DialogueNode {
  const { questStatuses, flags } = state;

  // After bandits defeated
  if (flags.bandits_defeated) {
    return BREN_POST_VICTORY;
  }

  // Bandit Problem active
  if (questStatuses.the_bandit_problem === "active") {
    return BREN_BANDIT_PROBLEM_ACTIVE;
  }

  // Whispers completed, waiting for Bandit Problem to start
  if (questStatuses.whispers_of_trouble === "completed") {
    return BREN_WHISPERS_COMPLETE;
  }

  // Evidence found but not yet reported
  if (flags.found_bandit_evidence && questStatuses.whispers_of_trouble === "active") {
    return BREN_EVIDENCE_FOUND;
  }

  // Whispers active, briefing given
  if (flags.talked_to_bren && questStatuses.whispers_of_trouble === "active") {
    return BREN_PATROL_REMINDER;
  }

  // Whispers active, first talk - show intro so player can choose to get briefing
  // (the objective completes when they ADVANCE to bren_briefing via the choice)
  if (questStatuses.whispers_of_trouble === "active") {
    return BREN_INTRO;
  }

  // Default - before quest
  return BREN_INTRO;
}

// ============================================
// INTRODUCTION - Before quest
// ============================================

const BREN_INTRO: DialogueNode = {
  id: "bren_intro",
  speaker: "Captain Bren",
  text: "Hail, traveler. I'm Bren, captain of the village guard. If Elder Morris sent you about the bandit situation, I can brief you on what we know.",
  portrait: "guard_captain_bren",
  choices: [
    {
      text: "What can you tell me?",
      nextNodeId: "bren_briefing",
    },
    {
      text: "Just passing through.",
      nextNodeId: "bren_decline",
    },
  ],
};

const BREN_DECLINE: DialogueNode = {
  id: "bren_decline",
  speaker: "Captain Bren",
  text: "Safe travels, then. If you change your mind about helping, I'll be here.",
  portrait: "guard_captain_bren",
};

// ============================================
// BRIEFING - Quest starts
// ============================================

const BREN_BRIEFING: DialogueNode = {
  id: "bren_briefing",
  speaker: "Captain Bren",
  text: "Our scouts have spotted unfamiliar figures in the Havenwood Outskirts—north of the village. They move in formation, not like common thieves. Three caravans have vanished on the northern road in the past month.",
  portrait: "guard_captain_bren",
  choices: [
    {
      text: "Any idea who they are?",
      nextNodeId: "bren_who_they_are",
    },
    {
      text: "What should I look for?",
      nextNodeId: "bren_what_to_find",
    },
  ],
};

export const BREN_WHO_THEY_ARE: DialogueNode = {
  id: "bren_who_they_are",
  speaker: "Captain Bren",
  text: "We're not certain. They're too disciplined for common brigands. Former soldiers, maybe mercenaries gone rogue. One scout swore he saw blue sparks—like lightning—coming from their camp at night. Could be tall tales, but... I've learned not to dismiss strange reports these days.",
  portrait: "guard_captain_bren",
  choices: [
    {
      text: "What should I look for out there?",
      nextNodeId: "bren_what_to_find",
    },
  ],
};

export const BREN_WHAT_TO_FIND: DialogueNode = {
  id: "bren_what_to_find",
  speaker: "Captain Bren",
  text: "Head to the Outskirts and patrol the area. Look for recent campfires, tracks, discarded supplies—anything that confirms they have a base nearby. If you find solid evidence, report back to Elder Morris. Don't engage a large group alone.",
  portrait: "guard_captain_bren",
};

// ============================================
// PATROL REMINDER - While searching
// ============================================

const BREN_PATROL_REMINDER: DialogueNode = {
  id: "bren_patrol_reminder",
  speaker: "Captain Bren",
  text: "Any luck in the Outskirts? Look for campfire remains, tracks, anything that proves they have a base out there. The eastern paths are where we've had the most sightings.",
  portrait: "guard_captain_bren",
};

// ============================================
// EVIDENCE FOUND - Player has evidence
// ============================================

const BREN_EVIDENCE_FOUND: DialogueNode = {
  id: "bren_evidence_found",
  speaker: "Captain Bren",
  text: "You've found something? Good work. Report your findings to Elder Morris—he'll want to know immediately. This is the proof we needed that there's a real camp out there.",
  portrait: "guard_captain_bren",
};

// ============================================
// WHISPERS COMPLETE - Ready for Bandit Problem
// ============================================

const BREN_WHISPERS_COMPLETE: DialogueNode = {
  id: "bren_whispers_complete",
  speaker: "Captain Bren",
  text: "So there's definitely a camp to the east. I wish I could send guards with you, but we can barely defend the village as is. Strike fast, free those prisoners, and put an end to their leader. That should scatter the rest.",
  portrait: "guard_captain_bren",
  choices: [
    {
      text: "Any tactical advice?",
      nextNodeId: "bren_tactical_advice",
    },
    {
      text: "I'll handle it.",
      nextNodeId: "bren_good_luck",
    },
  ],
};

export const BREN_TACTICAL_ADVICE: DialogueNode = {
  id: "bren_tactical_advice",
  speaker: "Captain Bren",
  text: "The camp will have patrols—take them out quietly if you can. The prisoners are likely held in cages near the center. Their leader, Vorn, will be in the largest tent. And that weapon of his... whatever it is, don't underestimate it.",
  portrait: "guard_captain_bren",
};

export const BREN_GOOD_LUCK: DialogueNode = {
  id: "bren_good_luck",
  speaker: "Captain Bren",
  text: "Good hunting. The village is counting on you.",
  portrait: "guard_captain_bren",
};

// ============================================
// BANDIT PROBLEM ACTIVE
// ============================================

const BREN_BANDIT_PROBLEM_ACTIVE: DialogueNode = {
  id: "bren_bandit_problem_active",
  speaker: "Captain Bren",
  text: "The camp is to the east, past the outskirts. Remember—free the prisoners, take out Vorn. Once the leader falls, the rest should scatter. And be careful of that lightning weapon of his.",
  portrait: "guard_captain_bren",
};

// ============================================
// POST VICTORY
// ============================================

const BREN_POST_VICTORY: DialogueNode = {
  id: "bren_post_victory",
  speaker: "Captain Bren",
  text: "The freed prisoners can't stop talking about you. You've done what the guard couldn't—saved our people and ended the bandit threat. If you ever need anything, you've a friend in the Havenwood guard.",
  portrait: "guard_captain_bren",
};

// Export all dialogue nodes
export const BREN_DIALOGUES: Record<string, DialogueNode> = {
  bren_intro: BREN_INTRO,
  bren_decline: BREN_DECLINE,
  bren_briefing: BREN_BRIEFING,
  bren_who_they_are: BREN_WHO_THEY_ARE,
  bren_what_to_find: BREN_WHAT_TO_FIND,
  bren_patrol_reminder: BREN_PATROL_REMINDER,
  bren_evidence_found: BREN_EVIDENCE_FOUND,
  bren_whispers_complete: BREN_WHISPERS_COMPLETE,
  bren_tactical_advice: BREN_TACTICAL_ADVICE,
  bren_good_luck: BREN_GOOD_LUCK,
  bren_bandit_problem_active: BREN_BANDIT_PROBLEM_ACTIVE,
  bren_post_victory: BREN_POST_VICTORY,
};
