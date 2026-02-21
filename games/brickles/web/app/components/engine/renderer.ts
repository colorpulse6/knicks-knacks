import {
  type GameState,
  type Brick,
  type Ball,
  type Paddle,
  type PowerUp,
  type Laser,
  type ActivePowerUp,
  BrickType,
  PowerUpType,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  POWER_UP_SIZE,
  LASER_WIDTH,
  LASER_HEIGHT,
  SHAKE_DURATION,
  COMBO_MULTIPLIER_THRESHOLD,
  NEON_COLORS,
} from "./types";
import { getParticleAlpha } from "./particles";

// ─── Easing ──────────────────────────────────────────────────────────

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ─── Main Draw ───────────────────────────────────────────────────────

export function drawGame(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  ctx.save();

  // Screen shake
  if (state.screenShake.duration > 0) {
    const decay = state.screenShake.duration / SHAKE_DURATION;
    const intensity = state.screenShake.intensity * decay;
    const ox = (Math.random() - 0.5) * intensity * 2;
    const oy = (Math.random() - 0.5) * intensity * 2;
    ctx.translate(ox, oy);
  }

  drawBackground(ctx, state.level, state.frameCount);
  drawBricks(ctx, state.bricks, state.frameCount);
  drawLasers(ctx, state.lasers);
  drawPowerUps(ctx, state.powerUps, state.frameCount);
  drawParticles(ctx, state);
  drawBalls(ctx, state.balls, state.frameCount);
  drawPaddle(ctx, state.paddle, state.activePowerUps, state.frameCount);
  drawCombo(ctx, state.combo, state.frameCount);

  ctx.restore();
}

// ─── Background ──────────────────────────────────────────────────────

