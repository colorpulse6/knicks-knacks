import {
  type GameState,
  type Keys,
  type Ball,
  type Paddle,
  type PowerUp,
  type ActivePowerUp,
  type Laser,
  type Brick,
  BrickType,
  PowerUpType,
  AudioEvent,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_Y,
  PADDLE_SPEED,
  PADDLE_LERP,
  BALL_RADIUS,
  BALL_TRAIL_LENGTH,
  POWER_UP_SIZE,
  POWER_UP_FALL_SPEED,
  POWER_UP_DROP_CHANCE,
  POWER_UP_DURATION,
  POWER_UP_CONFIG,
  POWER_UP_WEIGHTS,
  SCORE_NORMAL,
  SCORE_TOUGH,
  SCORE_ARMORED,
  SCORE_EXPLOSIVE,
  COMBO_MULTIPLIER_THRESHOLD,
  SHAKE_DURATION,
  SHAKE_INTENSITY_NORMAL,
  SHAKE_INTENSITY_EXPLOSIVE,
  LASER_SPEED,
  LASER_COOLDOWN,
  LASER_WIDTH,
  LASER_HEIGHT,
  LEVEL_TRANSITION_FRAMES,
} from "./types";

import {
  checkWallCollision,
  checkBrickCollision,
  checkPaddleCollision,
  computePaddleBounceAngle,
  getAdjacentBricks,
  clampBallSpeed,
  adjustBallSpeed,
  reflectBall,
  laserHitsBrick,
  powerUpHitsPaddle,
} from "./physics";

import {
  createLevelBricks,
  getLevelBallSpeed,
  isBossLevel,
  updateBossRow,
  resetBrickIds,
} from "./levels";

import {
  createBrickParticles,
  createExplosionParticles,
  createPowerUpParticles,
  updateParticles,
  capParticles,
} from "./particles";

// ─── ID Generators ───────────────────────────────────────────────────

let nextBallId = 0;
let nextPowerUpId = 0;
let nextLaserId = 0;

// ─── Initial State ───────────────────────────────────────────────────

export function createInitialState(level: number = 1): GameState {
  resetBrickIds();
  nextBallId = 0;
  nextPowerUpId = 0;
  nextLaserId = 0;

  const paddle: Paddle = {
    x: CANVAS_WIDTH / 2,
    y: PADDLE_Y,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    targetX: CANVAS_WIDTH / 2,
    magnetActive: false,
    laserCooldown: 0,
  };

  const ball: Ball = {
    id: nextBallId++,
    position: { x: CANVAS_WIDTH / 2, y: PADDLE_Y - BALL_RADIUS },
    velocity: { x: 0, y: 0 },
    radius: BALL_RADIUS,
    fireball: false,
    stuck: false,
    stuckOffset: 0,
    trail: [],
  };

  return {
    paddle,
    balls: [ball],
    bricks: createLevelBricks(level),
    powerUps: [],
    activePowerUps: [],
    lasers: [],
    particles: [],
    screenShake: { duration: 0, intensity: 0 },
    score: 0,
    lives: 3,
    level,
    combo: 0,
    maxCombo: 0,
    gameOver: false,
    paused: false,
    levelComplete: false,
    levelTransitionTimer: 0,
    ballLaunched: false,
    audioEvents: [],
    entranceAnimating: true,
    frameCount: 0,
  };
}

// ─── Score for brick type ────────────────────────────────────────────

function scoreForBrick(type: BrickType): number {
  switch (type) {
    case BrickType.TOUGH:
      return SCORE_TOUGH;
    case BrickType.ARMORED:
      return SCORE_ARMORED;
    case BrickType.EXPLOSIVE:
      return SCORE_EXPLOSIVE;
    default:
      return SCORE_NORMAL;
  }
}

// ─── Random Power-Up ─────────────────────────────────────────────────

