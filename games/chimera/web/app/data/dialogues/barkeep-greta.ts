// Barkeep Greta - The Rusted Cog Tavern
// Quest giver for "The Hooded Stranger" side quest

import type { DialogueNode } from "../../types";

export interface GretaDialogueState {
  questStatuses: {
    the_hooded_stranger: "not_started" | "active" | "completed";
  };
  flags: {
    met_greta: boolean;
    asked_about_stranger: boolean;
    stranger_riddle_solved: boolean;
  };
}

// ============================================
// DIALOGUE NODES
// ============================================

// First meeting
const GRETA_FIRST_MEETING: DialogueNode = {
  id: "greta_first_meeting",
  speaker: "Barkeep Greta",
  portrait: "barkeep_greta",
  text: "Welcome to the Rusted Cog, traveler! Best ale in Havenwood, if I do say so myself. What brings you to my humble establishment?",
  choices: [
    {
      text: "Just looking around.",
      nextNodeId: "greta_looking_around",
    },
    {
      text: "I heard there's a strange patron here...",
      nextNodeId: "greta_about_stranger",
    },
    {
      text: "Tell me about Havenwood.",
      nextNodeId: "greta_about_village",
    },
  ],
};

const GRETA_LOOKING_AROUND: DialogueNode = {
  id: "greta_looking_around",
  speaker: "Barkeep Greta",
  portrait: "barkeep_greta",
  text: "Make yourself at home! Grab a seat by the fire if you're cold. The stew today is lamb—recipe's been in my family for generations.",
};

const GRETA_ABOUT_VILLAGE: DialogueNode = {
  id: "greta_about_village",
  speaker: "Barkeep Greta",
  portrait: "barkeep_greta",
  text: "Havenwood's a good place. Quiet, mostly. Folk here look out for each other. Elder Morris keeps things running smooth, and Captain Bren keeps us safe. Though lately...",
  next: "greta_village_concern",
};

const GRETA_VILLAGE_CONCERN: DialogueNode = {
  id: "greta_village_concern",
  speaker: "Barkeep Greta",
  portrait: "barkeep_greta",
  text: "...there's been talk of bandits on the northern road. And strange lights in the old ruins at night. Times are changing, I think. Not sure if for better or worse.",
};

// About the Hooded Stranger
const GRETA_ABOUT_STRANGER: DialogueNode = {
  id: "greta_about_stranger",
  speaker: "Barkeep Greta",
  portrait: "barkeep_greta",
  text: "*lowers voice* So you've noticed them too? Aye, there's been a... peculiar patron visiting lately. Sits in that corner over there, hood always up. Never orders food—just watches. And makes... noises.",
  next: "greta_stranger_details",
};

const GRETA_STRANGER_DETAILS: DialogueNode = {
  id: "greta_stranger_details",
  speaker: "Barkeep Greta",
  portrait: "barkeep_greta",
  text: "*whispers* They don't talk like people. It's... noise, mostly. Numbers and static, like bees buzzing inside your skull. Made my head hurt just listening. Pays in coins with symbols that shimmer—never seen metal like it.",
  next: "greta_stranger_details_2",
};

const GRETA_STRANGER_DETAILS_2: DialogueNode = {
  id: "greta_stranger_details_2",
  speaker: "Barkeep Greta",
  portrait: "barkeep_greta",
  text: "Sometimes words slip through the noise. 'Anomaly.' 'Pattern deviation.' Cold words. Wrong words. Like they're reading from some ledger that lists... us. All of us.",
  choices: [
    {
      text: "Where can I find them?",
      nextNodeId: "greta_stranger_location",
    },
    {
      text: "Sounds dangerous. I'll avoid them.",
      nextNodeId: "greta_understand",
    },
  ],
};

const GRETA_STRANGER_LOCATION: DialogueNode = {
  id: "greta_stranger_location",
  speaker: "Barkeep Greta",
  portrait: "barkeep_greta",
  text: "They come and go as they please—always seem to know when someone's looking for them. Just... be careful. Something about that one isn't quite right. Not dangerous exactly, but... unnatural. Like they're not really here. Not all the way.",
};

const GRETA_UNDERSTAND: DialogueNode = {
  id: "greta_understand",
  speaker: "Barkeep Greta",
  portrait: "barkeep_greta",
  text: "Smart thinking. Some mysteries are better left alone. Can I get you something to drink instead?",
};

