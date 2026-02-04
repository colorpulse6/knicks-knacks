// Elder Morris's Dialogue - Main Story Quest Giver
// Handles: Whispers of Trouble, The Bandit Problem, Seeking Answers

import type { DialogueNode } from "../../types";

/**
 * Story flags used by Elder Morris:
 * - bandit_threat_known: Player has learned about the bandit problem
 * - bandits_defeated: Vorn has been defeated
 * - found_mechanism: Strange artifact discovered in cellar
 * - seeking_scholar: Looking for someone to explain the mechanism
 */

export interface MorrisDialogueState {
  questStatuses: {
    whispers_of_trouble: "not_started" | "active" | "completed";
    the_bandit_problem: "not_started" | "active" | "completed";
    seeking_answers: "not_started" | "active" | "completed";
  };
  flags: {
    bandit_threat_known: boolean;
    bandits_defeated: boolean;
    found_mechanism: boolean;
    met_lyra: boolean;
  };
}

/**
 * Get Elder Morris's dialogue based on current story state
 */
export function getMorrisDialogue(state: MorrisDialogueState): DialogueNode {
  const { questStatuses, flags } = state;

  // After finding the mechanism and meeting Lyra
  if (flags.found_mechanism && flags.met_lyra) {
    return MORRIS_POST_LYRA;
  }

  // After finding mechanism - start Seeking Answers
  if (flags.found_mechanism && questStatuses.seeking_answers === "not_started") {
    return MORRIS_MECHANISM_REACTION;
  }

  // Seeking Answers active
  if (questStatuses.seeking_answers === "active") {
    return MORRIS_SEEKING_ACTIVE;
  }

  // Bandit Problem completed but mechanism not yet returned
  if (flags.bandits_defeated && !flags.found_mechanism) {
    return MORRIS_AWAITING_REPORT;
  }

  // Bandit Problem active
  if (questStatuses.the_bandit_problem === "active") {
    return MORRIS_BANDIT_ACTIVE;
  }

  // Whispers of Trouble completed - offer Bandit Problem
  if (questStatuses.whispers_of_trouble === "completed" &&
      questStatuses.the_bandit_problem === "not_started") {
    return MORRIS_BANDIT_INTRO;
  }

  // Whispers of Trouble active
  if (questStatuses.whispers_of_trouble === "active") {
    return MORRIS_WHISPERS_ACTIVE;
  }

  // Default - offer Whispers of Trouble
  return MORRIS_INTRO;
}

// ============================================
// INTRODUCTION - Before any quests
// ============================================

const MORRIS_INTRO: DialogueNode = {
  id: "morris_intro",
  speaker: "Elder Morris",
  text: "Welcome to Havenwood, traveler. I am Morris, elder of this village. These are troubled times—bandits prowl the roads, and strange things stir in the shadows. Perhaps you could assist us?",
  portrait: "elder_morris",
  choices: [
    {
      text: "What kind of trouble?",
      nextNodeId: "morris_trouble_explain",
    },
    {
      text: "I'm just passing through.",
      nextNodeId: "morris_decline",
    },
  ],
};

export const MORRIS_TROUBLE_EXPLAIN: DialogueNode = {
  id: "morris_trouble_explain",
  speaker: "Elder Morris",
  text: "Travelers on the northern road have gone missing. Our scouts report figures lurking in the outskirts—too organized to be common highwaymen. Captain Bren has more details. If you could investigate and report back, the village would be most grateful.",
  portrait: "elder_morris",
  choices: [
    {
      text: "I'll speak with Captain Bren.",
      nextNodeId: "morris_quest_accept",
    },
    {
      text: "What's in it for me?",
      nextNodeId: "morris_reward_mention",
    },
  ],
};

export const MORRIS_REWARD_MENTION: DialogueNode = {
  id: "morris_reward_mention",
  speaker: "Elder Morris",
  text: "We're not a wealthy village, but we take care of those who help us. Gold, supplies, and the gratitude of everyone here. More importantly—these bandits threaten all who travel these roads. Today it's strangers; tomorrow it could be our own families.",
  portrait: "elder_morris",
  choices: [
    {
      text: "Alright, I'll help.",
      nextNodeId: "morris_quest_accept",
    },
    {
      text: "I need to think about it.",
      nextNodeId: "morris_decline",
    },
  ],
};

