# Chimera Development Progress

## Project Overview
**Chimera** is a Final Fantasy 6-style JRPG with ATB combat, pixel art graphics, and a story that transitions from medieval fantasy to time-traveling sci-fi.

**MVP Goal:** Demo Dungeon (30-60 minutes of gameplay)

---

## Current Status: Phase 2 Complete - Combat & Progression ✅

### Phase 1: Foundation ✅ COMPLETE

#### Project Setup
- [x] Next.js 15 project structure
- [x] Tailwind CSS configured
- [x] Static export for GitHub Pages
- [x] Monorepo integration
- [x] `yarn chimera:dev` script

#### Core Types (`app/types/`)
- [x] `character.ts` - Character, Stats, Equipment, growth rates
- [x] `battle.ts` - BattleState, ATBState, BattleAction, Enemy
- [x] `item.ts` - Item, Inventory, Equipment interfaces
- [x] `map.ts` - GameMap, Tile, NPC, MapEvent interfaces
- [x] `animation.ts` - Animation types and events
- [x] `lattice.ts` - Source Code Lattice progression system
- [x] `index.ts` - Re-exports and GamePhase

#### State Management (`app/stores/`)
- [x] `gameStore.ts` - Zustand store with:
  - Game phase management (title, system_boot, exploring, combat, game_over)
  - Party management
  - Player movement with collision
  - Map loading and transitions
  - Battle start/end with XP/gold rewards
  - Level-up processing
  - Inventory management
  - Save/Load functionality
  - localStorage migration for new fields

#### Data Files (`app/data/`)
- [x] `characters.ts` - Kai and Lyra with lattice fields
- [x] `items.ts` - Four Humors healing system + equipment
- [x] `enemies.ts` - Bandit encounter definitions
- [x] `maps/havenwood.ts` - Starting village
- [x] `maps/whispering_ruins.ts` - Danger zone with encounters
- [x] `lattices/kai-lattice.ts` - Kai's progression grid
- [x] `lattices/index.ts` - Lattice registry

#### World Rendering (`app/components/world/`)
- [x] `MapView.tsx` - Canvas tile renderer with camera

---

### Phase 2: Combat System ✅ COMPLETE

#### Battle Engine (`app/engine/`)
- [x] `battleEngine.ts` - Full ATB combat:
  - Battle initialization
  - ATB gauge updates
  - Command queue system
  - Attack/Magic execution
  - Item use (TODO: full implementation)
  - Defend action (TODO: damage reduction)
  - Flee mechanics
  - Victory/defeat conditions
- [x] `atbSystem.ts` - ATB calculations with speed-based fill
- [x] `damageCalculator.ts` - FF-style damage formulas
- [x] `aiController.ts` - 4 AI types (random, aggressive, defensive, smart)
- [x] `encounterEngine.ts` - Random encounter system
- [x] `levelingEngine.ts` - XP, level-up, OP earning
- [x] `animationController.ts` - Battle animations + particles
- [x] `spriteLoader.ts` - Sprite management

#### Combat UI (`app/components/combat/`)
- [x] `BattleScreen.tsx` - Main battle container
- [x] `CommandMenu.tsx` - Attack/Magic/Item/Defend/Flee
- [x] `PartyStatus.tsx` - HP/MP/ATB display
- [x] `EnemyDisplay.tsx` - Enemy HP bars
- [x] `BattleLog.tsx` - Action messages
- [x] `DamageNumbers.tsx` - Floating damage
- [x] `BattleAnimator.tsx` - Character animations
- [x] `BattleTransition.tsx` - Glitch transition effect

#### Progression System
- [x] Source Code Lattice (leveling grid)
- [x] Level-up notifications after battle
- [x] `LatticeScreen.tsx` - Visual grid UI
- [x] `LevelUpNotification.tsx` - Post-battle modal
- [x] OP (Optimization Points) earning
- [x] Node unlocking with prerequisites

---

### Phase 3: Screens & Menu ✅ COMPLETE

#### Screens (`app/components/screens/`)
- [x] `TitleScreen.tsx` - New Game / Continue
- [x] `SystemBootScreen.tsx` - Sci-fi horror intro sequence
- [x] Game Over screen (inline in Game.tsx)

#### Menu System (`app/components/menu/`)
- [x] `GameMenu.tsx` - Main menu container
- [x] `ItemsScreen.tsx` - Inventory management with effect display
- [x] `StatusScreen.tsx` - Character stats
- [x] `LatticeScreen.tsx` - Progression grid
- [x] `EquipScreen.tsx` - Equip/unequip gear with shard socketing
- [x] `QuestScreen.tsx` - Quest log with objectives
- [ ] Save/Load UI - Store has functions, needs UI screens

