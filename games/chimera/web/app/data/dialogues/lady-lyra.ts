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

// First meeting - curious about the visitor
const LYRA_FIRST_MEETING: DialogueNode = {
  id: "lyra_first_meeting",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "*A young woman with striking silver-blonde hair looks up from a tome, her violet eyes meeting yours with sharp intelligence*",
  next: "lyra_greeting",
};

const LYRA_GREETING: DialogueNode = {
  id: "lyra_greeting",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "Ah, a visitor. Sebastian mentioned someone had arrived. You're the one Elder Morris sent, aren't you? Something about an unusual artifact?",
  choices: [
    {
      text: "Yes. I found something strange.",
      nextNodeId: "lyra_show_mechanism",
    },
    {
      text: "How did you know Elder Morris sent me?",
      nextNodeId: "lyra_explains_knowing",
    },
  ],
};

const LYRA_EXPLAINS_KNOWING: DialogueNode = {
  id: "lyra_explains_knowing",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "*smiles slightly* Little happens in Havenwood without word reaching this estate. The Lumina family has been... keepers of knowledge for generations. When something unusual occurs, people come to us. Now, let me see this artifact of yours.",
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
  text: "A cellar? That... makes a disturbing amount of sense. The Whispering Ruins aren't far from there. According to my research, the ruins might be just the surface. There could be entire facilities hidden beneath.",
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
  text: "The Whispering Ruins! Yes—the texts mention a 'Terminal' deep within. A place where the Builders stored their memories. If we could reach it...",
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
  text: "*She stares into the distance, still processing* The pendant... it activated the Terminal. As if it was waiting for me specifically. For someone of my bloodline.",
  next: "lyra_post_terminal_2",
};

const LYRA_POST_TERMINAL_2: DialogueNode = {
  id: "lyra_post_terminal_2",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "The things I saw in that data stream... genetic markers, lineage tracking, 'Prime Code Authorization.' My family wasn't just keeping records of the Builders. We ARE part of their system.",
  next: "lyra_post_terminal_3",
};

const LYRA_POST_TERMINAL_3: DialogueNode = {
  id: "lyra_post_terminal_3",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "*She meets your eyes, shaken but determined* Everything we thought we knew is a lie. This world, our history, even our bloodlines—they were designed. But by whom? And why? We need answers. Real answers.",
};

// Return visit without mechanism
const LYRA_NO_MECHANISM: DialogueNode = {
  id: "lyra_no_mechanism",
  speaker: "Lady Lyra Lumina",
  portrait: "lady_lyra",
  text: "You've returned. Have you found the artifact Elder Morris mentioned? I've been researching in preparation—the old texts speak of 'keys to the Archive.'",
};

// ============================================
// DIALOGUE RECORDS
// ============================================

export const LYRA_DIALOGUES: Record<string, DialogueNode> = {
  lyra_first_meeting: LYRA_FIRST_MEETING,
  lyra_greeting: LYRA_GREETING,
  lyra_explains_knowing: LYRA_EXPLAINS_KNOWING,
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
