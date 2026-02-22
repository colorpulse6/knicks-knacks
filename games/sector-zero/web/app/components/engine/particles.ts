import type { Particle } from "./types";

export function createExplosion(
  x: number,
  y: number,
  count: number,
  color: string
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 1 + Math.random() * 3;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 20 + Math.random() * 20,
      maxLife: 40,
      size: 1 + Math.random() * 3,
      color,
      type: "explosion",
    });
  }
  return particles;
}

export function createSparks(
  x: number,
  y: number,
  count: number,
  color: string
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 10 + Math.random() * 15,
      maxLife: 25,
      size: 0.5 + Math.random() * 1.5,
      color,
      type: "spark",
    });
  }
  return particles;
}

export function createEngineTrail(
  x: number,
  y: number
): Particle {
  return {
    x: x + (Math.random() - 0.5) * 6,
    y,
    vx: (Math.random() - 0.5) * 0.3,
    vy: 1 + Math.random() * 2,
    life: 8 + Math.random() * 8,
    maxLife: 16,
    size: 1 + Math.random() * 2,
    color: "#44ccff",
    type: "trail",
  };
}

export function updateParticles(particles: Particle[]): Particle[] {
  return particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      life: p.life - 1,
      vx: p.vx * 0.98,
      vy: p.vy * 0.98,
    }))
    .filter((p) => p.life > 0);
}

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[]
): void {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;

    if (p.type === "explosion") {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 + (1 - alpha) * 1.5), 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === "trail") {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  }
  ctx.globalAlpha = 1;
}
