# Chimera Asset List

This document tracks all visual and audio assets needed for the game.

## Asset Status Legend
- ✅ Complete
- 🔄 In Progress
- ❌ Missing

---

## Character Sprites

### Battle Sprites
| Asset | Path | Dimensions | Status |
|-------|------|------------|--------|
| Kai Battle | `/sprites/characters/kai_battle.png` | 1024×1024 (4×3 grid, 256×341 frames) | ✅ |
| Lyra Battle | `/sprites/characters/lyra_battle.png` | 256×256 (4×4 grid, 64×64 frames) | ❌ |

### Field Sprites (Overworld)
| Asset | Path | Dimensions | Status |
|-------|------|------------|--------|
| Kai Field | `/sprites/characters/kai_field.png` | 96×128 (3×4 grid, 32×32 frames) | ❌ |
| Lyra Field | `/sprites/characters/lyra_field.png` | 96×128 (3×4 grid, 32×32 frames) | ❌ |

**Field Sprite Spec:**
- 32×32 pixel frames
- 3 columns (animation frames) × 4 rows (directions: down, left, right, up)
- Animations: idle (1 frame), walk (3 frames per direction)

---

## NPC Sprites

| Asset | Path | Dimensions | Status | Notes |
|-------|------|------------|--------|-------|
| Elder Morris | `/sprites/characters/elder.png` | 32×32 or 96×128 | ❌ | Havenwood village elder |
| Merchant Beth | `/sprites/characters/merchant.png` | 32×32 or 96×128 | ❌ | Shop keeper |
| Villager Tom | `/sprites/characters/villager.png` | 32×32 or 96×128 | ❌ | Generic villager |
| Mysterious Figure | `/sprites/characters/mysterious.png` | 32×32 or 96×128 | ❌ | Whispering Ruins (hooded/shadowy) |

---

## Enemy Sprites

### Battle Sprites
| Asset | Path | Dimensions | Status | Notes |
|-------|------|------------|--------|-------|
| Bandit | `/sprites/enemies/bandit.png` | 2816×1536 (5×3 grid, 563×512 frames) | ✅ | Human enemy |
| Giant Rat | `/sprites/enemies/giant_rat.png` | 1536×1024 (4×2 grid, 384×512 frames) | ✅ | Easiest enemy |
| Wild Wolf | `/sprites/enemies/wolf.png` | 1536×1024 (4×2 grid, 384×512 frames) | ✅ | Natural creature |
| Rogue Knight | `/sprites/enemies/rogue_knight.png` | 1536×1024 (4×2 grid, 384×512 frames) | ✅ | Armored human enemy |
| Corrupted Sprite | `/sprites/enemies/corrupted_sprite.png` | 1536×1024 (4×2 grid, 384×512 frames) | ✅ | Glitched fairy creature |
| Static Wraith | `/sprites/enemies/static_wraith.png` | 256×128 (4×2 grid, 64×64 frames) | ❌ | Ghostly glitched creature |
| Flickering Hound | `/sprites/enemies/flickering_hound.png` | 256×128 (4×2 grid, 64×64 frames) | ❌ | Wolf-like glitched creature |
| System Agent | `/sprites/enemies/system_agent.png` | 512×256 (4×2 grid, 128×128 frames) | ❌ | Boss - dark geometric armor |

**Enemy Animation Frames:**
- Row 1: idle (4 frames), attack start (1 frame)
- Row 2: attack (2 frames), hurt (1 frame), death (1 frame)

---

## Portraits

| Asset | Path | Dimensions | Status | Notes |
|-------|------|------------|--------|-------|
| Kai Portrait | `/portraits/kai.png` | 128×128 or 256×256 | ❌ | For dialogue boxes |
| Lyra Portrait | `/portraits/lyra.png` | 128×128 or 256×256 | ❌ | For dialogue boxes |
| Elder Morris Portrait | `/portraits/elder.png` | 128×128 | ❌ | Optional |
| Mysterious Figure Portrait | `/portraits/mysterious.png` | 128×128 | ❌ | Shadowed/hidden face |
| Aldric (Male Merchant) | `/assets/merchant_portrait_male.png` | 256×256 | ✅ | Shop keeper portrait |
| Beth (Female Merchant) | `/assets/merchant_portrait_female.png` | 256×256 | ✅ | Reserved for future use |

---

## Building Sprites

