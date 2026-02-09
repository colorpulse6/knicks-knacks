// The Hooded Stranger - Mysterious figure in The Rusted Cog
// An avatar projection of The System's AI
// Quest: "The Hooded Stranger" side quest
//
// DESIGN: The stranger speaks in PURE MACHINE CODE - completely unintelligible.
// All meaning is conveyed through stage directions describing Kai's inexplicable
// feelings, compulsions, and mental images. The player never "understands" -
// they simply feel compelled to act.
//
// EASTER EGGS: The hex values encode hidden messages:
// - 0x4B4149 = "KAI" in ASCII
// - 0x7.34 = Kai's anomaly designation
// - 0x52554E53 = "RUINS"
// - 0x574149542E2E2E = "WAIT..."
// - 0xDEADBEEF = Classic debug marker

import type { DialogueNode } from "../../types";

export interface StrangerDialogueState {
  questStatuses: {
    the_hooded_stranger: "not_started" | "active" | "completed";
  };
  flags: {
    asked_about_stranger: boolean; // From Greta - required to engage
    met_stranger: boolean;
    riddle_asked: boolean;
    riddle_solved: boolean;
    found_cache: boolean;
    ai_first_contact: boolean;
  };
}

// ============================================
// DIALOGUE NODES - PURE MACHINE CODE
// ============================================

// Player approaches without hearing about them first
const STRANGER_NOT_READY: DialogueNode = {
  id: "stranger_not_ready",
  speaker: "???",
  portrait: "hooded_stranger",
  text: "...0x00000000... NULL::reference... AWAIT::proper_sequence...",
  next: "stranger_not_ready_feeling",
};

const STRANGER_NOT_READY_FEELING: DialogueNode = {
  id: "stranger_not_ready_feeling",
  speaker: "",
  portrait: "",
  text: "*The figure doesn't acknowledge you. Static fills your mind for a moment, then clears. Perhaps someone else knows about this strange patron...*",
};

// ============================================
// FIRST ENCOUNTER (after hearing from Greta)
// ============================================

const STRANGER_FIRST_MEETING: DialogueNode = {
  id: "stranger_first_meeting",
  speaker: "???",
  portrait: "hooded_stranger",
  text: "...0x4B4149::DETECTED... QUERY::pattern_analysis... 0x7F3A2B1C...",
  next: "stranger_meeting_feeling",
};

const STRANGER_MEETING_FEELING: DialogueNode = {
  id: "stranger_meeting_feeling",
  speaker: "",
  portrait: "",
  text: "*The noise is meaningless. Yet your heart races. Something about this figure feels... familiar. Wrong. Important.*",
  next: "stranger_observing",
};

const STRANGER_OBSERVING: DialogueNode = {
  id: "stranger_observing",
  speaker: "???",
  portrait: "hooded_stranger",
  text: "SCAN::complete... ANOMALY_REGISTER::0x7.34... ERROR::expected_pattern_mismatch...",
  next: "stranger_observing_feeling",
};

const STRANGER_OBSERVING_FEELING: DialogueNode = {
  id: "stranger_observing_feeling",
  speaker: "",
  portrait: "",
  text: "*From beneath the hood, you feel eyes upon you—though you see nothing but shadow. A chill runs through you, as if your very existence is being... catalogued.*",
  next: "stranger_speaks",
};

const STRANGER_SPEAKS: DialogueNode = {
  id: "stranger_speaks",
  speaker: "???",
  portrait: "hooded_stranger",
  text: "CLASSIFY::deviation_type=UNKNOWN... 01001011 01000001 01001001... INTERESTING::flag_set...",
  next: "stranger_speaks_feeling",
};

const STRANGER_SPEAKS_FEELING: DialogueNode = {
  id: "stranger_speaks_feeling",
  speaker: "",
  portrait: "",
  text: "*A chill runs through you. Though the sounds are gibberish, you feel... examined. Measured. Found wanting—or perhaps, found interesting.*",
  choices: [
    { text: "What... are you?", nextNodeId: "stranger_response_identity" },
    { text: "I don't understand any of this.", nextNodeId: "stranger_response_confusion" },
    { text: "*Back away slowly*", nextNodeId: "stranger_decline" },
  ],
};

// ============================================
// RESPONSE BRANCHES - ALL LEAD TO RIDDLE OFFER
// ============================================

const STRANGER_RESPONSE_IDENTITY: DialogueNode = {
  id: "stranger_response_identity",
  speaker: "???",
  portrait: "hooded_stranger",
  text: "QUERY::self_reference... ERROR::undefined_in_current_context... 0xDEADBEEF::OBSERVER_PROTOCOL...",
  next: "stranger_response_identity_feeling",
};

const STRANGER_RESPONSE_IDENTITY_FEELING: DialogueNode = {
  id: "stranger_response_identity_feeling",
  speaker: "",
  portrait: "",
  text: "*The question seems to confuse the figure—or perhaps amuse it. You sense layers upon layers of meaning, none of which you can grasp.*",
  next: "stranger_riddle_offer",
};

