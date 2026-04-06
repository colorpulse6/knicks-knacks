import {
  CANVAS_WIDTH,
  GAME_AREA_HEIGHT,
  type GameState,
  type FirstPersonState,
  type BoardingMap,
} from "./types";
import { castAllRays, type RayHit } from "./raycaster";
import { drawDashboard } from "./dashboard";
import { getSprite, SPRITES } from "./sprites";

// ─── Colors ─────────────────────────────────────────────────────────

const CEILING_COLOR_TOP = "#050510";
const CEILING_COLOR_BOT = "#0a0a20";
const FLOOR_COLOR_TOP = "#1a1a2a";
const FLOOR_COLOR_BOT = "#0a0a15";

// Wall colors by tile type (fallback when no texture)
const WALL_COLORS: Record<string, { light: string; dark: string }> = {
  wall:  { light: "#3a4a5a", dark: "#2a3a4a" },
  empty: { light: "#2a2a3a", dark: "#1a1a2a" },
};

// ─── Mini-map ───────────────────────────────────────────────────────

function drawMiniMap(
  ctx: CanvasRenderingContext2D,
  fp: FirstPersonState
): void {
  const scale = 3;
  const mw = fp.map.width * scale;
  const mh = fp.map.height * scale;
  const mx = CANVAS_WIDTH - mw - 8;
  const my = 8;

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(mx - 2, my - 2, mw + 4, mh + 4);

  for (let r = 0; r < fp.map.height; r++) {
    for (let c = 0; c < fp.map.width; c++) {
      const tile = fp.map.tiles[r][c];
      if (tile === "wall") {
        ctx.fillStyle = "#334";
        ctx.fillRect(mx + c * scale, my + r * scale, scale, scale);
      } else if (tile === "goal") {
        ctx.fillStyle = "#0f8";
        ctx.fillRect(mx + c * scale, my + r * scale, scale, scale);
      } else if (tile === "door") {
        ctx.fillStyle = "#264";
        ctx.fillRect(mx + c * scale, my + r * scale, scale, scale);
      }
    }
  }

  // Player position + direction
  const px = mx + fp.posX * scale;
  const py = my + fp.posY * scale;
  ctx.fillStyle = "#44ccff";
  ctx.beginPath();
  ctx.arc(px, py, 2, 0, Math.PI * 2);
  ctx.fill();

  // Direction line
  ctx.strokeStyle = "#44ccff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px + fp.dirX * 8, py + fp.dirY * 8);
  ctx.stroke();
}

// ─── HUD Overlay ────────────────────────────────────────────────────

function drawCrosshair(ctx: CanvasRenderingContext2D): void {
  const cx = CANVAS_WIDTH / 2;
  const cy = GAME_AREA_HEIGHT / 2;
  ctx.strokeStyle = "rgba(68, 204, 255, 0.4)";
  ctx.lineWidth = 1;
  // Small cross
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy);
  ctx.lineTo(cx - 3, cy);
  ctx.moveTo(cx + 3, cy);
  ctx.lineTo(cx + 8, cy);
  ctx.moveTo(cx, cy - 8);
  ctx.lineTo(cx, cy - 3);
  ctx.moveTo(cx, cy + 3);
  ctx.lineTo(cx, cy + 8);
  ctx.stroke();
}

function drawCompass(ctx: CanvasRenderingContext2D, fp: FirstPersonState): void {
  // Direction indicator at top center
  const angle = Math.atan2(fp.dirY, fp.dirX);
  const dirs = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"];
  const idx = Math.round(((angle + Math.PI) / (Math.PI * 2)) * 8) % 8;

  ctx.fillStyle = "#44ccff88";
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(dirs[idx], CANVAS_WIDTH / 2, 8);
}

// ─── Main Renderer ──────────────────────────────────────────────────

