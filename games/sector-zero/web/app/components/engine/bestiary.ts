import { EnemyType, ENEMY_DEFS, type BestiaryEntry, type EnemyClass, type PlanetId, type SaveData } from "./types";

/** Record a kill — returns updated bestiary (immutably). */
export function recordKill(
  bestiary: SaveData["bestiary"],
  enemyType: EnemyType,
  classId: EnemyClass,
  context: { planetId?: PlanetId; world?: number }
): SaveData["bestiary"] {
  const existing = bestiary[enemyType];
  if (existing) {
    return {
      ...bestiary,
      [enemyType]: { ...existing, killCount: existing.killCount + 1 },
    };
  }
  return {
    ...bestiary,
    [enemyType]: {
      enemyType,
      classId,
      killCount: 1,
      firstSeenPlanet: context.planetId,
      firstSeenWorld: context.world,
    },
  };
}

/** Return entries in EnemyType enum order, only for discovered enemies. */
export function getBestiaryList(bestiary: SaveData["bestiary"]): BestiaryEntry[] {
  const allTypes = Object.values(EnemyType);
  return allTypes
    .map((t) => bestiary[t])
    .filter((e): e is BestiaryEntry => e !== undefined);
}

export function getDiscoveredCount(bestiary: SaveData["bestiary"]): number {
  return Object.keys(bestiary).length;
}

export function getTotalEnemyCount(): number {
  return Object.keys(ENEMY_DEFS).length;
}

export const ENEMY_LORE: Record<EnemyType, string> = {
  [EnemyType.SCOUT]:    "Fast reconnaissance unit. Dies easily but attacks in swarms.",
  [EnemyType.DRONE]:    "Automated attack drone. Fires while strafing. Vulnerable to energy weapons.",
  [EnemyType.GUNNER]:   "Armored heavy-weapons platform. Slow but devastating sustained fire.",
  [EnemyType.SHIELDER]: "Front-line bulwark with frontal barrier. Difficult to damage head-on.",
  [EnemyType.BOMBER]:   "Kamikaze unit that detonates on contact. Leaks biological spores.",
  [EnemyType.SWARM]:    "Small, fast, numerous. Individually weak, terrifying in formation.",
  [EnemyType.TURRET]:   "Stationary emplacement. High fire rate when player is in range.",
  [EnemyType.CLOAKER]:  "Phase-shift enemy. Invisible at rest, briefly visible when firing.",
  [EnemyType.ELITE]:    "Heavy assault unit combining multiple weapon systems. Priority target.",
  [EnemyType.MINE]:     "Drifting explosive. Attracted to player ship mass. Do not touch.",
  [EnemyType.WRAITH]:   "Ghost-class entity from deeper sectors. Phases through projectiles.",
  [EnemyType.ECHO]:     "Temporal anomaly. Flickers between existence states every 1.5s.",
  [EnemyType.MIRROR]:   "Adaptive reflection enemy. Copies player movement with jitter.",
};
