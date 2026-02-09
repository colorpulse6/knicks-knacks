# Chimera Engine Documentation

This directory contains the core game engine systems. See `games/chimera/CLAUDE.md` for world lore and content guidelines.

> **Expand this doc** when you modify engine systems or discover undocumented behavior. If you add a new formula, AI pattern, or battle mechanic, document it here before finishing.

---

## File Overview

| File | Purpose |
|------|---------|
| `battleEngine.ts` | Battle flow, turn execution, victory/defeat handling |
| `atbSystem.ts` | Active Time Battle gauge management |
| `damageCalculator.ts` | FF6-style damage formulas |
| `aiController.ts` | Enemy decision-making and targeting |
| `encounterEngine.ts` | Random encounter triggering |
| `interactionEngine.ts` | Player-world interactions (NPCs, events) |

---

## ATB System

### Gauge Fill Rate

```typescript
// Based on FF6 formula
fillRate = ((speed + 20) / 16) * BASE_RATE;

// Example: Speed 10 character
// fillRate = (10 + 20) / 16 * 0.5 = 0.9375 per tick
```

### ATB States

| State | Description |
|-------|-------------|
| `filling` | Gauge increasing based on speed |
| `ready` | Gauge at 100%, awaiting input |
| `acting` | Character executing action |
| `waiting` | Paused (menu open, animation) |

### Configuration

```typescript
// atbSystem.ts
const ATB_CONFIG = {
  BASE_FILL_RATE: 0.5,     // Base rate per tick
  TICK_INTERVAL: 50,        // ms between ticks
  HASTE_MULTIPLIER: 1.5,    // Speed buff
  SLOW_MULTIPLIER: 0.5,     // Speed debuff
};
```

---

## Damage Calculator

### Physical Damage Formula (FF6-style)

```typescript
// Base damage
baseDamage = (attack * 4 - defense * 2);

// Random variance (87.5% - 112.5%)
variance = 0.875 + (Math.random() * 0.25);

// Final calculation
finalDamage = Math.floor(baseDamage * variance * skillMultiplier);
```

### Magic Damage Formula

```typescript
// Base magic damage
baseDamage = (magicAttack * 4 - magicDefense * 2);

// Apply element weakness/resistance
if (targetWeakTo(element)) damage *= 1.5;
if (targetResists(element)) damage *= 0.5;
if (targetAbsorbs(element)) damage *= -1;  // Heals target
```

### Critical Hits

```typescript
// Crit chance based on luck
critChance = 5 + (luck / 2);  // Base 5%, +0.5% per luck

// Crit multiplier
if (isCritical) damage *= 1.5;
```

---

## Enemy AI Controller

### AI Types

| Type | Behavior |
|------|----------|
| `random` | Random action selection |
| `aggressive` | Prioritizes damage, targets lowest HP |
| `defensive` | Uses healing/buffs when HP < 30% |
| `smart` | Targets healers, uses specials strategically |
| `boss` | Scripted phases, special patterns |

### Target Priority

```typescript
function selectTarget(aiType: string, targets: Character[]): Character {
  switch (aiType) {
    case "aggressive":
      return targets.reduce((a, b) =>
        a.stats.hp < b.stats.hp ? a : b);  // Lowest HP

    case "smart":
      // Prioritize healers
      const healer = targets.find(t => t.class === "healer");
      if (healer) return healer;
      return targets[Math.floor(Math.random() * targets.length)];

    default:
      return targets[Math.floor(Math.random() * targets.length)];
  }
}
```

### Boss Phases

```typescript
// Boss behavior changes at HP thresholds
interface BossPhase {
  hpThreshold: number;      // Activate when HP drops below this %
  actions: string[];        // Available actions in this phase
  behavior: string;         // AI behavior override
  onEnter?: () => void;     // Script when entering phase
}

// Example: Vorn phases
phases: [
  { hpThreshold: 100, actions: ["Slash", "Intimidate"], behavior: "aggressive" },
  { hpThreshold: 50, actions: ["Lightning Strike", "Slash"], behavior: "aggressive" },
  { hpThreshold: 25, actions: ["Desperation"], behavior: "aggressive", onEnter: () => showDialogue("vorn_desperate") },
]
```

---

## Battle Engine

### Battle Flow

```
1. initBattle(enemies, isBoss, preBattleDialogue?)
   └─> Set phase: "battle", create enemy instances

2. ATB Loop (every 50ms)
   └─> Fill gauges → Check for ready units → Process actions

3. executeAction(actor, action, targets)
   └─> Calculate damage → Apply effects → Play animation

4. checkBattleEnd()
   └─> All enemies dead? → victory
   └─> All party dead? → defeat

5. endBattle(result)
   └─> Award XP/gold/items → Set victory flags → Return to exploration
```