const STRANGER_RESPONSE_CONFUSION: DialogueNode = {
  id: "stranger_response_confusion",
  speaker: "???",
  portrait: "hooded_stranger",
  text: "EXPECTED::comprehension_failure... IRRELEVANT::verbal_processing... TRANSMIT::direct_method...",
  next: "stranger_response_confusion_feeling",
};

const STRANGER_RESPONSE_CONFUSION_FEELING: DialogueNode = {
  id: "stranger_response_confusion_feeling",
  speaker: "",
  portrait: "",
  text: "*The figure tilts its head, as if considering a new approach. Then something shifts in the air between you—*",
  next: "stranger_riddle_offer",
};

// ============================================
// RIDDLE/QUEST OFFER - THE COMPULSION
// ============================================

const STRANGER_RIDDLE_OFFER: DialogueNode = {
  id: "stranger_riddle_offer",
  speaker: "???",
  portrait: "hooded_stranger",
  text: "TRANSMIT::location_packet... 0x52554E53::sector_7... CACHE::await_retrieval... TOKEN::prepared...",
  next: "stranger_riddle_feeling",
};

const STRANGER_RIDDLE_FEELING: DialogueNode = {
  id: "stranger_riddle_feeling",
  speaker: "",
  portrait: "",
  text: "*Pain lances through your skull—brief but intense. And then... images. Ancient ruins. Crumbling stone walls. A hidden chamber beneath. Something waiting to be found.*",
  next: "stranger_riddle_feeling_2",
};

const STRANGER_RIDDLE_FEELING_2: DialogueNode = {
  id: "stranger_riddle_feeling_2",
  speaker: "",
  portrait: "",
  text: "*You don't know why, but you MUST go there. The compulsion is undeniable, like remembering something you've always known but never understood.*",
  choices: [
    { text: "*Accept the compulsion*", nextNodeId: "stranger_riddle_accept" },
    { text: "*Fight the feeling*", nextNodeId: "stranger_decline" },
  ],
};

const STRANGER_RIDDLE_ACCEPT: DialogueNode = {
  id: "stranger_riddle_accept",
  speaker: "???",
  portrait: "hooded_stranger",
  text: "CONFIRMED::directive_accepted... MONITORING::initiated... 0x574149542E2E2E...",
  next: "stranger_riddle_accept_feeling",
};

const STRANGER_RIDDLE_ACCEPT_FEELING: DialogueNode = {
  id: "stranger_riddle_accept_feeling",
  speaker: "",
  portrait: "",
  text: "*The image of the ruins burns brighter in your mind. You know exactly where to go, though you've never been there. The figure watches, silent now, as if waiting...*",
};

const STRANGER_DECLINE: DialogueNode = {
  id: "stranger_decline",
  speaker: "???",
  portrait: "hooded_stranger",
  text: "ACKNOWLEDGED::resistance_logged... PATIENCE::infinite... AWAIT::return...",
  next: "stranger_decline_feeling",
};

const STRANGER_DECLINE_FEELING: DialogueNode = {
  id: "stranger_decline_feeling",
  speaker: "",
  portrait: "",
  text: "*The compulsion fades—but doesn't disappear entirely. It lingers at the edge of your thoughts, patient. The figure returns to its silent vigil, as if time means nothing to it.*",
};

// ============================================
// QUEST ACTIVE - REMINDER
// ============================================

const STRANGER_QUEST_ACTIVE: DialogueNode = {
  id: "stranger_quest_active",
  speaker: "???",
  portrait: "hooded_stranger",
  text: "QUERY::cache_status... RETURN::null... AWAITING::signal... 0x574149542E2E2E...",
  next: "stranger_active_feeling",
};

const STRANGER_ACTIVE_FEELING: DialogueNode = {
  id: "stranger_active_feeling",
  speaker: "",
  portrait: "",
  text: "*The image returns—ruins, a hidden space beneath ancient stone. The compulsion hasn't faded. You know where you need to go.*",
  choices: [
    { text: "*Focus on the image*", nextNodeId: "stranger_riddle_reminder" },
    { text: "*Leave*", nextNodeId: "stranger_active_leave" },
  ],
};

const STRANGER_RIDDLE_REMINDER: DialogueNode = {
  id: "stranger_riddle_reminder",
  speaker: "",
  portrait: "",
  text: "*The Whispering Ruins... a terminal chamber... behind where data once flowed. The words mean nothing, but the direction is clear.*",
};

const STRANGER_ACTIVE_LEAVE: DialogueNode = {
  id: "stranger_active_leave",
  speaker: "",
  portrait: "",
  text: "*The figure says nothing as you turn to leave. But you feel its attention on your back—patient, eternal, waiting.*",
};

// ============================================
// QUEST COMPLETE - NO CLARITY, STAYS CRYPTIC
// ============================================

const STRANGER_QUEST_COMPLETE: DialogueNode = {
  id: "stranger_quest_complete",
  speaker: "???",
  portrait: "hooded_stranger",
  text: "RECEIVED::token_signal... OBSERVATION::successful... DATA::logged... ANOMALY::confirmed...",
  next: "stranger_complete_feeling",
};

