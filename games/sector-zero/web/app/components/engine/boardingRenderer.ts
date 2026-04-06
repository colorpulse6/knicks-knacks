import {
  CANVAS_WIDTH,
  GAME_AREA_HEIGHT,
  type GameState,
  type BoardingState,
  type BoardingMap,
  type BoardingEntity,
  type FacingDirection,
} from "./types";
import { drawDashboard } from "./dashboard";
import { drawFloatingLabels } from "./floatingLabels";
import { drawSpriteExplosions } from "./particles";
import { getSprite, SPRITES } from "./sprites";

const T = 32;

// ─── Tile Colors ────────────────────────────────────────────────────

const TILE_COLORS: Record<string, string> = {
  floor: "#1a1a2a",
  wall: "#2a2a3a",
  door: "#1a2a1a",
  goal: "#003322",
  spawn: "#1a1a2a",
};

// ─── Tile Map ───────────────────────────────────────────────────────

function drawTileMap(
  ctx: CanvasRenderingContext2D,
  map: BoardingMap,
  camX: number,
  camY: number,
  frameCount: number
): void {
  const firstCol = Math.max(0, Math.floor(camX / T));
  const lastCol = Math.min(map.width - 1, Math.ceil((camX + CANVAS_WIDTH) / T));
  const firstRow = Math.max(0, Math.floor(camY / T));
  const lastRow = Math.min(map.height - 1, Math.ceil((camY + GAME_AREA_HEIGHT) / T));

  for (let row = firstRow; row <= lastRow; row++) {
    for (let col = firstCol; col <= lastCol; col++) {
      const tile = map.tiles[row][col];
      if (tile === "empty") continue;

      const sx = col * T - camX;
      const sy = row * T - camY;

      if (tile === "wall") {
        ctx.fillStyle = "#2a2a3a";
        ctx.fillRect(sx, sy, T, T);
        // Inner edge highlights
        ctx.fillStyle = "#3a3a4e";
        ctx.fillRect(sx, sy, T, 1);
        ctx.fillRect(sx, sy, 1, T);
        ctx.fillStyle = "#1a1a28";
        ctx.fillRect(sx + T - 1, sy, 1, T);
        ctx.fillRect(sx, sy + T - 1, T, 1);
      } else if (tile === "floor" || tile === "spawn") {
        ctx.fillStyle = "#12121e";
        ctx.fillRect(sx, sy, T, T);
        // Subtle grid lines
        ctx.strokeStyle = "#1a1a28";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(sx, sy, T, T);
      } else if (tile === "door") {
        ctx.fillStyle = "#12121e";
        ctx.fillRect(sx, sy, T, T);
        // Door indicator — green strip
        ctx.fillStyle = "#22664433";
        ctx.fillRect(sx + 2, sy + 2, T - 4, T - 4);
        ctx.fillStyle = "#44cc66";
        ctx.fillRect(sx + T / 2 - 2, sy, 4, T);
      } else if (tile === "goal") {
        const pulse = 0.5 + 0.3 * Math.sin(frameCount * 0.06);
        ctx.fillStyle = "#12121e";
        ctx.fillRect(sx, sy, T, T);
        ctx.fillStyle = `rgba(0, 255, 136, ${0.15 + pulse * 0.15})`;
        ctx.fillRect(sx, sy, T, T);
        ctx.strokeStyle = `rgba(0, 255, 136, ${pulse})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(sx + 2, sy + 2, T - 4, T - 4);

        ctx.fillStyle = `rgba(0, 255, 150, ${pulse})`;
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("DATA", sx + T / 2, sy - 2);
        ctx.fillText("CORE", sx + T / 2, sy + T + 10);
      }
    }
  }
}

// ─── Enemies ────────────────────────────────────────────────────────

function drawEnemies(
  ctx: CanvasRenderingContext2D,
  enemies: BoardingEntity[],
  camX: number,
  camY: number,
  frameCount: number
): void {
  for (const e of enemies) {
    const sx = e.x - camX;
    const sy = e.y - camY;
    if (sx + e.width < -20 || sx > CANVAS_WIDTH + 20) continue;
    if (sy + e.height < -20 || sy > GAME_AREA_HEIGHT + 20) continue;

    // Color by type
    const color = e.type === "sentry" ? "#cc4444"
      : e.type === "charger" ? "#4488ff"
      : "#44aa44";

    const drawW = e.width + 8;
    const drawH = e.height + 8;
    const drawX = sx - 4;
    const drawY = sy - 4;

    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(sx + e.width / 2, sy + e.height / 2, e.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Aggro indicator
    if (e.isAggro) {
      ctx.strokeStyle = "#ff000066";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx + e.width / 2, sy + e.height / 2, e.width / 2 + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Facing direction indicator
    const dir = facingVec(e.facing);
    ctx.fillStyle = "#ffffff88";
    ctx.beginPath();
    ctx.arc(
      sx + e.width / 2 + dir.x * 8,
      sy + e.height / 2 + dir.y * 8,
      3, 0, Math.PI * 2
    );
    ctx.fill();

    // HP bar
    if (e.hp < e.maxHp) {
      const barW = e.width;
      const barH = 3;
      ctx.fillStyle = "#330000";
      ctx.fillRect(sx, sy - 6, barW, barH);
      const ratio = e.hp / e.maxHp;
      ctx.fillStyle = ratio > 0.5 ? "#44ff44" : "#ff4444";
      ctx.fillRect(sx, sy - 6, barW * ratio, barH);
    }
  }
}

function facingVec(f: FacingDirection): { x: number; y: number } {
  switch (f) {
    case "up": return { x: 0, y: -1 };
    case "down": return { x: 0, y: 1 };
    case "left": return { x: -1, y: 0 };
    case "right": return { x: 1, y: 0 };
  }
}

// ─── Player ─────────────────────────────────────────────────────────

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  bs: BoardingState
): void {
  const { player } = state;

  if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer / 4) % 2 === 0) return;

  const sx = player.x - bs.cameraX;
  const sy = player.y - bs.cameraY;

  // Player circle (PoC — will be replaced with directional sprites)
  ctx.fillStyle = "#44aaff";
  ctx.beginPath();
  ctx.arc(sx + 12, sy + 12, 12, 0, Math.PI * 2);
  ctx.fill();

  // Facing indicator
  const dir = facingVec(bs.playerFacing);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(sx + 12 + dir.x * 8, sy + 12 + dir.y * 8, 3, 0, Math.PI * 2);
  ctx.fill();

  // Dash trail
  if (bs.dashTimer > 0) {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#44ccff";
    ctx.beginPath();
    ctx.arc(sx + 12 - dir.x * 16, sy + 12 - dir.y * 16, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ─── Bullets ────────────────────────────────────────────────────────

function drawBullets(
  ctx: CanvasRenderingContext2D,
  bs: BoardingState
): void {
  for (const b of bs.bullets) {
    const sx = b.x - bs.cameraX;
    const sy = b.y - bs.cameraY;
    if (sx < -10 || sx > CANVAS_WIDTH + 10 || sy < -10 || sy > GAME_AREA_HEIGHT + 10) continue;

    ctx.save();
    ctx.shadowBlur = 6;
    ctx.shadowColor = b.isPlayer ? "#44ccff" : "#ff4444";
    ctx.fillStyle = b.isPlayer ? "#44ccff" : "#ff4444";
    ctx.beginPath();
    ctx.arc(sx + b.width / 2, sy + b.height / 2, b.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ─── Level Complete Banner ──────────────────────────────────────────

function drawCompleteBanner(ctx: CanvasRenderingContext2D, timer: number): void {
  const alpha = Math.min(1, timer / 30);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.fillRect(0, GAME_AREA_HEIGHT / 2 - 44, CANVAS_WIDTH, 88);
  ctx.shadowColor = "#44ccff";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#44ccff";
  ctx.font = "bold 32px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("DATA SECURED", CANVAS_WIDTH / 2, GAME_AREA_HEIGHT / 2 - 10);
  ctx.font = "14px monospace";
  ctx.fillStyle = "#aaddff";
  ctx.shadowBlur = 8;
  ctx.fillText("OBJECTIVE COMPLETE", CANVAS_WIDTH / 2, GAME_AREA_HEIGHT / 2 + 20);
  ctx.restore();
}

// ─── Mini Map ───────────────────────────────────────────────────────

function drawMiniMap(
  ctx: CanvasRenderingContext2D,
  bs: BoardingState,
  playerX: number,
  playerY: number
): void {
  const scale = 3; // pixels per tile
  const mw = bs.map.width * scale;
  const mh = bs.map.height * scale;
  const mx = CANVAS_WIDTH - mw - 8;
  const my = 8;

  // Background
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(mx - 2, my - 2, mw + 4, mh + 4);

  // Tiles
  for (let r = 0; r < bs.map.height; r++) {
    for (let c = 0; c < bs.map.width; c++) {
      const tile = bs.map.tiles[r][c];
      if (tile === "wall") {
        ctx.fillStyle = "#334";
        ctx.fillRect(mx + c * scale, my + r * scale, scale, scale);
      } else if (tile === "goal") {
        ctx.fillStyle = "#0f8";
        ctx.fillRect(mx + c * scale, my + r * scale, scale, scale);
      }
    }
  }

  // Player dot
  const px = mx + (playerX / bs.map.tileSize) * scale;
  const py = my + (playerY / bs.map.tileSize) * scale;
  ctx.fillStyle = "#44ccff";
  ctx.fillRect(px - 1, py - 1, 3, 3);

  // Enemy dots
  for (const e of bs.enemies) {
    const ex = mx + (e.x / bs.map.tileSize) * scale;
    const ey = my + (e.y / bs.map.tileSize) * scale;
    ctx.fillStyle = e.isAggro ? "#ff4444" : "#ff444466";
    ctx.fillRect(ex, ey, 2, 2);
  }
}

// ─── Main Entry Point ───────────────────────────────────────────────

export function drawBoardingGame(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  const bs = state.boardingState;
  if (!bs) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, CANVAS_WIDTH, GAME_AREA_HEIGHT);
  ctx.clip();

  // Dark background (space visible through hull gaps)
  ctx.fillStyle = "#08080f";
  ctx.fillRect(0, 0, CANVAS_WIDTH, GAME_AREA_HEIGHT);

  // Tile map
  drawTileMap(ctx, bs.map, bs.cameraX, bs.cameraY, state.frameCount);

  // Enemies
  drawEnemies(ctx, bs.enemies, bs.cameraX, bs.cameraY, state.frameCount);

  // Bullets
  drawBullets(ctx, bs);

  // Explosions + labels (offset by camera)
  ctx.save();
  ctx.translate(-bs.cameraX, -bs.cameraY);
  drawSpriteExplosions(ctx, state.explosions);
  drawFloatingLabels(ctx, state.floatingLabels);
  ctx.restore();

  // Player
  drawPlayer(ctx, state, bs);

  // Mini-map
  drawMiniMap(ctx, bs, state.player.x, state.player.y);

  // Level complete
  if (state.levelCompleteTimer > 0) {
    drawCompleteBanner(ctx, state.levelCompleteTimer);
  }

  ctx.restore();

  // Dashboard
  drawDashboard(ctx, state);
}