function drawBackground(
  ctx: CanvasRenderingContext2D,
  level: number,
  frameCount: number
): void {
  // Base dark gradient with subtle hue per level
  const hue = (level * 30) % 360;
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, "#000000");
  grad.addColorStop(1, `hsl(${hue}, 15%, 5%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Scanlines
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
    ctx.fillRect(0, y, CANVAS_WIDTH, 1);
  }
}

// ─── Bricks ──────────────────────────────────────────────────────────

function drawBricks(
  ctx: CanvasRenderingContext2D,
  bricks: Brick[],
  frameCount: number
): void {
  for (const brick of bricks) {
    if (!brick.alive) continue;
    drawBrick(ctx, brick, frameCount);
  }
}

function drawBrick(
  ctx: CanvasRenderingContext2D,
  brick: Brick,
  frameCount: number
): void {
  ctx.save();

  // Entrance animation
  if (brick.entranceProgress < 1) {
    const t = easeOutCubic(brick.entranceProgress);
    const offsetX = (1 - t) * CANVAS_WIDTH * 0.3;
    ctx.globalAlpha = t;
    ctx.translate(offsetX, 0);
  }

  const { x, y, width, height, color, type } = brick;
  const radius = 3;

  // Main body with rounded corners
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);

  switch (type) {
    case BrickType.INDESTRUCTIBLE: {
      // Dark with crosshatch
      ctx.fillStyle = "#333333";
      ctx.fill();
      ctx.strokeStyle = "#555555";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Crosshatch
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 0.5;
      for (let i = x; i < x + width; i += 6) {
        ctx.beginPath();
        ctx.moveTo(i, y);
        ctx.lineTo(i + height, y + height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i, y + height);
        ctx.lineTo(i + height, y);
        ctx.stroke();
      }
      break;
    }

    case BrickType.ARMORED: {
      // Metallic gradient
      const metalGrad = ctx.createLinearGradient(x, y, x, y + height);
      metalGrad.addColorStop(0, "#AAAAAA");
      metalGrad.addColorStop(0.5, "#777777");
      metalGrad.addColorStop(1, "#555555");
      ctx.fillStyle = metalGrad;
      ctx.fill();
      ctx.strokeStyle = "#999999";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Corner bolts
      const boltSize = 3;
      ctx.fillStyle = "#CCCCCC";
      ctx.fillRect(x + 3, y + 3, boltSize, boltSize);
      ctx.fillRect(x + width - 6, y + 3, boltSize, boltSize);
      ctx.fillRect(x + 3, y + height - 6, boltSize, boltSize);
      ctx.fillRect(x + width - 6, y + height - 6, boltSize, boltSize);
      // Hit indicator
      drawHitIndicator(ctx, brick);
      break;
    }

    case BrickType.TOUGH: {
      // Blue gradient
      const toughGrad = ctx.createLinearGradient(x, y, x, y + height);
      toughGrad.addColorStop(0, "#6699DD");
      toughGrad.addColorStop(1, "#3366AA");
      ctx.fillStyle = toughGrad;
      ctx.fill();
      ctx.strokeStyle = "#88AADD";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Hit indicator
      drawHitIndicator(ctx, brick);
      break;
    }

    case BrickType.EXPLOSIVE: {
      // Pulsing red glow
      const pulse = 0.6 + Math.sin(frameCount * 0.1) * 0.4;
      ctx.fillStyle = color;
      ctx.fill();
      // Glow
      ctx.shadowColor = NEON_COLORS.red;
      ctx.shadowBlur = 8 * pulse;
      ctx.strokeStyle = `rgba(255, 80, 20, ${pulse})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
      // Warning symbol
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("!", x + width / 2, y + height / 2);
      break;
    }

    default: {
      // Normal brick with bevel
      const bevelGrad = ctx.createLinearGradient(x, y, x, y + height);
      bevelGrad.addColorStop(0, lightenColor(color, 40));
      bevelGrad.addColorStop(0.3, color);
      bevelGrad.addColorStop(1, darkenColor(color, 30));
      ctx.fillStyle = bevelGrad;
      ctx.fill();
      ctx.strokeStyle = lightenColor(color, 20);
      ctx.lineWidth = 0.5;
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

function drawHitIndicator(ctx: CanvasRenderingContext2D, brick: Brick): void {
  const cx = brick.x + brick.width / 2;
  const cy = brick.y + brick.height / 2;
  const dotSpacing = 8;
  const startX = cx - ((brick.hitsRemaining - 1) * dotSpacing) / 2;

  ctx.fillStyle = "#FFFFFF";
  for (let i = 0; i < brick.hitsRemaining; i++) {
    ctx.beginPath();
    ctx.arc(startX + i * dotSpacing, cy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Ball ────────────────────────────────────────────────────────────

function drawBalls(
  ctx: CanvasRenderingContext2D,
  balls: Ball[],
  frameCount: number
): void {
  for (const ball of balls) {
    drawBall(ctx, ball, frameCount);
  }
}

function drawBall(
  ctx: CanvasRenderingContext2D,
  ball: Ball,
  frameCount: number
): void {
  // Trail
  for (let i = 0; i < ball.trail.length; i++) {
    const t = i / ball.trail.length;
    const alpha = t * 0.3;
    const size = ball.radius * (0.3 + 0.5 * t);
    const pos = ball.trail[i];

    ctx.globalAlpha = alpha;
    ctx.fillStyle = ball.fireball ? NEON_COLORS.orange : "#FFFFFF";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Glow
  const glowColor = ball.fireball ? "rgba(255, 100, 0, 0.3)" : "rgba(255, 255, 255, 0.2)";
  const glowGrad = ctx.createRadialGradient(
    ball.position.x,
    ball.position.y,
    ball.radius * 0.5,
    ball.position.x,
    ball.position.y,
    ball.radius * 3
  );
  glowGrad.addColorStop(0, glowColor);
  glowGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(ball.position.x, ball.position.y, ball.radius * 3, 0, Math.PI * 2);
  ctx.fill();

  // Ball body
  if (ball.fireball) {
    const fireGrad = ctx.createRadialGradient(
      ball.position.x - 1,
      ball.position.y - 1,
      0,
      ball.position.x,
      ball.position.y,
      ball.radius
    );
    fireGrad.addColorStop(0, "#FFDD44");
    fireGrad.addColorStop(0.6, NEON_COLORS.orange);
    fireGrad.addColorStop(1, "#CC3300");
    ctx.fillStyle = fireGrad;
  } else {
    ctx.fillStyle = "#FFFFFF";
  }
  ctx.beginPath();
  ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  // Specular highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.beginPath();
  ctx.arc(
    ball.position.x - ball.radius * 0.3,
    ball.position.y - ball.radius * 0.3,
    ball.radius * 0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

// ─── Paddle ──────────────────────────────────────────────────────────

function drawPaddle(
  ctx: CanvasRenderingContext2D,
  paddle: Paddle,
  activePowerUps: ActivePowerUp[],
  frameCount: number
): void {
  const { x, y, width, height } = paddle;
  const left = x - width / 2;

  // Determine paddle color based on active power-ups
  let baseColor = "#FFFFFF";
  let glowColor = "rgba(255, 255, 255, 0.15)";
  const hasExpand = activePowerUps.some((p) => p.type === PowerUpType.EXPAND_PADDLE);
  const hasShrink = activePowerUps.some((p) => p.type === PowerUpType.SHRINK_PADDLE);
  const hasLaser = activePowerUps.some((p) => p.type === PowerUpType.LASER);
  const hasMagnet = activePowerUps.some((p) => p.type === PowerUpType.MAGNET);
  const hasFireball = activePowerUps.some((p) => p.type === PowerUpType.FIREBALL);

  if (hasExpand) {
    baseColor = NEON_COLORS.lime;
    glowColor = "rgba(57, 255, 20, 0.2)";
  } else if (hasShrink) {
    baseColor = NEON_COLORS.red;
    glowColor = "rgba(255, 50, 50, 0.2)";
  } else if (hasLaser) {
    baseColor = NEON_COLORS.magenta;
    glowColor = "rgba(255, 0, 255, 0.2)";
  } else if (hasMagnet) {
    baseColor = NEON_COLORS.purple;
    glowColor = "rgba(155, 89, 182, 0.2)";
  } else if (hasFireball) {
    baseColor = NEON_COLORS.orange;
    glowColor = "rgba(255, 102, 0, 0.2)";
  }

  // Glow beneath paddle
  const paddleGlow = ctx.createRadialGradient(x, y + height, 0, x, y + height, width * 0.6);
  paddleGlow.addColorStop(0, glowColor);
  paddleGlow.addColorStop(1, "transparent");
  ctx.fillStyle = paddleGlow;
  ctx.fillRect(left - 20, y - 10, width + 40, height + 30);

  // Main paddle body
  const grad = ctx.createLinearGradient(left, y, left, y + height);
  grad.addColorStop(0, lightenColor(baseColor, 30));
  grad.addColorStop(0.5, baseColor);
  grad.addColorStop(1, darkenColor(baseColor, 40));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(left, y, width, height, 4);
  ctx.fill();

  // Edge highlight
  ctx.strokeStyle = lightenColor(baseColor, 50);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(left, y, width, height, 4);
  ctx.stroke();

  // Laser barrels
  if (hasLaser) {
    ctx.fillStyle = NEON_COLORS.magenta;
    ctx.fillRect(left - 2, y - 4, 4, 6);
    ctx.fillRect(left + width - 2, y - 4, 4, 6);
  }

  // Magnet indicator
  if (hasMagnet) {
    ctx.fillStyle = NEON_COLORS.purple;
    const pulse = 0.5 + Math.sin(frameCount * 0.15) * 0.5;
    ctx.globalAlpha = pulse;
    ctx.fillRect(left + 4, y + 2, 3, height - 4);
    ctx.fillRect(left + width - 7, y + 2, 3, height - 4);
    ctx.globalAlpha = 1;
  }
}

// ─── Lasers ──────────────────────────────────────────────────────────

function drawLasers(
  ctx: CanvasRenderingContext2D,
  lasers: Laser[]
): void {
  ctx.fillStyle = NEON_COLORS.magenta;
  ctx.shadowColor = NEON_COLORS.magenta;
  ctx.shadowBlur = 6;
  for (const laser of lasers) {
    ctx.fillRect(
      laser.position.x,
      laser.position.y,
      LASER_WIDTH,
      LASER_HEIGHT
    );
  }
  ctx.shadowBlur = 0;
}

// ─── Power-Ups ───────────────────────────────────────────────────────

function drawPowerUps(
  ctx: CanvasRenderingContext2D,
  powerUps: PowerUp[],
  frameCount: number
): void {
  for (const pu of powerUps) {
    drawPowerUp(ctx, pu, frameCount);
  }
}

function drawPowerUp(
  ctx: CanvasRenderingContext2D,
  pu: PowerUp,
  frameCount: number
): void {
  const { x, y } = pu.position;
  const pulse = 0.7 + Math.sin(frameCount * 0.12) * 0.3;

  // Glow
  ctx.shadowColor = pu.color;
  ctx.shadowBlur = 8 * pulse;

  // Capsule body
  ctx.fillStyle = pu.color;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.roundRect(x, y, POWER_UP_SIZE, POWER_UP_SIZE, 6);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Border
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, POWER_UP_SIZE, POWER_UP_SIZE, 6);
  ctx.stroke();

  // Symbol
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(pu.symbol, x + POWER_UP_SIZE / 2, y + POWER_UP_SIZE / 2);

  ctx.shadowBlur = 0;
}

// ─── Particles ───────────────────────────────────────────────────────

function drawParticles(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  for (const p of state.particles) {
    ctx.globalAlpha = getParticleAlpha(p);
    ctx.fillStyle = p.color;
    ctx.fillRect(
      p.position.x - p.size / 2,
      p.position.y - p.size / 2,
      p.size,
      p.size
    );
  }
  ctx.globalAlpha = 1;
}

// ─── Combo Counter ───────────────────────────────────────────────────

function drawCombo(
  ctx: CanvasRenderingContext2D,
  combo: number,
  frameCount: number
): void {
  if (combo < COMBO_MULTIPLIER_THRESHOLD) return;

  const multiplier = Math.floor(combo / COMBO_MULTIPLIER_THRESHOLD);
  const scale = 1 + Math.sin(frameCount * 0.15) * 0.05;
  const fontSize = Math.min(16 + multiplier * 2, 32);

  ctx.save();
  ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);
  ctx.scale(scale, scale);

  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillText(`COMBO x${multiplier}`, 2, 2);

  // Gold text
  ctx.fillStyle = NEON_COLORS.yellow;
  ctx.shadowColor = NEON_COLORS.yellow;
  ctx.shadowBlur = 10;
  ctx.fillText(`COMBO x${multiplier}`, 0, 0);
  ctx.shadowBlur = 0;

  ctx.restore();
}

// ─── Color Utilities ─────────────────────────────────────────────────

function lightenColor(hex: string, amount: number): string {
  if (hex.startsWith("rgb")) return hex;
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

function darkenColor(hex: string, amount: number): string {
  if (hex.startsWith("rgb")) return hex;
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r}, ${g}, ${b})`;
}
