import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GAME_AREA_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_MAX_HP,
  PLAYER_INVINCIBLE_FRAMES,
  PLAYER_FIRE_RATE,
  COMBO_WINDOW,
  COMBO_MAX,
  GameScreen,
  PowerUpType,
  AudioEvent,
  EnemyType,
  POWER_UP_DURATION,
  type GameState,
  type Player,
  type Keys,
  type ActivePowerUp,
  type Particle,
  type Wave,
  type PowerUp,
  type Bullet,
  type ShipUpgrades,
  DEFAULT_UPGRADES,
} from "./types";
import { createBackground, updateBackground } from "./background";
import { updateParticles, createExplosion, createSparks, createEngineTrail } from "./particles";
import { firePlayerWeapon, fireSideGunners, updateBullets } from "./weapons";
import {
  updateEnemy,
  enemyShouldFire,
  fireEnemyBullet,
  isEnemyOffscreen,
  spawnFormation,
  resetEnemyIds,
} from "./enemies";
import { resetBulletIds } from "./weapons";
import { aabbOverlap } from "./physics";
import { getLevelData } from "./levels";
import { clamp } from "./physics";
import { createBossForWorld, updateBossForWorld, isBossDefeated, resetBossBulletIds } from "./bosses";
import { createDialogState, updateDialog, checkDialogTriggers, getDialogTriggers } from "./dialog";

// ─── Power-Up Spawning ──────────────────────────────────────────────

let powerUpIdCounter = 0;

export function resetPowerUpIds(): void {
  powerUpIdCounter = 0;
}

function createPowerUp(type: PowerUpType, x: number, y: number): PowerUp {
  return {
    id: ++powerUpIdCounter,
    type,
    x: x - 12,
    y,
    width: 24,
    height: 24,
    vy: 1.5,
  };
}

// Drop rate by enemy type (0 = never drops)
const DROP_RATES: Partial<Record<EnemyType, number>> = {
  [EnemyType.ELITE]: 0.6,
  [EnemyType.TURRET]: 0.35,
  [EnemyType.SHIELDER]: 0.35,
  [EnemyType.GUNNER]: 0.3,
  [EnemyType.BOMBER]: 0.25,
  [EnemyType.CLOAKER]: 0.25,
  [EnemyType.DRONE]: 0.2,
  [EnemyType.SCOUT]: 0.15,
  // SWARM and MINE: no entry → 0
};

// Weighted type selection
const POWER_UP_WEIGHTS: [PowerUpType, number][] = [
  [PowerUpType.WEAPON_UP, 25],
  [PowerUpType.SHIELD, 20],
  [PowerUpType.RAPID_FIRE, 18],
  [PowerUpType.SPEED, 12],
  [PowerUpType.SIDE_GUNNERS, 10],
  [PowerUpType.BOMB, 10],
  [PowerUpType.MAGNET, 5],
];

const TOTAL_WEIGHT = POWER_UP_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);

function pickRandomPowerUpType(): PowerUpType {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const [type, weight] of POWER_UP_WEIGHTS) {
    roll -= weight;
    if (roll <= 0) return type;
  }
  return PowerUpType.WEAPON_UP;
}

const MAX_POWERUPS_ON_SCREEN = 6;

// ─── Create State ────────────────────────────────────────────────────

export function createPlayer(upgrades: ShipUpgrades = DEFAULT_UPGRADES): Player {
  return {
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: GAME_AREA_HEIGHT - 100,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    hp: PLAYER_MAX_HP + upgrades.hullPlating,
    maxHp: PLAYER_MAX_HP + upgrades.hullPlating,
    speed: PLAYER_SPEED + upgrades.engineBoost * 0.5,
    weaponLevel: 1 + upgrades.weaponCore,
    invincibleTimer: 0,
    fireTimer: 0,
    energy: 100,
    maxEnergy: 100,
  };
}

// Store current upgrades so handlePlayerShooting and updatePowerUps can reference them
let currentUpgrades: ShipUpgrades = { ...DEFAULT_UPGRADES };