#### Main Game Component
- [x] `Game.tsx` - Full orchestrator with:
  - Phase routing
  - Input handling
  - Battle transitions
  - Map transitions with fade effect
  - Menu integration
  - Level-up notifications
  - Interaction prompts

---

### Phase 4: World Interaction ✅ COMPLETE

#### Shop System (`app/components/shop/`)
- [x] `ShopScreen.tsx` - Full buy/sell interface
- [x] Shop data structure with inventory, portraits, greetings
- [x] Item effect descriptions in cyan color
- [x] Quantity selection and transaction handling
- [x] Aldric's Provisions in Havenwood

#### Map System (`app/data/maps/`)
- [x] Static objects with sprite rendering and collision
- [x] Map events (teleport, shop, treasure, collectible)
- [x] Map transitions with fade effect
- [x] NPC placement and interaction
- [x] Encounter zones

#### Interaction System (`app/engine/interactionEngine.ts`)
- [x] NPC dialogue triggers
- [x] Treasure chest opening
- [x] Collectible items (quest-gated)
- [x] Shop entrance (requires interaction)
- [x] Interaction prompts on screen

#### Quest System (`app/types/quest.ts`, `app/data/quests.ts`)
- [x] Quest types and progress tracking
- [x] "The Herbalist's Request" fetch quest
- [x] Moonpetal flower collectibles
- [x] Quest rewards (gold, XP, items)
- [x] Quest markers on NPCs

#### Dialogue System (`app/components/ui/DialogueBox.tsx`)
- [x] Typewriter text effect
- [x] Speaker portraits
- [x] Dialogue choices
- [x] Dynamic dialogue based on quest state
- [x] Story flag triggers

---

### Phase 5: Save System & Services ✅ COMPLETE

#### Save/Load System (`app/components/menu/SaveScreen.tsx`)
- [x] 4-slot save system with visual preview
- [x] Slot shows location, party, playtime, timestamp
- [x] Overwrite confirmation dialog
- [x] "Game saved!" / "Game loaded!" feedback messages
- [x] Keyboard navigation (↑/↓ select, Enter confirm, Esc back)
- [x] Load Game button on Title Screen
- [x] Save points required to save (Temporal Distortions)

#### Inn System (`app/components/inn/InnScreen.tsx`)
- [x] The Weary Wanderer Inn in Havenwood
- [x] Full HP/MP restoration for party
- [x] 50 gold cost with affordability check
- [x] Innkeeper portrait and dialogue
- [x] Resting animation with heal particles
- [x] "Fully Rested!" completion screen
- [x] Keyboard navigation

#### Battle Backgrounds (`app/data/battleBackgrounds.ts`)
- [x] Dynamic backgrounds based on current map
- [x] Forest background for Havenwood encounters
- [x] Ruins background for Whispering Ruins encounters
- [x] Fallback gradient for unknown maps
- [x] Configurable overlay opacity per location

---

### Phase 6: Status Effects & Combat Polish ✅ COMPLETE

#### Status Effects System (`app/data/statusEffects.ts`, `app/engine/statusEffectProcessor.ts`)
- [x] Status effect definitions:
  - **Poison** (DoT, 10% max HP per turn)
  - **Regen** (HoT, 8% max HP per turn)
  - **Haste** (+50% ATB speed)
  - **Slow** (-50% ATB speed)
  - **Sleep** (cannot act, wakes on damage)
  - **Blind** (50% miss chance on attacks)
  - **Protect** (-25% physical damage)
  - **Shell** (-25% magic damage)
  - **Berserk** (+50% attack, auto-attack only)
  - **Silence** (cannot use magic)
- [x] Status effect processor with turn-start processing
- [x] Integration with battle engine (ATB modifiers, damage modifiers)
- [x] On-damage effects (sleep removal)
- [x] Visual indicators in battle UI

#### Attack Animation Improvements (`app/engine/animationController.ts`)
- [x] Slash effect particle system (diagonal streak)
- [x] Impact spark particles on hit
- [x] Screen shake on attack impact
- [x] Enhanced visual feedback for physical attacks

#### Critical Hit Effects
- [x] X-shaped slash effect (`createCriticalSlashEffect()`)
- [x] Extra burst particles (yellow/orange/red/white)
- [x] Double screen shake on critical hits
- [x] "CRITICAL" damage number with yellow text
- [x] Random critical hits based on luck stat

