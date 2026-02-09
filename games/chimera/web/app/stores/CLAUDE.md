# Chimera Store Documentation

This directory contains Zustand state management. See `games/chimera/CLAUDE.md` for world lore and content creation guidelines.

> **Expand this doc** when you add new state slices, actions, or discover undocumented patterns. If you create a new game phase, state structure, or action pattern, document it here before finishing.

---

## File Overview

| File | Purpose |
|------|---------|
| `gameStore.ts` | Main game state (player, map, inventory, quests, battle) |

---

## State Structure

```typescript
interface GameState {
  // Core game
  phase: GamePhase;
  currentMap: GameMap;
  playerPosition: { x: number; y: number };
  playerFacing: Direction;

  // Party & inventory
  party: Character[];
  inventory: Inventory;

  // Story progression
  story: {
    chapter: number;
    flags: Record<string, boolean>;
  };

  // Quest tracking
  quests: {
    active: QuestProgress[];
    completed: string[];
    failed: string[];
  };

  // Map state
  openedChests: Set<string>;
  collectedItems: Set<string>;

  // Battle state
  battleState: BattleState | null;
  pendingEncounter: Encounter | null;
  pendingVictoryFlag: string | null;

  // Transitions
  pendingMapTransition: { mapId: string; x: number; y: number } | null;

  // UI state
  activeDialogue: DialogueNode | null;
  shop: ShopState | null;
}
```

---

## Game Phases

| Phase | Description | Active UI |
|-------|-------------|-----------|
| `exploration` | Moving around map | MapView, InteractionPrompt |
| `dialogue` | NPC conversation | DialogueBox |
| `battle` | Combat | BattleScreen |
| `menu` | Pause menu open | GameMenu |
| `shop` | Shopping | ShopScreen |
| `transition` | Map changing | MapTransition overlay |

---

## Key Actions

### Movement

```typescript
movePlayer: (dx: number, dy: number) => {
  // 1. Calculate new position
  // 2. Check collision (tiles, objects, NPCs)
  // 3. Check step-on events (teleport, battle)
  // 4. Handle random encounters
  // 5. Return new state
}
```

### Interaction

```typescript
interact: () => {
  // 1. Check shop at current position
  // 2. Check NPC player is facing
  // 3. Check event player is facing
  // 4. Process interaction (treasure, trigger, battle, etc.)
}
```

### Map Transitions

```typescript
// 1. Set pending transition (in movePlayer or interact)
return { pendingMapTransition: { mapId, x, y } };

// 2. Game.tsx detects pending transition, shows overlay

// 3. At overlay midpoint, execute transition
executeMapTransition: () => {
  // Load new map
  // Set player position
  // Clear pending transition
}
```

### Story Flags

```typescript
setStoryFlag: (flag: string, value: boolean) => set((state) => ({
  story: {
    ...state.story,
    flags: { ...state.story.flags, [flag]: value },
  },
}));

// Usage:
get().setStoryFlag("vorn_defeated", true);

// Check:
if (state.story.flags.vorn_defeated) { ... }
```

---

## Quest Actions

### Starting a Quest

```typescript
startQuest: (questId: string) => {
  const quest = getQuestById(questId);
  if (!quest) return false;

  // Check prerequisites
  if (quest.requiredFlags) {
    for (const flag of quest.requiredFlags) {
      if (!state.story.flags[flag]) return false;
    }
  }

  // Create progress tracker
  const progress: QuestProgress = {
    questId,
    status: "active",
    objectives: quest.objectives.map(obj => ({
      objectiveId: obj.id,
      currentProgress: 0,
      isComplete: false,
    })),
  };

  // Add to active quests
  set((state) => ({
    quests: {
      ...state.quests,
      active: [...state.quests.active, progress],
    },
  }));

  return true;
}
```

### Updating Progress

```typescript
// For collect objectives with quantities
updateQuestProgress: (questId: string, objectiveId: string, progress: number) => {
  set((state) => ({
    quests: {
      ...state.quests,
      active: state.quests.active.map(q => {
        if (q.questId !== questId) return q;
        return {
          ...q,
          objectives: q.objectives.map(obj => {
            if (obj.objectiveId !== objectiveId) return obj;
            return { ...obj, currentProgress: progress };
          }),
        };
      }),
    },
  }));
}
```

### Completing Objectives

```typescript
completeObjective: (questId: string, objectiveId: string) => {
  set((state) => ({
    quests: {
      ...state.quests,
      active: state.quests.active.map(q => {
        if (q.questId !== questId) return q;
        return {
          ...q,
          objectives: q.objectives.map(obj => {
            if (obj.objectiveId !== objectiveId) return obj;
            return { ...obj, isComplete: true };
          }),
        };
      }),
    },
  }));
}
```

### Completing Quests

```typescript
completeQuest: (questId: string) => {
  const quest = getQuestById(questId);
  if (!quest) return;

  // Award rewards
  if (quest.rewards.gold) {
    get().addGold(quest.rewards.gold);
  }
  if (quest.rewards.experience) {
    get().addExperience(quest.rewards.experience);
  }
  if (quest.rewards.items) {
    for (const { itemId, quantity } of quest.rewards.items) {
      get().addItem(itemId, quantity);
    }
  }
  if (quest.rewards.storyFlags) {
    for (const flag of quest.rewards.storyFlags) {
      get().setStoryFlag(flag, true);
    }
  }

  // Move to completed
  set((state) => ({
    quests: {
      active: state.quests.active.filter(q => q.questId !== questId),
      completed: [...state.quests.completed, questId],
      failed: state.quests.failed,
    },
  }));
}
```

