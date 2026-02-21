import {
  type Vector2,
  type Ball,
  type Brick,
  type Paddle,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BALL_MAX_SPEED,
} from "./types";

// ─── Utility ─────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function magnitude(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

// ─── Circle-Rect Collision ───────────────────────────────────────────

export interface CollisionResult {
  collided: boolean;
  normal: Vector2;
  penetration: number;
}

export function circleRectCollision(
  ballPos: Vector2,
  ballRadius: number,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number
): CollisionResult {
  const nearestX = clamp(ballPos.x, rectX, rectX + rectWidth);
  const nearestY = clamp(ballPos.y, rectY, rectY + rectHeight);

  const dx = ballPos.x - nearestX;
  const dy = ballPos.y - nearestY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist >= ballRadius) {
    return { collided: false, normal: { x: 0, y: 0 }, penetration: 0 };
  }

  // Ball center is inside the rect
  if (dist === 0) {
    const overlapLeft = ballPos.x - rectX;
    const overlapRight = rectX + rectWidth - ballPos.x;
    const overlapTop = ballPos.y - rectY;
    const overlapBottom = rectY + rectHeight - ballPos.y;
    const minOverlap = Math.min(
      overlapLeft,
      overlapRight,
      overlapTop,
      overlapBottom
    );

    if (minOverlap === overlapLeft)
      return {
        collided: true,
        normal: { x: -1, y: 0 },
        penetration: ballRadius,
      };
    if (minOverlap === overlapRight)
      return {
        collided: true,
        normal: { x: 1, y: 0 },
        penetration: ballRadius,
      };
    if (minOverlap === overlapTop)
      return {
        collided: true,
        normal: { x: 0, y: -1 },
        penetration: ballRadius,
      };
    return {
      collided: true,
      normal: { x: 0, y: 1 },
      penetration: ballRadius,
    };
  }

  const penetration = ballRadius - dist;
  const normal: Vector2 = { x: dx / dist, y: dy / dist };

  return { collided: true, normal, penetration };
}

// ─── Paddle Bounce Angle ─────────────────────────────────────────────

export function computePaddleBounceAngle(
  ballX: number,
  paddleX: number,
  paddleWidth: number
): number {
  // offset: -1 (left edge) to +1 (right edge)
  const offset = clamp(
    (ballX - paddleX) / (paddleWidth / 2),
    -1,
    1
  );
  // Map to angle: -PI/2 is straight up, +/- PI/3 gives 60-degree max deflection
  const angle = -Math.PI / 2 + offset * (Math.PI / 3);
  return angle;
}

// ─── Wall Collision ──────────────────────────────────────────────────

export interface WallCollisionResult {
  hitWall: boolean;
  hitBottom: boolean;
  ball: Ball;
}

export function checkWallCollision(ball: Ball): WallCollisionResult {
  let hitWall = false;
  let hitBottom = false;
  const pos = { ...ball.position };
  const vel = { ...ball.velocity };

  // Left wall
  if (pos.x - ball.radius < 0) {
    pos.x = ball.radius;
    vel.x = Math.abs(vel.x);
    hitWall = true;
  }
  // Right wall
  if (pos.x + ball.radius > CANVAS_WIDTH) {
    pos.x = CANVAS_WIDTH - ball.radius;
    vel.x = -Math.abs(vel.x);
    hitWall = true;
  }
  // Top wall
  if (pos.y - ball.radius < 0) {
    pos.y = ball.radius;
    vel.y = Math.abs(vel.y);
    hitWall = true;
  }
  // Bottom — ball lost
  if (pos.y - ball.radius > CANVAS_HEIGHT) {
    hitBottom = true;
  }

  return {
    hitWall,
    hitBottom,
    ball: { ...ball, position: pos, velocity: vel },
  };
}

// ─── Brick Collision ─────────────────────────────────────────────────

export function checkBrickCollision(
  ball: Ball,
  brick: Brick
): CollisionResult {
  return circleRectCollision(
    ball.position,
    ball.radius,
    brick.x,
    brick.y,
    brick.width,
    brick.height
  );
}

// ─── Paddle Collision ────────────────────────────────────────────────

export function checkPaddleCollision(
  ball: Ball,
  paddle: Paddle
): CollisionResult {
  return circleRectCollision(
    ball.position,
    ball.radius,
    paddle.x - paddle.width / 2,
    paddle.y,
    paddle.width,
    paddle.height
  );
}

// ─── Adjacent Bricks (for explosive) ────────────────────────────────

export function getAdjacentBricks(
  brick: Brick,
  allBricks: Brick[]
): Brick[] {
  return allBricks.filter(
    (b) =>
      b.alive &&
      b.id !== brick.id &&
      b.type !== "indestructible" &&
      Math.abs(b.row - brick.row) <= 1 &&
      Math.abs(b.col - brick.col) <= 1
  );
}

// ─── Ball Speed ──────────────────────────────────────────────────────

export function clampBallSpeed(velocity: Vector2, maxSpeed: number = BALL_MAX_SPEED): Vector2 {
  const mag = magnitude(velocity);
  if (mag <= maxSpeed) return velocity;
  return {
    x: (velocity.x / mag) * maxSpeed,
    y: (velocity.y / mag) * maxSpeed,
  };
}

export function adjustBallSpeed(velocity: Vector2, targetSpeed: number): Vector2 {
  const mag = magnitude(velocity);
  if (mag === 0) return { x: 0, y: -targetSpeed };
  return {
    x: (velocity.x / mag) * targetSpeed,
    y: (velocity.y / mag) * targetSpeed,
  };
}

// ─── Reflect Ball Off Normal ─────────────────────────────────────────

export function reflectBall(ball: Ball, normal: Vector2, penetration: number): Ball {
  // Push ball out of collision
  const pos = {
    x: ball.position.x + normal.x * penetration,
    y: ball.position.y + normal.y * penetration,
  };

  // Reflect velocity
  const dot = ball.velocity.x * normal.x + ball.velocity.y * normal.y;
  const vel = {
    x: ball.velocity.x - 2 * dot * normal.x,
    y: ball.velocity.y - 2 * dot * normal.y,
  };

  return { ...ball, position: pos, velocity: vel };
}

// ─── Laser-Brick Collision (simple AABB) ─────────────────────────────

export function laserHitsBrick(
  laserPos: Vector2,
  laserW: number,
  laserH: number,
  brick: Brick
): boolean {
  return (
    laserPos.x < brick.x + brick.width &&
    laserPos.x + laserW > brick.x &&
    laserPos.y < brick.y + brick.height &&
    laserPos.y + laserH > brick.y
  );
}

// ─── Power-up-Paddle Collision (simple AABB) ─────────────────────────

export function powerUpHitsPaddle(
  puPos: Vector2,
  puSize: number,
  paddle: Paddle
): boolean {
  const paddleLeft = paddle.x - paddle.width / 2;
  return (
    puPos.x + puSize > paddleLeft &&
    puPos.x < paddleLeft + paddle.width &&
    puPos.y + puSize > paddle.y &&
    puPos.y < paddle.y + paddle.height
  );
}