### Pre-Battle Dialogue

```typescript
// Boss fights can have dialogue before combat
{
  type: "battle",
  data: {
    enemies: ["boss_id"],
    preBattleDialogue: "boss_confrontation",  // Dialogue chain ID
    postBattleFlag: "boss_defeated",
  }
}

// Flow:
// 1. Player triggers battle event
// 2. Dialogue plays (DialogueBox component)
// 3. Last dialogue node has: onComplete: { startBattle: true }
// 4. Battle transition begins
```

### Victory Handling

```typescript
// In endBattle()
if (result === "victory") {
  // Calculate rewards
  const expTotal = enemies.reduce((sum, e) => sum + e.experience, 0);
  const goldTotal = enemies.reduce((sum, e) => sum + e.gold, 0);

  // Apply to party
  party.forEach(member => {
    member.experience += Math.floor(expTotal / party.length);
    checkLevelUp(member);
  });

  // Set victory flags
  if (pendingVictoryFlag) {
    setStoryFlag(pendingVictoryFlag, true);
  }

  // Drop items (based on enemy drop tables)
  enemies.forEach(e => processDrops(e));
}
```

---

## Interaction Engine

### Event Types and Triggers

| Type | Trigger | Handler Location |
|------|---------|------------------|
| `teleport` | Step on tile | `movePlayer()` |
| `shop` | Step + interact | `interact()` |
| `treasure` | Face + interact | `interact()` |
| `npc` | Face + interact | `interact()` |
| `battle` | Step on / interact | Both locations |
| `trigger` | Face + interact | `interact()` |
| `collectible` | Face + interact | `interact()` |
| `save_point` | Face + interact | `interact()` |

### Interaction Prompt System

```typescript
// Determine what prompt to show
function getInteractionPrompt(event: MapEvent): string {
  switch (event.type) {
    case "treasure":
      return event.triggered ? "Empty Chest" : "Open Chest";
    case "npc":
      return "Talk";
    case "shop":
      return "Enter Shop";
    case "battle":
      return event.triggered ? "" : "Confront";
    case "trigger":
      return "Examine";
    // ...
  }
}
```

### NPC Facing Detection

```typescript
// Get the tile player is facing
function getFacingPosition(x: number, y: number, facing: Direction) {
  switch (facing) {
    case "up": return { x, y: y - 1 };
    case "down": return { x, y: y + 1 };
    case "left": return { x: x - 1, y };
    case "right": return { x: x + 1, y };
  }
}

// Check for NPC at that position
function getNpcPlayerIsFacing(map, playerX, playerY, facing): NPC | null {
  const { x, y } = getFacingPosition(playerX, playerY, facing);
  return map.npcs.find(npc => npc.x === x && npc.y === y) ?? null;
}
```

---

## Common Patterns

### Adding a New Ability

```typescript
// 1. Define ability in data/abilities.ts
{
  id: "new_ability",
  name: "New Ability",
  type: "magic",
  mpCost: 10,
  power: 50,
  element: "fire",
  target: "single",
  animation: "fire_burst",
}

// 2. Damage calculator handles type automatically
// Physical abilities use attack stat
// Magic abilities use magicAttack stat
```

### Adding a New Enemy

```typescript
// 1. Define in data/enemies.ts
{
  id: "new_enemy",
  name: "New Enemy",
  stats: { hp: 100, attack: 15, defense: 10, ... },
  abilities: ["Bite", "Poison Spit"],
  ai: { type: "aggressive", targetPriority: "lowest_hp" },
  drops: [{ itemId: "beast_fang", chance: 0.2 }],
  experience: 25,
  gold: 15,
}

// 2. Add to encounter tables in map data
encounters: [
  { enemies: ["new_enemy"], weight: 3 },
  { enemies: ["new_enemy", "new_enemy"], weight: 1 },
]
```

### Boss Multi-Entry Prevention

Bosses triggered from multiple tiles need extra protection:

```typescript
// In both movePlayer() and interact()
case "battle": {
  const data = event.data;

  // Check 1: Was THIS specific event triggered?
  if (data.oneTime && openedChests.has(event.id)) {
    return "The area is clear.";
  }

  // Check 2: Was the boss defeated via ANY trigger?
  if (data.postBattleFlag && story.flags[data.postBattleFlag]) {
    return "The area is clear.";
  }

  // Proceed with battle...
}
```
