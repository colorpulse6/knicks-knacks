// Enemy definitions for Chimera

import type { Enemy } from "../types/battle";
import type { Ability } from "../types";
import { createBaseStats } from "../types/character";
import { createATBState } from "../engine/atbSystem";

// Enemy abilities
const ENEMY_ABILITIES: Record<string, Ability[]> = {
  bandit: [
    {
      id: "quick_slash",
      name: "Quick Slash",
      type: "physical",
      mpCost: 0,
      power: 5,
      target: "single",
      description: "A fast slashing attack.",
    },
    {
      id: "steal",
      name: "Steal",
      type: "special",
      mpCost: 0,
      power: 0,
      target: "single",
      description: "Attempt to steal an item from the target.",
    },
  ],
  giantRat: [
    {
      id: "gnaw",
      name: "Gnaw",
      type: "physical",
      mpCost: 0,
      power: 4,
      target: "single",
      description: "Gnaws at the target with sharp teeth.",
    },
    {
      id: "disease_bite",
      name: "Disease Bite",
      type: "physical",
      mpCost: 0,
      power: 6,
      target: "single",
      description: "A filthy bite that may cause illness.",
    },
  ],
  wolf: [
    {
      id: "bite",
      name: "Bite",
      type: "physical",
      mpCost: 0,
      power: 8,
      target: "single",
      description: "A vicious bite.",
    },
    {
      id: "howl",
      name: "Howl",
      type: "support",
      mpCost: 3,
      power: 10,
      target: "self",
      description: "A frightening howl that boosts attack.",
    },
  ],
  rogueKnight: [
    {
      id: "heavy_slash",
      name: "Heavy Slash",
      type: "physical",
      mpCost: 0,
      power: 12,
      target: "single",
      description: "A powerful two-handed slash.",
    },
    {
      id: "shield_bash",
      name: "Shield Bash",
      type: "physical",
      mpCost: 0,
      power: 8,
      target: "single",
      description: "Slams target with a battered shield.",
    },
    {
      id: "war_cry",
      name: "War Cry",
      type: "support",
      mpCost: 5,
      power: 15,
      target: "self",
      description: "A battle cry that bolsters strength.",
    },
  ],
  corruptedSprite: [
    {
      id: "glitch_bolt",
      name: "Glitch Bolt",
      type: "magic",
      mpCost: 4,
      power: 15,
      target: "single",
      description: "A bolt of corrupted data energy.",
    },
    {
      id: "static_burst",
      name: "Static Burst",
      type: "magic",
      mpCost: 8,
      power: 12,
      target: "all",
      description: "Releases static energy at all foes.",
    },
  ],
  staticWraith: [
    {
      id: "spectral_touch",
      name: "Spectral Touch",
      type: "magic",
      mpCost: 0,
      power: 10,
      target: "single",
      description: "A chilling touch from beyond.",
    },
    {
      id: "phase_strike",
      name: "Phase Strike",
      type: "physical",
      mpCost: 5,
      power: 18,
      target: "single",
      description: "Phases through defenses to strike directly.",
    },
    {
      id: "terror_wail",
      name: "Terror Wail",
      type: "magic",
      mpCost: 8,
      power: 14,
      target: "all",
      description: "A horrifying wail that damages all foes.",
    },
  ],
  flickeringHound: [
    {
      id: "phase_bite",
      name: "Phase Bite",
      type: "physical",
      mpCost: 0,
      power: 12,
      target: "single",
      description: "Phases in and out while biting.",
    },
    {
      id: "flicker_strike",
      name: "Flicker Strike",
      type: "physical",
      mpCost: 4,
      power: 16,
      target: "single",
      description: "Teleports behind target before striking.",
    },
  ],
  systemAgent: [
    {
      id: "scan",
      name: "Scan",
      type: "support",
      mpCost: 2,
      power: 0,
      target: "single",
      description: "Analyzes target weaknesses.",
    },
    {
      id: "system_purge",
      name: "System Purge",
      type: "special",
      mpCost: 15,
      power: 35,
      target: "single",
      description: "A devastating attack meant to delete anomalies.",
      animation: "glitch",
    },
    {
      id: "data_drain",
      name: "Data Drain",
      type: "magic",
      mpCost: 8,
      power: 20,
      target: "single",
      description: "Drains HP and MP from target.",
    },
  ],
  banditChiefVorn: [
    {
      id: "heavy_slash",
      name: "Heavy Slash",
      type: "physical",
      mpCost: 0,
      power: 15,
      target: "single",
      description: "A powerful two-handed slash.",
    },
    {
      id: "lightning_rod",
      name: "Lightning Rod",
      type: "magic",
      mpCost: 8,
      power: 22,
      target: "single",
      description: "Discharges a strange weapon that crackles with energy.",
      animation: "glitch",
    },
    {
      id: "rally_cry",
      name: "Rally Cry",
      type: "support",
      mpCost: 5,
      power: 20,
      target: "self",
      description: "A battle cry that bolsters attack power.",
    },
    {
      id: "steal",
      name: "Steal",
      type: "special",
      mpCost: 0,
      power: 0,
      target: "single",
      description: "Attempt to steal an item from the target.",
    },
  ],
  dataFragment: [
    {
      id: "byte_strike",
      name: "Byte Strike",
      type: "physical",
      mpCost: 0,
      power: 8,
      target: "single",
      description: "A weak physical strike.",
    },
    {
      id: "corrupt",
      name: "Corrupt",
      type: "magic",
      mpCost: 4,
      power: 10,
      target: "single",
      description: "Corrupted data that may poison the target.",
      statusEffects: [
        { statusId: "poison", chance: 40, duration: 4, targetType: "target" },
      ],
    },
  ],
};

