const cache = new Map<string, HTMLImageElement>();
const loading = new Map<string, Promise<HTMLImageElement>>();

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function loadSprite(path: string): Promise<HTMLImageElement> {
  const fullPath = basePath + path;
  const cached = cache.get(fullPath);
  if (cached) return Promise.resolve(cached);

  const pending = loading.get(fullPath);
  if (pending) return pending;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      cache.set(fullPath, img);
      loading.delete(fullPath);
      resolve(img);
    };
    img.onerror = () => {
      loading.delete(fullPath);
      reject(new Error(`Failed to load sprite: ${fullPath}`));
    };
    img.src = fullPath;
  });

  loading.set(fullPath, promise);
  return promise;
}

export function getSprite(path: string): HTMLImageElement | null {
  return cache.get(basePath + path) ?? null;
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  sheet: HTMLImageElement,
  frameIndex: number,
  frameWidth: number,
  frameHeight: number,
  x: number,
  y: number,
  drawWidth: number,
  drawHeight: number
): void {
  const cols = Math.floor(sheet.width / frameWidth);
  const col = frameIndex % cols;
  const row = Math.floor(frameIndex / cols);

  ctx.drawImage(
    sheet,
    col * frameWidth,
    row * frameHeight,
    frameWidth,
    frameHeight,
    x,
    y,
    drawWidth,
    drawHeight
  );
}

// ─── Sprite Paths ────────────────────────────────────────────────────

