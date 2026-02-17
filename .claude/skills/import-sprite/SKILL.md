---
name: import-sprite
description: Process a sprite sheet image, detect grid layout, generate animation config, and wire into the engine. Use when adding new character or enemy sprites.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(sips *), Bash(cp *), Bash(mv *)
---

# Import Sprite

Process a sprite sheet and integrate it into the Chimera engine.

## Usage
`/import-sprite [path] --type [character|enemy|npc|portrait|background] --name [entity-name]`

Use $ARGUMENTS for the arguments. Path can be relative to project root or absolute.

## Steps

### 1. Analyze the image
Run `sips -g pixelHeight -g pixelWidth [path]` to get dimensions.

Detect grid based on type:
- `character` (5x3): frameWidth = width/5, frameHeight = height/3
- `character` (4x4): frameWidth = width/4, frameHeight = height/4
- `enemy` (4x2): frameWidth = width/4, frameHeight = height/2

Report detected dimensions and ask for confirmation if ambiguous.

### 2. Copy to public assets
- `character` → `games/chimera/web/public/sprites/characters/[name]_walk.png`
- `enemy` → `games/chimera/web/public/sprites/enemies/[name].png`
- `npc` → `games/chimera/web/public/sprites/characters/[name].png`
- `portrait` → `games/chimera/web/public/portraits/[name].png`
- `background` → `games/chimera/web/public/backgrounds/[name].png`

### 3. Generate config (character/enemy types only)

**Character walk cycle** — add to `WORLD_SPRITE_CONFIGS` in `web/app/data/animations.ts`:
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

**Enemy battle sprite** — add to `ENEMY_SPRITES` in `web/app/data/animations.ts`:
```typescript
[name]: {
  src: "/sprites/enemies/[name].png",
  frameWidth: [calculated],
  frameHeight: [calculated],
  columns: 4, rows: 2,
  animations: {
    idle: { row: 0, frameCount: 2, frameDuration: 1500, loop: true, startFrame: 0, alternateRows: true },
    attack: { row: 0, frameCount: 1, frameDuration: 300, loop: false, startFrame: 1 },
    hurt: { row: 0, frameCount: 1, frameDuration: 300, loop: false, startFrame: 2 },
    death: { row: 0, frameCount: 1, frameDuration: 1000, loop: false, startFrame: 3 },
  },
},
```

**NPC static** — no config needed, just the file in the right location.
**Portrait/Background** — no config needed, just the file.

### 4. Wire in
- Update map data if NPC sprite path changed
- Verify enemy definition references sprite in `enemies.ts`

### 5. Report
- Confirm file location
- Show generated config
- Suggest running `yarn chimera:dev` to test