---

## Battle Actions

### Starting Battle

```typescript
startBattle: (enemies: string[], isBoss: boolean, preBattleDialogue?: string) => {
  // Create enemy instances
  const enemyInstances = enemies.map(id => createEnemyInstance(id));

  // If pre-battle dialogue, store encounter and show dialogue
  if (preBattleDialogue) {
    set({
      pendingEncounter: { enemies: enemyInstances, isBoss },
      activeDialogue: getDialogueById(preBattleDialogue),
      phase: "dialogue",
    });
    return;
  }

  // Otherwise start battle directly
  set({
    battleState: createBattleState(get().party, enemyInstances),
    phase: "battle",
  });
}
```

### Ending Battle

```typescript
endBattle: (result: "victory" | "defeat" | "flee") => {
  if (result === "victory") {
    // Process rewards
    const { enemies } = get().battleState;
    const expTotal = enemies.reduce((sum, e) => sum + e.experience, 0);
    const goldTotal = enemies.reduce((sum, e) => sum + e.gold, 0);

    // Distribute to party
    // Process drops
    // Set victory flag if boss

    if (get().pendingVictoryFlag) {
      get().setStoryFlag(get().pendingVictoryFlag, true);
    }
  }

  // Clear battle state
  set({
    battleState: null,
    pendingEncounter: null,
    pendingVictoryFlag: null,
    phase: "exploration",
  });
}
```

---

## Inventory Actions

### Adding Items

```typescript
addItem: (itemId: string, quantity: number = 1) => {
  const item = getItemById(itemId);
  if (!item) return false;

  set((state) => {
    const existing = state.inventory.items.find(
      slot => slot.item.id === itemId && slot.item.stackable
    );

    if (existing && item.stackable) {
      // Increase quantity
      return {
        inventory: {
          ...state.inventory,
          items: state.inventory.items.map(slot =>
            slot.item.id === itemId
              ? { ...slot, quantity: Math.min(slot.quantity + quantity, item.maxStack) }
              : slot
          ),
        },
      };
    }

    // Add new slot
    if (state.inventory.items.length >= state.inventory.maxSlots) {
      return state;  // Inventory full
    }

    return {
      inventory: {
        ...state.inventory,
        items: [...state.inventory.items, { item, quantity }],
      },
    };
  });

  return true;
}
```

### Using Items

```typescript
useItem: (itemId: string, targetId: string) => {
  const item = getItemById(itemId);
  const target = get().party.find(c => c.id === targetId);

  if (!item || !target || !item.effect) return null;

  // Apply effect
  switch (item.effect.type) {
    case "heal_hp":
      target.stats.hp = Math.min(
        target.stats.hp + item.effect.power,
        target.stats.maxHp
      );
      break;
    case "heal_mp":
      target.stats.mp = Math.min(
        target.stats.mp + item.effect.power,
        target.stats.maxMp
      );
      break;
    // ... other effects
  }

  // Remove item from inventory
  get().removeItem(itemId, 1);

  return `${target.name} recovered ${item.effect.power} HP!`;
}
```

---

## Common Patterns

### Partial State Updates

Always return only changed fields in `set()`:

```typescript
// Good - only returns what changed
movePlayer: (dx, dy) => set((state) => ({
  playerPosition: { x: state.playerPosition.x + dx, y: state.playerPosition.y + dy },
}));

// Bad - returns entire state
movePlayer: (dx, dy) => set((state) => ({
  ...state,  // Unnecessary spread
  playerPosition: { ... },
}));
```

### Flag-Based Quest Tracking

When triggers set flags, update quest progress:

```typescript
// In interact() trigger handling
if (data.onTrigger?.setFlags) {
  for (const flag of data.onTrigger.setFlags) {
    get().setStoryFlag(flag, true);

    // Track prisoner rescues
    if (flag.startsWith("prisoner_") && flag.endsWith("_freed")) {
      const freedCount = [
        state.story.flags.prisoner_1_freed || flag === "prisoner_1_freed",
        state.story.flags.prisoner_2_freed || flag === "prisoner_2_freed",
        state.story.flags.prisoner_3_freed || flag === "prisoner_3_freed",
      ].filter(Boolean).length;

      get().updateQuestProgress("the_bandit_problem", "free_prisoners", freedCount);

      if (freedCount >= 3) {
        get().completeObjective("the_bandit_problem", "free_prisoners");
      }
    }
  }
}
```

### Async Action Sequencing

For actions that need to happen after state updates:

```typescript
// Use setTimeout(0) to defer to next tick
if (victoryFlag === "vorn_defeated") {
  setTimeout(() => {
    get().completeObjective("the_bandit_problem", "defeat_vorn");
    get().addMessage("Quest Updated: Defeated Bandit Chief Vorn!");
  }, 0);
}
```
