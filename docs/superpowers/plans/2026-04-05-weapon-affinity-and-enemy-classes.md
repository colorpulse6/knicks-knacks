# Weapon Affinity & Enemy Classes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 4-type weapon affinity system (Kinetic / Energy / Incendiary / Cryogenic) with per-class enemy stat profiles, visible damage feedback, class tint overlays, and a Bestiary screen — all of this applied to the existing 40 levels and 10 planets without breaking current gameplay.

**Architecture:** Introduce pure data modules (`weaponTypes.ts`, `enemyClasses.ts`) that tag the existing `EnemyType` enum values with an enemy class + affinity profile. Extend the damage-application code path in `gameEngine.ts` to apply the affinity multiplier using the player's equipped primary weapon type (default: Kinetic). Add floating damage labels to particles. Render class tint overlays in `drawEnemies`. Introduce a new Bestiary screen on the cockpit hub that reads kill counters from an extended `SaveData`.

**Tech Stack:** TypeScript, Next.js 15, React 19, HTML5 Canvas 2D. No test framework exists in the repo — verification is via `yarn build` (type check) + manual playtest checklists. Pure data/logic modules include simple assertion-based dev checks that run at module import time in development.

**Spec reference:** [2026-04-05-sector-zero-expansion-design.md](/Users/nichalasbarnes/Desktop/projects/knicks-knacks/docs/superpowers/specs/2026-04-05-sector-zero-expansion-design.md)

---

## File Structure

### New files

| Path | Responsibility |
|------|----------------|
| `games/sector-zero/web/app/components/engine/weaponTypes.ts` | Weapon type enum, player primary weapon type state, affinity multiplier lookup |
| `games/sector-zero/web/app/components/engine/enemyClasses.ts` | Enemy class enum, class stat profiles, enemy-to-class mapping, planet-to-dominant-class mapping |
| `games/sector-zero/web/app/components/engine/bestiary.ts` | Bestiary entry builder, encounter tracking helpers |
| `games/sector-zero/web/app/components/engine/floatingLabels.ts` | Floating damage/tag labels (CRITICAL, RESISTED) — separate from particles for lifecycle clarity |

### Modified files

| Path | Changes |
|------|---------|
| `games/sector-zero/web/app/components/engine/types.ts` | Add `WeaponType` enum, extend `Bullet` with `weaponType`, extend `Enemy` with `classId`, extend `GameState` with `floatingLabels`, extend `SaveData` with `bestiary` + `equippedWeaponType` |
| `games/sector-zero/web/app/components/engine/enemies.ts` | Assign `classId` in `createEnemy`, apply class stat multipliers, tint overlay in `drawEnemies`, affinity icon above HP bar |
| `games/sector-zero/web/app/components/engine/weapons.ts` | Tag player bullets with `weaponType` on creation, use player's equipped weapon type |
| `games/sector-zero/web/app/components/engine/gameEngine.ts` | Compute affinity-adjusted damage in collision code, spawn floating labels, update labels each frame, record kills to bestiary |
| `games/sector-zero/web/app/components/engine/renderer.ts` | Draw floating labels alongside particles |
| `games/sector-zero/web/app/components/engine/save.ts` | Extend `defaultSave` and `migrateSave` with new fields |
| `games/sector-zero/web/app/components/engine/cockpit.ts` | Add `bestiary` sub-screen to `CockpitHubState`, add hotspot for nav |
| `games/sector-zero/web/app/components/engine/cockpitRenderer.ts` | Add `drawBestiaryScreen` function, wire into screen dispatch |
| `games/sector-zero/web/app/components/Game.tsx` | Handle new cockpit sub-screen in input routing, test that save load/save includes new fields |

### Test/verification strategy

No test framework exists. Verification loop per task:

1. **Type check:** `cd games/sector-zero/web && yarn build` — must exit 0
2. **Assertion-based dev checks:** pure logic modules export a `__runSelfTests()` function. These are called at module import in development mode (`process.env.NODE_ENV === "development"`). They `console.assert()` on expected outputs. Failures print to browser console.
3. **Manual playtest checklist:** each task has a checklist of observable in-game behaviors to verify in the dev server (`yarn sector-zero:dev`).

---

## Commit strategy

Commit after each task (numbered). Use conventional commits: `feat:`, `refactor:`, `fix:`. Message format: `feat(sector-zero): <task-summary>`.

---

## Task 1: Define WeaponType enum and affinity data

**Files:**
- Create: `games/sector-zero/web/app/components/engine/weaponTypes.ts`
- Modify: `games/sector-zero/web/app/components/engine/types.ts` (add re-export convenience)

- [ ] **Step 1: Write the module with types and data**

Create `games/sector-zero/web/app/components/engine/weaponTypes.ts`:

```typescript
// Weapon type system — drives the affinity matrix.
// Each primary weapon belongs to one of four types.

export type WeaponType = "kinetic" | "energy" | "incendiary" | "cryogenic";

export const WEAPON_TYPES: WeaponType[] = ["kinetic", "energy", "incendiary", "cryogenic"];

/** Display metadata per weapon type */
export interface WeaponTypeMeta {
  id: WeaponType;
  name: string;
  color: string;      // hex, used for bullet tints / UI
  glowColor: string;  // hex, for bullet glow
  icon: string;       // single-char symbol for HUD
}

export const WEAPON_TYPE_META: Record<WeaponType, WeaponTypeMeta> = {
  kinetic:    { id: "kinetic",    name: "Kinetic",    color: "#e8e8ee", glowColor: "#ffffff", icon: "K" },
  energy:     { id: "energy",     name: "Energy",     color: "#44ccff", glowColor: "#88eeff", icon: "E" },
  incendiary: { id: "incendiary", name: "Incendiary", color: "#ff6a1a", glowColor: "#ffaa44", icon: "I" },
  cryogenic:  { id: "cryogenic",  name: "Cryogenic",  color: "#aaddff", glowColor: "#ddf2ff", icon: "C" },
};

/** Affinity outcomes: Effective = 1.5×, Neutral = 1.0×, Resisted = 0.5× */
export type AffinityResult = "effective" | "neutral" | "resisted";

export const AFFINITY_MULTIPLIER: Record<AffinityResult, number> = {
  effective: 1.5,
  neutral:   1.0,
  resisted:  0.5,
};

/**
 * Dev-mode self-tests — called on import to catch regressions.
 * Uses console.assert, visible in browser devtools when running yarn sector-zero:dev.
 */
export function __runWeaponTypeSelfTests(): void {
  console.assert(WEAPON_TYPES.length === 4, "WEAPON_TYPES must have exactly 4 entries");
  console.assert(AFFINITY_MULTIPLIER.effective === 1.5, "Effective must be 1.5×");
  console.assert(AFFINITY_MULTIPLIER.neutral === 1.0, "Neutral must be 1.0×");
  console.assert(AFFINITY_MULTIPLIER.resisted === 0.5, "Resisted must be 0.5×");
  for (const t of WEAPON_TYPES) {
    console.assert(WEAPON_TYPE_META[t] !== undefined, `Missing meta for weapon type ${t}`);
    console.assert(WEAPON_TYPE_META[t].id === t, `Meta id mismatch for ${t}`);
  }
}

if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
  __runWeaponTypeSelfTests();
}
```

- [ ] **Step 2: Type-check the build**

Run: `cd games/sector-zero/web && yarn build 2>&1 | tail -15`
Expected: `✓ Compiled successfully` with no type errors. A successful exit with the standard build output.

- [ ] **Step 3: Commit**

```bash
cd /Users/nichalasbarnes/Desktop/projects/knicks-knacks
git add games/sector-zero/web/app/components/engine/weaponTypes.ts
git commit -m "feat(sector-zero): add WeaponType enum and affinity multipliers"
```

---

## Task 2: Define EnemyClass enum and planet class mappings

**Files:**
- Create: `games/sector-zero/web/app/components/engine/enemyClasses.ts`

- [ ] **Step 1: Create the enemy class module**

Create `games/sector-zero/web/app/components/engine/enemyClasses.ts`:

```typescript
import { EnemyType, type PlanetId } from "./types";
import type { WeaponType, AffinityResult } from "./weaponTypes";

/** Enemy combat class — governs stat profile + affinity profile. */
export type EnemyClass =
  | "armored"
  | "swarm"
  | "bio-organic"
  | "tech-drone"
  | "heavy-mech"
  | "elemental-fire"
  | "elemental-ice"
  | "elemental-cinder";

/** Stat multipliers relative to an enemy's baseline ENEMY_DEFS values. */
export interface EnemyClassProfile {
  id: EnemyClass;
  name: string;
  tint: string;            // multiply-blend overlay color (hex)
  hpMult: number;          // 0.5 – 2.0
  speedMult: number;       // 0.5 – 1.8
  damageMult: number;      // 0.5 – 1.5
  fireRateMult: number;    // 0.6 – 1.6 (lower = faster fire)
  scoreMult: number;       // 0.8 – 2.0
  /** Weapon types this class is weak to (Effective hits) */
  effectiveVs: WeaponType[];
  /** Weapon types this class resists (Resisted hits) */
  resistedVs: WeaponType[];
}

export const ENEMY_CLASS_PROFILES: Record<EnemyClass, EnemyClassProfile> = {
  armored: {
    id: "armored", name: "Armored", tint: "#cc4444",
    hpMult: 2.0, speedMult: 0.6, damageMult: 1.5, fireRateMult: 1.4, scoreMult: 1.8,
    effectiveVs: ["energy"], resistedVs: ["kinetic"],
  },
  swarm: {
    id: "swarm", name: "Swarm", tint: "#ffaa44",
    hpMult: 0.5, speedMult: 1.6, damageMult: 0.5, fireRateMult: 0.7, scoreMult: 0.9,
    effectiveVs: ["incendiary"], resistedVs: ["kinetic"],
  },
  "bio-organic": {
    id: "bio-organic", name: "Bio-organic", tint: "#44ff66",
    hpMult: 1.0, speedMult: 1.0, damageMult: 1.2, fireRateMult: 1.0, scoreMult: 1.1,
    effectiveVs: ["incendiary", "energy"], resistedVs: ["cryogenic"],
  },
  "tech-drone": {
    id: "tech-drone", name: "Tech Drone", tint: "#44ddff",
    hpMult: 0.9, speedMult: 1.4, damageMult: 1.0, fireRateMult: 0.65, scoreMult: 1.0,
    effectiveVs: ["energy"], resistedVs: ["kinetic"],
  },
  "heavy-mech": {
    id: "heavy-mech", name: "Heavy Mech", tint: "#996644",
    hpMult: 1.8, speedMult: 0.5, damageMult: 1.4, fireRateMult: 1.6, scoreMult: 1.7,
    effectiveVs: ["kinetic"], resistedVs: ["energy"],
  },
  "elemental-fire": {
    id: "elemental-fire", name: "Fire Elemental", tint: "#ff4422",
    hpMult: 1.0, speedMult: 1.2, damageMult: 1.3, fireRateMult: 0.9, scoreMult: 1.2,
    effectiveVs: ["cryogenic"], resistedVs: ["incendiary"],
  },
  "elemental-ice": {
    id: "elemental-ice", name: "Ice Elemental", tint: "#88ccff",
    hpMult: 1.3, speedMult: 0.8, damageMult: 0.9, fireRateMult: 1.1, scoreMult: 1.1,
    effectiveVs: ["incendiary"], resistedVs: ["cryogenic", "kinetic"],
  },
  "elemental-cinder": {
    id: "elemental-cinder", name: "Cinder Wraith", tint: "#cc6644",
    hpMult: 0.8, speedMult: 1.3, damageMult: 1.0, fireRateMult: 0.8, scoreMult: 1.0,
    effectiveVs: ["cryogenic"], resistedVs: ["energy"],
  },
};

/**
 * Map each EnemyType to a "default" class. This is the base class for
 * enemies when not overridden by planet assignment. A single EnemyType
 * can be re-classed by the wave/level spawner (via `overrideClassId`),
 * but this is the fallback.
 *
 * Philosophy: give existing enemies sensible class identities that
 * preserve their current gameplay roles.
 */
export const DEFAULT_ENEMY_CLASS: Record<EnemyType, EnemyClass> = {
  [EnemyType.SCOUT]:    "swarm",
  [EnemyType.DRONE]:    "tech-drone",
  [EnemyType.GUNNER]:   "armored",
  [EnemyType.SHIELDER]: "armored",
  [EnemyType.BOMBER]:   "bio-organic",
  [EnemyType.SWARM]:    "swarm",
  [EnemyType.TURRET]:   "heavy-mech",
  [EnemyType.CLOAKER]:  "tech-drone",
  [EnemyType.ELITE]:    "heavy-mech",
  [EnemyType.MINE]:     "bio-organic",
  [EnemyType.WRAITH]:   "elemental-cinder",
  [EnemyType.ECHO]:     "tech-drone",
  [EnemyType.MIRROR]:   "tech-drone",
};

/** Planet-to-dominant-class mapping (for planet missions). */
export const PLANET_DOMINANT_CLASS: Record<PlanetId, EnemyClass> = {
  verdania: "bio-organic",
  glaciem:  "elemental-ice",
  pyraxis:  "elemental-fire",
  ossuary:  "armored",
  abyssia:  "bio-organic",
  ashfall:  "elemental-cinder",
  prismara: "tech-drone",
  genesis:  "swarm",
  luminos:  "tech-drone",
  bastion:  "heavy-mech",
};

/** Resolve an affinity outcome for a given weapon vs a given class. */
export function resolveAffinity(
  weaponType: WeaponType,
  classId: EnemyClass
): AffinityResult {
  const profile = ENEMY_CLASS_PROFILES[classId];
  if (profile.effectiveVs.includes(weaponType)) return "effective";
  if (profile.resistedVs.includes(weaponType)) return "resisted";
  return "neutral";
}

// ─── Dev-mode self-tests ─────────────────────────────────────────────

export function __runEnemyClassSelfTests(): void {
  // All 8 class profiles defined
  const expectedClasses: EnemyClass[] = [
    "armored", "swarm", "bio-organic", "tech-drone",
    "heavy-mech", "elemental-fire", "elemental-ice", "elemental-cinder",
  ];
  for (const c of expectedClasses) {
    console.assert(ENEMY_CLASS_PROFILES[c] !== undefined, `Missing profile: ${c}`);
    console.assert(ENEMY_CLASS_PROFILES[c].id === c, `Profile id mismatch: ${c}`);
  }

  // Every EnemyType has a default class
  const enemyTypes = Object.values(EnemyType);
  for (const t of enemyTypes) {
    console.assert(DEFAULT_ENEMY_CLASS[t] !== undefined, `Missing class for EnemyType.${t}`);
  }

  // Affinity resolution works
  console.assert(
    resolveAffinity("energy", "armored") === "effective",
    "Energy vs Armored should be effective"
  );
  console.assert(
    resolveAffinity("kinetic", "armored") === "resisted",
    "Kinetic vs Armored should be resisted"
  );
  console.assert(
    resolveAffinity("cryogenic", "armored") === "neutral",
    "Cryogenic vs Armored should be neutral"
  );

  // No class should be effective AND resisted vs same weapon
  for (const profile of Object.values(ENEMY_CLASS_PROFILES)) {
    for (const w of profile.effectiveVs) {
      console.assert(
        !profile.resistedVs.includes(w),
        `Class ${profile.id} has overlap on ${w}`
      );
    }
  }

  // Stat multipliers in expected ranges (spec §358)
  for (const p of Object.values(ENEMY_CLASS_PROFILES)) {
    console.assert(p.hpMult >= 0.5 && p.hpMult <= 2.0, `${p.id} hpMult out of range`);
    console.assert(p.speedMult >= 0.5 && p.speedMult <= 1.8, `${p.id} speedMult out of range`);
    console.assert(p.damageMult >= 0.5 && p.damageMult <= 1.5, `${p.id} damageMult out of range`);
    console.assert(p.fireRateMult >= 0.6 && p.fireRateMult <= 1.6, `${p.id} fireRateMult out of range`);
    console.assert(p.scoreMult >= 0.8 && p.scoreMult <= 2.0, `${p.id} scoreMult out of range`);
  }
}

if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
  __runEnemyClassSelfTests();
}
```