// Counter for unique enemy IDs
let enemyIdCounter = 0;

/**
 * Create a giant rat enemy (weakest enemy, early game)
 */
export function createGiantRat(level: number = 1): Enemy {
  return {
    id: `rat_${Date.now()}_${enemyIdCounter++}`,
    name: "Giant Rat",
    stats: {
      ...createBaseStats(level, 25, 5, 5, 1, 3, 2, 8, 4),
    },
    atb: createATBState(8),
    statusEffects: [],
    abilities: ENEMY_ABILITIES.giantRat,
    sprite: "/sprites/enemies/giant_rat.png",
    position: { x: 0, y: 0 },
    ai: {
      type: "random",
      targetPriority: "random",
    },
    experience: 8 + level * 3,
    gold: 3 + level * 1,
    drops: [
      { itemId: "stale_bread", chance: 0.2 },
      { itemId: "leather_scraps", chance: 0.15 },
    ],
  };
}

/**
 * Create a bandit enemy
 */
export function createBandit(level: number = 1): Enemy {
  return {
    id: `bandit_${Date.now()}_${enemyIdCounter++}`,
    name: "Bandit",
    stats: {
      ...createBaseStats(level, 50, 10, 8, 3, 6, 4, 7, 5),
    },
    atb: createATBState(7),
    statusEffects: [],
    abilities: ENEMY_ABILITIES.bandit,
    sprite: "/sprites/enemies/bandit.png",
    position: { x: 0, y: 0 },
    ai: {
      type: "aggressive",
      targetPriority: "lowest_hp",
    },
    experience: 15 + level * 5,
    gold: 10 + level * 3,
    drops: [
      { itemId: "sanguine_draught", chance: 0.25 },
      { itemId: "herb_bundle", chance: 0.15 },
    ],
  };
}

/**
 * Create a wild wolf enemy
 */
export function createWolf(level: number = 1): Enemy {
  return {
    id: `wolf_${Date.now()}_${enemyIdCounter++}`,
    name: "Wild Wolf",
    stats: {
      ...createBaseStats(level, 40, 15, 10, 2, 4, 3, 12, 6),
    },
    atb: createATBState(12),
    statusEffects: [],
    abilities: ENEMY_ABILITIES.wolf,
    sprite: "/sprites/enemies/wolf.png",
    position: { x: 0, y: 0 },
    ai: {
      type: "aggressive",
      targetPriority: "random",
    },
    experience: 12 + level * 4,
    gold: 5 + level * 2,
    drops: [
      { itemId: "beast_fang", chance: 0.25 },
      { itemId: "leather_scraps", chance: 0.2 },
    ],
  };
}

