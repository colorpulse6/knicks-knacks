# Act I Expansion Plan: The Cracks in Reality

## Current State Summary

### What We Have
- **Havenwood Village** - Safe zone with 4 NPCs, shop, inn, 1 quest
- **Whispering Ruins** - First dungeon with 4 encounter zones, 1 boss trigger
- **Characters** - Kai (Anomaly) and Lyra (Diplomat, not yet recruitable)
- **Enemies** - 8 types (bandits, corrupted creatures, System Agent)
- **Quests** - 1 side quest (Herbalist's Request)

### Story Beats Needed (from Act I outline)
1. ✅ Introduction - Kai in Havenwood (done)
2. ✅ First Anomaly - Save points with shimmer effect (done)
3. ⚠️ Early Conflicts - Bandits exist, need more structure
4. ❌ The Spark - First "magic" manifestation event
5. ❌ Whispers of the AI - Cryptic NPC encounter
6. ❌ The First Major Glitch - Act I climax with reality shattering

---

## Phase 1: Expand Havenwood (Town Building)

### New Buildings

#### 1. The Lumina Estate (North Havenwood)
- **Purpose**: Lady Lyra's family home, recruitment location
- **Visual**: Grand manor with purple/gold accents, iron gates
- **Interior Map**: Foyer, library (lore books), garden courtyard
- **NPCs**:
  - Butler Aldric (formal, guards entrance initially)
  - Lady Lyra (available after "noble_invitation" flag)
- **Quest Triggers**:
  - "An Audience with Nobility" - gain entry to the estate
  - "The Lady's Curiosity" - Lyra joins party after sharing anomaly info

#### 2. The Rusted Cog Tavern (East Havenwood)
- **Purpose**: Rumor mill, quest board, mercenary contacts
- **Visual**: Rowdy establishment with cog/gear decorations (hint at tech)
- **NPCs**:
  - Barkeep Greta - sells rumors for gold
  - Hooded Stranger - cryptic dialogue (AI manifestation #1)
  - Notice Board - side quest listings
- **Special**: Strange mechanical music box plays anachronistic tunes

#### 3. The Old Chapel (West Havenwood)
- **Purpose**: Save point with lore, hermit NPC
- **Visual**: Crumbling stone chapel with glowing windows
- **NPCs**:
  - Father Silas - speaks of "the Pattern" (foreshadowing)
  - Hidden basement with ancient texts
- **Event**: First minor glitch vision when praying

#### 4. Town Hall / Elder's House (Central)
- **Purpose**: Main quest hub for village defense
- **NPCs**:
  - Elder Morris (already exists, expand dialogue)
  - Guard Captain Bren - bandit threat briefing
- **Quest**: "The Bandit Problem" - main story quest

---

## Phase 2: New Maps

### Map 1: Havenwood Outskirts (Connecting Area)
- **Size**: 30x20 tiles
- **Purpose**: Transition between village and wilderness
- **Features**:
  - Northern path → Whispering Ruins
  - Eastern path → Bandit Camp
  - Western path → Ancient Road (locked until later)
  - Southern path → Havenwood Village
- **Encounters**: Light (wolves, bandits scouting)
- **Points of Interest**:
  - Abandoned watchtower (treasure, lore)
  - Old well (collectible, hint at underground)
  - Roadside shrine (save point)

### Map 2: Bandit Camp (Story Dungeon)
- **Size**: 25x25 tiles
- **Purpose**: Main story quest location, "The Bandit Problem"
- **Features**:
  - Palisade walls, tents, central bonfire
  - Prison area (rescue villagers)
  - Leader's tent (mini-boss: Bandit Chief Vorn)
  - Hidden cellar with strange artifacts
- **Story Beat**: Bandits found using "strange weapons" (first tech hint)
- **Boss**: Bandit Chief Vorn
  - Uses a "lightning rod" weapon (tech disguised as magic)
  - Drops "Broken Mechanism" key item

### Map 3: Whispering Ruins - Lower Level
- **Size**: 30x25 tiles
- **Purpose**: Deeper exploration, "The Spark" event location
- **Features**:
  - Collapsed sections requiring navigation
  - Ancient machinery (dormant)
  - Central chamber with "THE TERMINAL"
  - Glowing conduits on walls
- **Encounters**: Corrupted sprites, static wraiths, new "Data Fragment" enemy
- **Story Beat**: Kai touches the Terminal, triggering first power awakening
- **Boss**: Corrupted Guardian (Level 4)
  - Ancient security protocol awakened
  - Dialogue hints at "unauthorized access detected"

### Map 4: The Hidden Laboratory (Act I Climax)
- **Size**: 20x20 tiles
- **Purpose**: "The First Major Glitch" event
- **Access**: Found after Terminal activation
- **Features**:
  - Clean metallic corridors (stark contrast to ruins)
  - Holographic displays (shown as "magic mirrors")
  - Stasis pods (some with figures inside)
  - Central console with "SYSTEM INTERFACE"
- **Story Beat**: Reality visibly glitches, revealing technological nature
- **Boss**: System Agent Epsilon
  - "You were not supposed to find this place, Anomaly KAI_7.34"
  - Harder than regular System Agent
  - Victory triggers Act I ending cutscene

---

## Phase 3: Quest Chain

### Main Story Quests

#### Quest 1: "Whispers of Trouble"
- **Giver**: Elder Morris
- **Trigger**: Complete Herbalist's Request OR reach Level 2
- **Objective**: Investigate reports of bandit activity near village
- **Steps**:
  1. Talk to Guard Captain Bren at Town Hall
  2. Patrol the Havenwood Outskirts
  3. Find evidence of bandit scouting (campfire remains)
  4. Report back to Elder Morris
- **Reward**: 75 gold, 40 XP, access to Bandit Camp
- **Flags Set**: `bandit_threat_known`, `outskirts_unlocked`

#### Quest 2: "The Bandit Problem"
- **Giver**: Elder Morris
- **Prerequisite**: Complete "Whispers of Trouble"
- **Objective**: Raid the bandit camp and end the threat
- **Steps**:
  1. Enter the Bandit Camp
  2. Free the captured villagers (3 cages)
  3. Defeat Bandit Chief Vorn
  4. Discover the strange artifact in the cellar
  5. Return the artifact to Elder Morris
- **Reward**: 200 gold, 100 XP, "Broken Mechanism" key item
- **Flags Set**: `bandits_defeated`, `found_mechanism`, `strange_tech_seen`
- **Note**: Elder Morris is disturbed by the mechanism, suggests the "old scholar"

#### Quest 3: "Seeking Answers"
- **Giver**: Elder Morris (after examining mechanism)
- **Prerequisite**: Complete "The Bandit Problem"
- **Objective**: Find someone who can explain the strange technology
- **Steps**:
  1. Ask around town about scholars (multiple NPCs)
  2. Learn about the Lumina family's archives
  3. Gain audience at the Lumina Estate (need to help someone first)
  4. Speak with Lady Lyra about the mechanism
- **Reward**: 50 XP, access to Lumina Estate interior
- **Flags Set**: `met_lyra`, `noble_invitation`

#### Quest 4: "The Lady's Curiosity"
- **Giver**: Lady Lyra
- **Prerequisite**: Complete "Seeking Answers"
- **Objective**: Lyra wants to see the ruins where you found clues
- **Steps**:
  1. Agree to escort Lyra to the Whispering Ruins
  2. **LYRA JOINS PARTY** (temporarily)
  3. Navigate to the Terminal chamber
  4. Witness Lyra's reaction to the technology
  5. Lyra decides to join permanently
- **Reward**: Lady Lyra joins party permanently, 150 XP
- **Flags Set**: `lyra_recruited`, `lyra_saw_terminal`

#### Quest 5: "The Spark Within" (Act I Climax Setup)
- **Giver**: Lyra (after joining)
- **Prerequisite**: `lyra_recruited`
- **Objective**: Explore the lower ruins that Lyra's research suggests
- **Steps**:
  1. Enter Whispering Ruins - Lower Level (new area unlocks)
  2. Navigate the ancient machinery
  3. Reach the Terminal
  4. **EVENT**: Kai touches Terminal, awakens latent abilities
  5. Defeat the Corrupted Guardian
  6. Discover the hidden passage
- **Reward**: Kai learns "System Pulse" ability, 200 XP
- **Flags Set**: `awakening_triggered`, `lower_ruins_cleared`

#### Quest 6: "The First Major Glitch" (Act I Finale)
- **Giver**: Auto-triggered after Quest 5
- **Prerequisite**: `awakening_triggered`
- **Objective**: Investigate the hidden laboratory
- **Steps**:
  1. Enter The Hidden Laboratory
  2. Witness reality glitches (screen effects)
  3. Discover the stasis pods
  4. Confront System Agent Epsilon
  5. **BOSS BATTLE**: System Agent Epsilon
  6. **CUTSCENE**: World's true nature revealed briefly
  7. Escape as lab begins to collapse
- **Reward**: 500 XP, 300 gold, "Fragment of Truth" key item
- **Flags Set**: `act1_complete`, `saw_the_truth`, `epsilon_defeated`
- **Ending**: Return to Havenwood, world seems "different" now

### Side Quests

#### "The Hooded Stranger"
- **Giver**: Barkeep Greta (rumor purchase, 50 gold)
- **Objective**: A mysterious figure has been asking about "anomalies"
- **Steps**:
  1. Find the Hooded Stranger at the Rusted Cog (night only)
  2. Cryptic conversation (AI testing Kai)
  3. Given a riddle about the ruins
  4. Solve the riddle to find a hidden cache
- **Reward**: "Observer's Token" accessory (+10% XP gain)
- **Flags Set**: `met_observer`, `ai_first_contact`
- **Note**: Stranger speaks in glitched text occasionally

#### "Father Silas's Visions"
- **Giver**: Father Silas at Old Chapel
- **Prerequisite**: `strange_tech_seen`
- **Objective**: The priest has been having visions of "the Pattern"
- **Steps**:
  1. Listen to Silas describe his visions
  2. Find 3 "Pattern Fragments" in the ruins
  3. Return fragments to Silas
  4. Witness his interpretation (foreshadowing Act II)
- **Reward**: "Blessed Amulet" accessory (+5 MDEF, resist Silence)
- **Flags Set**: `silas_visions_heard`, `pattern_fragments_found`

#### "Lost Shipment"
- **Giver**: Merchant Aldric
- **Prerequisite**: `outskirts_unlocked`
- **Objective**: A supply cart was ambushed on the road
- **Steps**:
  1. Search the Outskirts for the cart
  2. Defeat bandits guarding the loot
  3. Recover the supplies
  4. Return to Aldric
- **Reward**: 100 gold, shop discount (10% off)
- **Flags Set**: `helped_aldric`, `aldric_discount`

---

## Phase 4: New Enemies

### New Enemy Types

#### Data Fragment (Level 2)
- **HP**: 30 | **MP**: 20
- **Type**: Corrupted (magical)
- **Appearance**: Floating geometric shard, glitches occasionally
- **Abilities**:
  - Byte Strike (physical, weak)
  - Corrupt (inflicts Poison)
- **Drops**: Shadow Essence, Ancient Cog (rare)
- **AI**: Random
- **Lore**: Leftover data made manifest

#### Bandit Chief Vorn (Level 3 Mini-Boss)
- **HP**: 120 | **MP**: 30
- **Type**: Humanoid (physical)
- **Appearance**: Scarred veteran with a strange sparking weapon
- **Abilities**:
  - Heavy Slash (1.5x damage)
  - Lightning Rod (magic damage, tech weapon)
  - Rally Cry (buffs ATK)
  - Steal (chance to take item)
- **Drops**: Sanguine Draught x2, Broken Mechanism (guaranteed)
- **AI**: Aggressive
- **Dialogue**: "That fancy footwork won't save you!"

#### Corrupted Guardian (Level 4 Boss)
- **HP**: 200 | **MP**: 50
- **Type**: Construct (hybrid)
- **Appearance**: Ancient mechanical knight, flickering between solid and glitched
- **Abilities**:
  - Protocol Strike (physical, high damage)
  - System Scan (reduces party defense)
  - Purge Subroutine (AOE magic)
  - Error State (self-heal when HP < 30%)
- **Drops**: Theriac Electuary, Ancient Core (key item)
- **AI**: Smart
- **Dialogue**: "INTRUDER DETECTED. INITIATING CONTAINMENT."

#### System Agent Epsilon (Level 6 Boss)
- **HP**: 300 | **MP**: 80
- **Type**: System (hybrid)
- **Appearance**: Humanoid figure in clean white, moves unnaturally smooth
- **Abilities**:
  - Precise Strike (high physical, never misses)
  - Data Drain (steals MP)
  - System Override (inflicts Silence + Slow)
  - EXECUTE.EXE (heavy AOE, used below 25% HP)
  - Regeneration Protocol (heals 30 HP/turn when below 50%)
- **Drops**: Fragment of Truth (guaranteed), Theriac Electuary x2
- **AI**: Smart
- **Dialogue**:
  - Intro: "Anomaly KAI_7.34. You were not supposed to find this place."
  - 50% HP: "Your resistance is... unexpected. Recalibrating."
  - Defeat: "This... does not... compute..."

---

## Phase 5: New Items

### Key Items
- **Broken Mechanism** - A strange device from the bandit camp. It sparks occasionally.
- **Ancient Core** - Power source from the Corrupted Guardian. Warm to the touch.
- **Fragment of Truth** - A shard of crystallized data. Shows brief visions when held.
- **Observer's Token** - A coin with an eye symbol. Feels like it's watching.
- **Pattern Fragments** (x3) - Pieces of something larger. They hum when near each other.

### Equipment
- **Lightning Rod** - Weapon (Vorn's weapon, repaired)
  - Attack: 15, Magic Attack: 10
  - Special: 10% chance to inflict Paralysis

- **Guardian's Plate** - Armor (from Corrupted Guardian)
  - Defense: 12, Magic Defense: 8
  - Special: +10 Max HP

- **System Shard Blade** - Weapon (crafted from Fragment of Truth)
  - Attack: 18
  - Special: +5% critical chance, glitch visual effect

### Consumables
- **Smelling Salts** - Cures Sleep, 40 gold
- **Antidote Draught** - Cures Poison, 35 gold
- **Speed Tonic** - Grants Haste for 3 turns, 80 gold
- **Barrier Scroll** - Grants Protect for 4 turns, 100 gold

---

## Phase 6: Story Flags Reference

### Act I Flag Checklist
```
# Tutorial / Early Game
- helped_herbalist (optional)
- mira_shop_discount (optional)

# Main Story Path
- bandit_threat_known
- outskirts_unlocked
- bandits_defeated
- found_mechanism
- strange_tech_seen
- met_lyra
- noble_invitation
- lyra_recruited
- lyra_saw_terminal
- awakening_triggered
- lower_ruins_cleared
- act1_complete
- saw_the_truth
- epsilon_defeated

# Optional / Side Content
- met_observer
- ai_first_contact
- silas_visions_heard
- pattern_fragments_found
- helped_aldric
- aldric_discount
```

---

## Implementation Priority

### Immediate (Phase 1-2)
1. Create Havenwood Outskirts map (connecting area)
2. Create Bandit Camp map
3. Add new buildings to Havenwood (at minimum Town Hall expansion)
4. Implement "Whispers of Trouble" quest

### Short-term (Phase 3)
5. Implement "The Bandit Problem" quest + Vorn boss
6. Create Lumina Estate (exterior + basic interior)
7. Implement Lyra recruitment quest chain
8. Add new enemy types (Data Fragment, Bandit Chief Vorn)

### Medium-term (Phase 4-5)
9. Create Whispering Ruins - Lower Level
10. Implement "The Spark Within" quest
11. Add Corrupted Guardian boss
12. Create The Hidden Laboratory

### Act I Finale (Phase 6)
13. Implement "The First Major Glitch" quest
14. Add System Agent Epsilon boss
15. Create Act I ending cutscene/transition
16. Add all side quests

---

## Design Notes

### Pacing Considerations
- Player should be Level 2-3 before Bandit Camp
- Lyra should join around Level 3-4
- Act I climax expects Level 5-6 party
- Total Act I playtime target: 2-3 hours

### Foreshadowing Checklist
- [ ] Mechanical cog decorations in Rusted Cog Tavern
- [ ] Father Silas's "Pattern" dialogue
- [ ] Hooded Stranger's glitched text
- [ ] Bandit's "lightning rod" weapon
- [ ] Corrupted Guardian's robotic dialogue
- [ ] Terminal's interface hints
- [ ] Stasis pods in Hidden Laboratory

### Combat Balance
- Vorn: Challenging solo, manageable with items
- Corrupted Guardian: Requires Lyra's support skills
- Epsilon: True Act I test, should feel climactic

---

## Implementation Status (Session 1)

### Completed
- [x] **Havenwood Outskirts map** - [havenwood_outskirts.ts](../web/app/data/maps/havenwood_outskirts.ts)
  - 35x25 tiles, connecting area between village and wilderness
  - Features: Old watchtower ruins, stream with bridge, roadside shrine (save point), signpost
  - NPCs: Peddler, Road Guard
  - Encounters: Wolves (west), Bandits (east), Mixed (north)
  - Connections to: Havenwood (south), Ruins (north), Bandit Camp (east)

- [x] **Bandit Camp map** - [bandit_camp.ts](../web/app/data/maps/bandit_camp.ts)
  - 30x30 tiles, story dungeon with palisade walls
  - Features: Leader's tent, prison cages (3), central bonfire, supply area, watchtower
  - NPCs: 3 captured prisoners
  - Boss: Bandit Chief Vorn trigger
  - Hidden cellar entrance (unlocks after Vorn defeated)

- [x] **Bandit Cellar map** - [bandit_cellar.ts](../web/app/data/maps/bandit_cellar.ts)
  - 15x12 tiles, small underground area
  - Features: Strange glowing floor, artifact device (story discovery)
  - Key item: Broken Mechanism

- [x] **New Enemy Types** - Added to [enemies.ts](../web/app/data/enemies.ts)
  - Bandit Chief Vorn (Level 3 Mini-Boss, 120 HP)
    - Abilities: Heavy Slash, Lightning Rod (magic/tech), Rally Cry, Steal
  - Data Fragment (Level 2 corrupted entity, 30 HP)
    - Abilities: Byte Strike, Corrupt (inflicts Poison)

- [x] **New Items** - Added to [items.ts](../web/app/data/items.ts)
  - Key Items: Broken Mechanism, Rusty Key, Fragment of Truth, Observer's Token
  - Consumables: Antidote Draught, Speed Tonic, Barrier Scroll, Smelling Salts
  - Treasure: Ancient Coin

- [x] **Main Story Quests** - Added to [quests.ts](../web/app/data/quests.ts)
  - "Whispers of Trouble" - Investigate bandit activity
  - "The Bandit Problem" - Raid the camp, defeat Vorn
  - "Seeking Answers" - Find someone to explain the mechanism
  - "The Lady's Curiosity" - Escort Lyra, recruit her

- [x] **Side Quests**
  - "Lost Shipment" - Help Aldric recover supplies
  - "The Hooded Stranger" - Mysterious AI contact

- [x] **Map Updates**
  - Havenwood now connects to Outskirts (not directly to Ruins)
  - Added Guard Captain Bren NPC to Havenwood

### Session 2 Additions

- [x] **Elder Morris Dynamic Dialogue** - [elder-morris.ts](../web/app/data/dialogues/elder-morris.ts)
  - Full quest chain dialogue for: Whispers of Trouble, Bandit Problem, Seeking Answers
  - Reactions to mechanism discovery, Lyra introduction

- [x] **Captain Bren Dynamic Dialogue** - [captain-bren.ts](../web/app/data/dialogues/captain-bren.ts)
  - Bandit briefings, tactical advice, patrol reminders
  - Post-victory gratitude dialogue

- [x] **Merchant Aldric Dynamic Dialogue** - [merchant-aldric.ts](../web/app/data/dialogues/merchant-aldric.ts)
  - Lost Shipment quest dialogue
  - Lumina family information for Seeking Answers quest
  - Shop integration dialogue

- [x] **Dialogue Index System** - [index.ts](../web/app/data/dialogues/index.ts)
  - Central export for all dialogues
  - Utility functions: `getDynamicDialogue()`, `getQuestStatus()`
  - State builders for each NPC

- [x] **Whispering Ruins Lower Level** - [whispering_ruins_lower.ts](../web/app/data/maps/whispering_ruins_lower.ts)
  - 35x30 tiles, deep dungeon with ancient machinery
  - The Terminal (key story location)
  - Corrupted Guardian boss arena
  - Glowing conduits, stasis pod preview (foreshadowing)
  - Connection to Hidden Laboratory (to be implemented)

- [x] **Corrupted Guardian Boss** - Added to enemies.ts
  - Level 4 boss, 200 HP
  - Abilities: Protocol Strike, System Scan, Purge Subroutine, Error State
  - Drops: Ancient Core (guaranteed), Theriac Electuary

- [x] **Map Connection Updates**
  - Ruins now exits to Outskirts (not directly to Havenwood)
  - Lower Ruins accessible from upper Ruins (requires `lyra_recruited` flag)

### Remaining Work
- [x] Quest trigger integration with game engine (Session 3)
- [ ] Prisoner rescue mechanics
- [ ] Lyra recruitment implementation
- [x] The Hidden Laboratory map (Act I finale) (Session 3)
- [x] System Agent Epsilon boss (Session 3)
- [ ] Terminal awakening cutscene/event

### Session 3 Additions

- [x] **Quest System Verified Complete**
  - Full QuestScreen UI in menu with filter tabs (Active/All/Completed)
  - Quest state management in gameStore (startQuest, completeQuest, etc.)
  - onItemCollected auto-updates collect objectives
  - Visual quest markers on MapView ("!" for available, "?" for in-progress)
  - Collectible rendering with glow effects when quest is active

- [x] **The Hidden Laboratory** - [hidden_laboratory.ts](../web/app/data/maps/hidden_laboratory.ts)
  - 20x20 tiles, Act I finale location
  - Clean metallic aesthetic (stark contrast to ruins)
  - Features:
    - Central System Interface (main story trigger)
    - Stasis pods (4) with examine events revealing lore
    - Holographic displays showing simulation data
    - Data terminals with Project Genesis info
  - Boss: System Agent Epsilon trigger
  - Save point at entrance
  - Connections: From whispering_ruins_lower (requires `found_laboratory_entrance` flag)
  - Story events:
    - System Interface access triggers Act I climax
    - Epsilon confrontation after interface accessed
    - Act I completion trigger after Epsilon defeated

- [x] **System Agent Epsilon Boss** - Added to enemies.ts
  - Level 6 final boss, 300 HP, 80 MP
  - Faster than regular System Agents (ATB speed 10)
  - Abilities:
    - Precise Strike (25 power physical, never misses)
    - Data Drain (steals MP)
    - System Override (inflicts Silence + Slow)
    - EXECUTE.EXE (35 power AOE, used below 25% HP)
    - Regeneration Protocol (self-heal over time)
  - Drops: Fragment of Truth (guaranteed), Theriac Electuary x2
  - Dialogue hints at Kai's designation: "Anomaly KAI_7.34"

- [x] **Map Registry Updated**
  - 7 total maps now registered in gameStore:
    - havenwood, havenwood_outskirts
    - whispering_ruins, whispering_ruins_lower
    - bandit_camp, bandit_cellar
    - hidden_laboratory

### Remaining Work for Act I Completion
- [ ] Prisoner rescue mechanics (bandit camp cages)
- [ ] Lyra recruitment cutscene/party join
- [ ] Terminal awakening cutscene (Kai's power awakening)
- [ ] Act I ending cutscene/transition
- [ ] Side quests: Father Silas's Visions

---

*Last Updated: Session 3 - Hidden Laboratory and System Agent Epsilon complete*
*Build Status: Compiling successfully*
*Total Maps: 7 | Total Enemies: 10+ | Total Quests: 8*
*Next Action: Implement Lyra recruitment, Terminal awakening event, prisoner rescue*
