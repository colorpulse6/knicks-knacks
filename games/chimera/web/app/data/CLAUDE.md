# Chimera Data Documentation

This directory contains game content definitions. See `games/chimera/CLAUDE.md` for world lore and content creation guidelines.

> **Expand this doc** when you add new data structures or discover undocumented patterns. If you create a new item type, event type, dialogue pattern, or quest mechanic, document it here before finishing.

---

## File Overview

| File | Purpose |
|------|---------|
| `items.ts` | All items: consumables, equipment, key items, treasures |
| `enemies.ts` | Enemy definitions, stats, AI, drops |
| `characters.ts` | Party member definitions, starting stats |
| `quests.ts` | Quest definitions, objectives, rewards |
| `abilities.ts` | Skills and spells |
| `animations.ts` | Battle + world sprite animation data |
| `shards.ts` | Shard socket system |
| `maps/` | Map definitions (see below) |
| `dialogues/` | NPC dialogue trees (see below) |

---

## World Sprite System

The world exploration engine supports sprite sheets for player and NPC walk animations via `WorldSpriteConfig` (defined in `types/animation.ts`).

### WorldSpriteConfig

```typescript
interface WorldSpriteConfig {
  src: string;            // Path to sprite sheet in public/
  columns: number;        // Frames per row (e.g., 5)
  rows: number;           // Number of rows (e.g., 3)
  directions: Record<string, {
    row: number;          // Row index for this direction
    frames: number;       // Number of walk frames
    idleFrame: number;    // Standing pose frame index
    flipX?: boolean;      // Mirror horizontally (left→right)
  }>;
  removeBackground?: boolean; // Strip checker backgrounds from AI output
}
```

### Adding a Character Walk Cycle

1. Place sprite sheet in `web/public/sprites/characters/[name]_walk.png`
2. Add config to `WORLD_SPRITE_CONFIGS` in `animations.ts`:
```typescript
[name]: {
  src: "/sprites/characters/[name]_walk.png",
  columns: 5, rows: 3,
  directions: {
    down:  { row: 0, frames: 5, idleFrame: 0 },
    left:  { row: 1, frames: 5, idleFrame: 0 },
    right: { row: 1, frames: 5, idleFrame: 0, flipX: true },
    up:    { row: 2, frames: 5, idleFrame: 0 },
  },
  removeBackground: true,
},
```
3. MapView automatically picks it up — no other changes needed.

### Adding an Animated NPC

1. Place sprite sheet in `web/public/sprites/characters/[npc_id]_walk.png`
2. Add config to `NPC_SPRITE_CONFIGS` in `animations.ts`
3. NPC still has `sprite: "..."` as fallback for when sheet isn't available

### Legacy System

Individual frame files (`kai_down_0.png` through `kai_up_5.png`) still work as fallback. If no `WorldSpriteConfig` exists for a character, the engine uses the `PLAYER_SPRITE_LEGACY` individual-file system.

---

## Items System

### Item Types

| Type | Stackable | Use |
|------|-----------|-----|
| `consumable` | Yes | Healing, buffs, status cure |
| `weapon` | No | Equippable, has attack stats |
| `armor` | No | Equippable, has defense stats |
| `helmet` | No | Equippable, head slot |
| `accessory` | No | Equippable, misc bonuses |
| `key` | Usually no | Story items, quest items |
| `treasure` | Yes | Crafting materials, sell value |
| `shard` | No | Socket into equipment |

### Adding a New Item

```typescript
// In items.ts - add to appropriate category
export const ITEMS: Record<string, Item> = {
  // ... existing items

  new_item: {
    id: "new_item",
    name: "New Item",
    description: "Medieval-style description using humoral/apothecary terms.",
    type: "consumable",
    rarity: "common",  // common, uncommon, rare, epic, legendary
    value: 50,         // Gold value for shops
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableInField: true,
    effect: {
      type: "heal_hp",  // heal_hp, heal_mp, cure_status, buff, revive
      power: 50,
      target: "single", // single, all
    },
  },
};
```

### Equipment with Shard Slots

```typescript
steel_longsword: {
  // ... basic fields
  type: "weapon",
  rarity: "uncommon",
  equipStats: { attack: 22 },
  shardSlots: 1,  // Uncommon = 1 slot, rare = 2, epic = 3, legendary = 4
  socketedShards: [],  // Will be filled when player sockets shards
}
```

### Story-Gated Equipment

```typescript
lightning_blade: {
  // ... basic fields
  requiredFlag: "awareness_restored",  // Flag that must be true to equip
  lockedDescription: "Your fingers pass through the weapon as if it were made of light...",
}
```

### Item Icon Derivation

