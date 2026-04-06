import {
  CANVAS_WIDTH,
  GAME_AREA_HEIGHT,
  PLAYER_INVINCIBLE_FRAMES,
  type GameState,
  type GroundState,
  type TileMap,
  type GroundEntity,
  type Bullet,
} from "./types";
import { drawDashboard } from "./dashboard";
import { drawFloatingLabels } from "./floatingLabels";
import { drawSpriteExplosions } from "./particles";
import { GROUND_TILE_SIZE } from "./groundPhysics";

const T = GROUND_TILE_SIZE;

// ─── Sky & Stars ──────────────────────────────────────────────────────────

function drawSky(ctx: CanvasRenderingContext2D, frameCount: number): void {
  // Dark gradient sky
  const grad = ctx.createLinearGradient(0, 0, 0, GAME_AREA_HEIGHT);
  grad.addColorStop(0, "#050510");
  grad.addColorStop(0.5, "#0a0a25");
  grad.addColorStop(1, "#101030");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, GAME_AREA_HEIGHT);

  // Distant stars (deterministic positions using seeded pattern)
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  for (let i = 0; i < 60; i++) {
    const sx = ((i * 137 + i * i * 7) % CANVAS_WIDTH);
    const sy = ((i * 97 + i * 31) % (GAME_AREA_HEIGHT * 0.7));
    const blink = 0.4 + 0.6 * Math.abs(Math.sin((frameCount * 0.02) + i * 0.8));
    ctx.globalAlpha = blink * 0.7;
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;
}

// ─── Tile Map ─────────────────────────────────────────────────────────────

function drawTileMap(
  ctx: CanvasRenderingContext2D,
  map: TileMap,
  cameraX: number,
  frameCount: number
): void {
  const firstCol = Math.max(0, Math.floor(cameraX / T));
  const lastCol = Math.min(map.width - 1, Math.ceil((cameraX + CANVAS_WIDTH) / T));

  for (let row = 0; row < map.height; row++) {
    for (let col = firstCol; col <= lastCol; col++) {
      const tile = map.tiles[row][col];
      if (tile === "empty" || tile === "spawn") continue;

      const screenX = col * T - cameraX;
      const screenY = row * T;

      if (tile === "solid") {
        // Dark gray solid tile
        ctx.fillStyle = "#2a2a3a";
        ctx.fillRect(screenX, screenY, T, T);
        // Top-edge highlight
        ctx.fillStyle = "#4a4a5e";
        ctx.fillRect(screenX, screenY, T, 2);
        // Subtle inner border
        ctx.strokeStyle = "#1a1a28";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(screenX + 0.5, screenY + 0.5, T - 1, T - 1);

      } else if (tile === "platform") {
        // One-way platform: thin top bar
        ctx.fillStyle = "#3a5a3a";
        ctx.fillRect(screenX, screenY, T, 6);
        ctx.fillStyle = "#5aaa5a";
        ctx.fillRect(screenX, screenY, T, 2);

      } else if (tile === "goal") {
        // Pulsing green glow
        const pulse = 0.6 + 0.4 * Math.sin(frameCount * 0.08);
        ctx.save();
        ctx.shadowColor = "#00ff88";
        ctx.shadowBlur = 18 * pulse;
        ctx.fillStyle = `rgba(0, 220, 120, ${0.8 * pulse})`;
        ctx.fillRect(screenX + 2, screenY + 2, T - 4, T - 4);
        ctx.restore();

        // "GOAL" label above
        ctx.save();
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = `rgba(0, 255, 150, ${pulse})`;
        ctx.shadowColor = "#00ff88";
        ctx.shadowBlur = 8;
        ctx.fillText("GOAL", screenX + T / 2, screenY - 4);
        ctx.restore();
      }
    }
  }
}

// ─── Ground Enemies ───────────────────────────────────────────────────────

const ENEMY_COLORS: Record<GroundEntity["type"], string> = {
  turret: "#cc2222",
  patrol: "#22aa44",
  jumper: "#2244cc",
};

function drawGroundEnemies(
  ctx: CanvasRenderingContext2D,
  enemies: GroundEntity[],
  cameraX: number
): void {
  for (const e of enemies) {
    const sx = e.x - cameraX;
    const sy = e.y;

    // Skip if off-screen
    if (sx + e.width < 0 || sx > CANVAS_WIDTH) continue;

    const color = ENEMY_COLORS[e.type];

    // Body
    ctx.fillStyle = color;
    ctx.fillRect(sx, sy, e.width, e.height);

    // Direction indicator: eye dot
    const eyeOffX = e.facingRight ? e.width - 6 : 4;
    const eyeOffY = Math.floor(e.height * 0.3);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(sx + eyeOffX, sy + eyeOffY, 3, 0, Math.PI * 2);
    ctx.fill();

    // HP bar above enemy
    const barW = e.width;
    const barH = 3;
    const barY = sy - 6;
    const hpRatio = e.hp / e.maxHp;
    ctx.fillStyle = "#330000";
    ctx.fillRect(sx, barY, barW, barH);
    ctx.fillStyle = hpRatio > 0.5 ? "#44ff44" : hpRatio > 0.25 ? "#ffaa00" : "#ff3333";
    ctx.fillRect(sx, barY, Math.round(barW * hpRatio), barH);
  }
}