/**
 * Create a rogue knight enemy (stronger human enemy)
 */
export function createRogueKnight(level: number = 2): Enemy {
  return {
    id: `knight_${Date.now()}_${enemyIdCounter++}`,
    name: "Rogue Knight",
    stats: {
      ...createBaseStats(level, 70, 15, 14, 5, 12, 6, 6, 7),
    },
    atb: createATBState(6),
    statusEffects: [],
    abilities: ENEMY_ABILITIES.rogueKnight,
    sprite: "/sprites/enemies/rogue_knight.png",
    position: { x: 0, y: 0 },
    ai: {
      type: "defensive",
      targetPriority: "highest_hp",
    },
    experience: 25 + level * 8,
    gold: 20 + level * 5,
    drops: [
      { itemId: "iron_ore", chance: 0.3 },
      { itemId: "sanguine_draught", chance: 0.2 },
      { itemId: "rusted_chain", chance: 0.15 },
    ],
  };
}

/**
 * Create a corrupted sprite enemy (glitched creature)
 */
export function createCorruptedSprite(level: number = 1): Enemy {
  return {
    id: `sprite_${Date.now()}_${enemyIdCounter++}`,
    name: "Corrupted Sprite",
    stats: {
      ...createBaseStats(level, 35, 30, 4, 12, 3, 10, 9, 8),
    },
    atb: createATBState(9),
    statusEffects: [],
    abilities: ENEMY_ABILITIES.corruptedSprite,
    sprite: "/sprites/enemies/corrupted_sprite.png",
    position: { x: 0, y: 0 },
    ai: {
      type: "smart",
      targetPriority: "healer",
      specialThreshold: 0.4,
    },
    experience: 20 + level * 6,
    gold: 15 + level * 4,
    drops: [
      { itemId: "aqua_vitae", chance: 0.2 },
      { itemId: "shadow_essence", chance: 0.15 },
      { itemId: "crystal_fragment", chance: 0.1 },
    ],
  };
}

/**
 * Create a static wraith enemy (ghostly glitched creature)
 */
export function createStaticWraith(level: number = 3): Enemy {
  return {
    id: `wraith_${Date.now()}_${enemyIdCounter++}`,
    name: "Static Wraith",
    stats: {
      ...createBaseStats(level, 45, 40, 6, 16, 4, 14, 11, 10),
    },
    atb: createATBState(11),
    statusEffects: [],
    abilities: ENEMY_ABILITIES.staticWraith,
    sprite: "/sprites/enemies/static_wraith.png",
    position: { x: 0, y: 0 },
    ai: {
      type: "smart",
      targetPriority: "lowest_hp",
      specialThreshold: 0.35,
    },
    experience: 30 + level * 8,
    gold: 20 + level * 5,
    drops: [
      { itemId: "shadow_essence", chance: 0.3 },
      { itemId: "aqua_vitae", chance: 0.15 },
      { itemId: "moonstone_shard", chance: 0.1 },
    ],
  };
}

/**
 * Create a flickering hound enemy (wolf-like glitched creature)
 */
export function createFlickeringHound(level: number = 2): Enemy {
  return {
    id: `hound_${Date.now()}_${enemyIdCounter++}`,
    name: "Flickering Hound",
    stats: {
      ...createBaseStats(level, 50, 20, 12, 6, 6, 5, 14, 9),
    },
    atb: createATBState(14),
    statusEffects: [],
    abilities: ENEMY_ABILITIES.flickeringHound,
    sprite: "/sprites/enemies/flickering_hound.png",
    position: { x: 0, y: 0 },
    ai: {
      type: "aggressive",
      targetPriority: "lowest_hp",
    },
    experience: 22 + level * 6,
    gold: 12 + level * 4,
    drops: [
      { itemId: "shadow_essence", chance: 0.25 },
      { itemId: "beast_fang", chance: 0.2 },
    ],
  };
}

/**
 * Create a System Agent enemy (mini-boss)
 */
