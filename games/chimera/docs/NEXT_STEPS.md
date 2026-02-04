# Chimera - Next Steps for Development

## Immediate Priority: Fix Compilation Errors

The game currently has missing files that prevent clean compilation. Fix these first:

### 1. Complete `app/components/Game.tsx`

This is the main game orchestrator. Create it with:

```typescript
"use client";

import { useEffect, useCallback } from "react";
import { useGameStore } from "../stores/gameStore";
import MapView from "./world/MapView";
import TitleScreen from "./screens/TitleScreen";
// Import other components as they're created

export default function Game() {
  const { phase, newGame, movePlayer, toggleMenu, togglePause } = useGameStore();

  // Input handling
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (phase === "title") {
      if (e.key === "Enter" || e.key === " ") {
        newGame();
      }
      return;
    }

    if (phase === "exploring") {
      switch (e.key) {
        case "ArrowUp":
        case "w":
          movePlayer(0, -1);
          break;
        case "ArrowDown":
        case "s":
          movePlayer(0, 1);
          break;
        case "ArrowLeft":
        case "a":
          movePlayer(-1, 0);
          break;
        case "ArrowRight":
        case "d":
          movePlayer(1, 0);
          break;
        case "Escape":
        case "m":
          toggleMenu();
          break;
        case "p":
          togglePause();
          break;
      }
    }
  }, [phase, newGame, movePlayer, toggleMenu, togglePause]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Render based on phase
  switch (phase) {
    case "title":
      return <TitleScreen />;
    case "exploring":
      return (
        <div className="relative w-full h-screen bg-black">
          <MapView />
          {/* Add HUD here */}
        </div>
      );
    case "combat":
      return <div>Combat Screen (TODO)</div>;
    case "dialogue":
      return <div>Dialogue (TODO)</div>;
    case "game_over":
      return <div>Game Over (TODO)</div>;
    default:
      return <div>Loading...</div>;
  }
}
```

### 2. Create `app/components/screens/TitleScreen.tsx`

```typescript
"use client";

import { useGameStore } from "../../stores/gameStore";

export default function TitleScreen() {
  const { newGame, loadGame } = useGameStore();

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black">
      <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-8">
        CHIMERA
      </h1>
      <p className="text-gray-500 mb-12">A world of digital illusions</p>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => newGame()}
          className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded transition-colors"
        >
          New Game
        </button>
        <button
          onClick={() => loadGame(1)}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded transition-colors"
        >
          Continue
        </button>
      </div>

      <p className="absolute bottom-8 text-gray-600 text-sm">
        Press ENTER to start
      </p>
    </div>
  );
}
```

---

## Next Major Feature: ATB Combat System

Once the game runs cleanly, build the combat system:

### Step 1: Create Battle Engine (`app/engine/battleEngine.ts`)

Core functions needed:
- `initializeBattle(party, enemies)` - Set up battle state
- `updateATB(state, deltaTime)` - Update all ATB gauges
- `executeAction(state, action)` - Process combat action
- `checkBattleEnd(state)` - Victory/defeat check

### Step 2: Create ATB System (`app/engine/atbSystem.ts`)

```typescript
// ATB gauge fills based on speed stat
const ATB_MAX = 100;
const BASE_FILL_RATE = 1; // Per 16ms tick

export function calculateFillRate(speed: number): number {
  return ((speed + 20) / 16) * BASE_FILL_RATE;
}

export function updateGauge(current: number, fillRate: number): number {
  return Math.min(ATB_MAX, current + fillRate);
}

export function isReady(gauge: number): boolean {
  return gauge >= ATB_MAX;
}
```

### Step 3: Create Damage Calculator (`app/engine/damageCalculator.ts`)

FF6-style formulas:
- Physical: `(STR + Weapon)² / 16 * variance - DEF`
- Magic: `(MAG + Spell Power)² / 32 * variance - MDEF`
- Variance: 87.5% to 112.5%

