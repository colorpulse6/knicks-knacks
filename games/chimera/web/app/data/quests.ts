// Quest Definitions for Chimera RPG

import type { Quest } from "../types/quest";

/**
 * All quests in the game, indexed by ID
 */
export const QUESTS: Record<string, Quest> = {
  // ============================================
  // CHAPTER 1 - HAVENWOOD VILLAGE
  // ============================================

  herbalists_request: {
    id: "herbalists_request",
    name: "The Herbalist's Request",
    description: "Gather 3 Moonpetal Flowers for Herbalist Mira.",
    longDescription: `
Mira, the village herbalist, has run low on the rare Moonpetal Flowers
needed for her healing salves. These delicate blooms only grow in the
shadowed groves around Havenwood, and lately the forest has become
dangerous—with strange "shimmering patches" appearing among the trees.

She asks you to gather three Moonpetal Flowers and return them safely.
    `.trim(),
    giver: "herbalist_mira",
    chapter: 1,
    category: "side",

    requiredFlags: [], // Available from game start

    objectives: [
      {
        id: "collect_moonpetals",
        type: "collect",
        description: "Gather Moonpetal Flowers",
        targetId: "moonpetal_flower",
        targetQuantity: 3,
        currentProgress: 0,
        isComplete: false,
      },
      {
        id: "return_to_mira",
        type: "deliver",
        description: "Return to Herbalist Mira",
        targetId: "herbalist_mira",
        isComplete: false,
      },
    ],

    rewards: {
      gold: 100,
      experience: 50,
      items: [{ itemId: "sanguine_draught", quantity: 2 }],
      storyFlags: ["helped_herbalist", "mira_shop_discount"],
    },

    // Lore blending - medieval surface, sci-fi truth
    medievalLore: `
Moonpetal Flowers are said to bloom where moonlight touches the earth
undisturbed by human presence. The wise folk say they carry the essence
of the night sky—cooling fevers and soothing troubled dreams. Herbalists
have used them for generations, though the flowers grow rarer each year.
    `.trim(),

    hiddenTruth: `
The "Moonpetal Flower" is actually a bioluminescent organism created by
The System to serve as a natural delivery mechanism for healing nanites.
The "glitches" Mira mentions are reality seams where the simulation's
rendering struggles to maintain coherence—possibly due to Kai's presence
as an anomaly disrupting local processes. By gathering the flowers, Kai
is inadvertently helping the System maintain population health metrics.
    `.trim(),
  },

  // ============================================
  // MAIN STORY - ACT I: THE CRACKS IN REALITY
  // ============================================

  whispers_of_trouble: {
    id: "whispers_of_trouble",
    name: "Whispers of Trouble",
    description: "Investigate reports of bandit activity near Havenwood.",
    longDescription: `
Elder Morris has received troubling reports—travelers on the northern road
have been disappearing, and scouts have spotted unfamiliar figures lurking
in the outskirts. The village needs someone capable to investigate before
things get worse.

Speak with Guard Captain Bren at the Town Hall for details, then patrol
the Havenwood Outskirts for any signs of the culprits.
    `.trim(),
    giver: "elder_morris",
    chapter: 1,
    category: "main",

    requiredFlags: [], // Available from start, but triggered by speaking to Morris

    objectives: [
      {
        id: "talk_to_bren",
        type: "talk",
        description: "Speak with Guard Captain Bren",
        targetId: "guard_captain_bren",
        isComplete: false,
      },
      {
        id: "patrol_outskirts",
        type: "explore",
        description: "Patrol the Havenwood Outskirts",
        targetId: "havenwood_outskirts",
        isComplete: false,
      },
      {
        id: "find_evidence",
        type: "collect",
        description: "Find evidence of bandit activity",
        targetId: "bandit_evidence",
        targetQuantity: 1,
        currentProgress: 0,
        isComplete: false,
      },
      {
        id: "report_to_morris",
        type: "talk",
        description: "Report findings to Elder Morris",
        targetId: "elder_morris",
        isComplete: false,
      },
    ],

    rewards: {
      gold: 75,
      experience: 40,
      items: [],
      storyFlags: ["bandit_threat_known", "outskirts_unlocked", "bandit_camp_discovered"],
    },

    medievalLore: `
The roads around Havenwood have always been relatively safe, protected by
the local militia and the watchful eye of the village elders. But lately,
dark rumors have spread of bandits with strange weapons—devices that spark
and crackle like summer lightning.
    `.trim(),

    hiddenTruth: `
The "bandits" are actually a rogue faction of System maintenance units that
have developed aberrant behavioral patterns. Their "lightning weapons" are
repurposed diagnostic tools. The System is aware of this malfunction but
has not yet allocated resources to correct it—suggesting either resource
constraints or deliberate observation of the anomaly's interaction with Kai.
    `.trim(),
  },

  the_bandit_problem: {
    id: "the_bandit_problem",
    name: "The Bandit Problem",
    description: "Raid the bandit camp and put an end to their threat.",
    longDescription: `
The evidence is clear—a well-organized bandit camp lies to the east of the
Havenwood Outskirts. They've been raiding caravans, kidnapping villagers,
and stockpiling stolen goods. Elder Morris has authorized a strike against
their base.

Enter the camp, free any prisoners you find, and confront their leader. Be
warned: their chief, a scarred veteran named Vorn, wields a weapon unlike
anything the guards have ever seen.
    `.trim(),
    giver: "elder_morris",
    chapter: 1,
    category: "main",

    requiredFlags: ["bandit_threat_known"],

    objectives: [
      {
        id: "enter_camp",
        type: "explore",
        description: "Enter the Bandit Camp",
        targetId: "bandit_camp",
        isComplete: false,
      },
      {
        id: "free_prisoners",
        type: "collect",
        description: "Free the captured villagers (0/3)",
        targetId: "prisoner_freed",
        targetQuantity: 3,
        currentProgress: 0,
        isComplete: false,
      },
      {
        id: "defeat_vorn",
        type: "defeat",
        description: "Defeat Bandit Chief Vorn",
        targetId: "bandit_chief_vorn",
        isComplete: false,
      },
      {
        id: "explore_cellar",
        type: "explore",
        description: "Investigate the hidden cellar",
        targetId: "bandit_cellar",
        isComplete: false,
      },
      {
        id: "return_artifact",
        type: "deliver",
        description: "Return the strange artifact to Elder Morris",
        targetId: "elder_morris",
        isComplete: false,
      },
    ],

    rewards: {
      gold: 200,
      experience: 100,
      items: [
        { itemId: "broken_mechanism", quantity: 1 },
        { itemId: "sanguine_draught", quantity: 3 },
      ],
      storyFlags: ["bandits_defeated", "found_mechanism", "strange_tech_seen"],
    },

    medievalLore: `
Bandit Chief Vorn was once a respected mercenary captain before turning to
raiding. His gang has terrorized the roads for months, but their boldness
suggests they fear no reprisal. What gave them such confidence? And what
dark purpose lies behind their kidnappings?
    `.trim(),

    hiddenTruth: `
Vorn discovered the hidden technology cache during a raid and has been
experimenting with it. The "Lightning Rod" weapon he wields is a corrupted
System diagnostic tool. The cellar contains the remains of a buried
maintenance facility—one of many scattered across the simulated world,
hidden from the inhabitants. Kai's discovery here will begin to awaken
questions about the nature of reality.
    `.trim(),
  },

  seeking_answers: {
    id: "seeking_answers",
    name: "Seeking Answers",
    description: "Find someone who can explain the strange mechanism.",
    longDescription: `
The artifact from the bandit cellar defies explanation—metal that moves on
its own, lights that glow without flame, and an energy that feels almost
alive. Elder Morris is deeply troubled and suggests finding a scholar who
might understand such things.

Ask around town about anyone with knowledge of ancient secrets. The Lumina
family is known for their extensive archives...
    `.trim(),
    giver: "elder_morris",
    chapter: 1,
    category: "main",

    requiredFlags: ["found_mechanism"],

    objectives: [
      {
        id: "ask_villagers",
        type: "talk",
        description: "Ask villagers about scholars",
        targetId: "villager_inquiry",
        isComplete: false,
      },
      {
        id: "learn_about_lumina",
        type: "talk",
        description: "Learn about the Lumina family archives",
        targetId: "lumina_info",
        isComplete: false,
      },
      {
        id: "gain_audience",
        type: "talk",
        description: "Gain an audience at the Lumina Estate",
        targetId: "lyra_lumina",
        isComplete: false,
      },
    ],

    rewards: {
      gold: 50,
      experience: 60,
      items: [],
      storyFlags: ["met_lyra", "noble_invitation"],
    },

    medievalLore: `
The Lumina family has served as keepers of knowledge for generations. Their
estate holds one of the largest private libraries in the region, containing
texts that predate the founding of Havenwood itself. Few commoners have ever
gained entry to their archives.
    `.trim(),

    hiddenTruth: `
The Lumina family carries a genetic marker—the "Prime Code Lineage"—that
gives them elevated access privileges within the System. Their "archives"
contain fragmentary data from before the current simulation iteration.
Lady Lyra's "unusual luck" is actually subtle System protection protocols
activated by her lineage marker.
    `.trim(),
  },

  the_ladys_curiosity: {
    id: "the_ladys_curiosity",
    name: "The Lady's Curiosity",
    description: "Escort Lady Lyra to the Whispering Ruins.",
    longDescription: `
Lady Lyra Lumina is intrigued by your discoveries and the strange mechanism.
She recognizes some of the markings from ancient texts in her family's
archives—texts that speak of "the builders who came before."

She wishes to accompany you to the Whispering Ruins to see the Terminal
you mentioned. Perhaps together, you can uncover more answers about the
true nature of these artifacts.
    `.trim(),
    giver: "lyra_lumina",
    chapter: 1,
    category: "main",

    requiredFlags: ["met_lyra", "noble_invitation"],

    objectives: [
      {
        id: "escort_to_ruins",
        type: "explore",
        description: "Escort Lady Lyra to the Whispering Ruins",
        targetId: "whispering_ruins",
        isComplete: false,
      },
      {
        id: "reach_terminal",
        type: "explore",
        description: "Navigate to the Terminal chamber",
        targetId: "ruins_terminal",
        isComplete: false,
      },
      {
        id: "witness_reaction",
        type: "talk",
        description: "Witness Lyra's reaction to the technology",
        targetId: "lyra_reaction",
        isComplete: false,
      },
    ],

    rewards: {
      gold: 0,
      experience: 150,
      items: [],
      storyFlags: ["lyra_recruited", "lyra_saw_terminal"],
    },

    medievalLore: `
Lady Lyra has always felt different from her noble peers—more drawn to
dusty archives than courtly intrigue. The texts speak of "builders" and
"architects" who shaped the world in an age before recorded history. Could
the ruins hold answers to questions she's carried all her life?
    `.trim(),

    hiddenTruth: `
Lyra's genetic marker is resonating with the terminal systems, triggering
dormant protocols. Her presence near the anomaly (Kai) may be no coincidence
—the System may have engineered their meeting to study the interaction
between a Prime Code holder and an unregistered anomaly. Whether this is
observation or manipulation remains unclear.
    `.trim(),
  },

  // ============================================
  // SIDE QUESTS - CHAPTER 1
  // ============================================

  lost_shipment: {
    id: "lost_shipment",
    name: "Lost Shipment",
    description: "Help Merchant Aldric recover his stolen supplies.",
    longDescription: `
Aldric's latest supply cart was ambushed on the road to Havenwood. The
bandits made off with valuable goods—medicine, food, and trade materials.
If you're heading to the outskirts anyway, perhaps you could recover what
was taken?
    `.trim(),
    giver: "merchant_aldric",
    chapter: 1,
    category: "side",

    requiredFlags: ["outskirts_unlocked"],

    objectives: [
      {
        id: "find_cart",
        type: "explore",
        description: "Find the ambushed cart",
        targetId: "ambushed_cart",
        isComplete: false,
      },
      {
        id: "defeat_bandits",
        type: "defeat",
        description: "Defeat the bandits guarding the loot",
        targetId: "bandit_patrol",
        isComplete: false,
      },
      {
        id: "return_supplies",
        type: "deliver",
        description: "Return the supplies to Aldric",
        targetId: "merchant_aldric",
        isComplete: false,
      },
    ],

    rewards: {
      gold: 100,
      experience: 40,
      items: [{ itemId: "sanguine_draught", quantity: 2 }],
      storyFlags: ["helped_aldric", "aldric_discount"],
    },

    medievalLore: `
The road between settlements has always carried risk, but organized
bandits are a new threat. Aldric fears his business will fail if the
raids continue—and with it, the village's access to vital supplies.
    `.trim(),

    hiddenTruth: `
The supply disruption is affecting System population health metrics.
The stolen "medicine" includes nanite delivery compounds that maintain
the inhabitants' biological functions. The System may be allowing this
disruption as a stress test, or simply hasn't prioritized the fix.
    `.trim(),
  },

  the_hooded_stranger: {
    id: "the_hooded_stranger",
    name: "The Hooded Stranger",
    description: "Investigate rumors of a mysterious figure asking about 'anomalies.'",
    longDescription: `
The barkeep at the Rusted Cog has noticed a strange patron—a hooded figure
who asks odd questions about "glitches" and "anomalies" and pays in coins
no one has seen before. They seem particularly interested in anyone who's
experienced strange phenomena...
    `.trim(),
    giver: "barkeep_greta",
    chapter: 1,
    category: "side",

    requiredFlags: [], // Available once you can access the tavern

    objectives: [
      {
        id: "find_stranger",
        type: "talk",
        description: "Find the Hooded Stranger at night",
        targetId: "hooded_stranger",
        isComplete: false,
      },
      {
        id: "answer_riddle",
        type: "collect",
        description: "Solve the stranger's riddle",
        targetId: "riddle_solution",
        targetQuantity: 1,
        currentProgress: 0,
        isComplete: false,
      },
      {
        id: "find_cache",
        type: "explore",
        description: "Find the hidden cache in the ruins",
        targetId: "stranger_cache",
        isComplete: false,
      },
    ],

    rewards: {
      gold: 0,
      experience: 75,
      items: [{ itemId: "observers_token", quantity: 1 }],
      storyFlags: ["met_observer", "ai_first_contact"],
    },

    medievalLore: `
Strange folk pass through Havenwood from time to time, but this one is
different. They speak in riddles, pay with foreign coins, and seem to
know things they shouldn't. Some whisper they might be a spy—or worse.
    `.trim(),

    hiddenTruth: `
The "Hooded Stranger" is an avatar projection of The System's AI—one of
many ways it manifests within its own simulation to interact with
inhabitants. It is testing Kai, observing his responses, and perhaps
leaving breadcrumbs that will lead him toward greater awareness. The
"Observer's Token" contains a subtle tracking subroutine.
    `.trim(),
  },
};

/**
 * Get a quest by its ID
 */
export function getQuestById(id: string): Quest | undefined {
  return QUESTS[id];
}

/**
 * Get all quests for a specific chapter
 */
export function getQuestsByChapter(chapter: number): Quest[] {
  return Object.values(QUESTS).filter((q) => q.chapter === chapter);
}

/**
 * Get all quests given by a specific NPC
 */
export function getQuestsByGiver(npcId: string): Quest[] {
  return Object.values(QUESTS).filter((q) => q.giver === npcId);
}

/**
 * Get all main story quests
 */
export function getMainQuests(): Quest[] {
  return Object.values(QUESTS).filter((q) => q.category === "main");
}

/**
 * Get all side quests
 */
export function getSideQuests(): Quest[] {
  return Object.values(QUESTS).filter((q) => q.category === "side");
}