#### Status-Inflicting Abilities (`app/types/character.ts`, `app/data/characters.ts`)
- [x] Extended Ability interface with `statusEffects` array
- [x] `AbilityStatusEffect` interface for effect configuration
- [x] `isStatusOnly` flag for pure buff/debuff abilities
- [x] Chance-based status application with resist messages
- [x] Battle engine integration (`applyAbilityStatusEffects()`)

**New Character Abilities:**

| Character | Ability | Type | Effect |
|-----------|---------|------|--------|
| Kai | Time Warp | Magic | 15 damage + 80% Slow |
| Kai | Quickstep | Support | Self Haste |
| Lyra | Bio | Magic | 20 damage + 75% Poison |
| Lyra | Sleep | Magic | 65% Sleep |
| Lyra | Slow | Magic | 70% Slow |
| Lyra | Haste | Support | Grants Haste |
| Lyra | Regen | Support | Grants Regen |
| Lyra | Shell | Support | Grants Shell |
| Lyra | Protect | Support | Grants Protect |

---

### In Progress 🔄

#### Additional Features

---

### Recently Completed ✅

#### Critical Hit Effects
- [x] X-shaped critical slash animation
- [x] Extra burst particles for crits
- [x] Double screen shake on critical hits
- [x] "CRITICAL" damage number display

#### Status-Inflicting Abilities
- [x] Extended Ability interface for status effects
- [x] Status-only abilities (Haste, Sleep, etc.)
- [x] Combined damage + status (Bio, Time Warp)
- [x] Chance-based application with resist messages
- [x] 9 new character abilities added

#### Status Effects System
- [x] Complete status effect data with 10+ effects
- [x] Status effect processor engine
- [x] ATB speed modifiers from haste/slow
- [x] Damage modifiers from protect/shell/berserk
- [x] Disable effects (sleep, silence)
- [x] Visual indicators in party and enemy UI

#### Attack Animation Polish
- [x] Slash effect particle system
- [x] Impact spark particles
- [x] Screen shake on attack hit

#### Battle Commands
- [x] `executeItem()` - Full item implementation with inventory consumption
- [x] `executeDefend()` - Adds "defending" status, halves incoming damage

#### Enemy Variety
- [x] Giant Rat (easiest enemy)
- [x] Bandit (basic human enemy)
- [x] Wild Wolf (fast attacker)
- [x] Rogue Knight (armored human)
- [x] Corrupted Sprite (glitched magic user)
- [x] Static Wraith (ghostly glitched)
- [x] Flickering Hound (fast glitched wolf)
- [x] System Agent (mini-boss)

---

### Not Started ❌

#### Additional Features
- [ ] Passive effects from Lattice nodes
- [ ] Sound effects & music
- [ ] More quest content (expand Herbalist quest)
- [ ] Additional party members
- [ ] Boss battles
- [ ] Dungeon puzzles

---

## Key Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `stores/gameStore.ts` | Central game state | ✅ |
| `types/index.ts` | All TypeScript types | ✅ |
| `data/characters.ts` | Kai, Lyra definitions | ✅ |
| `data/enemies.ts` | Bandit encounters | ✅ |
| `data/items.ts` | Four Humors items | ✅ |
| `data/battleBackgrounds.ts` | Battle BG config | ✅ |
| `engine/battleEngine.ts` | Combat logic | ✅ |
| `engine/levelingEngine.ts` | Progression | ✅ |
| `components/Game.tsx` | Main orchestrator | ✅ |
| `components/combat/BattleScreen.tsx` | Battle UI + backgrounds | ✅ |
| `components/screens/SystemBootScreen.tsx` | Intro sequence | ✅ |
| `components/menu/LatticeScreen.tsx` | Progression grid | ✅ |
| `components/menu/SaveScreen.tsx` | Save/Load UI | ✅ |
| `components/inn/InnScreen.tsx` | Inn rest system | ✅ |
| `data/statusEffects.ts` | Status effect definitions | ✅ |
| `engine/statusEffectProcessor.ts` | Status effect processing | ✅ |
| `components/combat/StatusEffectIcons.tsx` | Status effect UI | ✅ |
| `engine/aiController.ts` | Enemy AI including steal | ✅ |
| `data/items.ts` | Items + steal system functions | ✅ |

---

## How to Run

```bash
cd /path/to/knicks-knacks
yarn chimera:dev
# Opens at http://localhost:3010
```

## Controls
- **Arrow keys / WASD** - Move
- **Enter / Space** - Confirm / Skip
- **Escape / M** - Toggle menu
- **P** - Pause
- **B** - Test battle (debug)
- **1** - Teleport to Havenwood
- **2** - Teleport to Whispering Ruins

---

## Recent Additions (2026-02)