export function createGameState(world: number, level: number, upgrades: ShipUpgrades = DEFAULT_UPGRADES): GameState {
  currentUpgrades = { ...upgrades };
  resetEnemyIds();
  resetBulletIds();
  resetBossBulletIds();
  resetPowerUpIds();

  const levelData = getLevelData(world, level);
  const waves: Wave[] = (levelData?.waves ?? []).map((def) => ({
    definition: def,
    spawned: false,
    enemiesRemaining: def.enemies.reduce((sum, e) => sum + e.count, 0),
  }));

  // Briefing duration: longer if world intro text exists
  const hasWorldIntro = !!levelData?.worldIntroText;
  const briefingTimer = hasWorldIntro ? 720 : 480;

  return {
    screen: GameScreen.BRIEFING,
    player: createPlayer(upgrades),
    playerBullets: [],
    enemyBullets: [],
    enemies: [],
    boss: null,
    powerUps: [],
    activePowerUps: [],
    particles: [],
    background: createBackground(),
    score: 0,
    combo: 0,
    comboTimer: 0,
    maxCombo: 0,
    lives: 3,
    bombs: 2 + upgrades.munitionsBay,
    bombCooldown: 0,
    currentWorld: world,
    currentLevel: level,
    currentWave: 0,
    totalWaves: waves.length,
    waves,
    waveDelay: 120,
    kills: 0,
    totalEnemies: waves.reduce((sum, w) => sum + w.enemiesRemaining, 0),
    deaths: 0,
    frameCount: 0,
    screenShake: 0,
    audioEvents: [],
    bossIntroTimer: 0,
    briefingTimer,
    levelCompleteTimer: 0,
    devInvincible: false,
    dialog: createDialogState(),
    dialogTriggers: getDialogTriggers(world, level),
    xp: 0,
    hpWarningTriggered: false,
  };
}

// ─── Update ──────────────────────────────────────────────────────────

export function updateGame(
  state: GameState,
  keys: Keys,
  touchX: number | null,
  touchY: number | null
): GameState {
  // Briefing screen: countdown + animate background
  if (state.screen === GameScreen.BRIEFING) {
    return updateBriefingScreen(state);
  }

  // Boss intro screen: countdown + dramatic effects
  if (state.screen === GameScreen.BOSS_INTRO) {
    return updateBossIntroScreen(state);
  }

  // Boss fight: full gameplay + boss logic
  if (state.screen === GameScreen.BOSS_FIGHT) {
    return updateBossFight(state, keys, touchX, touchY);
  }

  if (state.screen !== GameScreen.PLAYING) return state;

  let s = { ...state, audioEvents: [] as AudioEvent[], frameCount: state.frameCount + 1 };

  // Update background
  s.background = updateBackground(s.background);

  // Update player
  s = updatePlayer(s, keys, touchX, touchY);

  // Spawn waves (track previous wave for dialog triggers)
  const prevWave = s.currentWave;
  s = spawnWaves(s);

  // Update enemies
  s = updateEnemies(s);

  // Player shooting
  s = handlePlayerShooting(s, keys);

  // Bomb activation
  s = handleBomb(s, keys);

  // Update bullets
  s.playerBullets = updateBullets(s.playerBullets, GAME_AREA_HEIGHT);
  s.enemyBullets = updateBullets(s.enemyBullets, GAME_AREA_HEIGHT);

  // Collisions
  s = handleCollisions(s);

  // Update power-ups
  s = updatePowerUps(s);

  // Update particles
  s.particles = updateParticles(s.particles);

  // Engine trail
  if (s.frameCount % 2 === 0) {
    s.particles = [
      ...s.particles,
      createEngineTrail(
        s.player.x + s.player.width / 2,
        s.player.y + s.player.height
      ),
    ];
  }

  // Combo decay
  if (s.comboTimer > 0) {
    s.comboTimer -= 1;
    if (s.comboTimer <= 0) {
      s.combo = 0;
    }
  }

  // Screen shake decay
  if (s.screenShake > 0) {
    s.screenShake = Math.max(0, s.screenShake - 0.5);
  }

  // Dialog: wave_start trigger when wave advances
  if (s.currentWave !== prevWave) {
    const dr = checkDialogTriggers(s.dialogTriggers, { type: "wave_start", wave: s.currentWave }, s.dialog);
    s.dialog = dr.dialog;
    s.dialogTriggers = dr.triggers;
  }

  // Tick dialog
  s.dialog = updateDialog(s.dialog);

  // Check level complete or boss trigger
  if (s.currentWave >= s.totalWaves && s.enemies.length === 0 && !s.boss) {
    if (s.waveDelay <= 0) {
      const levelData = getLevelData(s.currentWorld, s.currentLevel);
      if (levelData?.isBoss) {
        // Transition to boss intro
        s.screen = GameScreen.BOSS_INTRO;
        s.bossIntroTimer = 180;
      } else if (s.levelCompleteTimer === 0) {
        // Start the level-complete banner (stays in PLAYING)
        s.levelCompleteTimer = 360; // 6 seconds
        s.xp += 500; // XP for level completion
        s.audioEvents.push(AudioEvent.LEVEL_COMPLETE);
        // Fire level_complete dialog
        const dr = checkDialogTriggers(s.dialogTriggers, { type: "level_complete" }, s.dialog);
        s.dialog = dr.dialog;
        s.dialogTriggers = dr.triggers;
      }
    }
  }

  // Level complete timer countdown — auto-advance to next level
  if (s.levelCompleteTimer > 0) {
    s.levelCompleteTimer -= 1;
    if (s.levelCompleteTimer <= 0) {
      // Auto-advance to next level
      const nextLv = s.currentLevel + 1;
      const nextWorld = s.currentWorld;
      const nextLevelData = getLevelData(nextWorld, nextLv);
      if (nextLevelData) {
        // Carry over score, kills, etc. into the new level state
        const carryScore = s.score;
        const carryLives = s.lives;
        const carryWeapon = s.player.weaponLevel;
        const carryKills = s.kills;
        const carryDeaths = s.deaths;
        const carryMaxCombo = s.maxCombo;
        const carryInvincible = s.devInvincible;
        const carryPowerUps = s.activePowerUps;

        const newState = createGameState(nextWorld, nextLv, currentUpgrades);
        return {
          ...newState,
          score: carryScore,
          lives: carryLives,
          kills: carryKills,
          deaths: carryDeaths,
          maxCombo: carryMaxCombo,
          devInvincible: carryInvincible,
          activePowerUps: carryPowerUps,
          player: { ...newState.player, weaponLevel: carryWeapon },
        };
      } else {
        // No more levels — show the full LEVEL_COMPLETE screen
        s.screen = GameScreen.LEVEL_COMPLETE;
      }
    }
  }

  // Check game over
  if (s.lives <= 0 && s.player.hp <= 0) {
    s.screen = GameScreen.GAME_OVER;
    s.audioEvents.push(AudioEvent.GAME_OVER);
  }

  return s;
}

