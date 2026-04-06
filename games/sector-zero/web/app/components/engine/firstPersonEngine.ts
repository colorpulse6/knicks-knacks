import type { GameState, Keys, FirstPersonState, BoardingMap } from "./types";
import { GameScreen, AudioEvent, CANVAS_WIDTH, GAME_AREA_HEIGHT } from "./types";

// ─── Constants ──────────────────────────────────────────────────────

const MOVE_SPEED = 0.06;
const ROT_SPEED = 0.04;
const COLLISION_RADIUS = 0.2; // Player radius in tile units

// ─── Wall collision check ───────────────────────────────────────────

function isWalkable(map: BoardingMap, x: number, y: number): boolean {
  const col = Math.floor(x);
  const row = Math.floor(y);
  if (col < 0 || col >= map.width || row < 0 || row >= map.height) return false;
  const tile = map.tiles[row][col];
  return tile !== "wall" && tile !== "empty";
}

// ─── Main Update ────────────────────────────────────────────────────

export function updateFirstPerson(gs: GameState, keys: Keys): void {
  const fp = gs.firstPersonState;
  if (!fp || gs.levelCompleteTimer > 0) return;

  let { posX, posY, dirX, dirY, planeX, planeY } = fp;

  // ── Rotation (left/right arrows) ──
  if (keys.left) {
    // Rotate left (counter-clockwise)
    const oldDirX = dirX;
    dirX = dirX * Math.cos(ROT_SPEED) - dirY * Math.sin(ROT_SPEED);
    dirY = oldDirX * Math.sin(ROT_SPEED) + dirY * Math.cos(ROT_SPEED);
    const oldPlaneX = planeX;
    planeX = planeX * Math.cos(ROT_SPEED) - planeY * Math.sin(ROT_SPEED);
    planeY = oldPlaneX * Math.sin(ROT_SPEED) + planeY * Math.cos(ROT_SPEED);
  }
  if (keys.right) {
    // Rotate right (clockwise)
    const oldDirX = dirX;
    dirX = dirX * Math.cos(-ROT_SPEED) - dirY * Math.sin(-ROT_SPEED);
    dirY = oldDirX * Math.sin(-ROT_SPEED) + dirY * Math.cos(-ROT_SPEED);
    const oldPlaneX = planeX;
    planeX = planeX * Math.cos(-ROT_SPEED) - planeY * Math.sin(-ROT_SPEED);
    planeY = oldPlaneX * Math.sin(-ROT_SPEED) + planeY * Math.cos(-ROT_SPEED);
  }

  // ── Forward/backward (up/down arrows) ──
  if (keys.up) {
    const newX = posX + dirX * MOVE_SPEED;
    const newY = posY + dirY * MOVE_SPEED;
    // Slide along walls — check X and Y independently
    if (isWalkable(fp.map, newX + COLLISION_RADIUS * Math.sign(dirX), posY)) posX = newX;
    if (isWalkable(fp.map, posX, newY + COLLISION_RADIUS * Math.sign(dirY))) posY = newY;
  }
  if (keys.down) {
    const newX = posX - dirX * MOVE_SPEED;
    const newY = posY - dirY * MOVE_SPEED;
    if (isWalkable(fp.map, newX - COLLISION_RADIUS * Math.sign(dirX), posY)) posX = newX;
    if (isWalkable(fp.map, posX, newY - COLLISION_RADIUS * Math.sign(dirY))) posY = newY;
  }

  // ── Strafe (Z/Shift + left/right, or dedicated keys later) ──
  // For now: no strafe in PoC. Left/right = rotate.

  // ── Update state ──
  fp.posX = posX;
  fp.posY = posY;
  fp.dirX = dirX;
  fp.dirY = dirY;
  fp.planeX = planeX;
  fp.planeY = planeY;

  // ── Goal check ──
  const goalCol = Math.floor(posX);
  const goalRow = Math.floor(posY);
  if (goalCol >= 0 && goalCol < fp.map.width && goalRow >= 0 && goalRow < fp.map.height) {
    if (fp.map.tiles[goalRow][goalCol] === "goal") {
      fp.goalReached = true;
    }
  }

  if (fp.goalReached && gs.levelCompleteTimer === 0) {
    gs.levelCompleteTimer = 360;
    gs.xp += 500;
    gs.audioEvents.push(AudioEvent.LEVEL_COMPLETE);
  }

  // Signal to renderer: moving or not
  gs.player.bankDir = (keys.up || keys.down) ? 1 : 0;
}