| Asset | Path | Dimensions | Status | Notes |
|-------|------|------------|--------|-------|
| Inn | `/assets/inn.png` | 160×192 (5×6 tiles) | ✅ | Havenwood inn building |
| Shop | `/assets/shop.png` | 96×128 (3×4 tiles) | ✅ | Aldric's Provisions |
| Cottage | `/assets/cottage.png` | 96×128 (3×4 tiles) | ✅ | Small house |
| Tree | `/assets/tree.png` | 64×96 (2×3 tiles) | ✅ | Foliage decoration |
| Rock (Large) | `/assets/rock_large.png` | 64×32 (2×1 tiles) | ✅ | Boulder obstacle |
| Rock (Small) | `/assets/rock_small.png` | 32×32 (1×1 tile) | ✅ | Small rock |
| Cave Entrance | `/assets/cave.png` | 96×64 (3×2 tiles) | ✅ | Map transition point |

---

## Shop UI Assets

| Asset | Path | Dimensions | Status | Notes |
|-------|------|------------|--------|-------|
| Shop Interior | `/assets/shop_interior.png` | 800×600 | ✅ | Background for shop screen |
| Shop Frame | `/assets/shop_frame.png` | Variable | ✅ | UI frame element |
| Coin Icon | `/assets/coin_icon.png` | 32×32 | ✅ | Gold display |

---

## Map Tilesets

### Havenwood Village
| Asset | Path | Dimensions | Status |
|-------|------|------------|--------|
| Village Tileset | `/tilesets/havenwood.png` | 192×192 (6×6 tiles) | ❌ |

**Tile Types (32×32 each):**
- 0: Grass
- 1: Path/Dirt
- 2: Water
- 3: Wall/Building exterior
- 4: Floor/Interior
- 5: Door

### Whispering Ruins
| Asset | Path | Dimensions | Status |
|-------|------|------------|--------|
| Ruins Tileset | `/tilesets/whispering_ruins.png` | 192×192 (6×6 tiles) | ❌ |

**Tile Types (32×32 each):**
- 0: Stone floor
- 1: Path (worn stone)
- 2: Void/Pit (black)
- 3: Wall (crumbling stone)
- 4: Rubble
- 5: Glowing tiles (mystical cyan/purple)

---

## UI Elements

| Asset | Path | Status | Notes |
|-------|------|--------|-------|
| Menu Frame | `/ui/menu_frame.png` | ❌ | Fantasy-style border |
| Button Normal | `/ui/button.png` | ❌ | Standard button state |
| Button Hover | `/ui/button_hover.png` | ❌ | Highlighted state |
| HP Bar | `/ui/hp_bar.png` | ❌ | Red gradient |
| MP Bar | `/ui/mp_bar.png` | ❌ | Blue gradient |
| ATB Gauge | `/ui/atb_gauge.png` | ❌ | Yellow/amber fill |
| Item Icons | `/ui/item_icons.png` | ❌ | Sprite sheet of item icons |
| Cursor | `/ui/cursor.png` | ❌ | Selection arrow |

---

## Battle Backgrounds

| Asset | Path | Status | Notes |
|-------|------|--------|-------|
| Forest Battle BG | `/backgrounds/forest.png` | ❌ | Havenwood encounters |
| Ruins Battle BG | `/backgrounds/ruins.png` | ❌ | Whispering Ruins encounters |
| Boss Arena BG | `/backgrounds/boss_arena.png` | ❌ | System Agent fight |

**Dimensions:** 800×300 or 1200×400 (wide format for battle scene)

---

## Effects & Particles

| Asset | Path | Status | Notes |
|-------|------|--------|-------|
| Hit Effect | `/effects/hit.png` | ❌ | White/yellow impact burst |
| Critical Hit | `/effects/critical.png` | ❌ | Larger impact with stars |
| Heal Effect | `/effects/heal.png` | ❌ | Green sparkles rising |
| Fire Effect | `/effects/fire.png` | ❌ | Orange/red flames |
| Ice Effect | `/effects/ice.png` | ❌ | Blue crystals |
| Lightning Effect | `/effects/lightning.png` | ❌ | Yellow bolts |
| Glitch Effect | `/effects/glitch.png` | ❌ | Chromatic aberration/static |
| Death Effect | `/effects/death.png` | ❌ | Fade/dissolve particles |

---

## Audio