export const SPRITES = {
  // Player ship (3 frames side-by-side: bank-left, center, bank-right)
  PLAYER: "/sprites/ships/player.png",

  // Enemies
  ENEMY_SCOUT: "/sprites/enemies/scout.png",
  ENEMY_DRONE: "/sprites/enemies/drone.png",
  ENEMY_GUNNER: "/sprites/enemies/gunner.png",
  ENEMY_SHIELDER: "/sprites/enemies/shielder.png",
  ENEMY_BOMBER: "/sprites/enemies/bomber.png",
  ENEMY_SWARM: "/sprites/enemies/swarm.png",
  ENEMY_TURRET: "/sprites/enemies/turret.png",
  ENEMY_CLOAKER: "/sprites/enemies/cloaker.png",
  ENEMY_ELITE: "/sprites/enemies/elite.png",
  ENEMY_MINE: "/sprites/enemies/mine.png",
  ENEMY_WRAITH: "/sprites/enemies/wraith.png",
  ENEMY_ECHO: "/sprites/enemies/echo.png",
  ENEMY_MIRROR: "/sprites/enemies/mirror.png",

  // Bullets
  PLAYER_BULLETS: "/sprites/bullets/player-bullets.png",
  ENEMY_BULLETS: "/sprites/bullets/enemy-bullet.png",

  // Power-ups (6 icons in a row)
  POWERUPS: "/sprites/powerups/powerups.png",

  // Effects
  EXPLOSION: "/sprites/effects/explosion.png",

  // Bosses
  BOSS_ROCKJAW: "/sprites/bosses/rockjaw.png",
  BOSS_GLACIUS: "/sprites/bosses/glacius.png",
  BOSS_CINDERMAW: "/sprites/bosses/cindermaw.png",
  BOSS_NYXAR: "/sprites/bosses/nyxar.png",
  BOSS_REVENANT: "/sprites/bosses/revenant.png",
  BOSS_BEACON: "/sprites/bosses/beacon.png",
  BOSS_REFLECTION: "/sprites/bosses/reflection.png",
  BOSS_HOLLOW_MIND: "/sprites/bosses/hollow-mind.png",

  // Backgrounds — World 1: Aurelia Belt
  BG_AURELIA_FAR: "/sprites/backgrounds/aurelia-far.png",
  BG_AURELIA_MID: "/sprites/backgrounds/aurelia-mid.png",
  BG_AURELIA_NEAR: "/sprites/backgrounds/aurelia-near.png",
  // Backgrounds — World 2: Cryon Nebula
  BG_CRYON_FAR: "/sprites/backgrounds/cryon-far.png",
  BG_CRYON_MID: "/sprites/backgrounds/cryon-mid.png",
  BG_CRYON_NEAR: "/sprites/backgrounds/cryon-near.png",
  // Backgrounds — World 3: Ignis Rift
  BG_IGNIS_FAR: "/sprites/backgrounds/ignis-far.png",
  BG_IGNIS_MID: "/sprites/backgrounds/ignis-mid.png",
  BG_IGNIS_NEAR: "/sprites/backgrounds/ignis-near.png",
  // Backgrounds — World 4: The Graveyard
  BG_GRAVEYARD_FAR: "/sprites/backgrounds/graveyard-far.png",
  BG_GRAVEYARD_MID: "/sprites/backgrounds/graveyard-mid.png",
  BG_GRAVEYARD_NEAR: "/sprites/backgrounds/graveyard-near.png",
  // Backgrounds — World 5: Void Abyss
  BG_VOID_FAR: "/sprites/backgrounds/void-far.png",
  BG_VOID_MID: "/sprites/backgrounds/void-mid.png",
  BG_VOID_NEAR: "/sprites/backgrounds/void-near.png",
  // Backgrounds — World 6: The Scar
  BG_SCAR_FAR: "/sprites/backgrounds/scar-far.png",
  BG_SCAR_MID: "/sprites/backgrounds/scar-mid.png",
  BG_SCAR_NEAR: "/sprites/backgrounds/scar-near.png",
  // Backgrounds — World 7: The Fold
  BG_FOLD_FAR: "/sprites/backgrounds/fold-far.png",
  BG_FOLD_MID: "/sprites/backgrounds/fold-mid.png",
  BG_FOLD_NEAR: "/sprites/backgrounds/fold-near.png",
  // Portraits
  PORTRAIT_VOSS: "/sprites/portraits/voss.png",
  PORTRAIT_REYES: "/sprites/portraits/reyes.png",
  PORTRAIT_KAEL: "/sprites/portraits/kael.png",
  PORTRAIT_HOLLOW: "/sprites/portraits/hollow.png",

  // Backgrounds — World 8: The Hollow Core
  BG_HOLLOW_FAR: "/sprites/backgrounds/hollow-far.png",
  BG_HOLLOW_MID: "/sprites/backgrounds/hollow-mid.png",
  BG_HOLLOW_NEAR: "/sprites/backgrounds/hollow-near.png",

  // Star Map
  MAP_BG: "/sprites/map/map.png",
  MAP_SHIP: "/sprites/map/ship-cursor.png",
  MAP_WORLD_1: "/sprites/map/world-1.png",
  MAP_WORLD_2: "/sprites/map/world-2.png",
  MAP_WORLD_3: "/sprites/map/world-3.png",
  MAP_WORLD_4: "/sprites/map/world-4.png",
  MAP_WORLD_5: "/sprites/map/world-5.png",
  MAP_WORLD_6: "/sprites/map/world-6.png",
  MAP_WORLD_7: "/sprites/map/world-7.png",
  MAP_WORLD_8: "/sprites/map/world-8.png",

  // Cockpit Hub
  COCKPIT_BG: "/sprites/cockpit/cockpit-bg.png",
  ARMORY_BG: "/sprites/cockpit/armory-bg.png",
  CREW_BG: "/sprites/cockpit/crew-bg.png",
  MISSIONS_BG: "/sprites/cockpit/missions-bg.png",
  CODEX_BG: "/sprites/cockpit/codex-bg.png",
  UPGRADE_ICONS: "/sprites/cockpit/upgrade-icons.png",

  // Ending Scenes
  ENDING_1: "/sprites/ending/scene-1.png",
  ENDING_2: "/sprites/ending/scene-2.png",
  ENDING_3: "/sprites/ending/scene-3.png",
  ENDING_4: "/sprites/ending/scene-4.png",
};

export async function preloadAll(): Promise<void> {
  const paths = Object.values(SPRITES);
  await Promise.allSettled(paths.map(loadSprite));
}

export function isLoaded(): boolean {
  return loading.size === 0;
}
