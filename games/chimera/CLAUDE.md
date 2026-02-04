# Chimera Development Guide

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

## Coding Practices & Patterns

### Static Object Collision System

Buildings and objects use a **sprite position + collision offset** pattern:

```typescript
{
  id: "shop",
  sprite: "/assets/shop.png",
  x: 13,           // Sprite draws starting at tile (13, 4)
  y: 4,
  width: 3,        // Sprite is 3 tiles wide
  height: 4,       // Sprite is 4 tiles tall
  collision: [
    // Collision at sprite position + offset
    // offsetY: 2 means y = 4 + 2 = 6 is blocked
    { offsetX: 0, offsetY: 2 },  // Block left wall at (13, 6)
    { offsetX: 2, offsetY: 2 },  // Block right wall at (15, 6)
    // Center (14, 6) is open for door
  ],
}
```

**Key Points:**
- Sprite renders at `(x, y)` with given `width × height`
- Collision tiles are `(x + offsetX, y + offsetY)`
- Leave gaps in collision for doors/entrances
- Collision row is typically 1-2 rows above sprite bottom

### Map Event Types

Events are positioned on tiles and trigger different behaviors:

| Type | Trigger | Behavior |
|------|---------|----------|
| `teleport` | Step on tile | Auto-triggers map transition |
| `shop` | Step on tile + interact | Shows prompt, Enter opens shop |
| `treasure` | Face tile + interact | Opens chest, adds items |
| `collectible` | Face tile + interact | Quest item pickup |
| `save_point` | Face tile + interact | Save game (TODO) |
| `npc` | Face NPC + interact | Start dialogue |

**Shop Events Require Interaction:**
```typescript
// In movePlayer: Shops do NOT auto-trigger
// Shop events don't auto-trigger - require interaction (Enter/Space)

// In interact(): Check for shop at player's position
const shopEvent = currentMap.events.find(
  (e) => e.type === "shop" && e.x === playerX && e.y === playerY
);
```

### Item Effect Display Pattern

Items show description (gray) + effect (cyan):

```typescript
// types/item.ts
export function getEffectDescription(item: Item): string | null {
  if (!item.effect) return null;

  switch (item.effect.type) {
    case "heal_hp": return `Restores ${item.effect.power} HP`;
    case "heal_mp": return `Restores ${item.effect.power} MP`;
    case "cure_status": return "Cures status ailments";
    // ...
  }
}

// In components:
<p className="text-gray-400">{item.description}</p>
{getEffectDescription(item) && (
  <p className="text-cyan-400">{getEffectDescription(item)}</p>
)}
```

### Map Transition Pattern

Transitions use a **pending state + visual fade** pattern:

```typescript
// State
pendingMapTransition: { mapId: string; x: number; y: number } | null;

// 1. Trigger transition (in movePlayer)
return { pendingMapTransition: { mapId, x, y } };

// 2. Game.tsx watches for pending transition
useEffect(() => {
  if (pendingMapTransition && !showMapTransition) {
    setShowMapTransition(true);  // Start fade-out
  }
}, [pendingMapTransition]);

// 3. MapTransition component calls onMidpoint when screen is black
// 4. executeMapTransition() loads new map
// 5. onComplete clears state, fade-in completes
```

### Interaction Prompt Pattern

Show prompts when player can interact:

```typescript
const interactionPrompt = useMemo(() => {
  // 1. Check shop events at player's current position
  const shopEvent = currentMap.events.find(
    (e) => e.type === "shop" && e.x === playerX && e.y === playerY
  );
  if (shopEvent) return shopEvent.data.message || "Enter Shop";

  // 2. Check NPCs player is facing
  const npc = getNpcPlayerIsFacing(...);
  if (npc) return `Talk to ${npc.name}`;

  // 3. Check events player is facing
  const event = getEventPlayerIsFacing(...);
  if (event) return getInteractionPrompt(event);

  return null;
}, [currentMap, playerPosition]);
```

### Zustand State Management

Use partial state returns in `set()` callbacks:

```typescript
// Good - only return changed fields
movePlayer: (dx, dy) => set((state) => {
  // ... logic ...
  return { playerPosition: newPosition };  // Merges with existing state
}),

// For shop entry - return multiple fields
return {
  playerPosition: newPosition,
  phase: "shop" as const,
  shop: { currentShop: shop, ... },
};
```

### Quest-Gated Collectibles

Collectibles can require an active quest:

```typescript
// In map data
{
  id: "moonpetal_1",
  type: "collectible",
  x: 2, y: 2,
  data: {
    itemId: "moonpetal_flower",
    quantity: 1,
    requiredQuest: "herbalists_request",  // Only visible/collectible if quest active
    message: "Found a Moonpetal Flower!",
  },
}

// In movePlayer - block if quest active and not collected
if (e.type === "collectible") {
  const data = e.data as CollectibleContents;
  if (data.requiredQuest) {
    return get().hasActiveQuest(data.requiredQuest);
  }
}
```

### Dynamic Dialogue Pattern

NPCs can have dialogue that changes based on game state:

```typescript
// data/dialogues/herbalist-mira.ts
export function getMiraDialogue(
  questStatus: QuestStatus,
  hasEnoughFlowers: boolean,
  flowerCount: number
): DialogueNode {
  if (questStatus === "completed") {
    return MIRA_DIALOGUES.post_quest;
  }
  if (questStatus === "active" && hasEnoughFlowers) {
    return MIRA_DIALOGUES.turn_in;
  }
  if (questStatus === "active") {
    return { ...MIRA_DIALOGUES.in_progress,
      text: `You have ${flowerCount}/3 flowers...` };
  }
  return MIRA_DIALOGUES.first_meeting;
}
```

---

## Key Files Reference

| Purpose | Path |
|---------|------|
| Characters | `web/app/data/characters.ts` |
| Items & Equipment | `web/app/data/items.ts` |
| Enemies | `web/app/data/enemies.ts` |
| Map Data | `web/app/data/maps/` |
| Battle Engine | `web/app/engine/battleEngine.ts` |
| ATB System | `web/app/engine/atbSystem.ts` |
| Damage Formulas | `web/app/engine/damageCalculator.ts` |
| Enemy AI | `web/app/engine/aiController.ts` |
| Animations | `web/app/data/animations.ts` |
| Game Store | `web/app/stores/gameStore.ts` |
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

### Phase 3: Polish & Content (Current)
- [ ] Save/Load UI screens
- [ ] More enemy types
- [ ] Lyra recruitment sequence
- [ ] Sound effects and music
- [ ] Inn/rest system

### Phase 4: Story Expansion
- [ ] Full Act I content
- [ ] Additional party members
- [ ] More side quests
- [ ] Boss battles with unique mechanics
- [ ] First "Glitch" cutscene

### Immediate Next Steps
1. Complete Save/Load UI screens
2. Add more enemy variety
3. Implement Lyra recruitment
4. Create first scripted "Glitch" cutscene

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