function randomPowerUpType(): PowerUpType {
  const totalWeight = POWER_UP_WEIGHTS.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const entry of POWER_UP_WEIGHTS) {
    roll -= entry.weight;
    if (roll <= 0) return entry.type;
  }
  return PowerUpType.MULTI_BALL;
}

function spawnPowerUp(brick: Brick): PowerUp {
  const type = randomPowerUpType();
  const config = POWER_UP_CONFIG[type];
  return {
    id: nextPowerUpId++,
    type,
    position: {
      x: brick.x + brick.width / 2 - POWER_UP_SIZE / 2,
      y: brick.y + brick.height / 2,
    },
    color: config.color,
    symbol: config.symbol,
  };
}

// ─── Main Update ─────────────────────────────────────────────────────

export function updateGame(
  state: GameState,
  keys: Keys,
  mouseX: number | null
): GameState {
  if (state.gameOver || state.paused) return { ...state, audioEvents: [] };

  // Level transition countdown
  if (state.levelComplete) {
    const timer = state.levelTransitionTimer - 1;
    if (timer <= 0) {
      return createNextLevel(state);
    }
    return { ...state, levelTransitionTimer: timer, audioEvents: [] };
  }

  const audioEvents: AudioEvent[] = [];
  let {
    paddle,
    balls,
    bricks,
    powerUps,
    activePowerUps,
    lasers,
    particles,
    screenShake,
    score,
    lives,
    combo,
    maxCombo,
    ballLaunched,
    entranceAnimating,
  } = state;
  const frameCount = state.frameCount + 1;

  // ── Brick entrance animation ──
  if (entranceAnimating) {
    let allDone = true;
    bricks = bricks.map((brick) => {
      const delay = brick.row * 5;
      if (frameCount < delay) {
        allDone = false;
        return brick;
      }
      const progress = Math.min(1, brick.entranceProgress + 0.06);
      if (progress < 1) allDone = false;
      return { ...brick, entranceProgress: progress };
    });
    if (allDone) entranceAnimating = false;

    // During entrance, only update particles — no physics
    particles = updateParticles(particles);
    return {
      ...state,
      bricks,
      particles,
      entranceAnimating,
      frameCount,
      audioEvents: [],
    };
  }

  // ── Update paddle ──
  const isSlowMo = activePowerUps.some(
    (p) => p.type === PowerUpType.SLOW_MOTION
  );

  if (mouseX !== null) {
    paddle = { ...paddle, targetX: mouseX };
  } else {
    let targetX = paddle.targetX;
    if (keys.left) targetX -= PADDLE_SPEED;
    if (keys.right) targetX += PADDLE_SPEED;
    paddle = { ...paddle, targetX };
  }

  // Lerp paddle position
  const newPaddleX =
    paddle.x + (paddle.targetX - paddle.x) * PADDLE_LERP;
  const clampedX = Math.max(
    paddle.width / 2,
    Math.min(CANVAS_WIDTH - paddle.width / 2, newPaddleX)
  );
  paddle = { ...paddle, x: clampedX };

  // ── Handle ball launch ──
  if (!ballLaunched) {
    balls = balls.map((ball) => ({
      ...ball,
      position: { x: paddle.x, y: paddle.y - ball.radius },
      velocity: { x: 0, y: 0 },
    }));
    if (keys.space) {
      const speed = getLevelBallSpeed(state.level);
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
      balls = balls.map((ball) => ({
        ...ball,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
      }));
      ballLaunched = true;
      audioEvents.push(AudioEvent.PADDLE_HIT);
    }
  }

  // ── Update balls ──
  const survivingBalls: Ball[] = [];
  let ballLost = false;

  for (const ball of balls) {
    if (!ballLaunched) {
      survivingBalls.push(ball);
      continue;
    }

    // Magnet: ball stuck to paddle
    if (ball.stuck) {
      const stuckBall: Ball = {
        ...ball,
        position: {
          x: paddle.x + ball.stuckOffset,
          y: paddle.y - ball.radius,
        },
      };
      if (keys.space) {
        const speed = getLevelBallSpeed(state.level);
        const angle = computePaddleBounceAngle(
          stuckBall.position.x,
          paddle.x,
          paddle.width
        );
        survivingBalls.push({
          ...stuckBall,
          stuck: false,
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          },
        });
        audioEvents.push(AudioEvent.PADDLE_HIT);
      } else {
        survivingBalls.push(stuckBall);
      }
      continue;
    }

    // Add trail
    const trail = [...ball.trail, { ...ball.position }];
    if (trail.length > BALL_TRAIL_LENGTH) trail.shift();

    // Apply velocity (slow-mo reduces effective movement)
    const speedMult = isSlowMo ? 0.5 : 1;
    let movedBall: Ball = {
      ...ball,
      trail,
      position: {
        x: ball.position.x + ball.velocity.x * speedMult,
        y: ball.position.y + ball.velocity.y * speedMult,
      },
    };

    // Wall collision
    const wallResult = checkWallCollision(movedBall);
    if (wallResult.hitBottom) {
      ballLost = true;
      continue; // ball removed
    }
    if (wallResult.hitWall) {
      audioEvents.push(AudioEvent.WALL_HIT);
    }
    movedBall = wallResult.ball;

    // Paddle collision
    const paddleResult = checkPaddleCollision(movedBall, paddle);
    if (paddleResult.collided && movedBall.velocity.y > 0) {
      const angle = computePaddleBounceAngle(
        movedBall.position.x,
        paddle.x,
        paddle.width
      );
      const speed = getLevelBallSpeed(state.level) * (isSlowMo ? 1 : 1);
      if (paddle.magnetActive) {
        movedBall = {
          ...movedBall,
          stuck: true,
          stuckOffset: movedBall.position.x - paddle.x,
          velocity: { x: 0, y: 0 },
          position: { x: movedBall.position.x, y: paddle.y - movedBall.radius },
        };
      } else {
        movedBall = {
          ...movedBall,
          position: {
            x: movedBall.position.x,
            y: paddle.y - movedBall.radius,
          },
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          },
        };
      }
      combo = 0;
      audioEvents.push(AudioEvent.PADDLE_HIT);
    }

    // Brick collision (one per frame per ball to prevent tunneling)
    let hitBrick = false;
    for (let i = 0; i < bricks.length; i++) {
      const brick = bricks[i];
      if (!brick.alive) continue;

      const brickResult = checkBrickCollision(movedBall, brick);
      if (!brickResult.collided) continue;

      hitBrick = true;

      // Reflect ball (unless fireball)
      if (!movedBall.fireball) {
        movedBall = reflectBall(movedBall, brickResult.normal, brickResult.penetration);
      }

      // Damage brick
      const newHits = brick.hitsRemaining - 1;
      if (newHits <= 0 && brick.type !== BrickType.INDESTRUCTIBLE) {
        // Destroy brick
        bricks = bricks.map((b) =>
          b.id === brick.id ? { ...b, alive: false, hitsRemaining: 0 } : b
        );

        // Score
        combo++;
        if (combo > maxCombo) maxCombo = combo;
        const multiplier = Math.max(
          1,
          Math.floor(combo / COMBO_MULTIPLIER_THRESHOLD)
        );
        score += scoreForBrick(brick.type) * multiplier;

        if (combo >= COMBO_MULTIPLIER_THRESHOLD) {
          audioEvents.push(AudioEvent.COMBO);
        }

        // Particles
        if (brick.type === BrickType.EXPLOSIVE) {
          particles = [...particles, ...createExplosionParticles(brick)];
          // Chain destroy adjacent
          const adjacent = getAdjacentBricks(brick, bricks);
          for (const adj of adjacent) {
            bricks = bricks.map((b) =>
              b.id === adj.id ? { ...b, alive: false, hitsRemaining: 0 } : b
            );
            particles = [...particles, ...createBrickParticles(adj)];
            score += scoreForBrick(adj.type) * multiplier;
          }
          audioEvents.push(AudioEvent.EXPLOSIVE_DESTROY);
          screenShake = {
            duration: SHAKE_DURATION + 2,
            intensity: SHAKE_INTENSITY_EXPLOSIVE,
          };
        } else {
          particles = [...particles, ...createBrickParticles(brick)];
          audioEvents.push(AudioEvent.BRICK_DESTROY);
          screenShake = {
            duration: SHAKE_DURATION,
            intensity: SHAKE_INTENSITY_NORMAL,
          };
        }

        // Power-up drop
        if (Math.random() < POWER_UP_DROP_CHANCE) {
          powerUps = [...powerUps, spawnPowerUp(brick)];
        }
      } else if (brick.type !== BrickType.INDESTRUCTIBLE) {
        // Brick damaged but not destroyed
        bricks = bricks.map((b) =>
          b.id === brick.id ? { ...b, hitsRemaining: newHits } : b
        );
        audioEvents.push(AudioEvent.BRICK_HIT);
        // Small particle burst for damage
        particles = [
          ...particles,
          ...createBrickParticles(brick).slice(0, 4),
        ];
      } else {
        // Indestructible — just bounce
        audioEvents.push(AudioEvent.WALL_HIT);
      }

      if (!movedBall.fireball) break; // Only one collision per frame unless fireball
    }

    movedBall = {
      ...movedBall,
      velocity: clampBallSpeed(movedBall.velocity),
    };
    survivingBalls.push(movedBall);
  }

  balls = survivingBalls;

  // ── Handle ball loss ──
  if (ballLost && balls.length === 0) {
    lives--;
    if (lives <= 0) {
      audioEvents.push(AudioEvent.GAME_OVER);
      return {
        ...state,
        paddle,
        balls: [],
        bricks,
        powerUps: [],
        activePowerUps: [],
        lasers: [],
        particles: updateParticles(particles),
        screenShake,
        score,
        lives: 0,
        combo: 0,
        maxCombo,
        gameOver: true,
        ballLaunched: false,
        audioEvents,
        frameCount,
      };
    }

    audioEvents.push(AudioEvent.BALL_LOST);
    // Reset ball on paddle
    const resetBall: Ball = {
      id: nextBallId++,
      position: { x: paddle.x, y: paddle.y - BALL_RADIUS },
      velocity: { x: 0, y: 0 },
      radius: BALL_RADIUS,
      fireball: false,
      stuck: false,
      stuckOffset: 0,
      trail: [],
    };
    balls = [resetBall];
    ballLaunched = false;
    // Clear timed power-ups on death
    activePowerUps = [];
    paddle = { ...paddle, width: PADDLE_WIDTH, magnetActive: false, laserCooldown: 0 };
  }

  // ── Update lasers ──
  const hasLaser = activePowerUps.some(
    (p) => p.type === PowerUpType.LASER
  );

  if (hasLaser && paddle.laserCooldown <= 0 && ballLaunched) {
    const leftLaser: Laser = {
      id: nextLaserId++,
      position: { x: paddle.x - paddle.width / 2, y: paddle.y },
      velocity: { x: 0, y: -LASER_SPEED },
    };
    const rightLaser: Laser = {
      id: nextLaserId++,
      position: { x: paddle.x + paddle.width / 2 - LASER_WIDTH, y: paddle.y },
      velocity: { x: 0, y: -LASER_SPEED },
    };
    lasers = [...lasers, leftLaser, rightLaser];
    paddle = { ...paddle, laserCooldown: LASER_COOLDOWN };
    audioEvents.push(AudioEvent.LASER_FIRE);
  }
  if (paddle.laserCooldown > 0) {
    paddle = { ...paddle, laserCooldown: paddle.laserCooldown - 1 };
  }

  // Move lasers and check brick collision
  lasers = lasers
    .map((laser) => ({
      ...laser,
      position: {
        x: laser.position.x + laser.velocity.x,
        y: laser.position.y + laser.velocity.y,
      },
    }))
    .filter((laser) => laser.position.y > 0);

  // Laser-brick collisions
  const laserIdsToRemove = new Set<number>();
  for (const laser of lasers) {
    for (let i = 0; i < bricks.length; i++) {
      const brick = bricks[i];
      if (!brick.alive) continue;
      if (
        laserHitsBrick(laser.position, LASER_WIDTH, LASER_HEIGHT, brick)
      ) {
        laserIdsToRemove.add(laser.id);
        const newHits = brick.hitsRemaining - 1;
        if (newHits <= 0 && brick.type !== BrickType.INDESTRUCTIBLE) {
          bricks = bricks.map((b) =>
            b.id === brick.id ? { ...b, alive: false, hitsRemaining: 0 } : b
          );
          particles = [...particles, ...createBrickParticles(brick)];
          score += scoreForBrick(brick.type);
          audioEvents.push(AudioEvent.BRICK_DESTROY);

          if (brick.type === BrickType.EXPLOSIVE) {
            const adjacent = getAdjacentBricks(brick, bricks);
            for (const adj of adjacent) {
              bricks = bricks.map((b) =>
                b.id === adj.id
                  ? { ...b, alive: false, hitsRemaining: 0 }
                  : b
              );
              particles = [...particles, ...createBrickParticles(adj)];
              score += scoreForBrick(adj.type);
            }
            particles = [...particles, ...createExplosionParticles(brick)];
            audioEvents.push(AudioEvent.EXPLOSIVE_DESTROY);
            screenShake = {
              duration: SHAKE_DURATION + 2,
              intensity: SHAKE_INTENSITY_EXPLOSIVE,
            };
          }
        } else if (brick.type !== BrickType.INDESTRUCTIBLE) {
          bricks = bricks.map((b) =>
            b.id === brick.id ? { ...b, hitsRemaining: newHits } : b
          );
          audioEvents.push(AudioEvent.BRICK_HIT);
        }
        break;
      }
    }
  }
  lasers = lasers.filter((l) => !laserIdsToRemove.has(l.id));

  // ── Update falling power-ups ──
  const survivingPowerUps: PowerUp[] = [];
  for (const pu of powerUps) {
    const newPos = {
      x: pu.position.x,
      y: pu.position.y + POWER_UP_FALL_SPEED,
    };

    if (newPos.y > CANVAS_HEIGHT) continue; // fell off screen

    if (powerUpHitsPaddle(newPos, POWER_UP_SIZE, paddle)) {
      // Collect power-up
      const result = applyPowerUp(
        pu.type,
        balls,
        paddle,
        activePowerUps,
        lives
      );
      balls = result.balls;
      paddle = result.paddle;
      activePowerUps = result.activePowerUps;
      lives = result.lives;
      audioEvents.push(result.audioEvent);
      particles = [
        ...particles,
        ...createPowerUpParticles(newPos, pu.color),
      ];
    } else {
      survivingPowerUps.push({ ...pu, position: newPos });
    }
  }
  powerUps = survivingPowerUps;

  // ── Update active power-up timers ──
  const expiredTypes = new Set<PowerUpType>();
  activePowerUps = activePowerUps
    .map((ap) => ({ ...ap, remainingFrames: ap.remainingFrames - 1 }))
    .filter((ap) => {
      if (ap.remainingFrames <= 0) {
        expiredTypes.add(ap.type);
        return false;
      }
      return true;
    });

  // Handle expiration effects
  if (expiredTypes.has(PowerUpType.EXPAND_PADDLE) || expiredTypes.has(PowerUpType.SHRINK_PADDLE)) {
    // Only reset if no other size power-up is still active
    const hasExpand = activePowerUps.some((p) => p.type === PowerUpType.EXPAND_PADDLE);
    const hasShrink = activePowerUps.some((p) => p.type === PowerUpType.SHRINK_PADDLE);
    if (!hasExpand && !hasShrink) {
      paddle = { ...paddle, width: PADDLE_WIDTH };
    }
  }
  if (expiredTypes.has(PowerUpType.FIREBALL)) {
    balls = balls.map((b) => ({ ...b, fireball: false }));
  }
  if (expiredTypes.has(PowerUpType.MAGNET)) {
    paddle = { ...paddle, magnetActive: false };
  }

  // ── Update particles ──
  particles = capParticles(updateParticles(particles));

  // ── Update screen shake ──
  if (screenShake.duration > 0) {
    screenShake = {
      ...screenShake,
      duration: screenShake.duration - 1,
    };
  }

  // ── Boss row movement ──
  if (isBossLevel(state.level)) {
    bricks = updateBossRow(bricks, frameCount);
  }

  // ── Check level completion ──
  const destructibleRemaining = bricks.some(
    (b) => b.alive && b.type !== BrickType.INDESTRUCTIBLE
  );
  let levelComplete = false;
  let levelTransitionTimer = 0;
  if (!destructibleRemaining) {
    levelComplete = true;
    levelTransitionTimer = LEVEL_TRANSITION_FRAMES;
    audioEvents.push(AudioEvent.LEVEL_COMPLETE);
  }

  return {
    paddle,
    balls,
    bricks,
    powerUps,
    activePowerUps,
    lasers,
    particles,
    screenShake,
    score,
    lives,
    level: state.level,
    combo,
    maxCombo,
    gameOver: false,
    paused: false,
    levelComplete,
    levelTransitionTimer,
    ballLaunched,
    audioEvents,
    entranceAnimating,
    frameCount,
  };
}