// ─── Briefing Screen ────────────────────────────────────────────────

function updateBriefingScreen(state: GameState): GameState {
  let s = { ...state, frameCount: state.frameCount + 1, audioEvents: [] as AudioEvent[] };
  s.background = updateBackground(s.background);
  s.briefingTimer -= 1;

  if (s.briefingTimer <= 0) {
    s.screen = GameScreen.PLAYING;
    // Fire level_start dialog triggers
    const result = checkDialogTriggers(s.dialogTriggers, { type: "level_start" }, s.dialog);
    s.dialog = result.dialog;
    s.dialogTriggers = result.triggers;
  }
  return s;
}

// ─── Boss Intro Screen ──────────────────────────────────────────────

function updateBossIntroScreen(state: GameState): GameState {
  let s = { ...state, frameCount: state.frameCount + 1, audioEvents: [] as AudioEvent[] };
  s.background = updateBackground(s.background);
  s.particles = updateParticles(s.particles);
  s.bossIntroTimer -= 1;

  // Fire boss_intro dialog on first frame
  if (s.bossIntroTimer === 179) {
    const result = checkDialogTriggers(s.dialogTriggers, { type: "boss_intro" }, s.dialog);
    s.dialog = result.dialog;
    s.dialogTriggers = result.triggers;
  }

  // Periodic screen shake for drama
  if (s.bossIntroTimer > 60 && s.frameCount % 10 === 0) {
    s.screenShake = 2;
  }
  if (s.screenShake > 0) {
    s.screenShake = Math.max(0, s.screenShake - 0.5);
  }

  // Tick dialog during boss intro
  s.dialog = updateDialog(s.dialog);

  if (s.bossIntroTimer <= 0) {
    s.boss = createBossForWorld(s.currentWorld);
    s.screen = GameScreen.BOSS_FIGHT;
    // Fire level_start triggers for boss fight phase
    const result = checkDialogTriggers(s.dialogTriggers, { type: "level_start" }, s.dialog);
    s.dialog = result.dialog;
    s.dialogTriggers = result.triggers;
  }
  return s;
}

// ─── Boss Fight ─────────────────────────────────────────────────────

