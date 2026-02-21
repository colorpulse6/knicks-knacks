import {
  type Particle,
  type Brick,
  type Vector2,
  PARTICLES_PER_BRICK,
  PARTICLE_LIFETIME,
  PARTICLE_GRAVITY,
  MAX_PARTICLES,
} from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function hueShift(hexColor: string, shift: number): string {
  // Simple brightness variation rather than full HSL conversion
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `rgb(${clamp(r + shift)}, ${clamp(g + shift)}, ${clamp(b + shift)})`;
}

// ─── Brick Destruction Particles ─────────────────────────────────────

export function createBrickParticles(brick: Brick): Particle[] {
  const cx = brick.x + brick.width / 2;
  const cy = brick.y + brick.height / 2;
  const particles: Particle[] = [];

  for (let i = 0; i < PARTICLES_PER_BRICK; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomRange(2, 6);
    const lifetime = PARTICLE_LIFETIME + Math.round(randomRange(-5, 5));
    const shift = Math.round(randomRange(-30, 30));

    particles.push({
      position: { x: cx + randomRange(-5, 5), y: cy + randomRange(-5, 5) },
      velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
      color: hueShift(brick.color, shift),
      lifetime,
      maxLifetime: lifetime,
      size: randomRange(2, 5),
    });
  }

  return particles;
}

// ─── Explosion Particles (for explosive bricks) ─────────────────────

export function createExplosionParticles(brick: Brick): Particle[] {
  const cx = brick.x + brick.width / 2;
  const cy = brick.y + brick.height / 2;
  const particles: Particle[] = [];
  const count = PARTICLES_PER_BRICK * 2;

  const fireColors = ["#FF6600", "#FF3300", "#FFD700", "#FF4444", "#FFAA00"];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomRange(3, 10);
    const lifetime = PARTICLE_LIFETIME + Math.round(randomRange(-5, 10));
    const color =
      i % 2 === 0
        ? fireColors[Math.floor(Math.random() * fireColors.length)]
        : hueShift(brick.color, Math.round(randomRange(-20, 20)));

    particles.push({
      position: { x: cx + randomRange(-8, 8), y: cy + randomRange(-8, 8) },
      velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
      color,
      lifetime,
      maxLifetime: lifetime,
      size: randomRange(2, 6),
    });
  }

  return particles;
}

// ─── Power-Up Collection Particles ───────────────────────────────────

export function createPowerUpParticles(
  position: Vector2,
  color: string
): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomRange(2, 5);
    const lifetime = 20 + Math.round(randomRange(-3, 3));

    particles.push({
      position: { x: position.x, y: position.y },
      velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
      color,
      lifetime,
      maxLifetime: lifetime,
      size: randomRange(2, 4),
    });
  }

  return particles;
}

// ─── Update Particles ────────────────────────────────────────────────

export function updateParticles(particles: Particle[]): Particle[] {
  const updated: Particle[] = [];

  for (const p of particles) {
    const newLifetime = p.lifetime - 1;
    if (newLifetime <= 0) continue;

    updated.push({
      ...p,
      position: {
        x: p.position.x + p.velocity.x,
        y: p.position.y + p.velocity.y,
      },
      velocity: {
        x: p.velocity.x * 0.97,
        y: p.velocity.y * 0.97 + PARTICLE_GRAVITY,
      },
      lifetime: newLifetime,
    });
  }

  return updated;
}

// ─── Cap particle count ──────────────────────────────────────────────

export function capParticles(particles: Particle[]): Particle[] {
  if (particles.length <= MAX_PARTICLES) return particles;
  // Remove oldest (lowest lifetime) particles
  return particles
    .sort((a, b) => b.lifetime - a.lifetime)
    .slice(0, MAX_PARTICLES);
}

// ─── Particle Alpha ──────────────────────────────────────────────────

export function getParticleAlpha(particle: Particle): number {
  return particle.lifetime / particle.maxLifetime;
}