export function createSystemAgent(level: number = 5): Enemy {
  return {
    id: `system_agent_${Date.now()}_${enemyIdCounter++}`,
    name: "System Agent",
    stats: {
      ...createBaseStats(level, 150, 50, 15, 18, 12, 15, 10, 10),
    },
    atb: createATBState(10),
    statusEffects: [],
    abilities: ENEMY_ABILITIES.systemAgent,
    sprite: "/sprites/enemies/system_agent.png",
    position: { x: 0, y: 0 },
    ai: {
      type: "smart",
      targetPriority: "lowest_hp",
      specialThreshold: 0.3,
    },
    experience: 100 + level * 20,
    gold: 80 + level * 15,
    drops: [
      { itemId: "theriac_electuary", chance: 0.4 },
      { itemId: "ancient_cog", chance: 0.25 },
      { itemId: "crystal_fragment", chance: 0.2 },
    ],
  };
}

// ============================================
// ENCOUNTER FUNCTIONS
// ============================================

/**
 * Create a rat infestation encounter (easiest)
 */
export function createRatEncounter(): Enemy[] {
  return [
    createGiantRat(1),
    createGiantRat(1),
    createGiantRat(1),
  ];
}

/**
 * Create a group of bandits for an encounter
 */
export function createBanditEncounter(): Enemy[] {
  return [
    createBandit(1),
    createBandit(1),
  ];
}

/**
 * Create a bandit gang encounter (harder)
 */
export function createBanditGangEncounter(): Enemy[] {
  return [
    createBandit(2),
    createBandit(1),
    createRogueKnight(2),
  ];
}

/**
 * Create a wolf pack encounter
 */
export function createWolfEncounter(): Enemy[] {
  return [
    createWolf(1),
    createWolf(1),
    createWolf(2),
  ];
}

/**
 * Create a rogue patrol encounter
 */
export function createRoguePatrolEncounter(): Enemy[] {
  return [
    createRogueKnight(2),
    createRogueKnight(2),
  ];
}

/**
 * Create a corrupted sprite encounter
 */
export function createCorruptedEncounter(): Enemy[] {
  return [
    createCorruptedSprite(2),
    createCorruptedSprite(2),
  ];
}

/**
 * Create a static wraith encounter
 */
export function createWraithEncounter(): Enemy[] {
  return [
    createStaticWraith(3),
    createCorruptedSprite(2),
  ];
}

/**
 * Create a flickering hound pack encounter
 */
export function createHoundEncounter(): Enemy[] {
  return [
    createFlickeringHound(2),
    createFlickeringHound(2),
  ];
}

/**
 * Create a mixed glitched encounter (harder ruins)
 */
export function createGlitchedEncounter(): Enemy[] {
  return [
    createStaticWraith(3),
    createFlickeringHound(3),
    createCorruptedSprite(2),
  ];
}

/**
 * Create the System Agent boss encounter
 */
export function createSystemAgentEncounter(): Enemy[] {
  return [
    createSystemAgent(5),
    createCorruptedSprite(3),
  ];
}

/**
 * Create Bandit Chief Vorn (mini-boss for Bandit Camp)
 */
export function createBanditChiefVorn(level: number = 3): Enemy {
  return {
    id: `vorn_${Date.now()}_${enemyIdCounter++}`,
    name: "Bandit Chief Vorn",
    stats: {
      ...createBaseStats(level, 120, 30, 16, 8, 10, 6, 8, 6),
    },
    atb: createATBState(8),
    statusEffects: [],
    abilities: ENEMY_ABILITIES.banditChiefVorn,
    sprite: "/sprites/enemies/bandit_chief.png",
    position: { x: 0, y: 0 },
    ai: {
      type: "aggressive",
      targetPriority: "lowest_hp",
      specialThreshold: 0.4,
    },
    experience: 80 + level * 15,
    gold: 150 + level * 20,
    drops: [
      { itemId: "sanguine_draught", chance: 1.0 }, // Guaranteed
      { itemId: "sanguine_draught", chance: 1.0 }, // Guaranteed x2
      { itemId: "broken_mechanism", chance: 1.0 }, // Quest item, guaranteed
    ],
  };
}

/**
 * Create a Data Fragment enemy (weak corrupted data entity)
 */