function updateBossFight(
  state: GameState,
  keys: Keys,
  touchX: number | null,
  touchY: number | null
): GameState {
  let s = { ...state, audioEvents: [] as AudioEvent[], frameCount: state.frameCount + 1 };
  const prevBossPhase = s.boss?.phase ?? 1;

  s.background = updateBackground(s.background);
  s = updatePlayer(s, keys, touchX, touchY);
  s = handlePlayerShooting(s, keys);
  s = handleBomb(s, keys);

  s.playerBullets = updateBullets(s.playerBullets, GAME_AREA_HEIGHT);
  s.enemyBullets = updateBullets(s.enemyBullets, GAME_AREA_HEIGHT);

  // Update boss
  if (s.boss && !s.boss.defeated) {
    const result = updateBossForWorld(s.currentWorld, s.boss, s.player, s.frameCount);
    s.boss = result.boss;
    // Cap enemy bullets to prevent lag from accumulation
    const combined = [...s.enemyBullets, ...result.bullets];
    s.enemyBullets = combined.length > 80 ? combined.slice(-80) : combined;
    s.enemies = [...s.enemies, ...result.spawnedEnemies];
    s.audioEvents = [...s.audioEvents, ...result.audioEvents];
  }

  // Update minion enemies
  s = updateEnemies(s);

  // Boss collisions
  s = handleBossCollisions(s);

  // Check boss phase change for dialog
  if (s.boss && s.boss.phase !== prevBossPhase) {
    const dr = checkDialogTriggers(s.dialogTriggers, { type: "boss_phase", phase: s.boss.phase }, s.dialog);
    s.dialog = dr.dialog;
    s.dialogTriggers = dr.triggers;
  }

  // Regular enemy/bullet collisions
  s = handleCollisions(s);

  s = updatePowerUps(s);
  s.particles = updateParticles(s.particles);

  if (s.frameCount % 2 === 0) {
    s.particles = [
      ...s.particles,
      createEngineTrail(s.player.x + s.player.width / 2, s.player.y + s.player.height),
    ];
  }

  if (s.comboTimer > 0) {
    s.comboTimer -= 1;
    if (s.comboTimer <= 0) s.combo = 0;
  }

  if (s.screenShake > 0) {
    s.screenShake = Math.max(0, s.screenShake - 0.5);
  }

  // Tick dialog
  s.dialog = updateDialog(s.dialog);

  // Check boss defeated
  if (s.boss && isBossDefeated(s.boss)) {
    s.boss = { ...s.boss, defeated: true };
    s.score += 5000;
    s.xp += 2000; // XP for boss defeat
    s.screenShake = 10;
    s.audioEvents.push(AudioEvent.BOSS_DEFEAT);

    const bcx = s.boss.x + s.boss.width / 2;
    const bcy = s.boss.y + s.boss.height / 2;
    s.particles = [
      ...s.particles,
      ...createExplosion(bcx, bcy, 30, "#ff8844"),
      ...createExplosion(bcx, bcy, 20, "#ffcc44"),
      ...createExplosion(bcx, bcy, 15, "#ffffff"),
    ];

    s.enemyBullets = [];
    s.enemies = [];
    s.screen = GameScreen.LEVEL_COMPLETE;
    s.audioEvents.push(AudioEvent.LEVEL_COMPLETE);

    // Fire boss_defeat dialog
    const dr = checkDialogTriggers(s.dialogTriggers, { type: "boss_defeat" }, s.dialog);
    s.dialog = dr.dialog;
    s.dialogTriggers = dr.triggers;
  }

  // Check game over
  if (s.lives <= 0 && s.player.hp <= 0) {
    s.screen = GameScreen.GAME_OVER;
    s.audioEvents.push(AudioEvent.GAME_OVER);
  }

  return s;
}

// ─── Boss Collisions ────────────────────────────────────────────────

function handleBossCollisions(state: GameState): GameState {
  if (!state.boss || state.boss.defeated) return state;

  let s = { ...state };
  let newParticles = [...s.particles];
  const audioEvents = [...s.audioEvents];
  const destroyedBullets = new Set<number>();

  const boss = s.boss!;
  const weakPoint = boss.parts.find((p) => p.isWeakPoint);

  // Player bullets vs boss
  // Track cumulative damage so multiple bullets in one frame stack correctly
  let bossHp = boss.hp;

  for (const bullet of s.playerBullets) {
    if (destroyedBullets.has(bullet.id)) continue;

    if (aabbOverlap(bullet, boss)) {
      const isVulnerable = weakPoint?.vulnerable ?? false;

      if (isVulnerable) {
        // Mouth open — any hit on the boss deals damage
        if (!bullet.piercing) destroyedBullets.add(bullet.id);

        bossHp = Math.max(0, bossHp - bullet.damage);
        audioEvents.push(AudioEvent.BOSS_HIT);
        newParticles = [
          ...newParticles,
          ...createSparks(bullet.x, bullet.y, 4, "#ff4444"),
        ];
        s.screenShake = Math.max(s.screenShake, 2);
      } else {
        // Mouth closed — deflect
        if (!bullet.piercing) destroyedBullets.add(bullet.id);
        newParticles = [
          ...newParticles,
          ...createSparks(bullet.x, bullet.y, 2, "#888888"),
        ];
      }
    }
  }

  // Apply accumulated damage
  if (bossHp !== boss.hp) {
    s.boss = { ...boss, hp: bossHp };

    // Phase transition
    if (bossHp <= 40 && boss.phase === 1) {
      s.boss = { ...s.boss!, phase: 2, mouthOpen: true, velocityX: boss.velocityX > 0 ? 2 : -2, chargeTimer: 480 };
      audioEvents.push(AudioEvent.BOSS_PHASE);
      s.screenShake = 8;
      newParticles = [
        ...newParticles,
        ...createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, 20, "#ffaa00"),
      ];
    }
  }

  // Boss body contact damage
  if (s.player.invincibleTimer <= 0 && aabbOverlap(boss, s.player)) {
    const hasShield = s.activePowerUps.some((p) => p.type === PowerUpType.SHIELD);
    if (hasShield) {
      audioEvents.push(AudioEvent.SHIELD_HIT);
      newParticles = [
        ...newParticles,
        ...createSparks(s.player.x + s.player.width / 2, s.player.y, 4, "#4488ff"),
      ];
      s.activePowerUps = s.activePowerUps.map((p) =>
        p.type === PowerUpType.SHIELD
          ? { ...p, remainingFrames: p.remainingFrames - 200 }
          : p
      );
    } else {
      s = playerHit(s, audioEvents, newParticles);
      newParticles = s.particles;
    }
    s.screenShake = Math.max(s.screenShake, 5);
  }

  s.playerBullets = s.playerBullets.filter((b) => !destroyedBullets.has(b.id));
  s.particles = newParticles;
  s.audioEvents = audioEvents;

  return s;
}

