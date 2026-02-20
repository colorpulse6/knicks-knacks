export interface Vector {
  x: number;
  y: number;
}

export interface Ship {
  position: Vector;
  velocity: Vector;
  rotation: number;
  radius: number;
  invincible: boolean;
  invincibleTimer: number;
}

export interface Asteroid {
  id: number;
  position: Vector;
  velocity: Vector;
  radius: number;
  vertices: Vector[];
  rotation: number;
  rotationSpeed: number;
}

export interface Bullet {
  id: number;
  position: Vector;
  velocity: Vector;
  lifetime: number;
}

export interface GameState {
  ship: Ship;
  asteroids: Asteroid[];
  bullets: Bullet[];
  score: number;
  lives: number;
  level: number;
  gameOver: boolean;
  paused: boolean;
}

export interface Keys {
  left: boolean;
  right: boolean;
  up: boolean;
  space: boolean;
}

const SHIP_ROTATION_SPEED = 0.1;
const SHIP_THRUST = 0.15;
const SHIP_MAX_SPEED = 8;
const SHIP_FRICTION = 0.99;
const BULLET_SPEED = 12;
const BULLET_LIFETIME = 50;
const INVINCIBLE_TIME = 180;

let asteroidIdCounter = 0;
let bulletIdCounter = 0;

function createAsteroidVertices(radius: number): Vector[] {
  const vertices: Vector[] = [];
  const numVertices = 8 + Math.floor(Math.random() * 5);

  for (let i = 0; i < numVertices; i++) {
    const angle = (i / numVertices) * Math.PI * 2;
    const variation = 0.6 + Math.random() * 0.4;
    vertices.push({
      x: Math.cos(angle) * radius * variation,
      y: Math.sin(angle) * radius * variation,
    });
  }

  return vertices;
}

export function createAsteroid(
  x: number,
  y: number,
  radius: number,
  velocity?: Vector
): Asteroid {
  const speed = 1 + Math.random() * 2;
  const angle = Math.random() * Math.PI * 2;

  return {
    id: ++asteroidIdCounter,
    position: { x, y },
    velocity: velocity || {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    },
    radius,
    vertices: createAsteroidVertices(radius),
    rotation: 0,
    rotationSpeed: (Math.random() - 0.5) * 0.04,
  };
}

export function createInitialState(
  width: number,
  height: number,
  level: number = 1
): GameState {
  const asteroids: Asteroid[] = [];
  const numAsteroids = 3 + level;

  for (let i = 0; i < numAsteroids; i++) {
    let x: number, y: number;
    const margin = 100;

    // Spawn asteroids away from center
    do {
      x = Math.random() * width;
      y = Math.random() * height;
    } while (
      Math.abs(x - width / 2) < margin &&
      Math.abs(y - height / 2) < margin
    );

    asteroids.push(createAsteroid(x, y, 40 + Math.random() * 20));
  }

  return {
    ship: {
      position: { x: width / 2, y: height / 2 },
      velocity: { x: 0, y: 0 },
      rotation: -Math.PI / 2,
      radius: 15,
      invincible: true,
      invincibleTimer: INVINCIBLE_TIME,
    },
    asteroids,
    bullets: [],
    score: 0,
    lives: 3,
    level,
    gameOver: false,
    paused: false,
  };
}

function wrapPosition(pos: Vector, width: number, height: number): Vector {
  return {
    x: ((pos.x % width) + width) % width,
    y: ((pos.y % height) + height) % height,
  };
}

function checkCollision(
  pos1: Vector,
  radius1: number,
  pos2: Vector,
  radius2: number
): boolean {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < radius1 + radius2;
}

