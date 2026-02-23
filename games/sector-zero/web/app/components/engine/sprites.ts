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

  // Planet Mission Backgrounds (3 parallax layers each)
  // Planet 1: Verdania (Jungle)
  BG_VERDANIA_FAR: "/sprites/backgrounds/verdania-far.png",
  BG_VERDANIA_MID: "/sprites/backgrounds/verdania-mid.png",
  BG_VERDANIA_NEAR: "/sprites/backgrounds/verdania-near.png",
  // Planet 2: Glaciem (Arctic)
  BG_GLACIEM_FAR: "/sprites/backgrounds/glaciem-far.png",
  BG_GLACIEM_MID: "/sprites/backgrounds/glaciem-mid.png",
  BG_GLACIEM_NEAR: "/sprites/backgrounds/glaciem-near.png",
  // Planet 3: Pyraxis (Volcanic)
  BG_PYRAXIS_FAR: "/sprites/backgrounds/pyraxis-far.png",
  BG_PYRAXIS_MID: "/sprites/backgrounds/pyraxis-mid.png",
  BG_PYRAXIS_NEAR: "/sprites/backgrounds/pyraxis-near.png",
  // Planet 4: Ossuary (Ancient Ruins)
  BG_OSSUARY_FAR: "/sprites/backgrounds/ossuary-far.png",
  BG_OSSUARY_MID: "/sprites/backgrounds/ossuary-mid.png",
  BG_OSSUARY_NEAR: "/sprites/backgrounds/ossuary-near.png",
  // Planet 5: Abyssia (Ocean/Deep Sea)
  BG_ABYSSIA_FAR: "/sprites/backgrounds/abyssia-far.png",
  BG_ABYSSIA_MID: "/sprites/backgrounds/abyssia-mid.png",
  BG_ABYSSIA_NEAR: "/sprites/backgrounds/abyssia-near.png",
  // Planet 6: Ashfall (Desert)
  BG_ASHFALL_FAR: "/sprites/backgrounds/ashfall-far.png",
  BG_ASHFALL_MID: "/sprites/backgrounds/ashfall-mid.png",
  BG_ASHFALL_NEAR: "/sprites/backgrounds/ashfall-near.png",
  // Planet 7: Prismara (Crystal Caves)
  BG_PRISMARA_FAR: "/sprites/backgrounds/prismara-far.png",
  BG_PRISMARA_MID: "/sprites/backgrounds/prismara-mid.png",
  BG_PRISMARA_NEAR: "/sprites/backgrounds/prismara-near.png",
  // Planet 8: Genesis (Overgrown Paradise)
  BG_GENESIS_FAR: "/sprites/backgrounds/genesis-far.png",
  BG_GENESIS_MID: "/sprites/backgrounds/genesis-mid.png",
  BG_GENESIS_NEAR: "/sprites/backgrounds/genesis-near.png",

  // Planet 9: Luminos (Neon City)
  BG_LUMINOS_FAR: "/sprites/backgrounds/luminos-far.png",
  BG_LUMINOS_MID: "/sprites/backgrounds/luminos-mid.png",
  BG_LUMINOS_NEAR: "/sprites/backgrounds/luminos-near.png",
  // Planet 10: Bastion (Fortress City)
  BG_BASTION_FAR: "/sprites/backgrounds/bastion-far.png",
  BG_BASTION_MID: "/sprites/backgrounds/bastion-mid.png",
  BG_BASTION_NEAR: "/sprites/backgrounds/bastion-near.png",

  // Planet Map Icons (thumbnail for star map)
  MAP_PLANET_1: "/sprites/map/planet-verdania.png",
  MAP_PLANET_2: "/sprites/map/planet-glaciem.png",
  MAP_PLANET_3: "/sprites/map/planet-pyraxis.png",
  MAP_PLANET_4: "/sprites/map/planet-ossuary.png",
  MAP_PLANET_5: "/sprites/map/planet-abyssia.png",
  MAP_PLANET_6: "/sprites/map/planet-ashfall.png",
  MAP_PLANET_7: "/sprites/map/planet-prismara.png",
  MAP_PLANET_8: "/sprites/map/planet-genesis.png",
  MAP_PLANET_9: "/sprites/map/planet-luminos.png",
  MAP_PLANET_10: "/sprites/map/planet-bastion.png",

  // Planet Mission Entities
  ESCORT_SHIP: "/sprites/ships/escort-ship.png",
  DEFEND_STRUCTURE: "/sprites/effects/defend-structure.png",
  COLLECTIBLE_ORB: "/sprites/effects/collectible-orb.png",
};

export async function preloadAll(): Promise<void> {
  const paths = Object.values(SPRITES);
  await Promise.allSettled(paths.map(loadSprite));
}

export function isLoaded(): boolean {
  return loading.size === 0;
}