// ─── Player Movement ─────────────────────────────────────────────────

function updatePlayer(
  state: GameState,
  keys: Keys,
  touchX: number | null,
  touchY: number | null
): GameState {
  const player = { ...state.player };

  // Speed boost from power-up
  const hasSpeedBoost = state.activePowerUps.some((p) => p.type === PowerUpType.SPEED);
  const speed = player.speed * (hasSpeedBoost ? 1.5 : 1);

  if (touchX !== null && touchY !== null) {
    // Touch controls: move towards finger (with offset so ship visible above thumb)
    const targetX = touchX - player.width / 2;
    const targetY = touchY - player.height - 40; // offset above finger
    const dx = targetX - player.x;
    const dy = targetY - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 2) {
      player.x += (dx / dist) * Math.min(speed * 1.5, dist);
      player.y += (dy / dist) * Math.min(speed * 1.5, dist);
    }
  } else {
    // Keyboard controls
    if (keys.left) player.x -= speed;
    if (keys.right) player.x += speed;
    if (keys.up) player.y -= speed;
    if (keys.down) player.y += speed;
  }

  // Clamp to canvas
  player.x = clamp(player.x, 0, CANVAS_WIDTH - player.width);
  player.y = clamp(player.y, 0, GAME_AREA_HEIGHT - player.height);

  // Invincibility timer
  if (state.devInvincible) {
    player.invincibleTimer = 90; // keep flicker active as visual indicator
  } else if (player.invincibleTimer > 0) {
    player.invincibleTimer -= 1;
  }

  // Fire timer
  if (player.fireTimer > 0) {
    player.fireTimer -= 1;
  }

  return { ...state, player };
}

// ─── Player Shooting ─────────────────────────────────────────────────

function handlePlayerShooting(state: GameState, keys: Keys): GameState {
  if (state.player.fireTimer > 0) return state;

  // Auto-fire when touching, or manual with key
  const shouldFire = keys.shoot;
  if (!shouldFire) return state;

  const hasRapidFire = state.activePowerUps.some((p) => p.type === PowerUpType.RAPID_FIRE);
  const baseRate = PLAYER_FIRE_RATE - currentUpgrades.fireControl;
  const fireRate = hasRapidFire ? Math.floor(baseRate / 2) : baseRate;

  const newBullets = firePlayerWeapon(
    state.player,
    state.player.weaponLevel,
    state.activePowerUps
  );

  // Side gunners
  const hasSideGunners = state.activePowerUps.some((p) => p.type === PowerUpType.SIDE_GUNNERS);
  if (hasSideGunners && state.frameCount % 3 === 0) {
    newBullets.push(...fireSideGunners(state.player));
  }

  return {
    ...state,
    playerBullets: [...state.playerBullets, ...newBullets],
    player: { ...state.player, fireTimer: fireRate },
    audioEvents: [...state.audioEvents, AudioEvent.PLAYER_SHOOT],
  };
}

// ─── Wave Spawning ───────────────────────────────────────────────────

function spawnWaves(state: GameState): GameState {
  if (state.waveDelay > 0) {
    return { ...state, waveDelay: state.waveDelay - 1 };
  }

  if (state.currentWave >= state.totalWaves) return state;

  // Only spawn next wave when current enemies are mostly cleared
  if (state.enemies.length > 3) return state;

  const wave = state.waves[state.currentWave];
  if (wave.spawned) {
    // Move to next wave
    return {
      ...state,
      currentWave: state.currentWave + 1,
      waveDelay: 180, // 3s pause between waves
    };
  }

  // Spawn enemies from wave definition
  let newEnemies = [...state.enemies];
  for (const group of wave.definition.enemies) {
    const spawned = spawnFormation(group.type, group.count, group.formation);
    newEnemies = [...newEnemies, ...spawned];
  }

  const newWaves = [...state.waves];
  newWaves[state.currentWave] = { ...wave, spawned: true };

  return {
    ...state,
    enemies: newEnemies,
    waves: newWaves,
  };
}

// ─── Update Enemies ──────────────────────────────────────────────────