// ─── Bullets ─────────────────────────────────────────────────────────────

function drawGroundBullets(
  ctx: CanvasRenderingContext2D,
  bullets: Bullet[],
  cameraX: number
): void {
  for (const b of bullets) {
    const sx = b.x - cameraX;
    const sy = b.y;

    if (sx + b.width < 0 || sx > CANVAS_WIDTH) continue;

    const color = b.isPlayer ? "#00ffff" : "#ff4444";
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = color;
    ctx.fillRect(sx, sy, b.width, b.height);
    ctx.restore();
  }
}

// ─── Player ───────────────────────────────────────────────────────────────

function drawGroundPlayer(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  groundState: GroundState
): void {
  const { player } = state;
  const cameraX = groundState.cameraX;

  // Invincibility blink: hide every other 4-frame interval
  if (player.invincibleTimer > 0) {
    const blinkCycle = Math.floor(player.invincibleTimer / 4) % 2;
    if (blinkCycle === 0) return;
  }

  const sx = player.x - cameraX;
  const sy = player.y;

  // Body: blue rectangle
  ctx.fillStyle = "#3366ff";
  ctx.fillRect(sx, sy, player.width, player.height);

  // Direction indicator: eye dot
  const facingRight = groundState.playerFacingRight;
  const eyeOffX = facingRight ? player.width - 8 : 6;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(sx + eyeOffX, sy + Math.floor(player.height * 0.3), 4, 0, Math.PI * 2);
  ctx.fill();

  // Gun barrel
  const gunY = sy + Math.floor(player.height * 0.4);
  const gunX1 = facingRight ? sx + player.width : sx;
  const gunX2 = facingRight ? sx + player.width + 10 : sx - 10;
  ctx.strokeStyle = "#aaccff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(gunX1, gunY);
  ctx.lineTo(gunX2, gunY);
  ctx.stroke();
}

// ─── Level Complete Banner ────────────────────────────────────────────────

function drawLevelCompleteBanner(
  ctx: CanvasRenderingContext2D,
  timer: number
): void {
  const alpha = Math.min(1, timer / 30);
  ctx.save();
  ctx.globalAlpha = alpha;

  // Dark overlay strip
  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.fillRect(0, GAME_AREA_HEIGHT / 2 - 44, CANVAS_WIDTH, 88);

  // Banner text
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "#00ff88";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#00ff88";
  ctx.font = "bold 36px monospace";
  ctx.fillText("SECTOR CLEAR", CANVAS_WIDTH / 2, GAME_AREA_HEIGHT / 2 - 10);

  ctx.font = "14px monospace";
  ctx.fillStyle = "#aaffcc";
  ctx.shadowBlur = 8;
  ctx.fillText("OBJECTIVE COMPLETE", CANVAS_WIDTH / 2, GAME_AREA_HEIGHT / 2 + 20);

  ctx.restore();
}

// ─── Main Entry Point ─────────────────────────────────────────────────────

export function drawGroundGame(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  const gs = state.groundState;
  if (!gs) return;

  // Clip to game area (dashboard rendered separately below)
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, CANVAS_WIDTH, GAME_AREA_HEIGHT);
  ctx.clip();

  // Sky + stars
  drawSky(ctx, state.frameCount);

  // Tile map
  drawTileMap(ctx, gs.tileMap, gs.cameraX, state.frameCount);

  // Enemies
  drawGroundEnemies(ctx, gs.groundEnemies, gs.cameraX);

  // Enemy bullets
  const enemyBullets = gs.groundBullets.filter((b) => !b.isPlayer);
  drawGroundBullets(ctx, enemyBullets, gs.cameraX);

  // Player bullets
  const playerBullets = gs.groundBullets.filter((b) => b.isPlayer);
  drawGroundBullets(ctx, playerBullets, gs.cameraX);

  // Sprite explosions (offset by cameraX)
  ctx.save();
  ctx.translate(-gs.cameraX, 0);
  drawSpriteExplosions(ctx, state.explosions);
  ctx.restore();

  // Floating labels (offset by cameraX)
  ctx.save();
  ctx.translate(-gs.cameraX, 0);
  drawFloatingLabels(ctx, state.floatingLabels);
  ctx.restore();

  // Player
  drawGroundPlayer(ctx, state, gs);

  // Level complete banner
  if (state.levelCompleteTimer > 0) {
    drawLevelCompleteBanner(ctx, state.levelCompleteTimer);
  }

  ctx.restore(); // end clip

  // Dashboard always on top
  drawDashboard(ctx, state);
}