### Step 4: Create Battle UI Components

Priority order:
1. `BattleScreen.tsx` - Main battle container
2. `PartyStatus.tsx` - HP/MP bars with ATB gauges
3. `CommandMenu.tsx` - Attack/Magic/Item/Defend
4. `EnemyDisplay.tsx` - Enemy sprites and targeting
5. `DamageNumbers.tsx` - Floating damage text

---

## Combat Flow to Implement

```
1. Battle starts → Initialize all combatants
2. Game loop runs:
   - Update all ATB gauges
   - When player gauge full → Show command menu
   - When enemy gauge full → AI selects action
   - Actions execute in order
   - Check for victory/defeat
3. Battle ends → Award XP/gold, return to exploration
```

---

## File Structure Reference

```
games/chimera/web/app/
├── components/
│   ├── Game.tsx              ← NEED TO CREATE
│   ├── screens/
│   │   ├── TitleScreen.tsx   ← NEED TO CREATE
│   │   ├── GameOverScreen.tsx
│   │   └── SaveLoadScreen.tsx
│   ├── world/
│   │   └── MapView.tsx       ✅ EXISTS
│   ├── combat/
│   │   ├── BattleScreen.tsx  ← PRIORITY
│   │   ├── ATBGauge.tsx
│   │   ├── CommandMenu.tsx
│   │   ├── PartyStatus.tsx
│   │   └── DamageNumbers.tsx
│   ├── ui/
│   │   ├── DialogueBox.tsx
│   │   └── MenuSystem.tsx
│   └── hud/
│       └── PartyHUD.tsx
├── engine/
│   ├── battleEngine.ts       ← PRIORITY
│   ├── atbSystem.ts
│   ├── damageCalculator.ts
│   └── aiController.ts
├── stores/
│   └── gameStore.ts          ✅ EXISTS
├── data/
│   ├── characters.ts         ✅ EXISTS
│   ├── items.ts              ✅ EXISTS
│   ├── enemies.ts            ← NEED FOR COMBAT
│   └── maps/
│       └── havenwood.ts      ✅ EXISTS
└── types/
    └── *.ts                  ✅ EXISTS
```

---

## Testing Checkpoints

After each milestone, verify:

1. **After Game.tsx + TitleScreen.tsx:**
   - `yarn chimera:dev` runs without errors
   - Title screen displays
   - Pressing Enter starts game
   - Player can move in Havenwood

2. **After Battle Engine:**
   - Can trigger a test battle
   - ATB gauges fill over time
   - Commands can be selected

3. **After Full Combat:**
   - Battles start from map encounters
   - Actions deal damage
   - Victory awards XP/gold
   - Defeat shows game over

---

## Story Integration Notes

The demo should include these story beats:

1. **Opening:** Kai arrives in Havenwood, talks to Elder Morris about ruins
2. **Journey:** Travel north, tutorial combat with bandits
3. **Save Point:** First Temporal Distortion encounter
4. **Dungeon:** Whispering Ruins exploration
5. **Meet Lyra:** Lady Lyra Lumina investigating same ruins
6. **First Glitch:** Combat where environment shifts to sci-fi
7. **Mini-Boss:** System Agent or corrupted construct
8. **Cliffhanger:** Evidence of Elara, cryptic System message

See `docs/story/` for full narrative details.

---

## Commands Reference

```bash
# Run the game
yarn chimera:dev

# Run from project root
cd /Users/nichalasbarnes/Desktop/projects/knicks-knacks
yarn chimera:dev

# Build for production
cd games/chimera/web && yarn build
```

---

## Questions for Future Development

1. **Assets:** When will pixel art sprites be available? (Currently using placeholders)
2. **Audio:** Should we add background music and SFX?
3. **Scope:** How many enemies/items/spells for the demo?
4. **Difficulty:** What's the target difficulty curve?

---

Last Updated: 2026-01-28