// ─── Apply Power-Up ──────────────────────────────────────────────────

function applyPowerUp(
  type: PowerUpType,
  balls: Ball[],
  paddle: Paddle,
  activePowerUps: ActivePowerUp[],
  lives: number
): {
  balls: Ball[];
  paddle: Paddle;
  activePowerUps: ActivePowerUp[];
  lives: number;
  audioEvent: AudioEvent;
} {
  switch (type) {
    case PowerUpType.MULTI_BALL: {
      const newBalls: Ball[] = [];
      for (const ball of balls) {
        if (ball.stuck) {
          newBalls.push(ball);
          continue;
        }
        newBalls.push(ball);
        // Spawn 2 copies with rotated velocities
        for (const angleDelta of [-Math.PI / 6, Math.PI / 6]) {
          const cos = Math.cos(angleDelta);
          const sin = Math.sin(angleDelta);
          newBalls.push({
            ...ball,
            id: nextBallId++,
            velocity: {
              x: ball.velocity.x * cos - ball.velocity.y * sin,
              y: ball.velocity.x * sin + ball.velocity.y * cos,
            },
            trail: [],
          });
        }
      }
      return {
        balls: newBalls,
        paddle,
        activePowerUps,
        lives,
        audioEvent: AudioEvent.POWER_UP_COLLECT,
      };
    }

    case PowerUpType.EXPAND_PADDLE: {
      // Cancel shrink if active
      const filtered = activePowerUps.filter(
        (p) => p.type !== PowerUpType.SHRINK_PADDLE
      );
      return {
        balls,
        paddle: { ...paddle, width: PADDLE_WIDTH * 1.5 },
        activePowerUps: [
          ...filtered,
          { type: PowerUpType.EXPAND_PADDLE, remainingFrames: POWER_UP_DURATION },
        ],
        lives,
        audioEvent: AudioEvent.POWER_UP_COLLECT,
      };
    }

    case PowerUpType.SHRINK_PADDLE: {
      // Cancel expand if active
      const filtered = activePowerUps.filter(
        (p) => p.type !== PowerUpType.EXPAND_PADDLE
      );
      return {
        balls,
        paddle: { ...paddle, width: PADDLE_WIDTH * 0.6 },
        activePowerUps: [
          ...filtered,
          { type: PowerUpType.SHRINK_PADDLE, remainingFrames: POWER_UP_DURATION },
        ],
        lives,
        audioEvent: AudioEvent.POWER_UP_NEGATIVE,
      };
    }

    case PowerUpType.FIREBALL:
      return {
        balls: balls.map((b) => ({ ...b, fireball: true })),
        paddle,
        activePowerUps: [
          ...activePowerUps.filter((p) => p.type !== PowerUpType.FIREBALL),
          { type: PowerUpType.FIREBALL, remainingFrames: POWER_UP_DURATION },
        ],
        lives,
        audioEvent: AudioEvent.POWER_UP_COLLECT,
      };

    case PowerUpType.MAGNET:
      return {
        balls,
        paddle: { ...paddle, magnetActive: true },
        activePowerUps: [
          ...activePowerUps.filter((p) => p.type !== PowerUpType.MAGNET),
          { type: PowerUpType.MAGNET, remainingFrames: POWER_UP_DURATION },
        ],
        lives,
        audioEvent: AudioEvent.POWER_UP_COLLECT,
      };

    case PowerUpType.SLOW_MOTION:
      return {
        balls,
        paddle,
        activePowerUps: [
          ...activePowerUps.filter((p) => p.type !== PowerUpType.SLOW_MOTION),
          { type: PowerUpType.SLOW_MOTION, remainingFrames: POWER_UP_DURATION },
        ],
        lives,
        audioEvent: AudioEvent.POWER_UP_COLLECT,
      };

    case PowerUpType.EXTRA_LIFE:
      return {
        balls,
        paddle,
        activePowerUps,
        lives: lives + 1,
        audioEvent: AudioEvent.EXTRA_LIFE,
      };

    case PowerUpType.LASER:
      return {
        balls,
        paddle: { ...paddle, laserCooldown: 0 },
        activePowerUps: [
          ...activePowerUps.filter((p) => p.type !== PowerUpType.LASER),
          { type: PowerUpType.LASER, remainingFrames: POWER_UP_DURATION },
        ],
        lives,
        audioEvent: AudioEvent.POWER_UP_COLLECT,
      };
  }
}