export const MORRIS_QUEST_ACCEPT: DialogueNode = {
  id: "morris_quest_accept",
  speaker: "Elder Morris",
  text: "Thank you, traveler. Speak with Captain Bren—he patrols near the village square. He can brief you on what the scouts have seen. Be careful out there... something about this whole situation feels wrong to me.",
  portrait: "elder_morris",
};

const MORRIS_DECLINE: DialogueNode = {
  id: "morris_decline",
  speaker: "Elder Morris",
  text: "I understand. If you change your mind, you know where to find me. Safe travels.",
  portrait: "elder_morris",
};

// ============================================
// WHISPERS OF TROUBLE - Quest Active
// ============================================

const MORRIS_WHISPERS_ACTIVE: DialogueNode = {
  id: "morris_whispers_active",
  speaker: "Elder Morris",
  text: "Have you spoken with Captain Bren yet? He's been gathering information about the bandits. Check the outskirts for any signs of their activity—abandoned camps, tracks, anything unusual.",
  portrait: "elder_morris",
};

// ============================================
// THE BANDIT PROBLEM - Quest Introduction
// ============================================

const MORRIS_BANDIT_INTRO: DialogueNode = {
  id: "morris_bandit_intro",
  speaker: "Elder Morris",
  text: "Your findings confirm our worst fears—there's an organized bandit camp to the east. They've been raiding caravans and... the captured villagers worry me most. We must act before more innocents suffer.",
  portrait: "elder_morris",
  choices: [
    {
      text: "I'll raid their camp and free the prisoners.",
      nextNodeId: "morris_bandit_accept",
    },
    {
      text: "Tell me more about their leader.",
      nextNodeId: "morris_vorn_info",
    },
  ],
};

export const MORRIS_VORN_INFO: DialogueNode = {
  id: "morris_vorn_info",
  speaker: "Elder Morris",
  text: "They call him Vorn—a former mercenary captain turned raider. But what troubles me more are the reports of his weapon. A rod that crackles with lightning, they say. No blacksmith I know could forge such a thing. Be wary.",
  portrait: "elder_morris",
  choices: [
    {
      text: "Lightning or not, I'll stop him.",
      nextNodeId: "morris_bandit_accept",
    },
  ],
};

export const MORRIS_BANDIT_ACCEPT: DialogueNode = {
  id: "morris_bandit_accept",
  speaker: "Elder Morris",
  text: "The village is counting on you. Free the prisoners, defeat Vorn, and bring back anything that might explain where they got such strange weapons. May fortune guide your blade.",
  portrait: "elder_morris",
};

// ============================================
// THE BANDIT PROBLEM - Quest Active
// ============================================

const MORRIS_BANDIT_ACTIVE: DialogueNode = {
  id: "morris_bandit_active",
  speaker: "Elder Morris",
  text: "The camp lies east of the outskirts. Remember—free the prisoners first if you can. They've suffered enough. And that weapon of Vorn's... if you can capture it, perhaps we can learn where it came from.",
  portrait: "elder_morris",
};

// ============================================
// AWAITING REPORT - After defeating Vorn
// ============================================

const MORRIS_AWAITING_REPORT: DialogueNode = {
  id: "morris_awaiting_report",
  speaker: "Elder Morris",
  text: "You've returned! The freed prisoners spoke of your bravery. But your expression tells me there's more. What did you find in that camp?",
  portrait: "elder_morris",
  choices: [
    {
      text: "There was a hidden cellar with... something strange.",
      nextNodeId: "morris_cellar_reaction",
    },
  ],
};

// ============================================
// MECHANISM DISCOVERY - Start Seeking Answers
// ============================================

export const MORRIS_CELLAR_REACTION: DialogueNode = {
  id: "morris_cellar_reaction",
  speaker: "Elder Morris",
  text: "A cellar? Show me what you found...",
  portrait: "elder_morris",
  choices: [
    {
      text: "*Show the strange mechanism*",
      nextNodeId: "morris_mechanism_reaction",
    },
  ],
};

