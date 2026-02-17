// Lady Lyra Lumina - Noble scholar and key story character
// Quest: "Seeking Answers" and "The Lady's Curiosity"

import type { DialogueNode } from "../../types";

export interface LyraDialogueState {
  questStatuses: {
    seeking_answers: "not_started" | "active" | "completed";
    the_ladys_curiosity: "not_started" | "active" | "completed";
  };
  flags: {
    met_lyra: boolean;
    showed_mechanism: boolean;
    lyra_recruited: boolean;
    lyra_saw_terminal: boolean;
  };
}

// ============================================
// DIALOGUE NODES
// ============================================

// First meeting - Lyra recognizes Kai from rescuing him at the gates
const LYRA_FIRST_MEETING: DialogueNode = {
  id: "lyra_first_meeting",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "*A young woman with striking silver-blonde hair looks up from a tome — then freezes, violet eyes widening with recognition* Wait. I know you.",
  next: "lyra_greeting",
};

const LYRA_GREETING: DialogueNode = {
  id: "lyra_greeting",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "You're the one I found collapsed outside the village gates! Sunburnt, half-dead — I had Sebastian help me carry you up to the garden to rest. I went back to check on you, but you'd vanished. How did you even get down from there?",
  choices: [
    {
      text: "That was you? Thank you.",
      nextNodeId: "lyra_you_saved_me",
    },
    {
      text: "There was a ladder.",
      nextNodeId: "lyra_the_ladder",
    },
  ],
};

const LYRA_YOU_SAVED_ME: DialogueNode = {
  id: "lyra_you_saved_me",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "*waves a hand dismissively* Anyone would have done the same. Though I confess, it wasn't entirely selfless — you were carrying something when I found you. A strange artifact. I couldn't pry it from your fingers, so I left it with you. Elder Morris mentioned you've been asking about the ruins?",
  next: "lyra_show_mechanism",
};

const LYRA_THE_LADDER: DialogueNode = {
  id: "lyra_the_ladder",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "*She blinks* Ladder? There's no ladder up there — that garden has been sealed for years. *She shakes her head* Never mind that. You were carrying something strange when I found you. An artifact unlike anything I've seen. Do you still have it?",
  next: "lyra_show_mechanism",
};

const LYRA_SHOW_MECHANISM: DialogueNode = {
  id: "lyra_show_mechanism",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "*You show her the Broken Mechanism. Her eyes widen, and her hand trembles slightly as she reaches for it*",
  next: "lyra_recognizes",
};

const LYRA_RECOGNIZES: DialogueNode = {
  id: "lyra_recognizes",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "By the Lineage... I've seen diagrams of this in my family's oldest texts. Drawings passed down for generations—we thought they were just myths. 'The tools of the Builders,' they called them.",
  next: "lyra_excited",
};

const LYRA_EXCITED: DialogueNode = {
  id: "lyra_excited",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "*She sets down the mechanism carefully, her scholarly composure cracking with excitement* This changes everything. Where did you find this? The texts speak of a place called the 'Archive'—a repository of ancient knowledge.",
  choices: [
    {
      text: "In a hidden cellar beneath a bandit camp.",
      nextNodeId: "lyra_bandit_cellar",
    },
    {
      text: "What do you know about 'the Builders'?",
      nextNodeId: "lyra_about_builders",
    },
  ],
};

const LYRA_BANDIT_CELLAR: DialogueNode = {
  id: "lyra_bandit_cellar",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "A cellar? That... makes a disturbing amount of sense. The Whispering Ruins aren't far from there. According to my research, the ruins may extend far deeper than what's visible. The old texts describe vast chambers beneath the earth.",
  next: "lyra_proposal",
};

const LYRA_ABOUT_BUILDERS: DialogueNode = {
  id: "lyra_about_builders",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "'The Builders' is what the oldest texts call them. Our ancestors—or so we thought. But the more I study, the more I believe they weren't our ancestors at all. They were something else. Something that came before.",
  next: "lyra_about_builders_2",
};

const LYRA_ABOUT_BUILDERS_2: DialogueNode = {
  id: "lyra_about_builders_2",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "*lowers voice* There are passages in the Lumina archives that speak of a 'great reshaping.' Of a world that existed before this one. A world of light and metal and knowledge beyond imagining.",
  next: "lyra_proposal",
};

const LYRA_PROPOSAL: DialogueNode = {
  id: "lyra_proposal",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "*She stands, resolution in her eyes* I've spent my whole life studying ancient texts, dreaming of finding proof. And now you've brought it to my doorstep. I want to see the place where you found this.",
  choices: [
    {
      text: "It could be dangerous.",
      nextNodeId: "lyra_danger_response",
    },
    {
      text: "I was planning to explore the Whispering Ruins.",
      nextNodeId: "lyra_ruins_interest",
    },
  ],
};

