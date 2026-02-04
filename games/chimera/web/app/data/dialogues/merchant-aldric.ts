// Merchant Aldric's Dialogue - Shop Owner and Quest Giver
// Handles: Lost Shipment side quest, Scholar information for Seeking Answers

import type { DialogueNode } from "../../types";

export interface AldricDialogueState {
  questStatuses: {
    lost_shipment: "not_started" | "active" | "completed";
    seeking_answers: "not_started" | "active" | "completed";
  };
  flags: {
    outskirts_unlocked: boolean;
    helped_aldric: boolean;
    asked_about_scholars: boolean;
    found_mechanism: boolean;
  };
}

/**
 * Get Merchant Aldric's dialogue based on current story state
 */
export function getAldricDialogue(state: AldricDialogueState): DialogueNode {
  const { questStatuses, flags } = state;

  // Lost Shipment completed - grateful
  if (questStatuses.lost_shipment === "completed") {
    // Also asked about scholars
    if (flags.asked_about_scholars) {
      return ALDRIC_GRATEFUL_AND_HELPFUL;
    }
    return ALDRIC_GRATEFUL;
  }

  // Lost Shipment active
  if (questStatuses.lost_shipment === "active") {
    return ALDRIC_SHIPMENT_ACTIVE;
  }

  // Seeking Answers active - can provide Lumina info
  if (questStatuses.seeking_answers === "active" && !flags.asked_about_scholars) {
    return ALDRIC_SCHOLAR_INFO;
  }

  // Has mechanism but hasn't started Seeking Answers yet
  if (flags.found_mechanism && !flags.asked_about_scholars) {
    return ALDRIC_NOTICE_TROUBLED;
  }

  // Outskirts unlocked - can offer Lost Shipment
  if (flags.outskirts_unlocked && questStatuses.lost_shipment === "not_started") {
    return ALDRIC_SHIPMENT_INTRO;
  }

  // Default shop dialogue
  return ALDRIC_SHOP_DEFAULT;
}

// ============================================
// DEFAULT - Regular shop dialogue
// ============================================

const ALDRIC_SHOP_DEFAULT: DialogueNode = {
  id: "aldric_shop_default",
  speaker: "Aldric",
  text: "Welcome to Aldric's Provisions! I've got remedies, supplies, and the occasional rare find. What can I interest you in today?",
  portrait: "merchant_aldric",
  choices: [
    {
      text: "Show me your wares.",
      nextNodeId: "aldric_shop_open",
    },
    {
      text: "Just looking around.",
      nextNodeId: "aldric_browse",
    },
  ],
};

export const ALDRIC_SHOP_OPEN: DialogueNode = {
  id: "aldric_shop_open",
  speaker: "Aldric",
  text: "Of course! Browse at your leisure. I stand behind every item—quality goods at fair prices.",
  portrait: "merchant_aldric",
  // This would trigger the shop UI
};

const ALDRIC_BROWSE: DialogueNode = {
  id: "aldric_browse",
  speaker: "Aldric",
  text: "Take your time. Let me know if anything catches your eye.",
  portrait: "merchant_aldric",
};

// ============================================
// LOST SHIPMENT - Quest Introduction
// ============================================

const ALDRIC_SHIPMENT_INTRO: DialogueNode = {
  id: "aldric_shipment_intro",
  speaker: "Aldric",
  text: "*sighs heavily* Another cart ambushed on the north road. Those blasted bandits made off with half my stock—medicines, food stores, even some rare herbs I'd finally sourced. If this keeps up, I'll have to close my doors.",
  portrait: "merchant_aldric",
  choices: [
    {
      text: "Where was the cart ambushed?",
      nextNodeId: "aldric_shipment_details",
    },
    {
      text: "That's unfortunate. I need to buy something.",
      nextNodeId: "aldric_shop_open",
    },
  ],
};

export const ALDRIC_SHIPMENT_DETAILS: DialogueNode = {
  id: "aldric_shipment_details",
  speaker: "Aldric",
  text: "Somewhere in the outskirts, near the old watchtower. My driver barely escaped with his life. If you're heading that way... well, I'd pay handsomely to get those supplies back. Can't replace them easily.",
  portrait: "merchant_aldric",
  choices: [
    {
      text: "I'll see what I can find.",
      nextNodeId: "aldric_shipment_accept",
    },
    {
      text: "Sorry, I have other priorities.",
      nextNodeId: "aldric_shipment_decline",
    },
  ],
};

export const ALDRIC_SHIPMENT_ACCEPT: DialogueNode = {
  id: "aldric_shipment_accept",
  speaker: "Aldric",
  text: "You'd do that? Bless you! The cart was marked with my shop's symbol—a mortar and pestle. Bring back what you can, and I'll make sure you're well compensated. And... be careful. Those bandits are dangerous.",
  portrait: "merchant_aldric",
};

export const ALDRIC_SHIPMENT_DECLINE: DialogueNode = {
  id: "aldric_shipment_decline",
  speaker: "Aldric",
  text: "I understand. If you change your mind, the offer stands. Now, is there anything I can sell you?",
  portrait: "merchant_aldric",
};

// ============================================
// LOST SHIPMENT - Quest Active
// ============================================

const ALDRIC_SHIPMENT_ACTIVE: DialogueNode = {
  id: "aldric_shipment_active",
  speaker: "Aldric",
  text: "Any luck finding my supplies? The cart was near the old watchtower in the outskirts. It had my shop symbol—a mortar and pestle. Those medicines could save lives...",
  portrait: "merchant_aldric",
};

