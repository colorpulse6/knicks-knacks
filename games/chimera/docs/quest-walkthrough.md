m# Chimera: Act I Quest Walkthrough

This guide covers all quests in Act I of Chimera, including objectives, NPC locations, and progression flow.

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Main Story Quests](#main-story-quests)
3. [Side Quests](#side-quests)
4. [NPC Locations](#npc-locations)
5. [Recommended Play Order](#recommended-play-order)

---

## Quick Reference

### Main Story Quests (4 total)

| Quest                | Giver            | Prerequisite                   |
| -------------------- | ---------------- | ------------------------------ |
| Whispers of Trouble  | Elder Morris     | None                           |
| The Bandit Problem   | Elder Morris     | Complete "Whispers of Trouble" |
| Seeking Answers      | Elder Morris     | Complete "The Bandit Problem"  |
| The Lady's Curiosity | Lady Lyra Lumina | Complete "Seeking Answers"     |

### Side Quests (3 total)

| Quest                   | Giver           | Prerequisite     |
| ----------------------- | --------------- | ---------------- |
| The Herbalist's Request | Herbalist Mira  | None             |
| Lost Shipment           | Merchant Aldric | Unlock Outskirts |
| The Hooded Stranger     | Barkeep Greta   | None             |

---

## Main Story Quests

### 1. Whispers of Trouble

**Quest Giver:** Elder Morris (Havenwood Village)
**Category:** Main Story
**Prerequisites:** None (available from game start)

**Description:**

> Investigate reports of bandit activity near Havenwood. Travelers on the northern road have been disappearing, and scouts have spotted unfamiliar figures lurking in the outskirts.

**Objectives:**

1. **Speak with Guard Captain Bren**

   - Location: Havenwood Village (18, 10)
   - Talk to Captain Bren at the Town Hall area for intelligence about the bandit sightings

2. **Patrol the Havenwood Outskirts**

   - Travel north from Havenwood to reach the Outskirts area
   - Explore the area looking for signs of trouble

3. **Find evidence of bandit activity**

   - Look for the bandit evidence item in the Outskirts
   - This may involve defeating some bandit scouts

4. **Report findings to Elder Morris**
   - Return to Elder Morris with what you've discovered
   - Location: Havenwood Village (12, 10)

**Rewards:**

- 75 Gold
- 50 XP
- **Story Flags:** `bandit_threat_known`, `outskirts_unlocked`, `bandit_camp_discovered`

**Unlocks:**

- "The Bandit Problem" quest
- "Lost Shipment" side quest (requires `outskirts_unlocked`)

---

### 2. The Bandit Problem

**Quest Giver:** Elder Morris
**Category:** Main Story
**Prerequisites:** Complete "Whispers of Trouble" (`bandit_threat_known` flag)

**Description:**

> Raid the bandit camp and put an end to their threat. The evidence is clear—a well-organized bandit camp lies east of the Havenwood Outskirts. Elder Morris has authorized a strike.

**Objectives:**

1. **Enter the Bandit Camp**

   - Travel to the eastern edge of the Outskirts
   - The camp entrance is marked on your map

2. **Free the captured villagers (0/3)**

   - Find and open 3 prisoner cages scattered throughout the camp
   - Cages are guarded by bandit patrols

3. **Defeat Bandit Chief Vorn**

   - **BOSS FIGHT:** Vorn wields a strange "Lightning Rod" weapon
   - Bring healing items—this is a challenging fight
   - Vorn uses electric-type attacks

4. **Investigate the hidden cellar**

   - After defeating Vorn, a cellar entrance is revealed
   - Explore to find the strange technology cache

5. **Return the strange artifact to Elder Morris**
   - Bring the "Broken Mechanism" item back to the village

**Rewards:**

- 200 Gold
- 100 XP
- Broken Mechanism (key item)
- 3x Sanguine Draught
- **Story Flags:** `bandits_defeated`, `found_mechanism`, `strange_tech_seen`

**Boss Tips - Bandit Chief Vorn:**

- Weakness: Slow attacks, vulnerable after using Lightning Rod
- Strategy: Keep HP above 50%, use Protect if available
- His "Thunder Slash" hits hard—consider having revival items

---

### 3. Seeking Answers

**Quest Giver:** Elder Morris
**Category:** Main Story
**Prerequisites:** Complete "The Bandit Problem" (`found_mechanism` flag)

**Description:**

> Find someone who can explain the strange mechanism. The artifact from the bandit cellar defies explanation—metal that moves on its own, lights that glow without flame. Elder Morris suggests finding a scholar.

**Objectives:**

1. **Ask villagers about scholars**

   - Talk to various NPCs in Havenwood
   - Merchant Aldric may have useful information

2. **Learn about the Lumina family archives**

   - The Lumina family is known for their extensive knowledge
   - Gather information about how to gain an audience

3. **Gain an audience at the Lumina Estate**
   - Travel to the Lumina Estate (new location unlocked)
   - Meet Lady Lyra Lumina for the first time

**Rewards:**

- 50 Gold
- 60 XP
- **Story Flags:** `met_lyra`, `noble_invitation`

**Unlocks:** "The Lady's Curiosity" quest

---

### 4. The Lady's Curiosity

**Quest Giver:** Lady Lyra Lumina
**Category:** Main Story
**Prerequisites:** Complete "Seeking Answers" (`met_lyra` + `noble_invitation` flags)

**Description:**

> Escort Lady Lyra to the Whispering Ruins. She recognizes some markings on the mechanism from ancient texts in her family's archives—texts that speak of "the builders who came before."

**Objectives:**

1. **Escort Lady Lyra to the Whispering Ruins**

   - Lyra joins your party for this quest
   - Travel to the Whispering Ruins entrance

2. **Navigate to the Terminal chamber**

   - Guide Lyra through the Upper Ruins
   - Descend to the Lower Ruins
   - Reach the ancient Terminal

3. **Witness Lyra's reaction to the technology**
   - A story cutscene plays when Lyra sees the Terminal
   - Her genetic marker triggers dormant protocols

**Rewards:**

- 150 XP
- **Story Flags:** `lyra_recruited`, `lyra_saw_terminal`
- **Lyra joins your party permanently!**

**Note:** This quest leads directly into the Act I finale at the Hidden Laboratory.

---

## Side Quests

### The Herbalist's Request

**Quest Giver:** Herbalist Mira
**Category:** Side Quest
**Prerequisites:** None (available from game start)
**Location:** Havenwood Village (5, 14)

**Description:**

> Gather 3 Moonpetal Flowers for Herbalist Mira. These delicate blooms only grow in the shadowed groves around Havenwood, and lately the forest has become dangerous.

**Objectives:**

1. **Gather Moonpetal Flowers (0/3)**

   - Flower locations in Havenwood:
     - Northwest corner (2, 2) - Near the trees
     - Northeast area (26, 3) - Past the shop
     - South area (14, 23) - Near the rocks
   - Flowers only appear after accepting the quest
   - They glow faintly—look for shimmering spots

2. **Return to Herbalist Mira**
   - Bring the 3 flowers back to Mira
   - She'll craft healing potions for you as thanks

**Rewards:**

- 100 Gold
- 50 XP
- 2x Sanguine Draught
- **Story Flags:** `helped_herbalist`, `mira_shop_discount`

**Tips:**

- This is a great first quest—rewards help with early combat
- Mira mentions "glitches" and "shimmering patches"—pay attention to this foreshadowing!

---

### Lost Shipment

**Quest Giver:** Merchant Aldric
**Category:** Side Quest
**Prerequisites:** Unlock Havenwood Outskirts (`outskirts_unlocked` flag)
**Location:** Havenwood Village (22, 10)

**Description:**

> Help Merchant Aldric recover his stolen supplies. His latest supply cart was ambushed on the road to Havenwood. The bandits made off with valuable medicine, food, and trade materials.

**Objectives:**

1. **Find the ambushed cart**

   - Located in the Havenwood Outskirts
   - Follow the road until you find the wreckage

2. **Defeat the bandits guarding the loot**

   - A bandit patrol guards the stolen goods
   - Standard bandit encounter

3. **Return the supplies to Aldric**
   - Bring the recovered supplies back to Aldric in Havenwood

**Rewards:**

- 100 Gold
- 40 XP
- 2x Sanguine Draught
- **Story Flags:** `helped_aldric`, `aldric_discount`

**Tips:**

- Can be done while working on "Whispers of Trouble"
- The `aldric_discount` flag gives you better shop prices

---

### The Hooded Stranger

**Quest Giver:** Barkeep Greta (The Rusted Cog Tavern)
**Category:** Side Quest
**Prerequisites:** None (access tavern)

**Description:**

> Investigate rumors of a mysterious figure asking about "anomalies." A hooded figure has been asking odd questions about "glitches" and pays in strange coins. They seem interested in people who've experienced unusual phenomena...

**Objectives:**

1. **Find the Hooded Stranger at night**

   - Visit the tavern during nighttime hours
   - The stranger appears only after dark

2. **Solve the stranger's riddle**

   - The stranger poses a cryptic riddle
   - The answer relates to the nature of reality

3. **Find the hidden cache in the ruins**
   - Following the stranger's clues, locate a secret cache
   - Located in the Whispering Ruins

**Rewards:**

- 75 XP
- Observer's Token (unique item)
- **Story Flags:** `met_observer`, `ai_first_contact`

**Lore Significance:**

- The Hooded Stranger is an avatar of The System's AI
- This quest foreshadows major Act II revelations
- The Observer's Token has hidden significance...

---

## NPC Locations

### Havenwood Village

| NPC             | Role               | Coordinates | Notes                              |
| --------------- | ------------------ | ----------- | ---------------------------------- |
| Elder Morris    | Quest Giver (Main) | (12, 10)    | Village leader, main story hub     |
| Herbalist Mira  | Quest Giver (Side) | (5, 14)     | Sells potions, Herbalist's Request |
| Merchant Aldric | Quest Giver (Side) | (22, 10)    | General shop, Lost Shipment        |
| Captain Bren    | Story NPC          | (18, 10)    | Guard captain, bandit intel        |
| Tom             | Villager           | (8, 15)     | Wandering NPC, rumors              |

### Other Locations

| NPC              | Location       | Notes                                 |
| ---------------- | -------------- | ------------------------------------- |
| Lady Lyra Lumina | Lumina Estate  | Joins party in "The Lady's Curiosity" |
| Barkeep Greta    | The Rusted Cog | "The Hooded Stranger" quest giver     |
| Hooded Stranger  | Tavern (night) | Mysterious figure, AI avatar          |

---

## Recommended Play Order

### Optimal Progression

1. **Start in Havenwood Village**

   - Talk to Elder Morris → Accept "Whispers of Trouble"
   - Talk to Herbalist Mira → Accept "The Herbalist's Request"

2. **Complete "The Herbalist's Request" first**

   - Collect 3 Moonpetal Flowers around the village
   - Return to Mira for rewards (healing items help!)

3. **Progress "Whispers of Trouble"**

   - Talk to Captain Bren for intel
   - Travel to Havenwood Outskirts
   - Find bandit evidence

4. **Optional: Lost Shipment**

   - Talk to Aldric after unlocking Outskirts
   - Complete while exploring the Outskirts area

5. **Continue Main Story**

   - Report to Morris → Unlock "The Bandit Problem"
   - Raid the Bandit Camp, defeat Vorn
   - Discover the strange mechanism

6. **Seeking Answers**

   - Investigate the mechanism's origins
   - Meet Lady Lyra Lumina

7. **The Lady's Curiosity**

   - Escort Lyra to the Ruins
   - Lyra joins your party!

8. **Optional: The Hooded Stranger**

   - Available anytime with tavern access
   - Adds context before Act I finale

9. **Act I Finale**
   - Enter the Hidden Laboratory
   - Confront System Agent Epsilon
   - Witness the truth about reality

---

## Quest Status Checklist

Use this to track your progress:

**Main Story:**

- [ ] Whispers of Trouble
- [ ] The Bandit Problem
- [ ] Seeking Answers
- [ ] The Lady's Curiosity
- [ ] Act I Finale (Hidden Laboratory)

**Side Quests:**

- [ ] The Herbalist's Request
- [ ] Lost Shipment
- [ ] The Hooded Stranger

**Key Flags Unlocked:**

- [ ] `outskirts_unlocked` - Access to Havenwood Outskirts
- [ ] `bandit_threat_known` - Aware of bandit presence
- [ ] `bandits_defeated` - Cleared bandit camp
- [ ] `found_mechanism` - Discovered strange technology
- [ ] `met_lyra` - Met Lady Lyra Lumina
- [ ] `lyra_recruited` - Lyra joined party
- [ ] `lyra_saw_terminal` - Witnessed the Terminal

---

## Tips for New Players

1. **Save often** - Use the save point in Havenwood Square (15, 12)
2. **Talk to everyone** - NPCs give hints and context
3. **Check the Quest Log** - Press the menu button, select "Quests"
4. **Stock up on healing** - Aldric and Mira sell potions
5. **Look for "!" markers** - NPCs with available quests show exclamation marks
6. **Pay attention to dialogue** - The story has deep lore to discover