- [ ] **Step 2: Verify the build**

Run: `cd games/sector-zero/web && yarn build 2>&1 | tail -15`
Expected: `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
cd /Users/nichalasbarnes/Desktop/projects/knicks-knacks
git add games/sector-zero/web/app/components/engine/enemyClasses.ts
git commit -m "feat(sector-zero): add EnemyClass profiles and planet class mappings"
```

---

## Task 3: Extend types (Bullet.weaponType, Enemy.classId, GameState, SaveData)

**Files:**
- Modify: `games/sector-zero/web/app/components/engine/types.ts`

- [ ] **Step 1: Add `weaponType` to `Bullet` interface**

In `types.ts`, find the `Bullet` interface (around line 56) and add:

```typescript
export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
  isPlayer: boolean;
  piercing: boolean;
  variant?: BulletVariant;
  weaponType?: WeaponType;  // NEW — set on player bullets for affinity lookup
}
```

Also add the import at the top of `types.ts`:

```typescript
// (if not already present — it won't be at this point)
// We avoid a circular import by only importing the TYPE, not the value
```

Actually, to avoid circular imports, declare the type inline:

```typescript
export type WeaponType = "kinetic" | "energy" | "incendiary" | "cryogenic";
```

Then have `weaponTypes.ts` import `WeaponType` FROM `types.ts` instead of declaring its own. Update `weaponTypes.ts`:

```typescript
// First line of weaponTypes.ts — replace local declaration
import type { WeaponType } from "./types";
export type { WeaponType };
```

- [ ] **Step 2: Add `classId` to `Enemy` interface**

Find the `Enemy` interface in `types.ts` (around line 168) and add:

```typescript
export interface Enemy {
  id: number;
  type: EnemyType;
  // ... existing fields ...
  cloaked: boolean;
  classId: EnemyClass;  // NEW — resolved at createEnemy time
}
```

Add the `EnemyClass` type declaration in `types.ts`:

```typescript
export type EnemyClass =
  | "armored"
  | "swarm"
  | "bio-organic"
  | "tech-drone"
  | "heavy-mech"
  | "elemental-fire"
  | "elemental-ice"
  | "elemental-cinder";
```

Update `enemyClasses.ts` to import EnemyClass from types instead of declaring locally.

- [ ] **Step 3: Add `floatingLabels` to `GameState`**

In `types.ts`, find `GameState` (around line 443) and add:

```typescript
export interface FloatingLabel {
  id: number;
  x: number;
  y: number;
  vy: number;        // upward drift velocity (negative)
  text: string;
  color: string;
  life: number;      // frames remaining
  maxLife: number;
}

export interface GameState {
  // ... existing fields ...
  particles: Particle[];
  explosions: SpriteExplosion[];
  floatingLabels: FloatingLabel[];  // NEW
  // ... rest ...
}
```

- [ ] **Step 4: Extend `SaveData` for bestiary + equipped weapon type**

Find `SaveData` definition in `types.ts` and add:

```typescript
export interface BestiaryEntry {
  enemyType: EnemyType;
  classId: EnemyClass;
  killCount: number;
  firstSeenPlanet?: PlanetId;
  firstSeenWorld?: number;
}

export interface SaveData {
  // ... existing fields ...
  // NEW:
  bestiary: Partial<Record<EnemyType, BestiaryEntry>>;
  equippedWeaponType: WeaponType;  // default: "kinetic"
}
```

- [ ] **Step 5: Verify build**

Run: `cd games/sector-zero/web && yarn build 2>&1 | tail -25`
Expected: Type errors in places that construct GameState / SaveData / Enemy without the new fields — that's fine, we'll fix those in subsequent tasks. The key check: **the type definitions themselves compile without syntax errors.**

To get a clean compile, add defaults in the next task's places. For now verify only the types.ts file has no standalone syntax issues:

Run: `cd games/sector-zero/web && npx tsc --noEmit app/components/engine/types.ts 2>&1 | head -20`
Expected: Errors from incomplete GameState/SaveData construction elsewhere, but no errors INSIDE types.ts itself.

- [ ] **Step 6: Commit (WIP — will fix consumers next)**

```bash
cd /Users/nichalasbarnes/Desktop/projects/knicks-knacks
git add games/sector-zero/web/app/components/engine/types.ts games/sector-zero/web/app/components/engine/enemyClasses.ts games/sector-zero/web/app/components/engine/weaponTypes.ts
git commit -m "feat(sector-zero): extend types for weapon affinity and enemy classes"
```

---

## Task 4: Update save migration + defaults

**Files:**
- Modify: `games/sector-zero/web/app/components/engine/save.ts`

- [ ] **Step 1: Add new fields to `defaultSave`**

In `save.ts`, update `defaultSave`:

```typescript
const defaultSave: SaveData = {
  // ... existing ...
  unlockedEnhancements: [],
  bestiary: {},
  equippedWeaponType: "kinetic",
};
```

- [ ] **Step 2: Update `migrateSave` function**

Add to `migrateSave`:

```typescript
return {
  // ... existing migrations ...
  unlockedEnhancements: (raw.unlockedEnhancements as EnhancementId[]) ?? [],
  bestiary: (raw.bestiary as SaveData["bestiary"]) ?? {},
  equippedWeaponType: (raw.equippedWeaponType as WeaponType) ?? "kinetic",
};
```

- [ ] **Step 3: Add imports at top of save.ts**

```typescript
import {
  DEFAULT_UPGRADES,
  type ConsumableId,
  type EnhancementId,
  type MaterialId,
  type PlanetId,
  type SaveData,
  type ShipUpgrades,
  type WeaponType,  // NEW
} from "./types";
```

- [ ] **Step 4: Verify build**