export function createDataFragment(level: number = 2): Enemy {
  return {
    id: `fragment_${Date.now()}_${enemyIdCounter++}`,
    name: "Data Fragment",
    stats: {
      ...createBaseStats(level, 30, 20, 5, 10, 4, 8, 7, 5),
    },
    atb: createATBState(7),
    statusEffects: [],
    abilities: ENEMY_ABILITIES.dataFragment,
    sprite: "/sprites/enemies/data_fragment.png",
    position: { x: 0, y: 0 },
    ai: {
      type: "random",
      targetPriority: "random",
    },
    experience: 15 + level * 4,
    gold: 8 + level * 2,
    drops: [
      { itemId: "shadow_essence", chance: 0.25 },
      { itemId: "ancient_cog", chance: 0.15 },
    ],
  };
}

/**
 * Create Bandit Chief Vorn boss encounter
 */
export function createVornEncounter(): Enemy[] {
  return [createBanditChiefVorn(3)];
}

/**
 * Create a bandit camp patrol encounter
 */
export function createBanditCampEncounter(): Enemy[] {
  return [
    createBandit(2),
    createBandit(2),
    createRogueKnight(2),
  ];
}

/**
 * Create Corrupted Guardian (boss for Whispering Ruins Lower Level)
 * An ancient security protocol awakened by Kai's presence
 */
export function createCorruptedGuardian(level: number = 4): Enemy {
  return {
    id: `guardian_${Date.now()}_${enemyIdCounter++}`,
    name: "Corrupted Guardian",
    stats: {
      ...createBaseStats(level, 200, 50, 18, 15, 14, 12, 8, 8),
    },
    atb: createATBState(8),
    statusEffects: [],
    abilities: [
      {
        id: "protocol_strike",
        name: "Protocol Strike",
        type: "physical",
        mpCost: 0,
        power: 20,
        target: "single",
        description: "A precise mechanical strike.",
      },
      {
        id: "system_scan",
        name: "System Scan",
        type: "support",
        mpCost: 5,
        power: 0,
        target: "all",
        description: "Scans all targets, reducing their defense.",
        statusEffects: [
          { statusId: "defense_down", chance: 80, duration: 3, targetType: "target" },
        ],
      },
      {
        id: "purge_subroutine",
        name: "Purge Subroutine",
        type: "magic",
        mpCost: 12,
        power: 18,
        target: "all",
        description: "Releases a wave of corrupted energy.",
        animation: "glitch",
      },
      {
        id: "error_state",
        name: "Error State",
        type: "support",
        mpCost: 8,
        power: 30,
        target: "self",
        description: "Enters error recovery mode, healing itself.",
      },
    ],
    sprite: "/sprites/enemies/corrupted_guardian.png",
    position: { x: 0, y: 0 },
    ai: {
      type: "smart",
      targetPriority: "healer",
      specialThreshold: 0.3,
    },
    experience: 150 + level * 25,
    gold: 200 + level * 30,
    drops: [
      { itemId: "theriac_electuary", chance: 1.0 }, // Guaranteed
      { itemId: "ancient_core", chance: 1.0 }, // Quest item, guaranteed
      { itemId: "crystal_fragment", chance: 0.5 },
    ],
  };
}

/**
 * Create Corrupted Guardian boss encounter
 */
export function createGuardianEncounter(): Enemy[] {
  return [createCorruptedGuardian(4)];
}

/**
 * Create System Agent Epsilon (Act I Final Boss)
 * A superior System Agent sent to eliminate the anomaly Kai
 * "You were not supposed to find this place, Anomaly KAI_7.34"
 */