// ─── Next Level ──────────────────────────────────────────────────────

function createNextLevel(state: GameState): GameState {
  const newLevel = state.level + 1;
  resetBrickIds();

  const paddle: Paddle = {
    x: state.paddle.x,
    y: PADDLE_Y,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    targetX: state.paddle.x,
    magnetActive: false,
    laserCooldown: 0,
  };

  const ball: Ball = {
    id: nextBallId++,
    position: { x: paddle.x, y: PADDLE_Y - BALL_RADIUS },
    velocity: { x: 0, y: 0 },
    radius: BALL_RADIUS,
    fireball: false,
    stuck: false,
    stuckOffset: 0,
    trail: [],
  };

  return {
    ...state,
    paddle,
    balls: [ball],
    bricks: createLevelBricks(newLevel),
    powerUps: [],
    activePowerUps: [],
    lasers: [],
    particles: [],
    screenShake: { duration: 0, intensity: 0 },
    level: newLevel,
    combo: 0,
    levelComplete: false,
    levelTransitionTimer: 0,
    ballLaunched: false,
    audioEvents: [],
    entranceAnimating: true,
    frameCount: state.frameCount,
  };
}

// ─── Toggle Pause ────────────────────────────────────────────────────

export function togglePause(state: GameState): GameState {
  if (state.gameOver || state.levelComplete) return state;
  return { ...state, paused: !state.paused };
}