function updateEnemies(state: GameState): GameState {
  let newEnemyBullets = [...state.enemyBullets];
  const audioEvents = [...state.audioEvents];

  const updatedEnemies = state.enemies
    .map((e) => {
      const updated = updateEnemy(e, state.player);

      // Enemy shooting
      if (enemyShouldFire(updated)) {
        const bullets = fireEnemyBullet(updated, state.player);
        newEnemyBullets = [...newEnemyBullets, ...bullets];
        audioEvents.push(AudioEvent.ENEMY_SHOOT);
        return { ...updated, fireTimer: updated.fireRate };
      }

      return { ...updated, fireTimer: updated.fireTimer - 1 };
    })
    .filter((e) => !isEnemyOffscreen(e));

  return {
    ...state,
    enemies: updatedEnemies,
    enemyBullets: newEnemyBullets,
    audioEvents,
  };
}

// ─── Collisions ──────────────────────────────────────────────────────

function handleCollisions(state: GameState): GameState {
  let s = { ...state };
  let newParticles = [...s.particles];
  const audioEvents = [...s.audioEvents];
  const destroyedBullets = new Set<number>();
  const destroyedEnemies = new Set<number>();

  // Player bullets → Enemies
  for (const bullet of s.playerBullets) {
    if (destroyedBullets.has(bullet.id)) continue;

    for (const enemy of s.enemies) {
      if (destroyedEnemies.has(enemy.id)) continue;
      if (enemy.cloaked) continue;

      if (aabbOverlap(bullet, enemy)) {
        if (!bullet.piercing) {
          destroyedBullets.add(bullet.id);
        }

        const newHp = enemy.hp - bullet.damage;

        if (newHp <= 0) {
          destroyedEnemies.add(enemy.id);
          audioEvents.push(AudioEvent.ENEMY_DESTROY);

          // Explosion particles
          const ecx = enemy.x + enemy.width / 2;
          const ecy = enemy.y + enemy.height / 2;
          newParticles = [
            ...newParticles,
            ...createExplosion(ecx, ecy, 12, "#ff8844"),
            ...createSparks(ecx, ecy, 6, "#ffcc44"),
          ];

          // Score and XP with combo
          const comboMultiplier = Math.min(1 + s.combo * 0.5, COMBO_MAX);
          const earnedScore = Math.floor(enemy.score * comboMultiplier);
          s.score += earnedScore;
          s.xp += earnedScore;
          s.combo += 1;
          s.comboTimer = COMBO_WINDOW;
          s.maxCombo = Math.max(s.maxCombo, s.combo);
          s.kills += 1;

          if (s.combo >= 3) {
            audioEvents.push(AudioEvent.COMBO);
          }

          // Screen shake
          s.screenShake = Math.max(s.screenShake, 3);

          // Power-up drop
          const dropRate = DROP_RATES[enemy.type] ?? 0;
          if (dropRate > 0 && Math.random() < dropRate && s.powerUps.length < MAX_POWERUPS_ON_SCREEN) {
            const puType = pickRandomPowerUpType();
            s.powerUps = [...s.powerUps, createPowerUp(puType, ecx, ecy)];
          }
        } else {
          audioEvents.push(AudioEvent.ENEMY_HIT);
          newParticles = [
            ...newParticles,
            ...createSparks(bullet.x, bullet.y, 3, "#ffffff"),
          ];
        }

        // Update enemy hp in-place
        const eIdx = s.enemies.findIndex((e) => e.id === enemy.id);
        if (eIdx >= 0 && newHp > 0) {
          s.enemies = [...s.enemies];
          s.enemies[eIdx] = { ...s.enemies[eIdx], hp: newHp };
        }

        break; // bullet hits one enemy unless piercing
      }
    }
  }

  // Enemy bullets → Player
  const hasShield = s.activePowerUps.some((p) => p.type === PowerUpType.SHIELD);

  if (s.player.invincibleTimer <= 0) {
    for (const bullet of s.enemyBullets) {
      if (destroyedBullets.has(bullet.id)) continue;

      if (aabbOverlap(bullet, s.player)) {
        destroyedBullets.add(bullet.id);

        if (hasShield) {
          audioEvents.push(AudioEvent.SHIELD_HIT);
          newParticles = [
            ...newParticles,
            ...createSparks(bullet.x, bullet.y, 4, "#4488ff"),
          ];
          // Remove one hit from shield by reducing remaining frames
          s.activePowerUps = s.activePowerUps.map((p) =>
            p.type === PowerUpType.SHIELD
              ? { ...p, remainingFrames: p.remainingFrames - 200 }
              : p
          );
        } else {
          s = playerHit(s, audioEvents, newParticles);
          newParticles = s.particles;
        }
        break;
      }
    }
  }

  // Enemies → Player (contact damage)
  if (s.player.invincibleTimer <= 0) {
    for (const enemy of s.enemies) {
      if (destroyedEnemies.has(enemy.id)) continue;
      if (enemy.cloaked) continue;

      if (aabbOverlap(enemy, s.player)) {
        destroyedEnemies.add(enemy.id);
        s.screenShake = Math.max(s.screenShake, 5);

        const ecx = enemy.x + enemy.width / 2;
        const ecy = enemy.y + enemy.height / 2;
        newParticles = [
          ...newParticles,
          ...createExplosion(ecx, ecy, 10, "#ff4444"),
        ];

        if (hasShield) {
          audioEvents.push(AudioEvent.SHIELD_HIT);
        } else {
          s = playerHit(s, audioEvents, newParticles);
          newParticles = s.particles;
        }
      }
    }
  }

  // Remove destroyed
  s.playerBullets = s.playerBullets.filter((b) => !destroyedBullets.has(b.id));
  s.enemyBullets = s.enemyBullets.filter((b) => !destroyedBullets.has(b.id));
  s.enemies = s.enemies.filter((e) => !destroyedEnemies.has(e.id));
  s.particles = newParticles;
  s.audioEvents = audioEvents;

  return s;
}