### Music
| Asset | Path | Status | Notes |
|-------|------|--------|-------|
| Title Theme | `/audio/music/title.mp3` | ❌ | Epic/mysterious orchestral |
| Havenwood Theme | `/audio/music/peaceful_village.mp3` | ❌ | Calm, pastoral |
| Ruins Theme | `/audio/music/dungeon_mystery.mp3` | ❌ | Tense, eerie |
| Battle Theme | `/audio/music/battle.mp3` | ❌ | Fast-paced, urgent |
| Boss Theme | `/audio/music/boss.mp3` | ❌ | Intense, dramatic |
| Victory Fanfare | `/audio/music/victory.mp3` | ❌ | Short celebratory jingle |
| Game Over | `/audio/music/game_over.mp3` | ❌ | Somber, short |

### Sound Effects
| Asset | Path | Status | Notes |
|-------|------|--------|-------|
| Menu Select | `/audio/sfx/menu_select.wav` | ❌ | UI click |
| Menu Cursor | `/audio/sfx/menu_cursor.wav` | ❌ | UI navigation |
| Sword Slash | `/audio/sfx/slash.wav` | ❌ | Physical attack |
| Magic Cast | `/audio/sfx/magic.wav` | ❌ | Spell activation |
| Heal Sound | `/audio/sfx/heal.wav` | ❌ | HP recovery |
| Enemy Hit | `/audio/sfx/enemy_hit.wav` | ❌ | Damage dealt |
| Player Hit | `/audio/sfx/player_hit.wav` | ❌ | Damage received |
| Critical Hit | `/audio/sfx/critical.wav` | ❌ | Big damage |
| Death Sound | `/audio/sfx/death.wav` | ❌ | Enemy defeat |
| Level Up | `/audio/sfx/level_up.wav` | ❌ | Character advancement |
| Item Use | `/audio/sfx/item.wav` | ❌ | Consumable used |
| Footsteps | `/audio/sfx/footstep.wav` | ❌ | Walking |
| Door Open | `/audio/sfx/door.wav` | ❌ | Entering buildings |
| Treasure Open | `/audio/sfx/treasure.wav` | ❌ | Chest opened |
| Save Point | `/audio/sfx/save.wav` | ❌ | Temporal Distortion |
| Glitch Sound | `/audio/sfx/glitch.wav` | ❌ | Reality distortion |

---

## Priority Order for Development

### Phase 1 - MVP (Highest Priority)
1. ❌ Kai Field Sprite (needed for exploration)
2. ❌ Village Tileset (or procedural generation)
3. ❌ Ruins Tileset
4. ❌ Wild Wolf enemy sprite
5. ❌ Basic UI elements (HP/MP bars, cursor)

### Phase 2 - Polish
1. ❌ Lyra Battle Sprite
2. ❌ Lyra Field Sprite
3. ❌ NPC Sprites
4. ❌ Portraits
5. ❌ Battle Backgrounds
6. ❌ Effect sprites

### Phase 3 - Audio
1. ❌ Core sound effects (attack, hit, heal)
2. ❌ Music tracks
3. ❌ Ambient sounds

---

## Art Style Guidelines

**General:**
- Pixel art style (16-bit era inspired)
- Color palette: Muted medieval tones with occasional vibrant accents
- Glitch effects should use cyan/magenta chromatic aberration

**Characters:**
- Chibi proportions for field sprites (large head, small body)
- More detailed proportions for battle sprites
- Kai: Brown hair, determined expression, simple armor
- Lyra: Blonde hair, elegant dress, kind expression

**Enemies:**
- Bandits: Rugged human, leather armor, weapons
- Wolves: Natural gray/brown coloring
- Corrupted Sprite: Fairy-like with static/glitch visual effects
- System Agent: Dark geometric armor, glowing cyan sigils

**Environment:**
- Havenwood: Green, warm, inviting village
- Whispering Ruins: Dark stone, mysterious glowing elements, sense of decay

---

## Asset Generation Notes

For AI-generated assets, include these prompts:

**Kai Battle Sprite:**
"Pixel art JRPG character sprite sheet, young male warrior with brown hair, light armor, sword, 4x3 grid animation frames, 16-bit style, white background"

**Corrupted Sprite Enemy:**
"Pixel art fantasy enemy sprite sheet, corrupted fairy creature with digital glitch effects, static distortion, wrong colors, 4x2 grid, dark fantasy style"

**Village Tileset:**
"Pixel art medieval village tileset, grass, dirt path, water, wooden buildings, 32x32 tiles, 6x6 grid, RPG Maker style"