// ============================================
// LOST SHIPMENT - Quest Complete
// ============================================

const ALDRIC_GRATEFUL: DialogueNode = {
  id: "aldric_grateful",
  speaker: "Aldric",
  text: "You've saved my livelihood! With these supplies back, I can keep the shop running. Here—your reward, as promised. And from now on, you'll always get my best prices. A friend of the shop is a friend indeed!",
  portrait: "merchant_aldric",
};

const ALDRIC_GRATEFUL_AND_HELPFUL: DialogueNode = {
  id: "aldric_grateful_and_helpful",
  speaker: "Aldric",
  text: "Ah, my favorite customer! You saved my business AND helped point you toward the Lumina family. If there's anything else I can do, just say the word. Best prices in Havenwood for you, always!",
  portrait: "merchant_aldric",
};

// ============================================
// SEEKING ANSWERS - Scholar Information
// ============================================

const ALDRIC_NOTICE_TROUBLED: DialogueNode = {
  id: "aldric_notice_troubled",
  speaker: "Aldric",
  text: "You look troubled, friend. Found something strange on your travels? I've been a merchant thirty years—I've seen things that would curl your hair. Maybe I can help?",
  portrait: "merchant_aldric",
  choices: [
    {
      text: "Do you know anyone who studies ancient things?",
      nextNodeId: "aldric_scholar_info",
    },
    {
      text: "It's nothing. Let me see your wares.",
      nextNodeId: "aldric_shop_open",
    },
  ],
};

const ALDRIC_SCHOLAR_INFO: DialogueNode = {
  id: "aldric_scholar_info",
  speaker: "Aldric",
  text: "Scholars, eh? Well, most folk here are practical types—farmers, craftsmen, guards. But if you're looking for someone who knows about old mysteries and strange artifacts... the Lumina family might be your best bet.",
  portrait: "merchant_aldric",
  choices: [
    {
      text: "Tell me about the Lumina family.",
      nextNodeId: "aldric_lumina_info",
    },
    {
      text: "Anyone else?",
      nextNodeId: "aldric_other_scholars",
    },
  ],
};

export const ALDRIC_LUMINA_INFO: DialogueNode = {
  id: "aldric_lumina_info",
  speaker: "Aldric",
  text: "The Luminas are old nobility—their estate is to the north, past the outskirts. Lady Lyra runs things now. Keeps to herself mostly, but she's known for collecting old books, artifacts, strange curiosities. If anyone in this region knows about ancient secrets, it'd be her.",
  portrait: "merchant_aldric",
  choices: [
    {
      text: "How do I get an audience with her?",
      nextNodeId: "aldric_lumina_audience",
    },
  ],
};

export const ALDRIC_LUMINA_AUDIENCE: DialogueNode = {
  id: "aldric_lumina_audience",
  speaker: "Aldric",
  text: "Nobles are particular about who they see. But I've heard Lady Lyra has an interest in... unusual things. If you have something genuinely strange to show, she might grant you an audience. Worth trying, at least.",
  portrait: "merchant_aldric",
};

export const ALDRIC_OTHER_SCHOLARS: DialogueNode = {
  id: "aldric_other_scholars",
  speaker: "Aldric",
  text: "Father Silas at the old chapel knows some old lore, but he's more about faith than artifacts. There's also talk of a strange fellow who visits the Rusted Cog tavern—asks odd questions, pays in foreign coin. But for real scholarship? The Luminas are your best bet.",
  portrait: "merchant_aldric",
  choices: [
    {
      text: "Tell me more about the Lumina family.",
      nextNodeId: "aldric_lumina_info",
    },
    {
      text: "Thanks for the information.",
      nextNodeId: "aldric_youre_welcome",
    },
  ],
};

export const ALDRIC_YOURE_WELCOME: DialogueNode = {
  id: "aldric_youre_welcome",
  speaker: "Aldric",
  text: "Happy to help! And if you need supplies, you know where to find me.",
  portrait: "merchant_aldric",
};

// Export all dialogue nodes
export const ALDRIC_DIALOGUES: Record<string, DialogueNode> = {
  aldric_shop_default: ALDRIC_SHOP_DEFAULT,
  aldric_shop_open: ALDRIC_SHOP_OPEN,
  aldric_browse: ALDRIC_BROWSE,
  aldric_shipment_intro: ALDRIC_SHIPMENT_INTRO,
  aldric_shipment_details: ALDRIC_SHIPMENT_DETAILS,
  aldric_shipment_accept: ALDRIC_SHIPMENT_ACCEPT,
  aldric_shipment_decline: ALDRIC_SHIPMENT_DECLINE,
  aldric_shipment_active: ALDRIC_SHIPMENT_ACTIVE,
  aldric_grateful: ALDRIC_GRATEFUL,
  aldric_grateful_and_helpful: ALDRIC_GRATEFUL_AND_HELPFUL,
  aldric_notice_troubled: ALDRIC_NOTICE_TROUBLED,
  aldric_scholar_info: ALDRIC_SCHOLAR_INFO,
  aldric_lumina_info: ALDRIC_LUMINA_INFO,
  aldric_lumina_audience: ALDRIC_LUMINA_AUDIENCE,
  aldric_other_scholars: ALDRIC_OTHER_SCHOLARS,
  aldric_youre_welcome: ALDRIC_YOURE_WELCOME,
};