function playerHit(
  state: GameState,
  audioEvents: AudioEvent[],
  particles: Particle[]
): GameState {
  // Dev invincibility: skip all damage
  if (state.devInvincible) {
    return { ...state, particles };
  }

  const player = { ...state.player };
  player.hp -= 1;

  const pcx = player.x + player.width / 2;
  const pcy = player.y + player.height / 2;

  if (player.hp <= 0) {
    // Death
    const newLives = state.lives - 1;
    audioEvents.push(AudioEvent.PLAYER_DEATH);

    particles = [
      ...particles,
      ...createExplosion(pcx, pcy, 20, "#ff6644"),
      ...createExplosion(pcx, pcy, 10, "#ffcc44"),
    ];

    if (newLives > 0) {
      // Respawn
      const newPlayer = createPlayer();
      newPlayer.invincibleTimer = PLAYER_INVINCIBLE_FRAMES * 2;
      newPlayer.weaponLevel = Math.max(1, player.weaponLevel - 1);

      return {
        ...state,
        player: newPlayer,
        lives: newLives,
        deaths: state.deaths + 1,
        particles,
        screenShake: 8,
      };
    } else {
      return {
        ...state,
        player,
        lives: 0,
        deaths: state.deaths + 1,
        particles,
        screenShake: 10,
      };
    }
  } else {
    // Hit but survived
    audioEvents.push(AudioEvent.PLAYER_HIT);
    player.invincibleTimer = PLAYER_INVINCIBLE_FRAMES;

    particles = [
      ...particles,
      ...createSparks(pcx, pcy, 8, "#ff8844"),
    ];

    let dialog = state.dialog;
    let hpWarningTriggered = state.hpWarningTriggered;

    // HP warning at critical health (once per level)
    if (player.hp === 1 && player.maxHp > 1 && !hpWarningTriggered) {
      hpWarningTriggered = true;
      dialog = {
        ...dialog,
        queue: [
          ...dialog.queue,
          {
            speaker: "Voss",
            portraitKey: "PORTRAIT_VOSS",
            text: "Hull integrity critical! Get back to the armory for repairs.",
            duration: 180,
            color: "#ff4444",
          },
        ],
      };
    }

    return {
      ...state,
      player,
      particles,
      screenShake: 4,
      dialog,
      hpWarningTriggered,
    };
  }
}

// ─── Bomb Activation ─────────────────────────────────────────────────

const BOMB_COOLDOWN = 30; // half-second cooldown between bombs

function activateBomb(state: GameState): GameState {
  const audioEvents = [...state.audioEvents, AudioEvent.BOMB_ACTIVATE];
  let particles = [...state.particles];
  let enemies = [...state.enemies];
  let score = state.score;
  let xp = state.xp;
  let kills = state.kills;
  let combo = state.combo;
  let comboTimer = state.comboTimer;
  let maxCombo = state.maxCombo;

  // Destroy all non-boss enemies on screen
  for (const enemy of enemies) {
    const ecx = enemy.x + enemy.width / 2;
    const ecy = enemy.y + enemy.height / 2;
    particles = [
      ...particles,
      ...createExplosion(ecx, ecy, 12, "#ff4444"),
      ...createSparks(ecx, ecy, 6, "#ffcc44"),
    ];
    const comboMult = Math.min(1 + combo * 0.5, COMBO_MAX);
    const earnedScore = Math.floor(enemy.score * comboMult);
    score += earnedScore;
    xp += earnedScore;
    combo += 1;
    comboTimer = COMBO_WINDOW;
    maxCombo = Math.max(maxCombo, combo);
    kills += 1;
  }
  enemies = [];

  // Clear all enemy bullets
  const enemyBullets: Bullet[] = [];

  // Damage boss if present (25 damage)
  let boss = state.boss;
  if (boss && !boss.defeated) {
    boss = { ...boss, hp: Math.max(0, boss.hp - 25) };
    const bcx = boss.x + boss.width / 2;
    const bcy = boss.y + boss.height / 2;
    particles = [
      ...particles,
      ...createExplosion(bcx, bcy, 15, "#ff8844"),
    ];
    audioEvents.push(AudioEvent.BOSS_HIT);
  }

  // Big center explosion
  particles = [
    ...particles,
    ...createExplosion(CANVAS_WIDTH / 2, GAME_AREA_HEIGHT / 2, 25, "#ff3333"),
    ...createExplosion(CANVAS_WIDTH / 2, GAME_AREA_HEIGHT / 2, 15, "#ffaa00"),
  ];

  return {
    ...state,
    enemies,
    enemyBullets,
    boss,
    particles,
    score,
    xp,
    kills,
    combo,
    comboTimer,
    maxCombo,
    bombs: state.bombs - 1,
    bombCooldown: BOMB_COOLDOWN,
    screenShake: Math.max(state.screenShake, 10),
    audioEvents,
  };
}

