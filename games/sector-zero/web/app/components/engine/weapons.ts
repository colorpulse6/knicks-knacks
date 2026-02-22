import {
  CANVAS_WIDTH,
  BULLET_SPEED,
  type Bullet,
  type Player,
} from "./types";

let bulletIdCounter = 0;

export function resetBulletIds(): void {
  bulletIdCounter = 0;
}

function createBullet(
  x: number,
  y: number,
  vx: number,
  vy: number,
  isPlayer: boolean,
  damage: number = 1,
  piercing: boolean = false
): Bullet {
  return {
    id: ++bulletIdCounter,
    x,
    y,
    vx,
    vy,
    width: isPlayer ? 4 : 6,
    height: isPlayer ? 12 : 8,
    damage,
    isPlayer,
    piercing,
  };
}

export function firePlayerWeapon(
  player: Player,
  weaponLevel: number
): Bullet[] {
  const cx = player.x + player.width / 2;
  const top = player.y;
  const bullets: Bullet[] = [];
  const damage = 1;

  switch (weaponLevel) {
    case 1:
      // Single shot
      bullets.push(createBullet(cx - 2, top, 0, -BULLET_SPEED, true, damage));
      break;

    case 2:
      // Double shot
      bullets.push(createBullet(cx - 8, top, 0, -BULLET_SPEED, true, damage));
      bullets.push(createBullet(cx + 4, top, 0, -BULLET_SPEED, true, damage));
      break;

    case 3:
      // Triple spread
      bullets.push(createBullet(cx - 2, top, 0, -BULLET_SPEED, true, damage));
      bullets.push(createBullet(cx - 8, top, -1.5, -BULLET_SPEED, true, damage));
      bullets.push(createBullet(cx + 4, top, 1.5, -BULLET_SPEED, true, damage));
      break;

    case 4:
      // Quad spread
      bullets.push(createBullet(cx - 6, top, -0.5, -BULLET_SPEED, true, damage));
      bullets.push(createBullet(cx + 2, top, 0.5, -BULLET_SPEED, true, damage));
      bullets.push(createBullet(cx - 12, top, -2, -BULLET_SPEED, true, damage));
      bullets.push(createBullet(cx + 8, top, 2, -BULLET_SPEED, true, damage));
      break;

    case 5:
    default:
      // Full spread + center
      bullets.push(createBullet(cx - 2, top, 0, -BULLET_SPEED, true, damage));
      bullets.push(createBullet(cx - 8, top, -1, -BULLET_SPEED, true, damage));
      bullets.push(createBullet(cx + 4, top, 1, -BULLET_SPEED, true, damage));
      bullets.push(createBullet(cx - 14, top, -2.5, -BULLET_SPEED, true, damage));
      bullets.push(createBullet(cx + 10, top, 2.5, -BULLET_SPEED, true, damage));
      break;
  }

  return bullets;
}

export function fireSideGunners(player: Player): Bullet[] {
  const leftX = player.x - 16;
  const rightX = player.x + player.width + 8;
  const y = player.y + 8;

  return [
    createBullet(leftX, y, 0, -BULLET_SPEED * 0.8, true),
    createBullet(rightX, y, 0, -BULLET_SPEED * 0.8, true),
  ];
}

export function updateBullets(
  bullets: Bullet[],
  canvasHeight: number
): Bullet[] {
  return bullets
    .map((b) => ({
      ...b,
      x: b.x + b.vx,
      y: b.y + b.vy,
    }))
    .filter(
      (b) =>
        b.y > -20 &&
        b.y < canvasHeight + 20 &&
        b.x > -20 &&
        b.x < CANVAS_WIDTH + 20
    );
}

export function drawPlayerBullets(
  ctx: CanvasRenderingContext2D,
  bullets: Bullet[],
  weaponLevel: number = 1,
  hasRapidFire: boolean = false
): void {
  // Color scheme based on active effects
  let glowColor: string;
  let fillColor: string;
  let coreColor: string;
  let blurSize: number;

  if (hasRapidFire) {
    glowColor = "#ff6600";
    fillColor = "#ff9944";
    coreColor = "#ffddaa";
    blurSize = 10 + weaponLevel;
  } else {
    glowColor = "#44ccff";
    fillColor = "#88eeff";
    coreColor = "#ffffff";
    blurSize = 6 + weaponLevel * 2;
  }

  for (const b of bullets) {
    ctx.save();
    ctx.shadowBlur = blurSize;
    ctx.shadowColor = glowColor;
    ctx.fillStyle = fillColor;
    ctx.fillRect(b.x, b.y, b.width, b.height);
    ctx.shadowBlur = 0;
    ctx.fillStyle = coreColor;
    ctx.fillRect(b.x + 1, b.y + 1, b.width - 2, b.height - 2);

    // High weapon levels get a trailing glow
    if (weaponLevel >= 3) {
      ctx.globalAlpha = 0.2 + (weaponLevel - 3) * 0.1;
      ctx.fillStyle = glowColor;
      ctx.fillRect(b.x - 1, b.y + b.height, b.width + 2, 4 + weaponLevel);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}

export function drawEnemyBullets(
  ctx: CanvasRenderingContext2D,
  bullets: Bullet[]
): void {
  for (const b of bullets) {
    ctx.save();
    ctx.shadowBlur = 6;
    ctx.shadowColor = "#ff4444";
    ctx.fillStyle = "#ff6666";
    ctx.beginPath();
    ctx.arc(b.x + b.width / 2, b.y + b.height / 2, b.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}