export function drawFirstPerson(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  const fp = state.firstPersonState;
  if (!fp) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, CANVAS_WIDTH, GAME_AREA_HEIGHT);
  ctx.clip();

  const wallTexture = getSprite(SPRITES.BOARDING_TILES);

  // ── Ceiling gradient ──
  const ceilGrad = ctx.createLinearGradient(0, 0, 0, GAME_AREA_HEIGHT / 2);
  ceilGrad.addColorStop(0, CEILING_COLOR_TOP);
  ceilGrad.addColorStop(1, CEILING_COLOR_BOT);
  ctx.fillStyle = ceilGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, GAME_AREA_HEIGHT / 2);

  // ── Floor gradient ──
  const floorGrad = ctx.createLinearGradient(0, GAME_AREA_HEIGHT / 2, 0, GAME_AREA_HEIGHT);
  floorGrad.addColorStop(0, FLOOR_COLOR_TOP);
  floorGrad.addColorStop(1, FLOOR_COLOR_BOT);
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, GAME_AREA_HEIGHT / 2, CANVAS_WIDTH, GAME_AREA_HEIGHT / 2);

  // ── Cast rays ──
  const hits = castAllRays(
    fp.map,
    fp.posX, fp.posY,
    fp.dirX, fp.dirY,
    fp.planeX, fp.planeY,
    CANVAS_WIDTH
  );

  // ── Draw walls ──
  for (let x = 0; x < CANVAS_WIDTH; x++) {
    const hit = hits[x];
    if (!hit) continue;

    // Calculate wall strip height
    const lineHeight = Math.floor(GAME_AREA_HEIGHT / hit.distance);
    const drawStart = Math.max(0, Math.floor(GAME_AREA_HEIGHT / 2 - lineHeight / 2));
    const drawEnd = Math.min(GAME_AREA_HEIGHT - 1, Math.floor(GAME_AREA_HEIGHT / 2 + lineHeight / 2));
    const stripHeight = drawEnd - drawStart;

    if (wallTexture) {
      // Textured wall — sample from tile sheet (frame 1 = wall)
      const texWidth = wallTexture.width / 3;
      const texHeight = wallTexture.height;
      const texX = Math.floor(hit.wallX * texWidth);

      // Use wall frame (index 1)
      const srcX = texWidth + Math.min(texX, texWidth - 1);

      ctx.drawImage(
        wallTexture,
        srcX, 0, 1, texHeight,    // Source: 1-pixel-wide column from texture
        x, drawStart, 1, stripHeight  // Dest: 1-pixel-wide column on screen
      );

      // Darken one side for depth (side 1 = horizontal wall = darker)
      if (hit.side === 1) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(x, drawStart, 1, stripHeight);
      }

      // Distance fog
      const fogAmount = Math.min(0.7, hit.distance * 0.08);
      if (fogAmount > 0.05) {
        ctx.fillStyle = `rgba(5, 5, 16, ${fogAmount})`;
        ctx.fillRect(x, drawStart, 1, stripHeight);
      }
    } else {
      // Flat color fallback
      const colors = WALL_COLORS[hit.tileType] ?? WALL_COLORS.wall;
      ctx.fillStyle = hit.side === 1 ? colors.dark : colors.light;
      ctx.fillRect(x, drawStart, 1, stripHeight);

      // Distance fog
      const fogAmount = Math.min(0.7, hit.distance * 0.08);
      ctx.fillStyle = `rgba(5, 5, 16, ${fogAmount})`;
      ctx.fillRect(x, drawStart, 1, stripHeight);
    }
  }

  // ── Door highlights ──
  // Doors are walkable but we can add a subtle glow when looking at one
  for (let x = CANVAS_WIDTH / 2 - 2; x <= CANVAS_WIDTH / 2 + 2; x++) {
    const hit = hits[x];
    if (!hit) continue;
    // Check tile in front of the wall we hit
    const checkX = hit.mapX + (hit.side === 0 ? (fp.dirX > 0 ? -1 : 1) : 0);
    const checkY = hit.mapY + (hit.side === 1 ? (fp.dirY > 0 ? -1 : 1) : 0);
    if (checkX >= 0 && checkX < fp.map.width && checkY >= 0 && checkY < fp.map.height) {
      if (fp.map.tiles[checkY][checkX] === "door") {
        ctx.fillStyle = "rgba(68, 204, 102, 0.05)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, GAME_AREA_HEIGHT);
        break;
      }
    }
  }

  // ── Crosshair ──
  drawCrosshair(ctx);

  // ── Compass ──
  drawCompass(ctx, fp);

  // ── Mini-map ──
  drawMiniMap(ctx, fp);

  // ── Level complete banner ──
  if (state.levelCompleteTimer > 0) {
    const alpha = Math.min(1, state.levelCompleteTimer / 30);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(0, GAME_AREA_HEIGHT / 2 - 44, CANVAS_WIDTH, 88);
    ctx.shadowColor = "#44ff88";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#44ff88";
    ctx.font = "bold 32px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AREA SECURED", CANVAS_WIDTH / 2, GAME_AREA_HEIGHT / 2 - 10);
    ctx.font = "14px monospace";
    ctx.fillStyle = "#aaffcc";
    ctx.shadowBlur = 8;
    ctx.fillText("OBJECTIVE COMPLETE", CANVAS_WIDTH / 2, GAME_AREA_HEIGHT / 2 + 20);
    ctx.restore();
  }

  // ── Controls hint ──
  ctx.fillStyle = "#44668844";
  ctx.font = "9px monospace";
  ctx.textAlign = "center";
  ctx.fillText("← → TURN   ↑ ↓ MOVE", CANVAS_WIDTH / 2, GAME_AREA_HEIGHT - 8);

  ctx.restore();

  // Dashboard
  drawDashboard(ctx, state);
}