Run: `cd games/sector-zero/web && yarn build 2>&1 | tail -25`
Expected: Still some type errors in enemies.ts / gameEngine.ts (they don't yet set `classId` or `floatingLabels`), but save.ts should have none.

- [ ] **Step 5: Commit**

```bash
git add games/sector-zero/web/app/components/engine/save.ts
git commit -m "feat(sector-zero): migrate save for bestiary and equipped weapon type"
```

---

## Task 5: Assign classId and apply class stats in createEnemy

**Files:**
- Modify: `games/sector-zero/web/app/components/engine/enemies.ts`

- [ ] **Step 1: Import class data**

At top of `enemies.ts`:

```typescript
import { DEFAULT_ENEMY_CLASS, ENEMY_CLASS_PROFILES } from "./enemyClasses";
import type { EnemyClass } from "./types";
```

- [ ] **Step 2: Extend `createEnemy` to accept class override and apply multipliers**

Replace the existing `createEnemy` function. New signature:

```typescript
export function createEnemy(
  type: EnemyType,
  x: number,
  y: number,
  behavior?: EnemyBehavior,
  classOverride?: EnemyClass
): Enemy {
  const def = ENEMY_DEFS[type];
  const defaultBehavior = getDefaultBehavior(type);

  // Resolve class (override > default)
  const classId = classOverride ?? DEFAULT_ENEMY_CLASS[type];
  const classProfile = ENEMY_CLASS_PROFILES[classId];

  // Apply both world difficulty AND class multipliers
  const scaledHp = Math.max(1, Math.ceil(
    def.hp * currentDifficultyScale.hp * classProfile.hpMult
  ));
  const scaledSpeed = def.speed * currentDifficultyScale.speed * classProfile.speedMult;
  const scaledFireRate = Math.max(10, Math.floor(
    def.fireRate * currentDifficultyScale.fireRate * classProfile.fireRateMult
  ));
  const scaledScore = Math.floor(def.score * classProfile.scoreMult);

  return {
    id: ++enemyIdCounter,
    type,
    x,
    y,
    width: def.width,
    height: def.height,
    hp: scaledHp,
    maxHp: scaledHp,
    speed: scaledSpeed,
    vx: 0,
    vy: scaledSpeed,
    score: scaledScore,
    fireTimer: Math.floor(Math.random() * scaledFireRate),
    fireRate: scaledFireRate,
    shoots: def.shoots,
    behavior: behavior ?? defaultBehavior,
    behaviorTimer: 0,
    cloaked: type === EnemyType.CLOAKER || type === EnemyType.ECHO,
    classId,
  };
}
```

- [ ] **Step 3: Verify build (enemies.ts portion)**

Run: `cd games/sector-zero/web && yarn build 2>&1 | tail -25`
Expected: enemies.ts compiles. Still errors in gameEngine.ts if it calls createEnemy with old signature — those still work because `classOverride` is optional. Still errors because `GameState.floatingLabels` isn't initialized anywhere yet.

- [ ] **Step 4: Commit**

```bash
git add games/sector-zero/web/app/components/engine/enemies.ts
git commit -m "feat(sector-zero): apply enemy class stat multipliers in createEnemy"
```

---

## Task 6: Wire classId for planet missions (dominant class from planet)

**Files:**
- Modify: `games/sector-zero/web/app/components/engine/enemies.ts` (or wherever waves are spawned — find spawn call sites)

- [ ] **Step 1: Find spawn call sites**

Run: `cd games/sector-zero/web && grep -rn "createEnemy(" app/components/engine/ 2>&1 | head -20`

Expected output: a list of lines where `createEnemy` is called, likely in `enemies.ts` (spawnFormation) and possibly `gameEngine.ts` (planet-mission spawning).

- [ ] **Step 2: Determine class override strategy**

For MVP:
- **Main campaign missions:** keep `DEFAULT_ENEMY_CLASS` (no override)
- **Planet missions:** 70% of spawned enemies use `PLANET_DOMINANT_CLASS[planetId]`, 30% use `DEFAULT_ENEMY_CLASS[type]`

Find the planet-mission spawn site. It's likely in `gameEngine.ts` around `createPlanetGameState` or in `planetLevels.ts`. Inspect:

Run: `cd games/sector-zero/web && grep -n "createEnemy" app/components/engine/planetLevels.ts app/components/engine/gameEngine.ts 2>&1`

- [ ] **Step 3: Extend the planet spawn call site**

For each `createEnemy` call in planet-mission spawning code, add an override:

```typescript
import { PLANET_DOMINANT_CLASS, DEFAULT_ENEMY_CLASS } from "./enemyClasses";

// In the spawn function (wherever it is):
const planetClass = PLANET_DOMINANT_CLASS[planetId];
const useOverride = Math.random() < 0.7;  // 70% dominant, 30% default
const classOverride = useOverride ? planetClass : DEFAULT_ENEMY_CLASS[enemyType];
const enemy = createEnemy(enemyType, x, y, behavior, classOverride);
```

If there is NO existing planet-specific spawn code (i.e., planets currently use the same spawn flow as campaign), defer this to a later task — document that in the commit message and leave `createEnemy` calls unchanged in planet code. The class override system is in place regardless.

- [ ] **Step 4: Verify build**

Run: `cd games/sector-zero/web && yarn build 2>&1 | tail -15`
Expected: `✓ Compiled successfully` (or remaining errors only in floatingLabels-related code).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(sector-zero): apply planet dominant class to 70% of spawns"
```

---

## Task 7: Tag player bullets with weaponType

**Files:**
- Modify: `games/sector-zero/web/app/components/engine/weapons.ts`

- [ ] **Step 1: Update `createBullet` to accept weaponType**

In `weapons.ts`, update the function:

```typescript
import type { WeaponType } from "./types";

function createBullet(
  x: number,
  y: number,
  vx: number,
  vy: number,
  isPlayer: boolean,
  damage: number = 1,
  piercing: boolean = false,
  weaponType?: WeaponType
): Bullet {
  return {
    id: ++bulletIdCounter,
    x, y, vx, vy,
    width: isPlayer ? 4 : 6,
    height: isPlayer ? 12 : 8,
    damage,
    isPlayer,
    piercing,
    weaponType,
  };
}
```

- [ ] **Step 2: Update `firePlayerWeapon` to accept and propagate weaponType**

```typescript
export function firePlayerWeapon(
  player: Player,
  weaponLevel: number,
  weaponType: WeaponType = "kinetic"
): Bullet[] {
  const cx = player.x + player.width / 2;
  const top = player.y;
  const bullets: Bullet[] = [];
  const damage = 1;

  switch (weaponLevel) {
    case 1:
      bullets.push(createBullet(cx - 2, top, 0, -BULLET_SPEED, true, damage, false, weaponType));
      break;
    case 2:
      bullets.push(createBullet(cx - 8, top, 0, -BULLET_SPEED, true, damage, false, weaponType));
      bullets.push(createBullet(cx + 4, top, 0, -BULLET_SPEED, true, damage, false, weaponType));
      break;
    case 3:
      bullets.push(createBullet(cx - 2, top, 0, -BULLET_SPEED, true, damage, false, weaponType));
      bullets.push(createBullet(cx - 8, top, -1.5, -BULLET_SPEED, true, damage, false, weaponType));
      bullets.push(createBullet(cx + 4, top, 1.5, -BULLET_SPEED, true, damage, false, weaponType));
      break;
    case 4:
      bullets.push(createBullet(cx - 6, top, -0.5, -BULLET_SPEED, true, damage, false, weaponType));
      bullets.push(createBullet(cx + 2, top, 0.5, -BULLET_SPEED, true, damage, false, weaponType));
      bullets.push(createBullet(cx - 12, top, -2, -BULLET_SPEED, true, damage, false, weaponType));
      bullets.push(createBullet(cx + 8, top, 2, -BULLET_SPEED, true, damage, false, weaponType));
      break;
    case 5:
    default:
      bullets.push(createBullet(cx - 2, top, 0, -BULLET_SPEED, true, damage, false, weaponType));
      bullets.push(createBullet(cx - 8, top, -1, -BULLET_SPEED, true, damage, false, weaponType));
      bullets.push(createBullet(cx + 4, top, 1, -BULLET_SPEED, true, damage, false, weaponType));
      bullets.push(createBullet(cx - 14, top, -2.5, -BULLET_SPEED, true, damage, false, weaponType));
      bullets.push(createBullet(cx + 10, top, 2.5, -BULLET_SPEED, true, damage, false, weaponType));
      break;
  }
  return bullets;
}

export function fireSideGunners(player: Player, weaponType: WeaponType = "kinetic"): Bullet[] {
  const leftX = player.x - 16;
  const rightX = player.x + player.width + 8;
  const y = player.y + 8;
  return [
    createBullet(leftX, y, 0, -BULLET_SPEED * 0.8, true, 1, false, weaponType),
    createBullet(rightX, y, 0, -BULLET_SPEED * 0.8, true, 1, false, weaponType),
  ];
}
```

- [ ] **Step 3: Update call sites in gameEngine.ts**

Run: `cd games/sector-zero/web && grep -n "firePlayerWeapon\|fireSideGunners" app/components/engine/gameEngine.ts 2>&1`

For each call site, pass the player's equipped weapon type. The easiest source: the game state should hold this value at the `GameState` level (not SaveData level) during a run. Add to `GameState`:

In `types.ts` add:

```typescript
export interface GameState {
  // ... existing ...
  equippedWeaponType: WeaponType;  // NEW — hydrated from SaveData at mission start
}
```

Update all `createGameState` / `createPlanetGameState` callers to initialize from save:

```typescript
equippedWeaponType: save.equippedWeaponType ?? "kinetic",
```

Then in `gameEngine.ts` firing calls:

```typescript
const bullets = firePlayerWeapon(s.player, s.player.weaponLevel, s.equippedWeaponType);
// and:
const sideBullets = fireSideGunners(s.player, s.equippedWeaponType);
```

- [ ] **Step 4: Verify build**

Run: `cd games/sector-zero/web && yarn build 2>&1 | tail -20`
Expected: clean compile for weapons.ts and gameEngine.ts firing paths. Still type errors if `floatingLabels` isn't yet initialized in createGameState.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(sector-zero): tag player bullets with equipped weapon type"
```

---

## Task 8: Implement floating damage labels module

**Files:**
- Create: `games/sector-zero/web/app/components/engine/floatingLabels.ts`

- [ ] **Step 1: Create the module**

Create `games/sector-zero/web/app/components/engine/floatingLabels.ts`:

```typescript
import type { FloatingLabel } from "./types";
import type { AffinityResult } from "./weaponTypes";

let labelIdCounter = 0;

export function resetFloatingLabelIds(): void {
  labelIdCounter = 0;
}

const AFFINITY_LABEL_TEXT: Record<AffinityResult, string> = {
  effective: "CRITICAL",
  neutral:   "",
  resisted:  "RESISTED",
};

const AFFINITY_LABEL_COLOR: Record<AffinityResult, string> = {
  effective: "#ffdd44",
  neutral:   "",
  resisted:  "#888899",
};

/**
 * Spawn a floating label for an affinity hit.
 * Returns null for neutral hits (no label).
 */
export function createAffinityLabel(
  x: number,
  y: number,
  affinity: AffinityResult
): FloatingLabel | null {
  if (affinity === "neutral") return null;
  return {
    id: ++labelIdCounter,
    x,
    y,
    vy: -1.2,
    text: AFFINITY_LABEL_TEXT[affinity],
    color: AFFINITY_LABEL_COLOR[affinity],
    life: 40,     // ~0.67s at 60fps
    maxLife: 40,
  };
}

export function updateFloatingLabels(labels: FloatingLabel[]): FloatingLabel[] {
  return labels
    .map((l) => ({
      ...l,
      y: l.y + l.vy,
      vy: l.vy * 0.97,
      life: l.life - 1,
    }))
    .filter((l) => l.life > 0);
}

export function drawFloatingLabels(
  ctx: CanvasRenderingContext2D,
  labels: FloatingLabel[]
): void {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 11px monospace";
  for (const l of labels) {
    const alpha = l.life / l.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = l.color;
    ctx.shadowBlur = 4;
    ctx.shadowColor = l.color;
    ctx.fillText(l.text, l.x, l.y);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}
```

- [ ] **Step 2: Verify module compiles**

Run: `cd games/sector-zero/web && yarn build 2>&1 | tail -15`

- [ ] **Step 3: Commit**

```bash
git add games/sector-zero/web/app/components/engine/floatingLabels.ts
git commit -m "feat(sector-zero): add floating damage label system"
```

---

## Task 9: Initialize floatingLabels in game state, update & render

**Files:**
- Modify: `games/sector-zero/web/app/components/engine/gameEngine.ts`
- Modify: `games/sector-zero/web/app/components/engine/renderer.ts`

- [ ] **Step 1: Initialize `floatingLabels: []` in both game state factories**

In `gameEngine.ts`, find every `createGameState` and `createPlanetGameState`. Add `floatingLabels: [],` alongside `particles: [],`:

```typescript
particles: [],
explosions: [],
floatingLabels: [],
```

Also add `equippedWeaponType: save.equippedWeaponType ?? "kinetic",` to both factories if not done in Task 7.

- [ ] **Step 2: Update floating labels each frame**

Import at top of `gameEngine.ts`:

```typescript
import { updateFloatingLabels, createAffinityLabel, resetFloatingLabelIds } from "./floatingLabels";
```

Find the particles update line:

```typescript
s.particles = updateParticles(s.particles);
s.explosions = updateSpriteExplosions(s.explosions);
```

Add:

```typescript
s.floatingLabels = updateFloatingLabels(s.floatingLabels);
```

Add this to all 3 places where particles are updated (per earlier `grep` results).

- [ ] **Step 3: Add `resetFloatingLabelIds()` to the game reset path**

Find `resetEnemyIds()` calls in gameEngine.ts. After each, add `resetFloatingLabelIds()`.

- [ ] **Step 4: Render floating labels**

In `renderer.ts`, import:

```typescript
import { drawFloatingLabels } from "./floatingLabels";
```

Find `drawSpriteExplosions(ctx, state.explosions);` line (~72) and add below it:

```typescript
drawFloatingLabels(ctx, state.floatingLabels);
```

- [ ] **Step 5: Verify build**

Run: `cd games/sector-zero/web && yarn build 2>&1 | tail -15`
Expected: `✓ Compiled successfully`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(sector-zero): wire floating labels into game state and renderer"
```

---

## Task 10: Apply affinity multiplier in bullet→enemy collision

**Files:**
- Modify: `games/sector-zero/web/app/components/engine/gameEngine.ts`

- [ ] **Step 1: Locate the damage calculation**

The existing collision code (around line 1019) is:

```typescript
const newHp = enemy.hp - bullet.damage;
```

- [ ] **Step 2: Replace with affinity-adjusted damage**

Import at top of `gameEngine.ts`:

```typescript
import { resolveAffinity, ENEMY_CLASS_PROFILES } from "./enemyClasses";
import { AFFINITY_MULTIPLIER } from "./weaponTypes";
import { createAffinityLabel } from "./floatingLabels";
```

Replace the damage line (around line 1019) with:

```typescript
// Compute affinity-adjusted damage
let finalDamage = bullet.damage;
if (bullet.isPlayer && bullet.weaponType) {
  const affinity = resolveAffinity(bullet.weaponType, enemy.classId);
  finalDamage = bullet.damage * AFFINITY_MULTIPLIER[affinity];

  // Spawn floating label for non-neutral hits
  const label = createAffinityLabel(
    enemy.x + enemy.width / 2,
    enemy.y - 4,
    affinity
  );
  if (label) {
    s.floatingLabels = [...s.floatingLabels, label];
  }
}

const newHp = enemy.hp - finalDamage;
```

- [ ] **Step 3: Apply same treatment to boss damage calculation**

Find the similar pattern around line 730 for bosses:

```typescript
bossHp = Math.max(0, bossHp - bullet.damage);
```

Bosses don't have `classId` (yet — future work). For now, skip affinity multiplier for bosses but still spawn labels for visual consistency using a hardcoded neutral. Or just leave bosses unchanged for MVP and note it as a TODO:

```typescript
// TODO: bosses don't use affinity system in MVP — add per-boss class assignment later
bossHp = Math.max(0, bossHp - bullet.damage);
```

- [ ] **Step 4: Verify build**

Run: `cd games/sector-zero/web && yarn build 2>&1 | tail -15`
Expected: `✓ Compiled successfully`

- [ ] **Step 5: Playtest checklist**

Run: `cd games/sector-zero/web && yarn dev`

Open http://localhost:3000 and verify:
- [ ] Game starts normally, no console errors
- [ ] Shoot enemies — they take damage as before (currently all Kinetic player weapon, default enemy classes)
- [ ] Against armored-class enemies (SHIELDER/GUNNER/ELITE): shots do 0.5× damage → they take 2× as long to kill (this is "RESISTED" even though the label doesn't show yet — we'll add the visual next)
- [ ] No visual feedback yet (labels exist in state but no label visible is expected because Kinetic vs most classes is neutral or resisted — verify RESISTED labels DO appear via browser dev console inspecting `state.floatingLabels` array)

**Verification via console:**
Open devtools console while shooting a GUNNER or SHIELDER. You should see floating "RESISTED" labels drift upward from the hit.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(sector-zero): apply weapon affinity damage multiplier + spawn labels"
```

---

## Task 11: Render class tint overlay on enemies

**Files:**
- Modify: `games/sector-zero/web/app/components/engine/enemies.ts`

- [ ] **Step 1: Import class profiles**

Top of `enemies.ts`:

```typescript
import { DEFAULT_ENEMY_CLASS, ENEMY_CLASS_PROFILES } from "./enemyClasses";
```

- [ ] **Step 2: Update `drawEnemies` to apply tint overlay**

Replace the existing `drawEnemies` function:

```typescript
export function drawEnemies(
  ctx: CanvasRenderingContext2D,
  enemies: Enemy[]
): void {
  for (const enemy of enemies) {
    if (enemy.cloaked) {
      ctx.globalAlpha = 0.15;
    }

    ctx.save();

    const spritePath = ENEMY_SPRITE_MAP[enemy.type];
    const sprite = spritePath ? getSprite(spritePath) : null;

    const pad = 4;
    const dx = enemy.x - pad;
    const dy = enemy.y - pad;
    const dw = enemy.width + pad * 2;
    const dh = enemy.height + pad * 2;

    if (sprite) {
      ctx.drawImage(sprite, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = "#aa44ff";
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }

    // Class tint overlay (multiply blend, subtle)
    const classProfile = ENEMY_CLASS_PROFILES[enemy.classId];
    if (classProfile) {
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = (enemy.cloaked ? 0.15 : 1) * 0.35;  // subtle tint
      ctx.fillStyle = classProfile.tint;
      ctx.fillRect(dx, dy, dw, dh);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = enemy.cloaked ? 0.15 : 1;
    }

    ctx.restore();

    // HP bar (unchanged)
    if (enemy.maxHp > 1 && enemy.hp < enemy.maxHp) {
      const barW = enemy.width;
      const barH = 3;
      const barX = enemy.x;
      const barY = enemy.y - 6;
      ctx.fillStyle = "#333";
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = "#ff3333";
      ctx.fillRect(barX, barY, barW * (enemy.hp / enemy.maxHp), barH);
    }

    ctx.globalAlpha = 1;
  }
}
```

- [ ] **Step 3: Verify build**

Run: `cd games/sector-zero/web && yarn build 2>&1 | tail -15`

- [ ] **Step 4: Playtest checklist**

Run: `cd games/sector-zero/web && yarn dev`

Open http://localhost:3000 and verify:
- [ ] Enemies visibly show class tints:
  - Scouts/Swarm: orange tint
  - Drones/Cloakers/Echo/Mirror: cyan tint
  - Gunners/Shielders: red tint
  - Turrets/Elite: brown tint
  - Bombers/Mines: green tint
  - Wraiths: amber tint
- [ ] Tints are subtle, not overwhelming — the enemy sprite should still be clearly visible
- [ ] Cloaked enemies (Cloaker/Echo) remain low-alpha as before, but with tint also applied

- [ ] **Step 5: Commit**

```bash
git add games/sector-zero/web/app/components/engine/enemies.ts
git commit -m "feat(sector-zero): render class tint overlay on enemies"
```

---

## Task 12: Add affinity icon above enemy HP bar on hit

**Files:**
- Modify: `games/sector-zero/web/app/components/engine/types.ts`
- Modify: `games/sector-zero/web/app/components/engine/gameEngine.ts`
- Modify: `games/sector-zero/web/app/components/engine/enemies.ts`

- [ ] **Step 1: Add `lastHitAffinity` and `lastHitTimer` to Enemy interface**

In `types.ts` Enemy interface:

```typescript
export interface Enemy {
  // ... existing ...
  classId: EnemyClass;
  lastHitAffinity?: AffinityResult;  // NEW
  lastHitTimer: number;              // NEW — frames remaining on hit marker (0 = none)
}
```

Add import:

```typescript
import type { AffinityResult } from "./weaponTypes";
```

Or declare `AffinityResult` in types.ts to avoid circular imports:

```typescript
export type AffinityResult = "effective" | "neutral" | "resisted";
```

And import it in `weaponTypes.ts` from types.ts instead.

- [ ] **Step 2: Initialize new fields in createEnemy**

Add to the return object in `createEnemy` (enemies.ts):

```typescript
lastHitAffinity: undefined,
lastHitTimer: 0,
```

- [ ] **Step 3: Set `lastHitAffinity` in collision code**

In `gameEngine.ts`, inside the block where you computed `finalDamage` (from Task 10), after recording the label:

```typescript
// Mark enemy with last hit affinity for visual indicator
enemy.lastHitAffinity = affinity;
enemy.lastHitTimer = 120;  // visible for 2s at 60fps
```

Note: `enemy` is a loop variable. To mutate the stored enemy, use the enemyById Map or mutate by reference (they're already object references in the array). Verify the surrounding code pattern — if it rebuilds arrays immutably, you'll need to track updates differently. If enemies are mutated in place (which they are in this codebase based on `enemy.hp - bullet.damage` usage), direct mutation works.

- [ ] **Step 4: Decrement `lastHitTimer` each frame**

In `gameEngine.ts`, find the enemy update loop or `updateEnemies` function. Add at the end of each enemy update:

```typescript
if (updated.lastHitTimer > 0) {
  updated.lastHitTimer -= 1;
  if (updated.lastHitTimer === 0) {
    updated.lastHitAffinity = undefined;
  }
}
```

- [ ] **Step 5: Draw affinity indicator in drawEnemies**

In `enemies.ts` `drawEnemies`, after the HP bar block:

```typescript
// Affinity indicator (appears above HP bar when recently hit)
if (enemy.lastHitAffinity && enemy.lastHitTimer > 0 && enemy.lastHitAffinity !== "neutral") {
  const icon = enemy.lastHitAffinity === "effective" ? "⬆" : "⬇";
  const color = enemy.lastHitAffinity === "effective" ? "#ffdd44" : "#888899";
  const alpha = Math.min(1, enemy.lastHitTimer / 60);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(icon, enemy.x + enemy.width / 2, enemy.y - 10);
  ctx.restore();
}
```

- [ ] **Step 6: Verify build**

Run: `cd games/sector-zero/web && yarn build 2>&1 | tail -15`
Expected: `✓ Compiled successfully`

- [ ] **Step 7: Playtest checklist**

Run: `cd games/sector-zero/web && yarn dev`

- [ ] Shoot armored enemies (gunner/shielder/elite/turret) → see ⬇ indicator above them briefly (Kinetic RESISTED)
- [ ] Shoot heavy-mech class enemies (elite/turret) → see ⬆ (Kinetic EFFECTIVE)
- [ ] Indicator fades out after ~2 seconds

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(sector-zero): show affinity up/down indicator above enemies on hit"
```

---

## Task 13: Bestiary data helpers

**Files:**
- Create: `games/sector-zero/web/app/components/engine/bestiary.ts`

- [ ] **Step 1: Create the bestiary module**

Create `games/sector-zero/web/app/components/engine/bestiary.ts`:

```typescript
import type { BestiaryEntry, EnemyType, PlanetId, SaveData } from "./types";
import { DEFAULT_ENEMY_CLASS, ENEMY_CLASS_PROFILES } from "./enemyClasses";
import { ENEMY_DEFS } from "./types";

/**
 * Record a kill in the bestiary. Mutates and returns the updated bestiary.
 * First kill of a type creates the entry; subsequent kills increment count.
 */
export function recordKill(
  bestiary: SaveData["bestiary"],
  enemyType: EnemyType,
  classId: BestiaryEntry["classId"],
  context: { planetId?: PlanetId; world?: number }
): SaveData["bestiary"] {
  const existing = bestiary[enemyType];
  if (existing) {
    return {
      ...bestiary,
      [enemyType]: { ...existing, killCount: existing.killCount + 1 },
    };
  }
  return {
    ...bestiary,
    [enemyType]: {
      enemyType,
      classId,
      killCount: 1,
      firstSeenPlanet: context.planetId,
      firstSeenWorld: context.world,
    },
  };
}

/** Entries sorted by display order (EnemyType enum order). */
export function getBestiaryList(bestiary: SaveData["bestiary"]): BestiaryEntry[] {
  const allTypes = Object.values(ENEMY_DEFS).map((d) => d.type);
  return allTypes
    .filter((t) => bestiary[t] !== undefined)
    .map((t) => bestiary[t]!);
}

/** Total distinct enemies discovered */
export function getDiscoveredCount(bestiary: SaveData["bestiary"]): number {
  return Object.keys(bestiary).length;
}

/** Total possible enemies */
export function getTotalEnemyCount(): number {
  return Object.keys(ENEMY_DEFS).length;
}

/** Human-readable lore for each enemy type (1-2 sentences each) */
export const ENEMY_LORE: Record<EnemyType, string> = {
  SCOUT:
    "Fast reconnaissance unit. Dies easily but attacks in swarms. First seen in Aurelia Belt.",
  DRONE:
    "Automated attack drone. Fires while strafing. Tech-class, vulnerable to energy weapons.",
  GUNNER:
    "Armored heavy-weapons platform. Slow but devastating sustained fire.",
  SHIELDER:
    "Front-line bulwark with frontal barrier. Difficult to damage head-on.",
  BOMBER:
    "Kamikaze unit that detonates on contact. Leaks biological spores.",
  SWARM:
    "Small, fast, numerous. Individually weak, terrifying in formation.",
  TURRET:
    "Stationary emplacement. High fire rate when player is in range.",
  CLOAKER:
    "Phase-shift enemy. Invisible at rest, briefly visible when firing.",
  ELITE:
    "Heavy assault unit combining multiple weapon systems. Priority target.",
  MINE:
    "Drifting explosive. Attracted to player ship mass. Do not touch.",
  WRAITH:
    "Ghost-class entity from the deeper sectors. Phases through projectiles.",
  ECHO:
    "Temporal anomaly unit. Flickers between existence states every 1.5s.",
  MIRROR:
    "Adaptive reflection enemy. Copies player movement patterns with jitter.",
};
```

- [ ] **Step 2: Verify build**

Run: `cd games/sector-zero/web && yarn build 2>&1 | tail -15`

- [ ] **Step 3: Commit**

```bash
git add games/sector-zero/web/app/components/engine/bestiary.ts
git commit -m "feat(sector-zero): add bestiary data helpers and enemy lore"
```

---

## Task 14: Record kills to bestiary

**Files:**
- Modify: `games/sector-zero/web/app/components/engine/gameEngine.ts`
- Modify: `games/sector-zero/web/app/components/engine/types.ts`

- [ ] **Step 1: Add pendingBestiaryKills to GameState**

In `types.ts`:

```typescript
export interface GameState {
  // ... existing ...
  /** Enemy kills recorded this session — flushed to SaveData on mission complete */
  pendingBestiaryKills: Array<{ type: EnemyType; classId: EnemyClass }>;
}
```

Initialize as `pendingBestiaryKills: []` in both game state factories.

- [ ] **Step 2: Record kills in collision code**

In `gameEngine.ts`, find the enemy destruction block (around line 1020):

```typescript
if (newHp <= 0) {
  destroyedEnemies.add(enemy.id);
  audioEvents.push(AudioEvent.ENEMY_DESTROY);

  // ... existing explosion / score code ...

  // NEW: record kill for bestiary
  s.pendingBestiaryKills = [
    ...s.pendingBestiaryKills,
    { type: enemy.type, classId: enemy.classId },
  ];
}
```

Do the same in the bomb kill loop (around line 1278):

```typescript
for (const enemy of enemies) {
  // ... existing ...
  s.pendingBestiaryKills.push({ type: enemy.type, classId: enemy.classId });
}
```

(Note: for bomb kills, `pendingBestiaryKills` may not be on `s` in that function — check the scope. If the bomb handler returns a new state object, push to a local array and include in the returned state.)

- [ ] **Step 3: Flush kills to SaveData on mission complete**

Find where levels are completed / saves happen. Likely in `Game.tsx` or a saveSave call. Search:

Run: `cd games/sector-zero/web && grep -n "saveSave\|LEVEL_COMPLETE\|levelComplete" app/components/Game.tsx 2>&1 | head -20`

At the mission-complete save point, flush pending kills:

```typescript
import { recordKill } from "./engine/bestiary";

// when mission completes:
let updatedBestiary = save.bestiary;
for (const kill of gameState.pendingBestiaryKills) {
  updatedBestiary = recordKill(updatedBestiary, kill.type, kill.classId, {
    world: gameState.currentWorld,
    planetId: gameState.planetId,
  });
}
const newSave = { ...save, bestiary: updatedBestiary };
saveSave(newSave);
setSave(newSave);
```

- [ ] **Step 4: Verify build**

Run: `cd games/sector-zero/web && yarn build 2>&1 | tail -15`

- [ ] **Step 5: Playtest checklist**

Run: `yarn dev`

- [ ] Complete a level, kill some enemies along the way
- [ ] After level-complete, open browser devtools console and inspect `localStorage.getItem("sector-zero-save")`
- [ ] Verify the `bestiary` object has entries matching killed enemy types with `killCount > 0`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(sector-zero): record enemy kills to bestiary on mission complete"
```

---

## Task 15: Bestiary screen UI (cockpit hub)

**Files:**
- Modify: `games/sector-zero/web/app/components/engine/cockpit.ts`
- Modify: `games/sector-zero/web/app/components/engine/cockpitRenderer.ts`
- Modify: `games/sector-zero/web/app/components/Game.tsx`

- [ ] **Step 1: Add `bestiary` to cockpit screen enum**

In `cockpit.ts`, find the `CockpitScreen` type and add:

```typescript
export type CockpitScreen =
  | "hub"
  | "armory"
  | "crew"
  | "missions"
  | "codex"
  | "bestiary";  // NEW
```

Also add a `bestiarySelected: number` to `CockpitHubState` and initialize to 0.

Add a hotspot entry to `COCKPIT_HOTSPOTS` for the bestiary. Copy an existing hotspot (like codex) as a template. Position it in an unused screen corner — e.g., beside the codex.

- [ ] **Step 2: Add `drawBestiaryScreen` in cockpitRenderer.ts**

In `cockpitRenderer.ts`:

```typescript
import { getBestiaryList, getDiscoveredCount, getTotalEnemyCount, ENEMY_LORE } from "./bestiary";
import { ENEMY_CLASS_PROFILES } from "./enemyClasses";
import { WEAPON_TYPE_META } from "./weaponTypes";
```

Add a new function, modeled on `drawCodexScreen`:

```typescript
function drawBestiaryScreen(
  ctx: CanvasRenderingContext2D,
  state: CockpitHubState,
  save: SaveData
): void {
  drawSubScreenFrame(ctx, "BESTIARY", SPRITES.CODEX_BG);  // reuse codex bg for now

  const entries = getBestiaryList(save.bestiary);
  const total = getTotalEnemyCount();
  const discovered = getDiscoveredCount(save.bestiary);

  // Discovery progress
  ctx.fillStyle = "#667788";
  ctx.font = "10px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`DISCOVERED ${discovered} / ${total}`, 20, 52);

  if (entries.length === 0) {
    ctx.fillStyle = "#556666";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("No enemies discovered yet.", CANVAS_WIDTH / 2, 200);
    ctx.fillText("Engage hostiles to populate bestiary.", CANVAS_WIDTH / 2, 220);
    return;
  }

  // List of entries on left; detail panel on right
  const listX = 16;
  const listW = 160;
  const startY = 70;
  const rowH = 42;

  const selected = Math.min(state.bestiarySelected, entries.length - 1);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const y = startY + i * rowH;
    const isSelected = i === selected;

    // Row background
    if (isSelected) {
      ctx.fillStyle = "rgba(68, 204, 255, 0.15)";
      ctx.beginPath();
      ctx.roundRect(listX, y, listW, rowH - 4, 4);
      ctx.fill();
    }

    // Class tint swatch
    const profile = ENEMY_CLASS_PROFILES[entry.classId];
    ctx.fillStyle = profile.tint;
    ctx.fillRect(listX + 8, y + 12, 8, 14);

    // Name + kill count
    ctx.fillStyle = isSelected ? "#ffffff" : "#889999";
    ctx.font = isSelected ? "bold 11px monospace" : "11px monospace";
    ctx.textAlign = "left";
    ctx.fillText(entry.enemyType, listX + 24, y + 14);
    ctx.fillStyle = "#667788";
    ctx.font = "9px monospace";
    ctx.fillText(`x${entry.killCount} kills`, listX + 24, y + 28);
  }

  // Detail panel on right
  const entry = entries[selected];
  const profile = ENEMY_CLASS_PROFILES[entry.classId];
  const detailX = listX + listW + 16;
  const detailW = CANVAS_WIDTH - detailX - 16;

  // Name + class
  ctx.shadowBlur = 4;
  ctx.shadowColor = profile.tint;
  ctx.fillStyle = profile.tint;
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(entry.enemyType, detailX, startY);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#667788";
  ctx.font = "9px monospace";
  ctx.fillText(`CLASS: ${profile.name.toUpperCase()}`, detailX, startY + 18);

  // Affinity profile
  let ay = startY + 40;
  ctx.fillStyle = "#ffdd44";
  ctx.font = "bold 9px monospace";
  ctx.fillText("EFFECTIVE VS", detailX, ay);
  ay += 12;
  ctx.font = "9px monospace";
  ctx.fillStyle = "#aaaaaa";
  const effStr = profile.effectiveVs.map((w) => WEAPON_TYPE_META[w].name).join(", ") || "—";
  ctx.fillText(effStr, detailX, ay);
  ay += 18;
  ctx.fillStyle = "#888899";
  ctx.font = "bold 9px monospace";
  ctx.fillText("RESISTS", detailX, ay);
  ay += 12;
  ctx.font = "9px monospace";
  ctx.fillStyle = "#aaaaaa";
  const resStr = profile.resistedVs.map((w) => WEAPON_TYPE_META[w].name).join(", ") || "—";
  ctx.fillText(resStr, detailX, ay);
  ay += 20;

  // Stat profile
  ctx.fillStyle = "#667788";
  ctx.font = "bold 9px monospace";
  ctx.fillText("STAT PROFILE", detailX, ay);
  ay += 12;
  ctx.font = "9px monospace";
  ctx.fillStyle = "#aaaaaa";
  ctx.fillText(`HP: ${profile.hpMult.toFixed(1)}x`, detailX, ay);
  ctx.fillText(`SPD: ${profile.speedMult.toFixed(1)}x`, detailX + 90, ay);
  ay += 12;
  ctx.fillText(`DMG: ${profile.damageMult.toFixed(1)}x`, detailX, ay);
  ctx.fillText(`RATE: ${profile.fireRateMult.toFixed(1)}x`, detailX + 90, ay);
  ay += 20;

  // Lore
  ctx.fillStyle = "#667788";
  ctx.font = "bold 9px monospace";
  ctx.fillText("INTEL", detailX, ay);
  ay += 12;
  ctx.fillStyle = "#aaaaaa";
  ctx.font = "10px monospace";
  wrapText(ctx, ENEMY_LORE[entry.enemyType], detailX, ay, detailW, 14);
}

// Helper wrapText is already defined elsewhere; if not, copy from renderer.ts
```

Add dispatch case in the main screen dispatch function (around line 20):

```typescript
} else if (state.screen === "bestiary") {
  drawBestiaryScreen(ctx, state, save);
```

- [ ] **Step 3: Handle input for bestiary screen**

In `Game.tsx`, find the cockpit input handling. Add arrow-up/arrow-down to navigate bestiary entries:

```typescript
if (cockpitState.screen === "bestiary") {
  const entries = getBestiaryList(save.bestiary);
  if (key === "ArrowUp") {
    setCockpitState((s) => ({
      ...s,
      bestiarySelected: Math.max(0, s.bestiarySelected - 1),
    }));
  } else if (key === "ArrowDown") {
    setCockpitState((s) => ({
      ...s,
      bestiarySelected: Math.min(entries.length - 1, s.bestiarySelected + 1),
    }));
  }
}
```

Also wire the hotspot click to set `screen: "bestiary"`.

- [ ] **Step 4: Verify build**

Run: `cd games/sector-zero/web && yarn build 2>&1 | tail -15`

- [ ] **Step 5: Playtest checklist**

Run: `yarn dev`

- [ ] Complete a mission with varied enemies
- [ ] Open cockpit hub → navigate to Bestiary
- [ ] See list of discovered enemies with class tint swatch, kill counts
- [ ] Arrow keys navigate the list
- [ ] Detail panel shows: name, class, effective/resisted weapons, stat multipliers, lore

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(sector-zero): add Bestiary screen to cockpit hub"
```

---

## Task 16: Final verification + polish pass

**Files:** All touched files

- [ ] **Step 1: Full build**

Run: `cd games/sector-zero/web && yarn build 2>&1 | tail -20`
Expected: `✓ Compiled successfully` with no errors or warnings (except any pre-existing Next.js warnings).

- [ ] **Step 2: Lint**

Run: `cd games/sector-zero/web && yarn lint 2>&1 | tail -20`
Expected: no new lint errors. Fix any introduced.

- [ ] **Step 3: End-to-end playtest checklist**

Run: `yarn dev`

- [ ] Load the game with an existing save — migration runs without crashing
- [ ] Load the game without a save (clear localStorage) — new save has `bestiary: {}`, `equippedWeaponType: "kinetic"`
- [ ] Start a mission, shoot enemies — damage + affinity feedback works
- [ ] Play through to mission complete — bestiary updates with kills
- [ ] Open Bestiary screen — entries display correctly
- [ ] Open Codex — still works (no regression)
- [ ] Enemies visibly have class tint overlays
- [ ] Shooting armored enemies shows RESISTED labels; heavy-mech shows CRITICAL
- [ ] Enemy stats vary — swarm enemies die fast, armored enemies take more hits
- [ ] Planet missions still load and play (if they didn't have planet-dominant class overrides from Task 6, they work with default classes)

- [ ] **Step 4: Open-browser dev-console check**

Run: `yarn dev`, open the game, check browser console for:

- [ ] No errors on load
- [ ] Self-test assertions from `weaponTypes.ts` and `enemyClasses.ts` pass silently (console.assert only logs on failure)

- [ ] **Step 5: Final commit (if any polish changes)**

```bash
git add -A
git status  # verify what's changed
git commit -m "chore(sector-zero): affinity system final polish and verification" || echo "Nothing to commit"
```

---

## Summary

After all 16 tasks complete, the game will have:

- ✅ 4 weapon types defined (Kinetic / Energy / Incendiary / Cryogenic)
- ✅ 8 enemy classes with distinct stat profiles and affinity profiles
- ✅ All existing enemies auto-tagged with default classes
- ✅ Planet missions use 70% dominant class + 30% default (where planet spawn code exists)
- ✅ Affinity damage multipliers (1.5× / 1.0× / 0.5×) applied to all player→enemy damage
- ✅ Floating CRITICAL / RESISTED labels on non-neutral hits
- ✅ Subtle class tint overlay on all enemy sprites
- ✅ Up/down affinity arrow above enemies for 2s after each hit
- ✅ Bestiary screen in cockpit hub tracking kills, showing class/stats/affinities/lore
- ✅ Save data migrated to include bestiary + equipped weapon type
- ✅ Player weapon tagged as Kinetic by default (ready for future weapon-type swapping)

**Remaining post-MVP work** (future plans):
- Pilot leveling layer
- Multi-phase level architecture
- Ground run-and-gun mode
- Rare/legendary materials (Stage 1 of reward economy)
- Scout ship passive reveal (requires Hangar system from Expansion 1)
- Resonance Beacon consumable (requires Workshop from Expansion 2)

---

## Open Decisions Deferred to Implementation

- **Bosses & affinity:** MVP leaves bosses unaffected by affinity. Future task assigns bosses their own `classId`.
- **Weapon type switching:** Player stays on Kinetic forever in MVP. A future Loadout screen lets player equip other types once other weapons are unlocked.
- **Planet spawn override:** If no planet-specific spawner exists in current code, Task 6 becomes a no-op. This is acceptable — the data is in place.
- **Bestiary screen art:** Uses existing SPRITES.CODEX_BG for now. A dedicated bestiary background sprite is future polish.
