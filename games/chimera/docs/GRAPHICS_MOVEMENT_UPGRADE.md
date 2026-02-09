# Chimera Graphics & Movement Upgrade Plan

This document outlines potential upgrades to move from FF6-style graphics to FF9-style presentation while maintaining the current tile-based architecture.

---

## Current System Overview

### Graphics
- **Tile Size:** 32px
- **Asset Format:** PNG, 1024x1536 pixels, RGBA with transparency
- **Style:** Top-down 3/4 isometric perspective
- **Rendering:** Static objects layered on tile-based ground

### Movement
- **Type:** Tile-locked (discrete grid movement)
- **Position:** Integer tile coordinates `{x: 5, y: 10}`
- **Collision:** Boolean grid `collision[y][x]` where `true` = walkable
- **Input:** Arrow keys move exactly 1 tile per press

---

## Upgrade Options

### Option 1: Smooth Tile Animation (Recommended First Step)

**Effort:** Low | **Impact:** High | **Risk:** Low

Keep tile-based collision logic but add visual interpolation for smooth movement.

#### Changes Required

**1. Add visual position to player state:**
```typescript
// In gameStore.ts
playerPosition: {
  x: number;           // Logical tile X
  y: number;           // Logical tile Y
  visualX: number;     // Pixel X for rendering
  visualY: number;     // Pixel Y for rendering
  facing: Direction;
  isMoving: boolean;   // Animation state
}
```

**2. Create movement animation system:**
```typescript
// New file: engine/movementEngine.ts
const MOVE_DURATION = 150; // ms per tile

function updateMovement(state, deltaTime) {
  if (!state.isMoving) return;

  const targetX = state.x * TILE_SIZE;
  const targetY = state.y * TILE_SIZE;

  // Lerp toward target
  state.visualX = lerp(state.visualX, targetX, deltaTime / MOVE_DURATION);
  state.visualY = lerp(state.visualY, targetY, deltaTime / MOVE_DURATION);

  // Snap when close enough
  if (Math.abs(state.visualX - targetX) < 1 && Math.abs(state.visualY - targetY) < 1) {
    state.visualX = targetX;
    state.visualY = targetY;
    state.isMoving = false;
  }
}
```

**3. Update MapView rendering:**
```typescript
// Use visualX/visualY for player sprite position instead of x * tileSize
<PlayerSprite
  x={playerPosition.visualX}
  y={playerPosition.visualY}
  facing={playerPosition.facing}
  isMoving={playerPosition.isMoving}
/>
```

**4. Add walking animation frames:**
- 4 frames per direction (idle, step1, step2, step1)
- Cycle through frames while `isMoving === true`

#### Benefits
- Smooth, fluid movement feel
- No collision system changes
- Backwards compatible with all existing maps
- Easy to implement and test

---

### Option 2: Sub-Tile Movement (Half-Tile Precision)

**Effort:** Medium | **Impact:** Medium | **Risk:** Medium

Allow movement in half-tile increments for finer control.

#### Changes Required

**1. Update position precision:**
```typescript
playerPosition: {
  x: number;  // Now supports 0.5 increments: 5.0, 5.5, 6.0
  y: number;
}
```

**2. Update collision checks:**
```typescript
// Check both tiles the player overlaps
function canMoveTo(x: number, y: number): boolean {
  const tiles = getTilesAtPosition(x, y); // Returns 1-4 tiles
  return tiles.every(t => isWalkable(t));
}
```

**3. Update NPC/event collision:**
```typescript
// Use distance-based collision instead of exact tile match
function isCollidingWith(entity: {x, y}, player: {x, y}): boolean {
  return Math.abs(entity.x - player.x) < 0.5 &&
         Math.abs(entity.y - player.y) < 0.5;
}
```

#### Benefits
- Smoother navigation around obstacles
- More natural diagonal movement
- Still uses existing collision grid

#### Drawbacks
- Requires updating all collision checks
- May need to adjust NPC interaction distances
- Event triggers need proximity checks

---

### Option 3: True Pixel Movement (FF9 Style)

**Effort:** High | **Impact:** High | **Risk:** High

Full pixel-based movement with bounding box collision.

#### Changes Required

**1. New position system:**
```typescript
playerPosition: {
  x: number;      // Pixel X (e.g., 256.5)
  y: number;      // Pixel Y (e.g., 384.0)
  facing: Direction;
  velocity: { x: number, y: number };
}

const MOVE_SPEED = 120; // pixels per second
```

**2. New collision system:**
```typescript
interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Player hitbox (smaller than sprite for forgiveness)
const playerHitbox: Hitbox = {
  x: playerX + 8,  // Offset from sprite corner
  y: playerY + 24, // Feet area only
  width: 16,
  height: 8
};

// Check collision against walkable mask
function canMoveTo(hitbox: Hitbox, map: GameMap): boolean {
  // Sample collision grid at hitbox corners
  const corners = [
    { x: hitbox.x, y: hitbox.y },
    { x: hitbox.x + hitbox.width, y: hitbox.y },
    { x: hitbox.x, y: hitbox.y + hitbox.height },
    { x: hitbox.x + hitbox.width, y: hitbox.y + hitbox.height }
  ];

  return corners.every(c => {
    const tileX = Math.floor(c.x / TILE_SIZE);
    const tileY = Math.floor(c.y / TILE_SIZE);
    return map.layers.collision[tileY]?.[tileX] === true;
  });
}
```