Icons are auto-derived from item properties via `getItemIcon()`:

```typescript
// Order of precedence:
// 1. Explicit icon field: item.icon → /icons/items/{icon}.png
// 2. Derived from type + effect + name

// Examples:
// heal_hp 50+ power → potion_red.png
// heal_hp <50 power → food.png
// weapon with "staff" in name → staff.png
// key item with "flower" in name → flower.png
```

---

## Maps System

Maps are in `data/maps/`. Each map is a separate file exporting a `GameMap` object.

### Map Structure

```typescript
export const MY_MAP: GameMap = {
  id: "my_map",
  name: "Display Name",
  width: 30,
  height: 20,
  tileSize: 32,

  layers: {
    ground: number[][],      // Tile type indices
    collision: boolean[][],  // true = blocked
    overhead: number[][],    // Tiles drawn above player
  },

  events: MapEvent[],        // Interactions (see below)
  npcs: NPC[],               // Characters on map
  staticObjects: StaticObject[],  // Buildings, decorations

  encounters: EncounterGroup[],   // Random battles
  connections: MapConnection[],   // Links to other maps

  ambientColor: "#rrggbb",   // Lighting tint
  music: "track_name",       // Background music
  requiredFlags?: string[],  // Flags needed to enter
};
```

### Static Object Collision Pattern

Buildings use sprite + collision offset:

```typescript
{
  id: "building",
  sprite: "/assets/building.png",
  x: 10,         // Sprite origin tile
  y: 5,
  width: 3,      // Sprite size in tiles
  height: 4,
  collision: [
    // Offsets from sprite origin where collision blocks are placed
    { offsetX: 0, offsetY: 2 },  // Block at (10, 7)
    { offsetX: 2, offsetY: 2 },  // Block at (12, 7)
    // Center (11, 7) left open for door
  ],
}
```

### Event Types

| Type | Trigger | Common Fields |
|------|---------|---------------|
| `teleport` | Step on | `targetMapId`, `targetX`, `targetY`, `requiredFlags?` |
| `shop` | Step + Enter | `shopId`, `message` |
| `treasure` | Face + Enter | `items[]`, `gold`, `oneTime` |
| `battle` | Step/Face | `enemies[]`, `isBoss`, `preBattleDialogue?`, `postBattleFlag?` |
| `trigger` | Face + Enter | `triggerType`, `message`, `onTrigger`, `flag` |
| `collectible` | Face + Enter | `itemId`, `quantity`, `requiredQuest?` |
| `save_point` | Face + Enter | (no special data) |
| `npc` | Face + Enter | `dialogueId` (NPCs also defined in `npcs[]`) |

### Trigger Event Examples

```typescript
// Rescue trigger (one-time, sets flag)
{
  id: "rescue_prisoner_1",
  type: "trigger",
  x: 22, y: 11,
  data: {
    triggerType: "rescue",
    flag: "prisoner_1_freed",  // One-time flag
    message: "You break open the cage lock!",
    onTrigger: {
      setFlags: ["prisoner_1_freed"],
    },
  },
  triggered: false,
}

// Examine trigger (gives item)
{
  id: "desk_examine",
  type: "trigger",
  x: 8, y: 5,
  data: {
    triggerType: "examine",
    requiredFlag: "vorn_defeated",  // Only works after this flag set
    flag: "found_orders",
    message: "Found important documents!",
    onTrigger: {
      setFlags: ["found_orders"],
      giveItem: "vorns_orders",  // Item added to inventory
    },
  },
  triggered: false,
}
```

### Battle Event with Pre-Dialogue

```typescript
{
  id: "boss_vorn",
  type: "battle",
  x: 5, y: 4,
  data: {
    enemies: ["bandit_chief_vorn"],
    isBoss: true,
    oneTime: true,
    preBattleDialogue: "vorn_confrontation",  // Dialogue before fight
    postBattleFlag: "vorn_defeated",
    requiredFlags: ["prisoner_1_freed", "prisoner_2_freed", "prisoner_3_freed"],
    notMetMessage: "*Zzzzz...* The boss is still sleeping.",
  },
  triggered: false,
}
```

---

## Dialogues System

Dialogues are in `data/dialogues/`. Each NPC gets their own file.

### Dialogue Node Structure

```typescript
interface DialogueNode {
  id: string;
  speaker: string;           // Name shown in dialogue box
  portrait?: string;         // Portrait image name
  text: string;              // What they say
  next?: string;             // Auto-advance to this node
  choices?: DialogueChoice[];
  onComplete?: {
    startBattle?: boolean;   // Trigger pending battle
    setFlags?: string[];     // Set story flags
  };
}

interface DialogueChoice {
  text: string;              // Choice button text
  nextNodeId: string;        // Node to go to
  effect?: () => void;       // Side effects (start quest, etc.)
  condition?: () => boolean; // Only show if true
}
```

