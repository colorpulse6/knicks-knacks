# Chimera Development Checklist

Quick reference for tracking progress. See PROGRESS.md for details.

---

## Phase 1: Foundation ✅ COMPLETE

### Setup
- [x] Next.js project created
- [x] Tailwind CSS configured
- [x] Static export for GitHub Pages
- [x] Monorepo integration

### Types (`app/types/`)
- [x] character.ts
- [x] battle.ts
- [x] item.ts
- [x] map.ts
- [x] animation.ts
- [x] lattice.ts
- [x] index.ts

### State (`app/stores/`)
- [x] gameStore.ts

### Data (`app/data/`)
- [x] characters.ts (Kai, Lyra with lattice fields)
- [x] items.ts (Four Humors system)
- [x] enemies.ts (Bandit encounters)
- [x] maps/havenwood.ts
- [x] maps/whispering_ruins.ts
- [x] lattices/kai-lattice.ts
- [x] lattices/index.ts

### Components - World
- [x] MapView.tsx (tile renderer)

### Components - Core
- [x] Game.tsx
- [x] screens/TitleScreen.tsx
- [x] screens/SystemBootScreen.tsx
- [x] Game Over (inline)

---

## Phase 2: Combat System ✅ COMPLETE

### Engine (`app/engine/`)
- [x] battleEngine.ts
- [x] atbSystem.ts
- [x] damageCalculator.ts
- [x] aiController.ts
- [x] encounterEngine.ts
- [x] levelingEngine.ts
- [x] animationController.ts
- [x] spriteLoader.ts

### Components - Combat
- [x] BattleScreen.tsx
- [x] CommandMenu.tsx
- [x] PartyStatus.tsx
- [x] EnemyDisplay.tsx
- [x] DamageNumbers.tsx
- [x] BattleLog.tsx
- [x] BattleAnimator.tsx
- [x] BattleTransition.tsx

### Combat Features
- [x] ATB gauge filling
- [x] Attack command
- [x] Magic command (with MP deduction)
- [ ] Item command (TODO: full implementation)
- [ ] Defend command (TODO: damage reduction)
- [x] Flee command
- [x] Enemy AI (4 types)
- [x] Victory/defeat handling
- [x] XP/gold rewards
- [x] Level-up processing

---

## Phase 3: Screens & Menu ✅ COMPLETE

### Menu Components
- [x] GameMenu.tsx
- [x] ItemsScreen.tsx (with effect descriptions)
- [x] StatusScreen.tsx
- [x] LatticeScreen.tsx
- [x] EquipScreen.tsx (with shard socketing)
- [x] QuestScreen.tsx
- [x] SaveScreen.tsx (4-slot save/load with preview)

### Progression System
- [x] Source Code Lattice
- [x] LevelUpNotification.tsx
- [x] OP earning
- [x] Node unlocking

---

## Phase 4: World Interaction ✅ COMPLETE

### Shop System
- [x] ShopScreen.tsx (buy/sell UI)
- [x] Shop data (shops.ts)
- [x] Aldric's Provisions
- [x] Item effect display (cyan)
- [x] Requires interaction to enter

### Map System
- [x] Static objects with collision
- [x] Map transitions (fade effect)
- [x] Teleport events
- [x] Shop entrance events
- [x] Treasure chests
- [x] Collectible items

### Quest System
- [x] Quest types (quest.ts)
- [x] Quest data (quests.ts)
- [x] Herbalist's Request quest
- [x] QuestScreen.tsx
- [x] Quest markers on NPCs

### Dialogue System
- [x] DialogueBox.tsx (typewriter effect)
- [x] Dynamic dialogue (herbalist-mira.ts)
- [x] Choice branches
- [x] Story flag triggers

---

## Phase 5: Save & Services ✅ COMPLETE

### Save System
- [x] SaveScreen.tsx with 4 slots
- [x] Slot preview (location, party, playtime)
- [x] Overwrite confirmation
- [x] Load Game on Title Screen
- [x] Save points (Temporal Distortions)

### Inn System
- [x] InnScreen.tsx (The Weary Wanderer)
- [x] Full HP/MP restoration (50 gold)
- [x] Innkeeper portrait and dialogue
- [x] Resting animation
- [x] Inn event in Havenwood map

### Battle Backgrounds
- [x] battleBackgrounds.ts config
- [x] Forest BG for Havenwood
- [x] Ruins BG for Whispering Ruins
- [x] Dynamic loading in BattleScreen

---

## Phase 6: Status Effects & Combat Polish ✅ COMPLETE

### Status Effects System
- [x] Status effect definitions (poison, regen, haste, slow, sleep, blind, protect, shell, berserk, silence)
- [x] Status effect processor engine
- [x] ATB speed modifiers (haste +50%, slow -50%)
- [x] Damage modifiers (protect, shell, berserk)
- [x] Disable effects (sleep wakes on damage, silence blocks magic)
- [x] Turn-start effects (poison damage, regen healing)
- [x] Visual indicators in party status panel
- [x] Visual indicators on enemy display

### Attack Animation Improvements
- [x] Slash effect particles (diagonal streak)
- [x] Impact spark particles on hit
- [x] Screen shake on attack impact
- [x] Better visual feedback for physical attacks

### Critical Hit Effects
- [x] X-shaped slash effect for crits
- [x] Extra burst particles (yellow/orange/red)
- [x] Double screen shake on critical hits
- [x] "CRITICAL" damage number display

### Status-Inflicting Abilities
- [x] Ability type extended with status effect support
- [x] Status chance rolls with resist messages
- [x] Status-only abilities (no damage)
- [x] Combined damage + status abilities

**Kai's New Abilities:**
- [x] Time Warp (magic, inflicts Slow)
- [x] Quickstep (support, self-Haste)

**Lyra's New Abilities:**
- [x] Bio (magic, damage + Poison)
- [x] Sleep (magic, inflicts Sleep)
- [x] Slow (magic, inflicts Slow)
- [x] Haste (support, grants Haste)
- [x] Regen (support, grants Regen)
- [x] Shell (support, grants Shell)
- [x] Protect (updated, grants Protect status)

---

## Coming Next 🔄

### Gameplay Features
- [ ] Passive effects from Lattice nodes
- [ ] Boss battle (System Agent encounter)
- [ ] Element-specific magic animations (fire/ice/thunder)

---

## Not Started ❌

### Additional Features
- [ ] Sound effects & music
- [ ] More quest content
- [ ] Additional party members
- [ ] Boss battles
- [ ] Dungeon puzzles

---

## Quick Test

```bash
yarn chimera:dev
# Opens at http://localhost:3010
```

**Expected behavior:**
1. Title screen with "CHIMERA" + Load Game button (if saves exist)
2. Click "New Game" → System Boot intro
3. After intro → Havenwood village
4. WASD to move, Enter/Space to interact
5. Walk to shop door → "Enter Aldric's Provisions?"
6. Walk to inn door → "Enter The Weary Wanderer Inn?"
7. Walk into cave for map transition to Whispering Ruins
8. Talk to Herbalist Mira for quest
9. Press B for test battle (see forest/ruins backgrounds)
10. Stand on save point → Menu → Save tab → Save Game

---

Last Updated: 2026-02-03 (Critical Hits, Status Abilities)