// Return visit dialogue
const GRETA_RETURN_VISIT: DialogueNode = {
  id: "greta_return_visit",
  speaker: "Barkeep Greta",
  portrait: "barkeep_greta",
  text: "Back again! Always good to see a familiar face. What can I do for you today?",
  choices: [
    {
      text: "Any news from the village?",
      nextNodeId: "greta_village_news",
    },
    {
      text: "Has the hooded stranger been back?",
      nextNodeId: "greta_stranger_update",
    },
    {
      text: "Just passing through.",
      nextNodeId: "greta_passing",
    },
  ],
};

const GRETA_VILLAGE_NEWS: DialogueNode = {
  id: "greta_village_news",
  speaker: "Barkeep Greta",
  portrait: "barkeep_greta",
  text: "Word travels fast in a tavern! Let's see... Aldric's expecting a new shipment, Mira's been busy with her herbs, and I heard someone spotted strange lights near the ruins again. Same old, same old.",
};

const GRETA_STRANGER_UPDATE: DialogueNode = {
  id: "greta_stranger_update",
  speaker: "Barkeep Greta",
  portrait: "barkeep_greta",
  text: "That one's been in again. Still making those noises. Still watching. *shivers* Something's different though—they seem to be waiting for something. Or someone.",
  next: "greta_stranger_update_2",
};

const GRETA_STRANGER_UPDATE_2: DialogueNode = {
  id: "greta_stranger_update_2",
  speaker: "Barkeep Greta",
  portrait: "barkeep_greta",
  text: "I tried to listen once—to really listen. All I heard was static and numbers, but... I swear I felt something. An image in my head. Ruins, I think. Old ones. Made no sense. *shakes head* Be careful if you go near them.",
};

const GRETA_PASSING: DialogueNode = {
  id: "greta_passing",
  speaker: "Barkeep Greta",
  portrait: "barkeep_greta",
  text: "Well, don't be a stranger! The fire's always warm and the ale's always cold. Safe travels out there.",
};

// Quest completed dialogue
const GRETA_QUEST_COMPLETE: DialogueNode = {
  id: "greta_quest_complete",
  speaker: "Barkeep Greta",
  portrait: "barkeep_greta",
  text: "You! I saw what happened. That stranger—they just... flickered. Like a candle going out. And then nothing. Gone. *crosses arms nervously* What did you do? What were they?",
  next: "greta_quest_complete_2",
};

const GRETA_QUEST_COMPLETE_2: DialogueNode = {
  id: "greta_quest_complete_2",
  speaker: "Barkeep Greta",
  portrait: "barkeep_greta",
  text: "*studies your face* You don't know either, do you? I can see it in your eyes—something happened you can't explain. *sighs* Just... be careful. Whatever's going on, it's bigger than any of us understand. My door's always open if you need a place to think.",
};

// ============================================
// DIALOGUE RECORDS
// ============================================

export const GRETA_DIALOGUES: Record<string, DialogueNode> = {
  greta_first_meeting: GRETA_FIRST_MEETING,
  greta_looking_around: GRETA_LOOKING_AROUND,
  greta_about_village: GRETA_ABOUT_VILLAGE,
  greta_village_concern: GRETA_VILLAGE_CONCERN,
  greta_about_stranger: GRETA_ABOUT_STRANGER,
  greta_stranger_details: GRETA_STRANGER_DETAILS,
  greta_stranger_details_2: GRETA_STRANGER_DETAILS_2,
  greta_stranger_location: GRETA_STRANGER_LOCATION,
  greta_understand: GRETA_UNDERSTAND,
  greta_return_visit: GRETA_RETURN_VISIT,
  greta_village_news: GRETA_VILLAGE_NEWS,
  greta_stranger_update: GRETA_STRANGER_UPDATE,
  greta_stranger_update_2: GRETA_STRANGER_UPDATE_2,
  greta_passing: GRETA_PASSING,
  greta_quest_complete: GRETA_QUEST_COMPLETE,
  greta_quest_complete_2: GRETA_QUEST_COMPLETE_2,
};

// ============================================
// DYNAMIC DIALOGUE FUNCTION
// ============================================

export function getGretaDialogue(state: GretaDialogueState): DialogueNode {
  // First meeting - ALWAYS check this first regardless of quest status
  // Player must meet Greta before any quest-related dialogue
  if (!state.flags.met_greta) {
    return GRETA_FIRST_MEETING;
  }

  // If quest completed
  if (state.questStatuses.the_hooded_stranger === "completed") {
    return GRETA_QUEST_COMPLETE;
  }

  // If actively pursuing the stranger (and they've met Greta)
  if (state.questStatuses.the_hooded_stranger === "active") {
    return GRETA_STRANGER_UPDATE;
  }

  return GRETA_RETURN_VISIT;
}