function handleBomb(state: GameState, keys: Keys): GameState {
  // Tick down cooldown
  let s = state;
  if (s.bombCooldown > 0) {
    s = { ...s, bombCooldown: s.bombCooldown - 1 };
  }

  // Activate bomb on key press
  if (keys.bomb && s.bombs > 0 && s.bombCooldown <= 0 && s.player.hp > 0) {
    return activateBomb(s);
  }

  return s;
}

// ─── Power-Ups ───────────────────────────────────────────────────────

function updatePowerUps(state: GameState): GameState {
  const hasMagnet = state.activePowerUps.some((p) => p.type === PowerUpType.MAGNET);
  const pcx = state.player.x + state.player.width / 2;
  const pcy = state.player.y + state.player.height / 2;

  // Move power-ups down (with magnet attraction)
  const updatedPowerUps = state.powerUps
    .map((p) => {
      let { x, y, vy } = p;

      if (hasMagnet) {
        const dx = pcx - (x + p.width / 2);
        const dy = pcy - (y + p.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 2) {
          const pull = Math.min(4, 150 / dist);
          x += (dx / dist) * pull;
          y += (dy / dist) * pull;
          return { ...p, x, y };
        }
      }

      return { ...p, y: y + vy };
    })
    .filter((p) => p.y < GAME_AREA_HEIGHT + 20);

  // Check collection
  const audioEvents = [...state.audioEvents];
  let activePowerUps = [...state.activePowerUps];
  let player = { ...state.player };
  let particles = [...state.particles];
  let enemies = [...state.enemies];
  let enemyBullets = [...state.enemyBullets];
  let score = state.score;
  let kills = state.kills;
  let combo = state.combo;
  let comboTimer = state.comboTimer;
  let maxCombo = state.maxCombo;
  let screenShake = state.screenShake;
  let bombs = state.bombs;
  let xp = state.xp;
  const collected = new Set<number>();

  for (const pu of updatedPowerUps) {
    if (aabbOverlap(pu, player)) {
      collected.add(pu.id);
      audioEvents.push(AudioEvent.POWER_UP_COLLECT);
      xp += 50; // XP for power-up collection

      if (pu.type === PowerUpType.WEAPON_UP) {
        player.weaponLevel = Math.min(5, player.weaponLevel + 1);
      } else if (pu.type === PowerUpType.BOMB) {
        // Add to bomb inventory (max 5)
        bombs = Math.min(5, bombs + 1);
      } else {
        let dur = POWER_UP_DURATION[pu.type] ?? 600;
        // Shield generator upgrade extends shield duration
        if (pu.type === PowerUpType.SHIELD) {
          dur += currentUpgrades.shieldGenerator * 200;
        }
        const existing = activePowerUps.findIndex((a) => a.type === pu.type);

        if (existing >= 0) {
          activePowerUps[existing] = {
            ...activePowerUps[existing],
            remainingFrames: dur,
          };
        } else {
          activePowerUps.push({ type: pu.type, remainingFrames: dur });
        }
      }
    }
  }

  // Tick down active power-ups
  activePowerUps = activePowerUps
    .map((a) => ({ ...a, remainingFrames: a.remainingFrames - 1 }))
    .filter((a) => a.remainingFrames > 0);

  return {
    ...state,
    powerUps: updatedPowerUps.filter((p) => !collected.has(p.id)),
    activePowerUps,
    player,
    enemies,
    enemyBullets,
    particles,
    score,
    kills,
    combo,
    comboTimer,
    maxCombo,
    screenShake,
    bombs,
    xp,
    audioEvents,
  };
}

// ─── Pause / State Transitions ───────────────────────────────────────

export function togglePause(state: GameState): GameState {
  if (state.screen === GameScreen.PLAYING) {
    return { ...state, screen: GameScreen.PAUSED };
  }
  if (state.screen === GameScreen.PAUSED) {
    return { ...state, screen: GameScreen.PLAYING };
  }
  return state;
}
