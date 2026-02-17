// Simple atmospheric dialogues for Havenwood district NPCs
// These NPCs add flavor and world-building to the village

import type { DialogueNode } from "../../types";

// ============================================
// VILLAGE SQUARE
// ============================================

export function getAnnaDialogue(): DialogueNode {
  return {
    id: "anna_greeting",
    speaker: "Anna",
    text: "Have you seen the flowers by the fountain today? They seem brighter than usual. Almost... glowing. My grandmother says the fountain has always been special.",
  };
}

export function getTownCrierDialogue(): DialogueNode {
  return {
    id: "town_crier_greeting",
    speaker: "Town Crier",
    text: "Hear ye, hear ye! Travelers are advised to avoid the outskirts road after dark. Bandit activity has been reported near the old ruins!",
  };
}

export function getVillagerTomDialogue(): DialogueNode {
  return {
    id: "villager_tom_greeting",
    speaker: "Tom",
    text: "Another quiet day in Havenwood... though lately the nights haven't been so quiet. Strange lights near the ruins, they say. I keep my doors locked after sunset.",
  };
}

// ============================================
// MARKET ROW
// ============================================

export function getFridaDialogue(): DialogueNode {
  return {
    id: "frida_greeting",
    speaker: "Frida",
    portrait: "frida",
    text: "Fresh fruit! Apples from the orchards, plums from the south! ...And these blue berries? Found 'em growing near the old aqueduct. Taste like starlight, they do!",
  };
}

export function getWeaverHoltDialogue(): DialogueNode {
  return {
    id: "holt_greeting",
    speaker: "Weaver Holt",
    portrait: "weaver_holt",
    text: "Finest cloth in Havenwood! Though... the silk shipments from the coast have been late. The Lumina family's orders take priority, it seems. Must be nice to be nobility.",
  };
}

export function getStreetUrchinDialogue(): DialogueNode {
  return {
    id: "urchin_greeting",
    speaker: "Street Urchin",
    portrait: "street_urchin",
    text: "Psst! Hey mister! I know a secret passage behind the guardhouse. ...Just kidding! But I DID see Captain Bren sneaking extra rations to someone. Wonder who?",
  };
}

// ============================================
// RESIDENTIAL LANE
// ============================================

export function getInnkeeperRowanDialogue(): DialogueNode {
  return {
    id: "rowan_greeting",
    speaker: "Innkeeper Rowan",
    text: "Welcome to The Weary Wanderer! We've got clean beds and warm stew. Business has been slow since the bandit troubles started. Fewer travelers on the roads these days...",
  };
}

export function getGrandmotherEdithDialogue(): DialogueNode {
  return {
    id: "edith_greeting",
    speaker: "Grandmother Edith",
    text: "In my youth, the old well was said to grant wishes. I wished for peace... and we had it, for many years. But something's changed. The earth hums at night. Can you feel it?",
  };
}

export function getCatWhiskersDialogue(): DialogueNode {
  return {
    id: "whiskers_dialogue",
    speaker: "Whiskers",
    text: "...Mrrrow?",
  };
}

// ============================================
// WATERFRONT
// ============================================

export function getFishermanReedDialogue(): DialogueNode {
  return {
    id: "reed_greeting",
    speaker: "Old Reed",
    text: "Fish ain't biting like they used to. Water's been warm... too warm for the season. And the marsh? Don't go into the marsh at night. Things glow in there that shouldn't.",
  };
}

export function getDockWorkerSalDialogue(): DialogueNode {
  return {
    id: "sal_greeting",
    speaker: "Sal",
    text: "These crates? All bound for the Lumina Estate. Heavy ones too. Sealed with wax I've never seen—won't melt, won't crack. Whatever's inside, the Lady wants it kept safe from the air itself.",
  };
}

export function getMarshHermitOrinDialogue(): DialogueNode {
  return {
    id: "orin_greeting",
    speaker: "Orin",
    text: "The marsh remembers what the village forgets. I've lived here forty years, and some nights the water glows from below. Not moonlight. Something deeper. Something patient.",
  };
}

// ============================================
// ESTATE ROAD
// ============================================

export function getGateGuardDialogue(hasMechanism: boolean): DialogueNode {
  if (hasMechanism) {
    return {
      id: "gate_guard_pass",
      speaker: "Gate Guard",
      text: "Lady Lyra sent word to expect you. You may pass. Mind the gardens—the Lady is particular about her grounds.",
    };
  }
  return {
    id: "gate_guard_stop",
    speaker: "Gate Guard",
    text: "Halt. The Lumina Estate is not open to the public. Only those with business with Lady Lyra may pass through these gates.",
  };
}

export function getNobleServantDialogue(): DialogueNode {
  return {
    id: "servant_greeting",
    speaker: "Servant",
    text: "Good day. I'm on an errand for the estate. Lady Lyra has been... preoccupied lately. Locked in her study for days. The other servants whisper, but I mind my own business.",
  };
}

// ============================================
// EXISTING SIMPLE NPCS (upgraded from generic)
// ============================================

export function getEstateButlerDialogue(): DialogueNode {
  return {
    id: "butler_greeting",
    speaker: "Sebastian",
    text: "Welcome to the Lumina Estate. Please do not touch the relics. Many are older than the estate itself, and Lady Lyra is... particular about their arrangement.",
  };
}

export function getEstateGuardDialogue(): DialogueNode {
  return {
    id: "estate_guard_interior",
    speaker: "Estate Guard",
    text: "The estate has been on high alert since the bandit activity increased. Lady Lyra's collection is quite valuable — both to scholars and to thieves.",
  };
}

export function getTavernPatronDialogue(): DialogueNode {
  return {
    id: "patron_greeting",
    speaker: "Patron",
    text: "Pull up a chair, stranger! The ale here's watered down, but the stories are strong. Have you heard about the lights in the ruins? Old Ferris swears he saw them dancing like festival lanterns—but there's no festival, and no one to light them.",
  };
}