const LYRA_DANGER_RESPONSE: DialogueNode = {
  id: "lyra_danger_response",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "*She laughs, but there's steel beneath it* I'm not the delicate flower you might imagine. My family's martial traditions go back as far as our scholarly ones. Besides... I have to know. This is everything I've been searching for.",
  next: "lyra_joins",
};

const LYRA_RUINS_INTEREST: DialogueNode = {
  id: "lyra_ruins_interest",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "The Whispering Ruins! Yes—the texts mention a sanctum deep within. A place where the Builders kept their most sacred records. If we could reach it...",
  next: "lyra_joins",
};

const LYRA_JOINS: DialogueNode = {
  id: "lyra_joins",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "*She removes a glowing pendant from beneath her collar* This has been in my family for generations. They say it 'resonates with the old places.' I never understood what that meant—until now. Take me with you. Please.",
};

// After joining - before seeing terminal
const LYRA_PARTY_MEMBER: DialogueNode = {
  id: "lyra_party_member",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "I'm ready when you are. The Whispering Ruins await. Let's find this Terminal—and the truth hidden within.",
};

// After seeing the terminal - revelation
const LYRA_POST_TERMINAL: DialogueNode = {
  id: "lyra_post_terminal",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "*She stares into the distance, still processing* The pendant... it woke the sanctum. As if it had been waiting. Not for anyone—for me. For my blood.",
  next: "lyra_post_terminal_2",
};

const LYRA_POST_TERMINAL_2: DialogueNode = {
  id: "lyra_post_terminal_2",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "I saw... visions. Symbols I recognized from the oldest Lumina texts—the ones my father forbade me from reading. Lines of light, branching like a great tree. And at the roots... my family's name. Woven into the very pattern of it.",
  next: "lyra_post_terminal_3",
};

const LYRA_POST_TERMINAL_3: DialogueNode = {
  id: "lyra_post_terminal_3",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "*She meets your eyes, shaken but determined* I always believed my family were keepers of history. But what if we're not just keeping it? What if we're... part of it? Something older than I can name. We must learn more.",
};

// Return visit without mechanism
const LYRA_NO_MECHANISM: DialogueNode = {
  id: "lyra_no_mechanism",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "Feeling better? You gave me quite a scare at the gates. Elder Morris has been asking about you — says something strange has been found near the ruins. Come back when you've spoken with him.",
};

// ============================================
// DIALOGUE RECORDS
// ============================================

export const LYRA_DIALOGUES: Record<string, DialogueNode> = {
  lyra_first_meeting: LYRA_FIRST_MEETING,
  lyra_greeting: LYRA_GREETING,
  lyra_you_saved_me: LYRA_YOU_SAVED_ME,
  lyra_the_ladder: LYRA_THE_LADDER,
  lyra_show_mechanism: LYRA_SHOW_MECHANISM,
  lyra_recognizes: LYRA_RECOGNIZES,
  lyra_excited: LYRA_EXCITED,
  lyra_bandit_cellar: LYRA_BANDIT_CELLAR,
  lyra_about_builders: LYRA_ABOUT_BUILDERS,
  lyra_about_builders_2: LYRA_ABOUT_BUILDERS_2,
  lyra_proposal: LYRA_PROPOSAL,
  lyra_danger_response: LYRA_DANGER_RESPONSE,
  lyra_ruins_interest: LYRA_RUINS_INTEREST,
  lyra_joins: LYRA_JOINS,
  lyra_party_member: LYRA_PARTY_MEMBER,
  lyra_post_terminal: LYRA_POST_TERMINAL,
  lyra_post_terminal_2: LYRA_POST_TERMINAL_2,
  lyra_post_terminal_3: LYRA_POST_TERMINAL_3,
  lyra_no_mechanism: LYRA_NO_MECHANISM,
};

// ============================================
// DYNAMIC DIALOGUE FUNCTION
// ============================================

export function getLyraDialogue(state: LyraDialogueState): DialogueNode {
  // After seeing the Terminal
  if (state.flags.lyra_saw_terminal) {
    return LYRA_POST_TERMINAL;
  }

  // After recruitment
  if (state.flags.lyra_recruited) {
    return LYRA_PARTY_MEMBER;
  }

  // Has shown the mechanism
  if (state.flags.showed_mechanism) {
    return LYRA_PROPOSAL;
  }

  // First meeting with mechanism
  if (state.flags.met_lyra) {
    return LYRA_NO_MECHANISM;
  }

  // First meeting
  return LYRA_FIRST_MEETING;
}