const MORRIS_MECHANISM_REACTION: DialogueNode = {
  id: "morris_mechanism_reaction",
  speaker: "Elder Morris",
  text: "By the old gods... what IS this? Metal that moves on its own, lights without flame... This is no craft I've ever seen. This defies everything I thought I knew. We need someone with knowledge of ancient secrets—scholars, historians, anyone who might understand such things.",
  portrait: "elder_morris",
  choices: [
    {
      text: "Where can I find such a person?",
      nextNodeId: "morris_suggest_scholar",
    },
    {
      text: "What do you think it means?",
      nextNodeId: "morris_speculation",
    },
  ],
};

export const MORRIS_SPECULATION: DialogueNode = {
  id: "morris_speculation",
  speaker: "Elder Morris",
  text: "I've lived seventy winters, and I've never seen its like. Old legends speak of 'builders' who shaped the world before our time... but those are children's tales. Aren't they? Ask around the village—someone may know of scholars who study such mysteries. The Lumina family, perhaps. They're said to have extensive archives.",
  portrait: "elder_morris",
  choices: [
    {
      text: "I'll ask around about the Lumina family.",
      nextNodeId: "morris_seeking_accept",
    },
  ],
};

export const MORRIS_SUGGEST_SCHOLAR: DialogueNode = {
  id: "morris_suggest_scholar",
  speaker: "Elder Morris",
  text: "Ask the villagers—Tom wanders about and hears all manner of gossip. Aldric deals with travelers from far places. And there's the Lumina family to the north... nobles with a reputation for collecting ancient knowledge. Perhaps one of them could make sense of this.",
  portrait: "elder_morris",
  choices: [
    {
      text: "I'll investigate.",
      nextNodeId: "morris_seeking_accept",
    },
  ],
};

export const MORRIS_SEEKING_ACCEPT: DialogueNode = {
  id: "morris_seeking_accept",
  speaker: "Elder Morris",
  text: "Good. This device... it frightens me, truth be told. Whatever it is, it's connected to Vorn's strange weapon. Perhaps connected to the disappearances, the strange lights in the ruins... Be careful who you show it to. Not everyone may have our best interests at heart.",
  portrait: "elder_morris",
};

// ============================================
// SEEKING ANSWERS - Quest Active
// ============================================

const MORRIS_SEEKING_ACTIVE: DialogueNode = {
  id: "morris_seeking_active",
  speaker: "Elder Morris",
  text: "Any luck finding someone who can explain that mechanism? The villagers might point you toward scholars, and the Lumina estate to the north is known for its archives. Someone must know what this thing is.",
  portrait: "elder_morris",
};

// ============================================
// POST-LYRA - After meeting Lady Lyra
// ============================================

const MORRIS_POST_LYRA: DialogueNode = {
  id: "morris_post_lyra",
  speaker: "Elder Morris",
  text: "So the Lady Lumina has taken an interest? Curious. The nobles rarely involve themselves with village matters. Perhaps this mystery runs deeper than any of us realized. Be careful, traveler. Questions about the nature of things... sometimes the answers change you.",
  portrait: "elder_morris",
};

// Export all dialogue nodes
export const MORRIS_DIALOGUES: Record<string, DialogueNode> = {
  morris_intro: MORRIS_INTRO,
  morris_trouble_explain: MORRIS_TROUBLE_EXPLAIN,
  morris_reward_mention: MORRIS_REWARD_MENTION,
  morris_quest_accept: MORRIS_QUEST_ACCEPT,
  morris_decline: MORRIS_DECLINE,
  morris_whispers_active: MORRIS_WHISPERS_ACTIVE,
  morris_bandit_intro: MORRIS_BANDIT_INTRO,
  morris_vorn_info: MORRIS_VORN_INFO,
  morris_bandit_accept: MORRIS_BANDIT_ACCEPT,
  morris_bandit_active: MORRIS_BANDIT_ACTIVE,
  morris_awaiting_report: MORRIS_AWAITING_REPORT,
  morris_cellar_reaction: MORRIS_CELLAR_REACTION,
  morris_mechanism_reaction: MORRIS_MECHANISM_REACTION,
  morris_speculation: MORRIS_SPECULATION,
  morris_suggest_scholar: MORRIS_SUGGEST_SCHOLAR,
  morris_seeking_accept: MORRIS_SEEKING_ACCEPT,
  morris_seeking_active: MORRIS_SEEKING_ACTIVE,
  morris_post_lyra: MORRIS_POST_LYRA,
};
