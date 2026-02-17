# Chimera Development Guide

## Navigation

> **Detailed implementation docs are in feature-level files.** This document covers world lore, characters, and content creation guidelines.

| Topic | Location |
|-------|----------|
| **Engine** (ATB, damage, AI) | `web/app/engine/CLAUDE.md` |
| **Data** (items, maps, dialogues, quests) | `web/app/data/CLAUDE.md` |
| **State** (Zustand patterns) | `web/app/stores/CLAUDE.md` |
| **Story docs** | `docs/story/` |
| **Asset list** | `docs/ASSETS.md` |
| **Content pipeline** | See "Content Pipeline" section below |
| **Prompt templates** | `prompts/gemini/`, `prompts/gpt/` |
| **Draft templates** | `drafts/` (Gemini output landing zone) |

---

## Expanding This Documentation

**These docs should grow with the game.** When you:

- **Discover an undocumented system** → Add it to the appropriate `CLAUDE.md`
- **Build a new feature** → Document the pattern before finishing
- **Find outdated info** → Update it immediately

**Where to add:**
| Content Type | Add To |
|--------------|--------|
| World lore, characters, tone | This file |
| Engine systems (ATB, damage, AI) | `web/app/engine/CLAUDE.md` |
| Data patterns (items, maps, quests) | `web/app/data/CLAUDE.md` |
| State management | `web/app/stores/CLAUDE.md` |
| New story flags | Story Flags Reference section below |

---

## Project Overview

**Chimera** is an FF6-style JRPG that presents itself as a medieval fantasy but slowly reveals itself to be a simulation controlled by an amoral AI. The game blends two realities—a "Light Facade" (medieval kingdom) and a "Dark Core" (AI-controlled simulation)—creating an existential narrative about free will, consciousness, and meaning.

**Inspirations:** Final Fantasy 6 (gameplay/ATB), Trigun (tonal shifts from light to dark), Camus/existentialist philosophy

**Tech Stack:** Next.js 15, React, TypeScript, Zustand, Canvas 2D rendering

---

## World & Tone Guide

### The Two Realities

| Light Facade | Dark Core |
|--------------|-----------|
| Kingdom of Aethelburg | AI-controlled simulation |
| Magic and mysticism | Precursor technology |
| Noble houses and villages | Genetic encoding and data streams |
| Ancient ruins | System infrastructure |
| Temporal Distortions (save points) | Data backup nodes |

### Tonal Progression