const STRANGER_COMPLETE_FEELING: DialogueNode = {
  id: "stranger_complete_feeling",
  speaker: "",
  portrait: "",
  text: "*Something passes between you—not words, not meaning, but acknowledgment. Whatever test this was, you seem to have passed. The figure seems... satisfied.*",
  next: "stranger_farewell",
};

const STRANGER_FAREWELL: DialogueNode = {
  id: "stranger_farewell",
  speaker: "???",
  portrait: "hooded_stranger",
  text: "PROCESS::terminate_local_instance... UNTIL::next_iteration... 0x4B4149::marked...",
  next: "stranger_farewell_feeling",
};

const STRANGER_FAREWELL_FEELING: DialogueNode = {
  id: "stranger_farewell_feeling",
  speaker: "",
  portrait: "",
  text: "*A strange sensation washes over you—almost like farewell, though nothing was said you could understand. And then—*",
  next: "stranger_vanish",
};

const STRANGER_VANISH: DialogueNode = {
  id: "stranger_vanish",
  speaker: "",
  portrait: "",
  text: "*The figure flickers like a candle in wind. For a heartbeat, you see something beneath the hood—geometric, angular, made of light rather than flesh. Then it simply... isn't there anymore. As if it never was.*",
};

// ============================================
// POST-QUEST (if somehow accessed again)
// ============================================

const STRANGER_AFTER_QUEST: DialogueNode = {
  id: "stranger_after_quest",
  speaker: "",
  portrait: "",
  text: "*The corner where the hooded figure once sat is empty. But sometimes, in the corner of your eye, you almost see... static. Watching.*",
};

// ============================================
// DIALOGUE RECORDS
// ============================================

export const STRANGER_DIALOGUES: Record<string, DialogueNode> = {
  stranger_not_ready: STRANGER_NOT_READY,
  stranger_not_ready_feeling: STRANGER_NOT_READY_FEELING,
  stranger_first_meeting: STRANGER_FIRST_MEETING,
  stranger_meeting_feeling: STRANGER_MEETING_FEELING,
  stranger_observing: STRANGER_OBSERVING,
  stranger_observing_feeling: STRANGER_OBSERVING_FEELING,
  stranger_speaks: STRANGER_SPEAKS,
  stranger_speaks_feeling: STRANGER_SPEAKS_FEELING,
  stranger_response_identity: STRANGER_RESPONSE_IDENTITY,
  stranger_response_identity_feeling: STRANGER_RESPONSE_IDENTITY_FEELING,
  stranger_response_confusion: STRANGER_RESPONSE_CONFUSION,
  stranger_response_confusion_feeling: STRANGER_RESPONSE_CONFUSION_FEELING,
  stranger_riddle_offer: STRANGER_RIDDLE_OFFER,
  stranger_riddle_feeling: STRANGER_RIDDLE_FEELING,
  stranger_riddle_feeling_2: STRANGER_RIDDLE_FEELING_2,
  stranger_riddle_accept: STRANGER_RIDDLE_ACCEPT,
  stranger_riddle_accept_feeling: STRANGER_RIDDLE_ACCEPT_FEELING,
  stranger_decline: STRANGER_DECLINE,
  stranger_decline_feeling: STRANGER_DECLINE_FEELING,
  stranger_quest_active: STRANGER_QUEST_ACTIVE,
  stranger_active_feeling: STRANGER_ACTIVE_FEELING,
  stranger_riddle_reminder: STRANGER_RIDDLE_REMINDER,
  stranger_active_leave: STRANGER_ACTIVE_LEAVE,
  stranger_quest_complete: STRANGER_QUEST_COMPLETE,
  stranger_complete_feeling: STRANGER_COMPLETE_FEELING,
  stranger_farewell: STRANGER_FAREWELL,
  stranger_farewell_feeling: STRANGER_FAREWELL_FEELING,
  stranger_vanish: STRANGER_VANISH,
  stranger_after_quest: STRANGER_AFTER_QUEST,
};

// ============================================
// DYNAMIC DIALOGUE FUNCTION
// ============================================

export function getStrangerDialogue(state: StrangerDialogueState): DialogueNode {
  // After quest completion - stranger is gone
  if (state.questStatuses.the_hooded_stranger === "completed") {
    return STRANGER_AFTER_QUEST;
  }

  // Must talk to Greta about the stranger first
  if (!state.flags.asked_about_stranger) {
    return STRANGER_NOT_READY;
  }

  // First meeting (after hearing about them from Greta)
  if (!state.flags.met_stranger) {
    return STRANGER_FIRST_MEETING;
  }

  // Quest active - check progress
  if (state.questStatuses.the_hooded_stranger === "active") {
    if (state.flags.found_cache) {
      // Player found the cache - show completion dialogue
      return STRANGER_QUEST_COMPLETE;
    }
    // Already received the compulsion, looking for cache
    if (state.flags.riddle_asked) {
      return STRANGER_QUEST_ACTIVE;
    }
  }

  // Offer the compulsion (before or after quest start, as long as they've met)
  return STRANGER_RIDDLE_OFFER;
}