### Dynamic Dialogue Pattern

NPCs whose dialogue changes based on game state:

```typescript
// data/dialogues/herbalist-mira.ts

export function getMiraDialogue(state: MiraDialogueState): DialogueNode {
  // Check quest state
  if (state.questStatus === "completed") {
    return MIRA_DIALOGUES.post_quest;
  }
  if (state.questStatus === "active" && state.hasEnoughFlowers) {
    return MIRA_DIALOGUES.turn_in;
  }
  if (state.questStatus === "active") {
    return MIRA_DIALOGUES.in_progress;
  }
  return MIRA_DIALOGUES.first_meeting;
}
```

### Registering Dialogues

In `data/dialogues/index.ts`:

```typescript
// 1. Export from individual files
export { getMiraDialogue, MIRA_DIALOGUES } from "./herbalist-mira";

// 2. Add to getDialogueById()
export function getDialogueById(nodeId: string): DialogueNode | undefined {
  const allDialogues = {
    ...ELDER_MORRIS_DIALOGUES,
    ...MIRA_DIALOGUES,
    // ... add new dialogues here
  };
  return allDialogues[nodeId];
}

// 3. Add case to getDynamicDialogue()
export function getDynamicDialogue(npcId: string, storyState: StoryState): DialogueNode | null {
  switch (npcId) {
    case "herbalist_mira":
      return getMiraDialogue(buildMiraState(storyState));
    // ... add new cases here
    default:
      return null;
  }
}
```

---

## Quests System

Quests are defined in `data/quests.ts`.

### Quest Structure

```typescript
const QUESTS: Record<string, Quest> = {
  my_quest: {
    id: "my_quest",
    name: "Quest Name",
    description: "Short description for quest log.",
    giver: "npc_id",
    chapter: 1,
    category: "side",  // "main" or "side"

    requiredFlags: ["prereq_flag"],  // Must be set to start quest

    objectives: [
      { id: "obj_1", type: "explore", description: "Enter the dungeon", targetId: "dungeon_map" },
      { id: "obj_2", type: "collect", description: "Find items (0/3)", targetId: "item_id", targetQuantity: 3 },
      { id: "obj_3", type: "defeat", description: "Defeat the boss", targetId: "boss_enemy" },
      { id: "obj_4", type: "deliver", description: "Return to NPC", targetId: "npc_id" },
    ],

    rewards: {
      gold: 100,
      experience: 50,
      items: [{ itemId: "sanguine_draught", quantity: 2 }],
      storyFlags: ["quest_completed"],
    },
  },
};
```

### Objective Types

| Type | Completes When |
|------|----------------|
| `talk` | Dialogue with NPC finishes |
| `explore` | Player enters specified map |
| `collect` | Manual progress tracking via flags |
| `defeat` | Boss defeated (postBattleFlag set) |
| `deliver` | Talk to NPC while carrying items |

### Quest Tracking (in gameStore)

```typescript
// Start quest
startQuest("my_quest");

// Update progress (for collect objectives)
updateQuestProgress("my_quest", "collect_items", 2);  // Now 2/3

// Complete objective
completeObjective("my_quest", "defeat_boss");

// Complete quest (awards rewards)
completeQuest("my_quest");
```

---

## Enemies System

Enemies are defined in `data/enemies.ts`.

### Enemy Structure

```typescript
{
  id: "enemy_id",
  name: "Enemy Name",
  sprite: "/sprites/enemies/enemy.png",

  stats: {
    hp: 100,
    mp: 20,
    attack: 15,
    defense: 10,
    magicAttack: 8,
    magicDefense: 8,
    speed: 10,
    luck: 5,
  },

  abilities: ["Bite", "Poison Spit"],
  ai: {
    type: "aggressive",  // random, aggressive, defensive, smart, boss
    targetPriority: "lowest_hp",
  },

  drops: [
    { itemId: "beast_fang", chance: 0.2 },
    { itemId: "leather_scraps", chance: 0.4 },
  ],

  experience: 25,
  gold: 15,

  // Boss-specific
  isBoss: false,
  phases: [],  // HP threshold behavior changes
}
```

### Adding to Encounter Tables

In map data:

```typescript
encounters: [
  { enemies: ["wild_wolf"], weight: 5 },
  { enemies: ["wild_wolf", "wild_wolf"], weight: 3 },
  { enemies: ["bandit_scout"], weight: 2 },
],
encounterRate: 0.08,  // 8% chance per step
```
