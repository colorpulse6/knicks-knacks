import type { GameState, Keys, FirstPersonState, BoardingMap, FPEnemy } from "./types";
import { GameScreen, AudioEvent, CANVAS_WIDTH, GAME_AREA_HEIGHT } from "./types";
import { resolveAffinity } from "./enemyClasses";
import { AFFINITY_MULTIPLIER } from "./weaponTypes";
import { createAffinityLabel } from "./floatingLabels";
import { hasSkill, getSkillEffect } from "./skillTree";

// ─── Constants ──────────────────────────────────────────────────────

const MOVE_SPEED = 0.06;
const ROT_SPEED = 0.04;
const COLLISION_RADIUS = 0.25;
const GUN_FIRE_RATE = 15;     // frames between shots
const GUN_FLASH_DURATION = 6; // frames of muzzle flash
const BULLET_RANGE = 12;      // max hit distance in tiles
const BULLET_DAMAGE = 1;
const ENEMY_AGGRO_RANGE = 6;  // tiles
const ENEMY_CONTACT_RANGE = 0.5; // tiles — melee damage
const ENEMY_CONTACT_DAMAGE = 1;
const SENTRY_FIRE_RANGE = 8;
const SENTRY_FIRE_RATE = 120;

// ─── Wall collision ─────────────────────────────────────────────────

function isWalkable(map: BoardingMap, x: number, y: number): boolean {
  const col = Math.floor(x);
  const row = Math.floor(y);
  if (col < 0 || col >= map.width || row < 0 || row >= map.height) return false;
  const tile = map.tiles[row][col];
  return tile !== "wall" && tile !== "empty";
}

// ─── Line of sight (simplified) ─────────────────────────────────────

function hasLOS(map: BoardingMap, x1: number, y1: number, x2: number, y2: number): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.ceil(dist * 3);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    const col = Math.floor(px);
    const row = Math.floor(py);
    if (col < 0 || col >= map.width || row < 0 || row >= map.height) return false;
    const tile = map.tiles[row][col];
    if (tile === "wall" || tile === "empty") return false;
  }
  return true;
}

// ─── Main Update ────────────────────────────────────────────────────