export function createSystemAgentEpsilon(level: number = 6): Enemy {
  return {
    id: `system_agent_epsilon_${Date.now()}_${enemyIdCounter++}`,
    name: "System Agent Epsilon",
    stats: {
      ...createBaseStats(level, 300, 80, 22, 20, 18, 15, 12, 10),
    },
    atb: createATBState(10), // Faster than regular agents
    statusEffects: [],
    abilities: [
      {
        id: "precise_strike",
        name: "Precise Strike",
        type: "physical",
        mpCost: 0,
        power: 25,
        target: "single",
        description: "A calculated strike that never misses.",
      },
      {
        id: "data_drain",
        name: "Data Drain",
        type: "magic",
        mpCost: 8,
        power: 15,
        target: "single",
        description: "Siphons MP from the target to restore own resources.",
        statusEffects: [
          { statusId: "mp_drain", chance: 100, duration: 1, targetType: "target" },
        ],
      },
      {
        id: "system_override",
        name: "System Override",
        type: "magic",
        mpCost: 15,
        power: 12,
        target: "single",
        description: "Attempts to override the target's systems, causing Silence and Slow.",
        statusEffects: [
          { statusId: "silence", chance: 70, duration: 3, targetType: "target" },
          { statusId: "slow", chance: 70, duration: 3, targetType: "target" },
        ],
        animation: "glitch",
      },
      {
        id: "execute_exe",
        name: "EXECUTE.EXE",
        type: "magic",
        mpCost: 25,
        power: 35,
        target: "all",
        description: "Emergency protocol. Unleashes devastating AOE damage.",
        animation: "glitch_heavy",
      },
      {
        id: "regeneration_protocol",
        name: "Regeneration Protocol",
        type: "support",
        mpCost: 10,
        power: 30,
        target: "self",
        description: "Activates self-repair systems, healing over time.",
        statusEffects: [
          { statusId: "regen", chance: 100, duration: 4, targetType: "self" },
        ],
      },
    ],
    sprite: "/sprites/enemies/system_agent_epsilon.png",
    position: { x: 0, y: 0 },
    ai: {
      type: "smart",
      targetPriority: "healer",
      specialThreshold: 0.25, // Uses EXECUTE.EXE when below 25% HP
    },
    experience: 300 + level * 40,
    gold: 500 + level * 50,
    drops: [
      { itemId: "fragment_of_truth", chance: 1.0 }, // Quest item, guaranteed
      { itemId: "theriac_electuary", chance: 1.0 },
      { itemId: "theriac_electuary", chance: 1.0 },
      { itemId: "crystal_fragment", chance: 0.8 },
      { itemId: "ancient_cog", chance: 0.6 },
    ],
  };
}

/**
 * Create System Agent Epsilon boss encounter (Act I Finale)
 */
export function createEpsilonEncounter(): Enemy[] {
  return [createSystemAgentEpsilon(6)];
}

/**
 * Get a random encounter based on area and difficulty
 */
export function getRandomEncounter(
  area: "forest" | "ruins" | "village" | "deep_ruins",
  difficulty: "easy" | "normal" | "hard" = "normal"
): Enemy[] {
  const encounters: Record<string, Record<string, (() => Enemy[])[]>> = {
    village: {
      easy: [createRatEncounter],
      normal: [createRatEncounter, createBanditEncounter],
      hard: [createBanditEncounter, createBanditGangEncounter],
    },
    forest: {
      easy: [createRatEncounter, createWolfEncounter],
      normal: [createWolfEncounter, createBanditEncounter],
      hard: [createBanditGangEncounter, createRoguePatrolEncounter],
    },
    ruins: {
      easy: [createCorruptedEncounter],
      normal: [createCorruptedEncounter, createHoundEncounter],
      hard: [createHoundEncounter, createWraithEncounter],
    },
    deep_ruins: {
      easy: [createHoundEncounter, createCorruptedEncounter],
      normal: [createWraithEncounter, createGlitchedEncounter],
      hard: [createGlitchedEncounter, createSystemAgentEncounter],
    },
  };

  const areaEncounters = encounters[area]?.[difficulty] ?? encounters.forest.normal;
  const createEncounter = areaEncounters[Math.floor(Math.random() * areaEncounters.length)];
  return createEncounter();
}

/**
 * Get all enemy types for testing/debugging
 */
export function createTestEncounter(type: string): Enemy[] {
  switch (type) {
    case "rat": return [createGiantRat(1)];
    case "bandit": return [createBandit(1)];
    case "wolf": return [createWolf(1)];
    case "knight": return [createRogueKnight(2)];
    case "sprite": return [createCorruptedSprite(2)];
    case "wraith": return [createStaticWraith(3)];
    case "hound": return [createFlickeringHound(2)];
    case "agent": return [createSystemAgent(5)];
    default: return createBanditEncounter();
  }
}