**3. Movement with collision sliding:**
```typescript
function movePlayer(dx: number, dy: number, deltaTime: number) {
  const moveX = dx * MOVE_SPEED * deltaTime;
  const moveY = dy * MOVE_SPEED * deltaTime;

  // Try full movement
  if (canMoveTo(newX + moveX, newY + moveY)) {
    player.x += moveX;
    player.y += moveY;
  }
  // Try X only (slide along Y wall)
  else if (canMoveTo(newX + moveX, newY)) {
    player.x += moveX;
  }
  // Try Y only (slide along X wall)
  else if (canMoveTo(newX, newY + moveY)) {
    player.y += moveY;
  }
}
```

**4. Update all systems:**
- Event triggers use proximity circles
- NPC interaction uses distance checks
- Camera follows pixel position
- Teleports convert to/from tile coordinates

#### Benefits
- True FF9-style movement
- Smoother navigation
- More immersive feel

#### Drawbacks
- Significant refactor across codebase
- Need to update all maps with collision adjustments
- Event/NPC interaction logic changes
- Potential for new collision bugs

---

### Option 4: Walkable Polygon System (Advanced)

**Effort:** Very High | **Impact:** Very High | **Risk:** High

Pre-rendered backgrounds with invisible walkable area polygons (true FF9/Baldur's Gate style).

#### Concept
Instead of tile grids, each map defines walkable areas as polygons:

```typescript
interface WalkableArea {
  id: string;
  polygon: Point[];  // Vertices defining walkable region
  connections: string[];  // Adjacent walkable areas for pathfinding
}

const tavernWalkableAreas: WalkableArea[] = [
  {
    id: "main_floor",
    polygon: [
      { x: 64, y: 128 },
      { x: 448, y: 128 },
      { x: 448, y: 320 },
      { x: 64, y: 320 }
    ],
    connections: ["bar_area", "entrance"]
  },
  // ...
];
```

#### Requirements
- Point-in-polygon collision detection
- Navmesh generation or manual polygon creation
- Pathfinding (A* on navmesh)
- Click-to-move input option

#### Benefits
- Maximum visual fidelity (no tile constraints)
- Supports any camera angle
- Professional RPG feel

#### Drawbacks
- Complete engine rewrite
- Need tools for polygon editing
- Very time consuming

---

## Graphics Upgrade Path

### Phase 1: Enhanced Assets (Current)
- Continue with high-quality AI-generated sprites
- Maintain 1024x1536 format
- Consistent art style across all assets

### Phase 2: Larger Character Sprites
- Upgrade from ~32px to ~64px character sprites
- More detailed walk animations (8 frames per direction)
- Idle animations
- Emotion expressions for dialogue

### Phase 3: Lighting & Effects
- Dynamic lighting based on `ambientColor`
- Particle effects (dust, sparkles, fire)
- Screen transitions (fade, wipe)
- Weather effects (rain, fog)

### Phase 4: Full-Scene Backgrounds (Optional)
- Replace tiled grounds with pre-rendered full backgrounds
- Keep static objects for interactive elements
- Requires careful collision mapping

---

## Recommended Implementation Order

1. **Option 1: Smooth Tile Animation** - Quick win, big visual improvement
2. **Phase 2: Larger Character Sprites** - More expressive characters
3. **Phase 3: Lighting & Effects** - Polish and atmosphere
4. **Option 2: Sub-Tile Movement** - If more precision needed
5. **Option 3/4** - Only if fundamentally changing game feel

---

## Technical Notes

### Asset Pipeline
Current prompts use this format for consistency:
```
Pixel art RPG game asset, [description], viewed from above at 3/4
top-down isometric angle like classic SNES/FF6 JRPGs, 1024x1536
pixels, RGBA with transparent dark background, [lighting style]
```

### Performance Considerations
- Keep sprite sheets for animations (reduce draw calls)
- Use canvas layering (ground, objects, characters, overhead)
- Consider WebGL for advanced effects

### Save Compatibility
Any position system changes need migration:
```typescript
// Migrate old saves (tile-based) to new format
if (saveData.version < 2) {
  saveData.playerPosition.visualX = saveData.playerPosition.x * TILE_SIZE;
  saveData.playerPosition.visualY = saveData.playerPosition.y * TILE_SIZE;
}
```

---

## References

- **FF6 Movement:** Tile-locked, 16px tiles, instant snap
- **Chrono Trigger:** Tile-locked with smooth animation
- **FF9:** Pixel movement on pre-rendered backgrounds
- **Octopath Traveler:** Modern hybrid (2D sprites, 3D depth)

---

*Document created: 2026-02-08*
*Last updated: 2026-02-08*
