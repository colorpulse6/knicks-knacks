// Bandit Camp Prisoner Dialogues
// Dynamic dialogue based on whether prisoners have been rescued

import type { DialogueNode } from "../../types";

// ============================================
// PRISONER 1 - CAPTURED FARMER
// ============================================

const FARMER_IN_CAGE: DialogueNode = {
  id: "farmer_in_cage",
  speaker: "Captured Farmer",
  portrait: "",
  text: "*The farmer grips the cage bars desperately* Please, you have to help us! They're going to sell us to... someone. I heard them talking about 'payment' and 'subjects.'",
  next: "farmer_plea",
};

const FARMER_PLEA: DialogueNode = {
  id: "farmer_plea",
  speaker: "Captured Farmer",
  portrait: "",
  text: "The cage lock looks rusted. If you could just break it open... Please, my family doesn't even know where I am!",
};

const FARMER_FREED: DialogueNode = {
  id: "farmer_freed",
  speaker: "Rescued Farmer",
  portrait: "",
  text: "*He stretches his aching limbs* Thank the gods! I'll never forget this. Get the others out too - the merchant knows something about what they're planning!",
};

// ============================================
// PRISONER 2 - CAPTURED MERCHANT
// ============================================

const MERCHANT_IN_CAGE: DialogueNode = {
  id: "merchant_in_cage",
  speaker: "Captured Merchant",
  portrait: "",
  text: "*The merchant looks up with hollow eyes* They took my cart, my goods, everything. But that's not what scares me...",
  next: "merchant_warning",
};

const MERCHANT_WARNING: DialogueNode = {
  id: "merchant_warning",
  speaker: "Captured Merchant",
  portrait: "",
  text: "I overheard their leader - Vorn - talking to someone in his tent. Not one of his men. The voice was... strange. Like metal grinding on metal. They mentioned something about 'harvesting' us.",
};

const MERCHANT_FREED: DialogueNode = {
  id: "merchant_freed",
  speaker: "Rescued Merchant",
  portrait: "",
  text: "*He grabs your arm* Listen to me - there's something unnatural about their leader's weapons. They spark and hum like nothing I've ever seen. Be careful when you face him!",
  next: "merchant_hint",
};

const MERCHANT_HINT: DialogueNode = {
  id: "merchant_hint",
  speaker: "Rescued Merchant",
  portrait: "",
  text: "And after you deal with Vorn... check under his tent. I saw them carrying crates down through a trapdoor. Whatever they're hiding, it's important.",
};

// ============================================
// PRISONER 3 - CAPTURED GUARD
// ============================================

const GUARD_IN_CAGE: DialogueNode = {
  id: "guard_in_cage",
  speaker: "Captured Guard",
  portrait: "",
  text: "*The guard soldier sits slumped against the bars* They ambushed our patrol. Six men with strange weapons that shot lightning. We didn't stand a chance.",
  next: "guard_intel",
};

const GUARD_INTEL: DialogueNode = {
  id: "guard_intel",
  speaker: "Captured Guard",
  portrait: "",
  text: "Vorn's tent is to the north. He's got at least two bodyguards inside with him. And that weapon of his... it's not from any blacksmith I've ever seen.",
};

const GUARD_FREED: DialogueNode = {
  id: "guard_freed",
  speaker: "Rescued Guard",
  portrait: "",
  text: "*He salutes weakly* I'm in no shape to fight, but I can help the others escape. You focus on taking down Vorn - Captain Bren would want that scum brought to justice.",
  next: "guard_thanks",
};

const GUARD_THANKS: DialogueNode = {
  id: "guard_thanks",
  speaker: "Rescued Guard",
  portrait: "",
  text: "Thank you, friend. Havenwood won't forget what you've done here today. Now go - end this!",
};

// ============================================
// DIALOGUE RECORDS
// ============================================

export const PRISONER_DIALOGUES: Record<string, DialogueNode> = {
  // Farmer
  farmer_in_cage: FARMER_IN_CAGE,
  farmer_plea: FARMER_PLEA,
  farmer_freed: FARMER_FREED,
  // Merchant
  merchant_in_cage: MERCHANT_IN_CAGE,
  merchant_warning: MERCHANT_WARNING,
  merchant_freed: MERCHANT_FREED,
  merchant_hint: MERCHANT_HINT,
  // Guard
  guard_in_cage: GUARD_IN_CAGE,
  guard_intel: GUARD_INTEL,
  guard_freed: GUARD_FREED,
  guard_thanks: GUARD_THANKS,
};

/**
 * Get dialogue for a prisoner based on rescue status
 */
export function getPrisonerDialogue(
  prisonerId: "prisoner_farmer" | "prisoner_merchant" | "prisoner_guard",
  isFreed: boolean
): DialogueNode {
  switch (prisonerId) {
    case "prisoner_farmer":
      return isFreed ? FARMER_FREED : FARMER_IN_CAGE;
    case "prisoner_merchant":
      return isFreed ? MERCHANT_FREED : MERCHANT_IN_CAGE;
    case "prisoner_guard":
      return isFreed ? GUARD_FREED : GUARD_IN_CAGE;
    default:
      return FARMER_IN_CAGE;
  }
}