### 2026-02-03 (Latest)
1. **Bandit Steal System**:
   - Bandits can now steal items from the player during combat
   - Item rarity affects steal resistance (common=10%, legendary=95%)
   - Target selection weighted by rarity (common items more likely targeted)
   - 30% fumble chance where steal attempt does nothing
   - Luck stats affect steal success (thief luck +2%, target luck -1.5% per point)
   - Steal chance clamped between 5%-95% (never guaranteed, never impossible)
   - Bandits have 25% chance to attempt steal each turn

2. **Updated Bandit Sprite**:
   - New 4x2 grid sprite format matching other enemies
   - Breathing animation with alternateRows
   - Fixed checkered background removal in sprite loader

3. **UI Fixes**:
   - Magic ability menu now scrollable with `max-h-48 overflow-y-auto`
   - Enemy encounters now use map-based area selection
   - "Normal" difficulty by default for more enemy variety

4. **Damage Numbers Enhancement**:
   - All attacks now display floating damage numbers
   - Critical hits show red, larger text (`text-red-500 text-4xl font-black`)
   - Removed white flash effect on attacks

5. **Critical Hit Effects**:
   - X-shaped slash effect for critical hits
   - Extra burst particles (yellow/orange/red)
   - Double screen shake on crit impact
   - "CRITICAL" text on damage numbers (yellow, larger)

2. **Status-Inflicting Abilities**:
   - Extended Ability type with status effect configuration
   - Status-only abilities (no damage, just apply effects)
   - Combined damage + status abilities (like Bio)
   - Chance rolls with resist messages
   - New abilities for Kai and Lyra

3. **Status Effects System** - Full combat status effects:
   - 10+ status effect types (poison, regen, haste, slow, sleep, blind, etc.)
   - ATB speed modifiers (haste speeds up, slow slows down)
   - Damage modifiers (protect, shell, berserk)
   - Disable effects (sleep prevents action, silence blocks magic)
   - Turn-start processing (poison ticks, regen heals)
   - Visual indicators on party status and enemy display

4. **Attack Animation Improvements**:
   - Slash effect particle system (diagonal streak of particles)
   - Impact spark particles when attacks land
   - Screen shake on attack hit for better feedback
   - Enhanced visual feedback vs. the previous placeholder

### 2026-02-03 (Later)
1. **Save/Load UI** - Complete save system:
   - 4 save slots with preview (location, party, playtime)
   - Overwrite confirmation dialog
   - Load Game button on title screen
   - Keyboard navigation throughout
   - Save points required (Temporal Distortions)

2. **Inn System** - The Weary Wanderer Inn:
   - Full HP/MP restoration for 50 gold
   - Innkeeper portrait and welcoming dialogue
   - Resting animation with heal particles
   - Party status display after rest
   - Styled like ShopScreen for consistency

3. **Battle Backgrounds** - Location-aware combat scenes:
   - Forest background for Havenwood (dense trees, dappled light)
   - Ruins background for Whispering Ruins (pillars, glowing runes)
   - Dynamic loading based on playerPosition.mapId
   - Configurable overlay opacity for UI readability

### 2026-02-03 (Earlier)
1. **Shop System** - Full mercantile with:
   - Aldric's Provisions in Havenwood
   - Buy/sell interface with quantity selection
   - Item effect descriptions (cyan color)
   - Shopkeeper portraits and greetings
   - Requires interaction to enter (not auto-trigger)

2. **Map Transitions** - Smooth area changes:
   - Fade out → map switch → fade in
   - Cave entrance/exit between Havenwood and Whispering Ruins
   - Shop door entrances

3. **Quest System** - "The Herbalist's Request":
   - Quest types and progress tracking
   - Collectible items (Moonpetal Flowers)
   - Dynamic NPC dialogue based on quest state
   - Quest markers on NPCs

4. **Building Collision System**:
   - Static objects with explicit collision offsets
   - Sprites render at position, collision at specific tiles
   - Doors can be walkable for shop/inn entrances

### 2026-02-02
1. **System Boot Screen** - Sci-fi horror intro
2. **Source Code Lattice** - Progression system
3. **Battle Fixes** - Enemy ATB, level-up processing
4. **localStorage Migration** - Auto-migrate old saves

---

## Story Context

See `docs/story/` for full narrative:
- `story-outline.md` - 3-act structure
- `characters.md` - Character profiles
- `lumina-family/` - Lumina lineage

**Demo premise:** Kai investigates Whispering Ruins near Havenwood, seeking his missing sister Elara. He meets Lady Lyra and experiences his first "Glitch" - reality revealing its sci-fi core.

---

## Last Updated
2026-02-03 - Phase 6 complete (Critical Hits, Status-Inflicting Abilities, Status Effects System)