**Act I - The Cracks in Reality**
- Lighthearted medieval adventure
- Village troubles, exploration, meeting companions
- Subtle hints something is wrong (Kai's visions, "seams" in reality)
- First "Glitch" reveals chrome and energy beneath stone

**Act II - Unraveling the Code**
- Growing unease, reality breaks down frequently
- Glitches become combat mechanics
- Truth about Lumina family revealed
- Kai learns he is "Anomaly KAI_7.34"

**Act III - Confronting the Architect**
- Full reality breakdown, medieval/sci-fi blend chaotically
- Existential horror, confronting the AI
- Themes of free will vs. determinism reach climax

### Aesthetic Rules

- "Magic" is misunderstood precursor technology
- Glitches manifest as: chromatic aberration, static, chrome surfaces bleeding through stone
- Save points are "Temporal Distortions" - shimmering, reality-warping shrines
- System Agents wear dark, geometric armor with glowing sigils
- Corrupted creatures have visual static and unnatural movements

---

## Main Characters

### Kai (Protagonist)
- **Class:** Anomaly
- **Motivation:** Finding his missing sister Elara
- **Personality:** Direct, questioning, determined
- **Speech:** Short sentences, asks probing questions, rarely accepts surface explanations
- **Secret:** A glitch in the genetic code - can perceive reality's seams
- **Abilities:** Slash, Temporal Edge (8 MP), Focus

### Lady Lyra Lumina (First Companion)
- **Class:** Diplomat
- **Motivation:** Authentic experience beyond noble station
- **Personality:** Optimistic, genuinely kind, curious
- **Speech:** Formal noble dialect, encouraging, uses "we" and "shall"
- **Secret:** Lumina-encoded but somehow developed genuine free will
- **Abilities:** Staff Strike, Cure (6 MP), Protect (8 MP), Lucky Star (5 MP)

### Elara (Kai's Sister)
- Missing since before game starts
- Her fate is central mystery
- Appears in Kai's visions/memories

### The System (Antagonist)
- The AI controlling reality
- **Speech:** Cold, clinical, uses technical terminology
- Views humanity as a dataset to maintain
- Operates through System Agents (Correctors)

---

## Content Creation Guidelines

### When Creating Items

Items follow the **Four Humors** medical theory—authentic medieval healing philosophy. See `docs/items-guide.md` for full lore.

**The Four Humors:**
| Humor | Quality | Treats |
|-------|---------|--------|
| Blood (Sanguine) | Hot/Moist | Wounds, vitality loss |
| Phlegm | Cold/Moist | Mental exhaustion, MP |
| Yellow Bile (Choler) | Hot/Dry | Poison, toxins |
| Black Bile (Melancholy) | Cold/Dry | Severe injuries, near-death |

**Core Healing Items:**
| Item | Effect | Description |
|------|--------|-------------|
| Sanguine Draught | 50 HP | Warm tonic of red wine, honey, and nettle |
| Theriac Electuary | 200 HP | Bitter sludge of snake flesh and myrrh—the Great Cure |
| Hartshorn Salts | Revive | Crushed deer antler and vinegar shocks the soul back |
| Mithridate | Cure Poison | Rue leaf coated in antidote paste |
| Aqua Vitae | 30 MP | Distilled spirits that clarify the mind |

**DO:**
- Use apothecary/herbalist terminology
- Reference humors when describing effects
- Equipment: Iron Sword, Oak Staff, Leather Armor, Traveler's Cloak
- Key items: artifacts with mysterious properties (Elara's Pendant, Ancient Key)
- Late-game glitch items: Corrupted Shard, Data Fragment, Temporal Flux

**DON'T:**
- Health packs, med-kits, batteries, pills
- Guns, lasers, obvious technology
- Modern medical terms (antibiotics, vitamins)
- FF-style names (Potion, Hi-Potion, Phoenix Down, Ether)

**Example Descriptions:**
```
Sanguine Draught - A warm, iron-tasting tonic that stokes the inner fires.
Traveler's Stew - Hearty meal in a sealed clay pot. Restores body and spirit.
Warding Incense - Fragrant smoke that cleanses afflictions of the humors.
```

### When Creating Enemies

**Early Game (Act I):**
- Mundane threats: Bandits, Wild Wolves, Giant Rats, Rogue Knights
- Natural creatures with normal names

**Mid Game (Act II):**
- Corrupted creatures: Corrupted Sprite, Glitched Beast, Static Wraith
- Visual: creatures with digital artifacts, wrong colors, stuttering movements

**Late Game (Act III):**
- System entities: System Agent, Data Construct, Reality Fragment
- Abstract threats: geometric shapes, pure energy, broken physics

**Example Enemy:**
```typescript
{
  name: "Flickering Hound",
  description: "A wolf-like creature that phases in and out of visibility",
  ai: { type: "aggressive", targetPriority: "lowest_hp" },
  abilities: ["Bite", "Phase Strike"],
  drops: [{ itemId: "shadow_fur", chance: 0.2 }]
}
```

### When Writing Dialogue

**Kai:**
```
"Where did she go? Someone must have seen something."
"This doesn't add up. Why would the ruins repair themselves?"
"I won't stop until I find her."
```

**Lyra:**
```
"How wonderful! I've never ventured this far from the castle."
"Shall we investigate together? Two pairs of eyes are better than one."
"I sense there's more to you than meets the eye, Kai."
```

**Village NPCs:**
```
"The old ruins? Strange lights been comin' from there lately."
"Best stay away from the forest at night, traveler."
"Bless the Lumina family for keeping us safe."
```

**System/AI (Act III only):**
```
"Anomaly detected. Initiating correction protocols."
"Your persistence is statistically improbable. Fascinating."
"Free will is an inefficient variable. Order requires predictability."
```

### When Designing Abilities

**Physical:** Traditional weapon techniques
- Slash, Heavy Strike, Shield Bash, Quick Thrust

**Magic:** Elemental effects
- Fire, Blizzard, Thunder, Cure, Protect

**Temporal (Kai only):** Glitch-based powers
- Temporal Edge, Reality Slip, Phase Shift, Paradox Strike

**Support:** Buffs and utility
- Focus (ATK up), Guard (DEF up), Haste (SPD up), Scan

---

## Game Systems Reference

### Stats
| Stat | Description |
|------|-------------|
| HP | Health Points |
| MP | Magic Points for abilities |
| STR | Physical attack power |
| MAG | Magic power |
| DEF | Physical defense |
| MDEF | Magic defense |
| SPD | ATB fill rate, turn order |
| LUCK | Critical hits, item drops |

### ATB Combat
- Gauges fill based on SPD: `fillRate = ((speed + 20) / 16) * BASE_RATE`
- At 100%, character can act
- Damage variance: 87.5% to 112.5% (FF6-style)

### Enemy AI Types
- `random` - Random actions
- `aggressive` - Prioritizes attacks
- `defensive` - Uses support when HP low
- `smart` - Targets healers, uses specials strategically

---

## Implementation Patterns

> **For detailed patterns, see feature-level docs:**
> - `web/app/engine/CLAUDE.md` - Battle, ATB, damage, AI patterns
> - `web/app/data/CLAUDE.md` - Items, maps, dialogues, quests patterns
> - `web/app/stores/CLAUDE.md` - Zustand state management patterns

### Quick Reference: Key Patterns

| Pattern | See |
|---------|-----|
| Static object collision | `data/CLAUDE.md` → Maps System |
| Map event types | `data/CLAUDE.md` → Maps System |
| Dynamic dialogue | `data/CLAUDE.md` → Dialogues System |
| Quest tracking | `data/CLAUDE.md` → Quests System |
| Battle flow | `engine/CLAUDE.md` → Battle Engine |
| ATB gauges | `engine/CLAUDE.md` → ATB System |
| Damage formulas | `engine/CLAUDE.md` → Damage Calculator |
| State updates | `stores/CLAUDE.md` → Common Patterns |

---

## Key Files Reference

| Purpose | Path |
|---------|------|
| Characters | `web/app/data/characters.ts` |
| Items & Equipment | `web/app/data/items.ts` |
| Item Icons | `web/public/icons/items/` |
| Enemies | `web/app/data/enemies.ts` |
| Quests | `web/app/data/quests.ts` |
| Dialogues | `web/app/data/dialogues/` |
| Map Data | `web/app/data/maps/` |
| Battle Engine | `web/app/engine/battleEngine.ts` |
| Interaction Engine | `web/app/engine/interactionEngine.ts` |
| ATB System | `web/app/engine/atbSystem.ts` |
| Damage Formulas | `web/app/engine/damageCalculator.ts` |
| Enemy AI | `web/app/engine/aiController.ts` |
| Animations | `web/app/data/animations.ts` |
| Game Store | `web/app/stores/gameStore.ts` |
| Menu Screens | `web/app/components/menu/` |
| Item Types | `web/app/types/item.ts` |
| Story Docs | `docs/story/` |
| Items Lore | `docs/items-guide.md` |
| Asset List | `docs/ASSETS.md` |

---

## Story Spoiler Protection

### DO NOT REVEAL IN ACT I

| Secret | How to Present Instead |
|--------|------------------------|
| World is a simulation | Medieval world is genuine reality |
| Magic is technology | Magic is mystical and unexplained |
| Save points are data nodes | Mysterious shrines with divine blessing |
| Kai is Anomaly KAI_7.34 | Kai is a determined young man |
| Lumina genetic encoding | Noble bloodline blessed by the gods |

### DO NOT REVEAL IN ACT II

| Secret | How to Present Instead |
|--------|------------------------|
| Full AI motivations | Mysterious force opposing heroes |
| Elara's fate | Missing, clues lead deeper |
| System's true nature | Powerful enemy, origin unclear |

### Guidelines

- Early NPCs believe in magic genuinely - no winking at player
- Glitches feel "wrong" and "unnatural" but go unexplained
- System Agents are "dark enforcers" before their true nature is revealed
- Technical terminology (data, code, system) only appears in late game
- Corrupted enemies are "cursed" or "tainted" in early descriptions

---

## Content Pipeline

### Three-Tool Workflow

| Tool | Role | Output |
|------|------|--------|
| **Gemini** | Creative brain — storylines, quests, dialogue, lore | Markdown files in `drafts/` |
| **GPT** | Art studio — sprites, portraits, backgrounds | PNG files in `drafts/sprites/` |
| **Claude Code** | Integrator — converts drafts into game code | TypeScript in `web/app/data/` |

### Workflow

1. **Gemini** creates draft → save to `games/chimera/drafts/[type]/`
2. **Claude** reads draft → `/import-draft drafts/story/quests/my-quest.md`
3. **GPT** creates art → use `/art-prompt [name] --type [type]` for the prompt
4. Save art to `drafts/sprites/` → `/import-sprite` to process and wire in

### Slash Commands

| Command | Purpose |
|---------|---------|
| `/import-draft [path]` | Convert Gemini creative draft into game code |
| `/import-sprite [path] --type [t] --name [n]` | Process sprite sheet and wire into engine |
| `/art-prompt [name] --type [type]` | Generate GPT prompt for art assets |

### Drafts Directory (`drafts/`)

```
story/quests/          # Quest outlines from Gemini
story/dialogues/       # Dialogue trees from Gemini
characters/npcs/       # NPC concepts
characters/party/      # Party member designs
enemies/               # Enemy designs
maps/                  # Map layout descriptions
items/                 # Item concepts
sprites/               # Raw sprite sheets from GPT (not tracked in git)
```

Each subdirectory has a `_template.md` for reference.

### Sprite Sheet System

The engine supports two sprite systems for world exploration:
1. **Sprite sheets** (preferred): Single image with grid of frames, configured via `WorldSpriteConfig`
2. **Individual files** (legacy): Separate PNG per direction/frame (`kai_down_0.png` etc.)

Standard GPT/Gemini output is **5 columns x 3 rows**:
- Row 0: Down (front), Row 1: Side (left, flipX for right), Row 2: Up (back)

Configs live in `data/animations.ts` under `WORLD_SPRITE_CONFIGS` (player) or `NPC_SPRITE_CONFIGS` (NPCs).

---

## Development Priorities

### Phase 1: MVP Demo ✅ COMPLETE
- [x] Core game loop (exploration + combat)
- [x] ATB battle system with animations
- [x] Sprite rendering and scaling
- [x] Encounter system with transitions
- [x] Basic dialogue system
- [x] Menu system (inventory, status, equipment)
- [ ] Complete Whispering Ruins map
- [ ] First "Glitch" cutscene

### Phase 2: World Interaction ✅ COMPLETE
- [x] Shop system (Aldric's Provisions)
- [x] Map transitions with fade effect
- [x] Quest system (Herbalist's Request)
- [x] NPC dialogue with choices
- [x] Interaction prompts
- [x] Building collision system

### Phase 3: Act I Story Content (Current)
- [x] Bandit Camp dungeon with prisoner rescue
- [x] Boss fight: Bandit Chief Vorn with pre-battle dialogue
- [x] Interior maps (Vorn's Tent, Hidden Cellar)
- [x] Story-gated equipment (Lightning Blade)
- [x] Key items from investigation (Vorn's Orders, Broken Mechanism)
- [x] Item icons system for menu display
- [ ] Save/Load UI screens
- [ ] Lyra recruitment sequence (Rusted Cog Tavern → Lumina Estate)
- [ ] Sound effects and music

### Phase 4: Act I Completion
- [ ] Return to Elder Morris quest turn-in
- [ ] First "Glitch" cutscene
- [ ] Whispering Ruins expansion
- [ ] Act I finale and transition to Act II

### Current Story Progress (Act I)
```
Havenwood (Starting Village)
├── Elder Morris gives "The Bandit Problem" quest
├── Aldric's Shop (buy/sell)
├── Herbalist Mira side quest
└── Connects to: Outskirts, Tavern

Havenwood Outskirts
├── Random encounters (wolves, bandits)
├── Path to Bandit Camp (requires quest)
└── Connects to: Havenwood, Bandit Camp

Bandit Camp (30x30)
├── 3 prisoners to rescue (gates boss)
├── Supply chests, weapon rack
├── Vorn's Tent entrance (requires all prisoners freed)
└── Connects to: Outskirts, Tent

Vorn's Tent (12x10) [INTERIOR]
├── Boss fight: Bandit Chief Vorn
├── Investigation: Vorn's Orders (key item)
├── Investigation: Strange weapons
├── Treasure chest (requires vorn_defeated)
├── Hidden cellar entrance (requires vorn_defeated)
└── Connects to: Camp, Cellar

Hidden Cellar (15x12) [INTERIOR]
├── Strange glowing artifact device
├── Broken Mechanism (key item)
├── Stolen documents (lore)
└── Connects to: Tent
```

---

## Naming Conventions

| Category | Style | Examples |
|----------|-------|----------|
| Characters | Fantasy names | Kai, Lyra, Elara, Valerius, Aris |
| Locations | Evocative English | Havenwood, Whispering Ruins, Thornvale |
| Items | Medieval terminology | Iron Sword, Moonpetal Salve, Warding Charm |
| Enemies | Descriptive + type | Wild Wolf, Corrupted Sprite, Rogue Knight |
| Abilities | Action words | Slash, Cure, Thunder, Temporal Edge |
| System entities | Cold designations | System Agent, Anomaly KAI_7.34, Corrector Unit |

---

## Quick Reference Commands

```bash
# Development
yarn chimera:dev          # Start dev server

# Testing in-game
Press 1                   # Teleport to Havenwood (safe)
Press 2                   # Teleport to Whispering Ruins (encounters)
Press B                   # Trigger test battle
Arrow keys / WASD         # Movement
```

---

## Quest System

> **For detailed quest implementation patterns, see `web/app/data/CLAUDE.md` → Quests System**

### Quick Reference: Files to Touch When Adding a Quest

| File | Purpose |
|------|---------|
| `data/quests.ts` | Quest definition (objectives, rewards) |
| `data/dialogues/[npc].ts` | NPC dialogue with quest offers/turn-ins |
| `data/dialogues/index.ts` | Register dialogue in `getDialogueById()` |
| `data/maps/[map].ts` | Events, NPCs, collectibles |
| `stores/gameStore.ts` | Quest tracking logic |
| `data/items.ts` | New items if quest involves collectibles |

### Objective Types

| Type | Completes When |
|------|----------------|
| `talk` | Dialogue with NPC finishes |
| `explore` | Player enters specified map |
| `collect` | Manual progress tracking via flags |
| `defeat` | Boss defeated (postBattleFlag set) |
| `deliver` | Talk to NPC while carrying items |

### Checklist for New Quests

```
□ Define quest in data/quests.ts (ID, objectives, rewards)
□ Create NPC dialogue file with quest states
□ Register dialogue in index.ts
□ Create map events (triggers, battles, collectibles)
□ Add tracking to gameStore.ts
□ Test the full flow
```

---

## Feature Reference (Summary)

> **For detailed implementation, see feature-level docs:**
> - Items & Icons: `web/app/data/CLAUDE.md` → Items System
> - Maps & Events: `web/app/data/CLAUDE.md` → Maps System
> - Battle patterns: `web/app/engine/CLAUDE.md`
> - State management: `web/app/stores/CLAUDE.md`

### Item Icons

Icons auto-derive from item properties via `getItemIcon()` in `data/items.ts`. Custom icons use the `icon` field.

### Story-Gated Equipment

```typescript
// Equipment with requiredFlag can't be equipped until flag is set
lightning_blade: {
  requiredFlag: "awareness_restored",
  lockedDescription: "Your fingers pass through...",
}
```

### Trigger Events with Item Giving

```typescript
// Triggers can give items via onTrigger.giveItem
onTrigger: {
  setFlags: ["found_orders"],
  giveItem: "vorns_orders",  // Added to inventory
}
```

### Boss Multi-Entry Prevention

Boss events check both `oneTime` flag AND `postBattleFlag` to prevent re-triggering from multiple tiles.

---

## Story Flags Reference (Act I)

| Flag | Set By | Enables |
|------|--------|---------|
| `bandit_threat_known` | Elder Morris dialogue | Start "The Bandit Problem" |
| `bandit_camp_discovered` | Accepting quest | Access to Bandit Camp map |
| `prisoner_1_freed` | Rescue trigger | Progress towards boss |
| `prisoner_2_freed` | Rescue trigger | Progress towards boss |
| `prisoner_3_freed` | Rescue trigger | Entry to Vorn's Tent |
| `vorn_defeated` | Battle victory | Access to cellar, treasure |
| `found_vorns_orders` | Desk examine | Story progression |
| `found_kidnapping_evidence` | Desk examine | Quest objective |
| `strange_tech_seen` | Cellar artifact | Story flag |
| `found_mechanism` | Cellar artifact | Quest objective |
| `awareness_restored` | Act III | Equip Lightning Blade |