export function updateGame(
  state: GameState,
  keys: Keys,
  width: number,
  height: number,
  shootPressed: boolean
): GameState {
  if (state.gameOver || state.paused) return state;

  let { ship, asteroids, bullets, score, lives, level } = state;

  // Update ship rotation
  if (keys.left) {
    ship = { ...ship, rotation: ship.rotation - SHIP_ROTATION_SPEED };
  }
  if (keys.right) {
    ship = { ...ship, rotation: ship.rotation + SHIP_ROTATION_SPEED };
  }

  // Update ship thrust
  let newVelocity = { ...ship.velocity };
  if (keys.up) {
    newVelocity.x += Math.cos(ship.rotation) * SHIP_THRUST;
    newVelocity.y += Math.sin(ship.rotation) * SHIP_THRUST;

    // Limit speed
    const speed = Math.sqrt(
      newVelocity.x * newVelocity.x + newVelocity.y * newVelocity.y
    );
    if (speed > SHIP_MAX_SPEED) {
      newVelocity.x = (newVelocity.x / speed) * SHIP_MAX_SPEED;
      newVelocity.y = (newVelocity.y / speed) * SHIP_MAX_SPEED;
    }
  }

  // Apply friction
  newVelocity.x *= SHIP_FRICTION;
  newVelocity.y *= SHIP_FRICTION;

  // Update ship position
  const newPosition = wrapPosition(
    {
      x: ship.position.x + newVelocity.x,
      y: ship.position.y + newVelocity.y,
    },
    width,
    height
  );

  // Update invincibility
  let newInvincible = ship.invincible;
  let newInvincibleTimer = ship.invincibleTimer;
  if (ship.invincible) {
    newInvincibleTimer--;
    if (newInvincibleTimer <= 0) {
      newInvincible = false;
    }
  }

  ship = {
    ...ship,
    position: newPosition,
    velocity: newVelocity,
    invincible: newInvincible,
    invincibleTimer: newInvincibleTimer,
  };

  // Shoot bullet
  let newBullets = [...bullets];
  if (shootPressed) {
    newBullets.push({
      id: ++bulletIdCounter,
      position: {
        x: ship.position.x + Math.cos(ship.rotation) * ship.radius,
        y: ship.position.y + Math.sin(ship.rotation) * ship.radius,
      },
      velocity: {
        x: Math.cos(ship.rotation) * BULLET_SPEED + ship.velocity.x * 0.5,
        y: Math.sin(ship.rotation) * BULLET_SPEED + ship.velocity.y * 0.5,
      },
      lifetime: BULLET_LIFETIME,
    });
  }

  // Update bullets
  newBullets = newBullets
    .map((bullet) => ({
      ...bullet,
      position: wrapPosition(
        {
          x: bullet.position.x + bullet.velocity.x,
          y: bullet.position.y + bullet.velocity.y,
        },
        width,
        height
      ),
      lifetime: bullet.lifetime - 1,
    }))
    .filter((bullet) => bullet.lifetime > 0);

  // Update asteroids
  let newAsteroids = asteroids.map((asteroid) => ({
    ...asteroid,
    position: wrapPosition(
      {
        x: asteroid.position.x + asteroid.velocity.x,
        y: asteroid.position.y + asteroid.velocity.y,
      },
      width,
      height
    ),
    rotation: asteroid.rotation + asteroid.rotationSpeed,
  }));

  // Check bullet-asteroid collisions
  const bulletsToRemove = new Set<number>();
  const asteroidsToRemove = new Set<number>();
  const newAsteroidsToAdd: Asteroid[] = [];

  for (const bullet of newBullets) {
    for (const asteroid of newAsteroids) {
      if (
        checkCollision(
          bullet.position,
          4,
          asteroid.position,
          asteroid.radius * 0.8
        )
      ) {
        bulletsToRemove.add(bullet.id);
        asteroidsToRemove.add(asteroid.id);

        // Score based on asteroid size
        if (asteroid.radius > 30) {
          score += 20;
        } else if (asteroid.radius > 15) {
          score += 50;
        } else {
          score += 100;
        }

        // Split asteroid
        if (asteroid.radius > 15) {
          const newRadius = asteroid.radius * 0.5;
          const angle1 = Math.random() * Math.PI * 2;
          const angle2 = angle1 + Math.PI;
          const speed = 2 + Math.random() * 2;

          newAsteroidsToAdd.push(
            createAsteroid(asteroid.position.x, asteroid.position.y, newRadius, {
              x: Math.cos(angle1) * speed,
              y: Math.sin(angle1) * speed,
            }),
            createAsteroid(asteroid.position.x, asteroid.position.y, newRadius, {
              x: Math.cos(angle2) * speed,
              y: Math.sin(angle2) * speed,
            })
          );
        }
      }
    }
  }

  newBullets = newBullets.filter((b) => !bulletsToRemove.has(b.id));
  newAsteroids = newAsteroids.filter((a) => !asteroidsToRemove.has(a.id));
  newAsteroids = [...newAsteroids, ...newAsteroidsToAdd];

  // Check ship-asteroid collision
  let gameOver: boolean = state.gameOver;
  if (!ship.invincible) {
    for (const asteroid of newAsteroids) {
      if (
        checkCollision(
          ship.position,
          ship.radius * 0.7,
          asteroid.position,
          asteroid.radius * 0.8
        )
      ) {
        lives--;
        if (lives <= 0) {
          gameOver = true;
        } else {
          // Respawn ship
          ship = {
            ...ship,
            position: { x: width / 2, y: height / 2 },
            velocity: { x: 0, y: 0 },
            invincible: true,
            invincibleTimer: INVINCIBLE_TIME,
          };
        }
        break;
      }
    }
  }

  // Check level complete
  if (newAsteroids.length === 0 && !gameOver) {
    level++;
    const newLevelState = createInitialState(width, height, level);
    return {
      ...newLevelState,
      ship: {
        ...ship,
        position: { x: width / 2, y: height / 2 },
        velocity: { x: 0, y: 0 },
        invincible: true,
        invincibleTimer: INVINCIBLE_TIME,
      },
      score,
      lives,
      level,
    };
  }

  return {
    ship,
    asteroids: newAsteroids,
    bullets: newBullets,
    score,
    lives,
    level,
    gameOver,
    paused: state.paused,
  };
}