export function updateFirstPerson(gs: GameState, keys: Keys): void {
  const fp = gs.firstPersonState;
  if (!fp || gs.levelCompleteTimer > 0) return;

  let { posX, posY, dirX, dirY, planeX, planeY } = fp;

  // ── Rotation ──
  if (keys.left) {
    const oldDirX = dirX;
    dirX = dirX * Math.cos(ROT_SPEED) - dirY * Math.sin(ROT_SPEED);
    dirY = oldDirX * Math.sin(ROT_SPEED) + dirY * Math.cos(ROT_SPEED);
    const oldPlaneX = planeX;
    planeX = planeX * Math.cos(ROT_SPEED) - planeY * Math.sin(ROT_SPEED);
    planeY = oldPlaneX * Math.sin(ROT_SPEED) + planeY * Math.cos(ROT_SPEED);
  }
  if (keys.right) {
    const oldDirX = dirX;
    dirX = dirX * Math.cos(-ROT_SPEED) - dirY * Math.sin(-ROT_SPEED);
    dirY = oldDirX * Math.sin(-ROT_SPEED) + dirY * Math.cos(-ROT_SPEED);
    const oldPlaneX = planeX;
    planeX = planeX * Math.cos(-ROT_SPEED) - planeY * Math.sin(-ROT_SPEED);
    planeY = oldPlaneX * Math.sin(-ROT_SPEED) + planeY * Math.cos(-ROT_SPEED);
  }

  // ── Movement ──
  if (keys.up) {
    const newX = posX + dirX * MOVE_SPEED;
    const newY = posY + dirY * MOVE_SPEED;
    if (isWalkable(fp.map, newX + COLLISION_RADIUS * Math.sign(dirX), posY)) posX = newX;
    if (isWalkable(fp.map, posX, newY + COLLISION_RADIUS * Math.sign(dirY))) posY = newY;
  }
  if (keys.down) {
    const newX = posX - dirX * MOVE_SPEED;
    const newY = posY - dirY * MOVE_SPEED;
    if (isWalkable(fp.map, newX - COLLISION_RADIUS * Math.sign(dirX), posY)) posX = newX;
    if (isWalkable(fp.map, posX, newY - COLLISION_RADIUS * Math.sign(dirY))) posY = newY;
  }

  fp.posX = posX;
  fp.posY = posY;
  fp.dirX = dirX;
  fp.dirY = dirY;
  fp.planeX = planeX;
  fp.planeY = planeY;

  // ── Shooting ──
  if (fp.gunCooldown > 0) fp.gunCooldown--;
  if (fp.gunFireTimer > 0) fp.gunFireTimer--;

  if (keys.shoot && fp.gunCooldown <= 0) {
    fp.gunFireTimer = GUN_FLASH_DURATION;
    fp.gunCooldown = GUN_FIRE_RATE;
    gs.audioEvents.push(AudioEvent.PLAYER_SHOOT);

    // Hitscan — check if any enemy is near the center ray
    let closestHit: FPEnemy | null = null;
    let closestDist = BULLET_RANGE;

    for (const enemy of fp.enemies) {
      if (enemy.deathTimer !== 0) continue;

      const dx = enemy.x - posX;
      const dy = enemy.y - posY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > BULLET_RANGE || dist > closestDist) continue;

      // Check if enemy is roughly in crosshair
      // Project enemy onto camera plane
      const invDet = 1.0 / (planeX * dirY - dirX * planeY);
      const transformY = invDet * (-planeY * dx + planeX * dy); // depth
      if (transformY <= 0) continue; // Behind camera

      const transformX = invDet * (dirY * dx - dirX * dy);
      const screenX = Math.floor((CANVAS_WIDTH / 2) * (1 + transformX / transformY));

      // Hit tolerance: enemy must be within ~30% of screen center
      const hitWidth = Math.abs(CANVAS_WIDTH / transformY) * 0.4;
      if (Math.abs(screenX - CANVAS_WIDTH / 2) < hitWidth) {
        // Line of sight check
        if (hasLOS(fp.map, posX, posY, enemy.x, enemy.y)) {
          closestHit = enemy;
          closestDist = dist;
        }
      }
    }

    if (closestHit) {
      // Apply damage with affinity
      let dmg = BULLET_DAMAGE;
      const affinity = resolveAffinity(gs.equippedWeaponType, closestHit.classId);
      dmg *= AFFINITY_MULTIPLIER[affinity];

      if (hasSkill(gs.allocatedSkills, "sharpshooter") && affinity === "effective") {
        dmg *= 1 + getSkillEffect(gs.allocatedSkills, "sharpshooter");
      }
      if (hasSkill(gs.allocatedSkills, "glass-cannon")) {
        dmg *= 1 + getSkillEffect(gs.allocatedSkills, "glass-cannon");
      }

      closestHit.hp -= dmg;
      gs.screenShake = 2;

      // Floating label (in screen space — approximate)
      const label = createAffinityLabel(CANVAS_WIDTH / 2, GAME_AREA_HEIGHT / 2 - 40, affinity);
      if (label) gs.floatingLabels = [...gs.floatingLabels, label];

      if (closestHit.hp <= 0) {
        closestHit.deathTimer = 30; // 0.5s death animation
        gs.score += 200;
        gs.xp += 200;
        gs.kills += 1;
        gs.audioEvents.push(AudioEvent.ENEMY_DESTROY);
      } else {
        gs.audioEvents.push(AudioEvent.BOSS_HIT); // reuse for hit sound
      }
    }
  }

  // ── Enemy AI ──
  for (const enemy of fp.enemies) {
    if (enemy.deathTimer > 0) {
      enemy.deathTimer--;
      if (enemy.deathTimer <= 0) enemy.deathTimer = -1; // Mark for removal
      continue;
    }
    if (enemy.deathTimer < 0) continue; // Dead

    const dx = posX - enemy.x;
    const dy = posY - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Aggro
    if (!enemy.isAggro && dist < ENEMY_AGGRO_RANGE) {
      if (hasLOS(fp.map, enemy.x, enemy.y, posX, posY)) {
        enemy.isAggro = true;
      }
    }

    if (!enemy.isAggro) continue;

    switch (enemy.type) {
      case "grunt":
      case "charger": {
        // Move toward player
        const speed = enemy.type === "charger" ? enemy.speed * 1.5 : enemy.speed;
        const len = dist || 1;
        const mvx = (dx / len) * speed;
        const mvy = (dy / len) * speed;
        const newX = enemy.x + mvx;
        const newY = enemy.y + mvy;
        if (isWalkable(fp.map, newX, enemy.y)) enemy.x = newX;
        if (isWalkable(fp.map, enemy.x, newY)) enemy.y = newY;

        // Contact damage
        if (dist < ENEMY_CONTACT_RANGE && gs.player.invincibleTimer <= 0) {
          gs.player.hp -= ENEMY_CONTACT_DAMAGE;
          gs.player.invincibleTimer = 60;
          gs.screenShake = 5;
          gs.audioEvents.push(AudioEvent.PLAYER_HIT);
          if (gs.player.hp <= 0) {
            gs.lives -= 1;
            gs.deaths += 1;
            if (gs.lives <= 0) {
              gs.screen = GameScreen.GAME_OVER;
              gs.audioEvents.push(AudioEvent.GAME_OVER);
            } else {
              // Respawn
              gs.player.hp = gs.player.maxHp;
              gs.player.invincibleTimer = 90;
              // Find spawn
              for (let r = 0; r < fp.map.height; r++) {
                for (let c = 0; c < fp.map.width; c++) {
                  if (fp.map.tiles[r][c] === "spawn") {
                    fp.posX = c + 0.5;
                    fp.posY = r + 0.5;
                  }
                }
              }
            }
          }
        }
        break;
      }
      case "sentry": {
        // Stationary — shoots at player (TODO: implement projectiles in FP)
        // For now: hitscan damage at interval
        if (enemy.fireTimer > 0) {
          enemy.fireTimer--;
        } else if (dist < SENTRY_FIRE_RANGE && hasLOS(fp.map, enemy.x, enemy.y, posX, posY)) {
          if (gs.player.invincibleTimer <= 0) {
            gs.player.hp -= 1;
            gs.player.invincibleTimer = 40;
            gs.screenShake = 3;
            gs.audioEvents.push(AudioEvent.PLAYER_HIT);
            if (gs.player.hp <= 0) {
              gs.lives -= 1;
              gs.deaths += 1;
              if (gs.lives <= 0) {
                gs.screen = GameScreen.GAME_OVER;
                gs.audioEvents.push(AudioEvent.GAME_OVER);
              } else {
                gs.player.hp = gs.player.maxHp;
                gs.player.invincibleTimer = 90;
              }
            }
          }
          enemy.fireTimer = SENTRY_FIRE_RATE;
          gs.audioEvents.push(AudioEvent.ENEMY_SHOOT);
        }
        break;
      }
    }
  }

  // Remove dead enemies
  fp.enemies = fp.enemies.filter((e) => e.deathTimer !== -1);

  // ── Invincibility ──
  if (gs.player.invincibleTimer > 0) gs.player.invincibleTimer--;

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

  gs.player.bankDir = (keys.up || keys.down) ? 1 : 0;
}