export function drawGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  width: number,
  height: number,
  thrusting: boolean
) {
  // Clear canvas
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);

  const { ship, asteroids, bullets } = state;

  // Draw bullets
  ctx.fillStyle = "#fff";
  for (const bullet of bullets) {
    ctx.beginPath();
    ctx.arc(bullet.position.x, bullet.position.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw asteroids
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  for (const asteroid of asteroids) {
    ctx.save();
    ctx.translate(asteroid.position.x, asteroid.position.y);
    ctx.rotate(asteroid.rotation);

    ctx.beginPath();
    ctx.moveTo(asteroid.vertices[0].x, asteroid.vertices[0].y);
    for (let i = 1; i < asteroid.vertices.length; i++) {
      ctx.lineTo(asteroid.vertices[i].x, asteroid.vertices[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }

  // Draw ship (if not in game over and visible during invincibility)
  if (!state.gameOver) {
    const visible = !ship.invincible || Math.floor(ship.invincibleTimer / 10) % 2 === 0;

    if (visible) {
      ctx.save();
      ctx.translate(ship.position.x, ship.position.y);
      ctx.rotate(ship.rotation);

      // Ship body
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(-15, -12);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-15, 12);
      ctx.closePath();
      ctx.stroke();

      // Thrust flame
      if (thrusting) {
        ctx.strokeStyle = "#ff6600";
        ctx.beginPath();
        ctx.moveTo(-10, -6);
        ctx.lineTo(-25 - Math.random() * 10, 0);
        ctx.lineTo(-10, 6);
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}

export function loadHighScore(): number {
  if (typeof window === "undefined") return 0;
  const saved = localStorage.getItem("asteroids-high-score");
  return saved ? parseInt(saved, 10) : 0;
}

export function saveHighScore(score: number): void {
  if (typeof window === "undefined") return;
  const current = loadHighScore();
  if (score > current) {
    localStorage.setItem("asteroids-high-score", score.toString());
  }
}
