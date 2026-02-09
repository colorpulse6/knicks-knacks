// Item definitions for Chimera
// Based on Four Humors medieval medical theory
// See docs/items-guide.md for lore details

import type { Item, Inventory } from "../types";

// ============================================
// CONSUMABLE ITEMS - Four Humors Healing
// ============================================

export const ITEMS: Record<string, Item> = {
  // Core Humoral Remedies
  sanguine_draught: {
    id: "sanguine_draught",
    name: "Sanguine Draught",
    description:
      "A warm, iron-tasting tonic of red wine, honey, and nettle. Replenishes the vital Sanguine humor.",
    type: "consumable",
    rarity: "common",
    value: 50,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableInField: true,
    effect: {
      type: "heal_hp",
      power: 50,
      target: "single",
    },
  },
  theriac_electuary: {
    id: "theriac_electuary",
    name: "Theriac Electuary",
    description:
      "A thick, bitter sludge of snake flesh, opium, and myrrh. The Great Cure that purges Black Bile.",
    type: "consumable",
    rarity: "uncommon",
    value: 200,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableInField: true,
    effect: {
      type: "heal_hp",
      power: 200,
      target: "single",
    },
  },
  hartshorn_salts: {
    id: "hartshorn_salts",
    name: "Hartshorn Salts",
    description:
      "Crushed deer antler and vinegar. The piercing scent shocks the soul back into the body.",
    type: "consumable",
    rarity: "rare",
    value: 500,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableInField: false,
    effect: {
      type: "revive",
      power: 10,
      target: "single",
    },
  },
  mithridate: {
    id: "mithridate",
    name: "Mithridate",
    description:
      "Bitter Rue leaf coated in antidote paste. Expels toxic Yellow Bile from the stomach.",
    type: "consumable",
    rarity: "common",
    value: 30,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableInField: true,
    effect: {
      type: "cure_status",
      power: 0,
      target: "single",
    },
  },
  aqua_vitae: {
    id: "aqua_vitae",
    name: "Aqua Vitae",
    description:
      "Distilled spirits of wine. Burns the throat but clarifies the mind and restores the Pneuma.",
    type: "consumable",
    rarity: "uncommon",
    value: 100,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableInField: true,
    effect: {
      type: "heal_mp",
      power: 30,
      target: "single",
    },
  },

  // Simple Provisions
  stale_bread: {
    id: "stale_bread",
    name: "Stale Bread",
    description: "Hard but filling. A traveler's staple that provides basic sustenance.",
    type: "consumable",
    rarity: "common",
    value: 15,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableInField: true,
    effect: {
      type: "heal_hp",
      power: 25,
      target: "single",
    },
  },
  dried_meat: {
    id: "dried_meat",
    name: "Dried Meat",
    description: "Salted and preserved for long journeys. Restores vigor effectively.",
    type: "consumable",
    rarity: "common",
    value: 40,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableInField: true,
    effect: {
      type: "heal_hp",
      power: 75,
      target: "single",
    },
  },
  herb_bundle: {
    id: "herb_bundle",
    name: "Herb Bundle",
    description: "Freshly picked medicinal herbs. A simpler alternative to refined Mithridate.",
    type: "consumable",
    rarity: "common",
    value: 20,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableInField: true,
    effect: {
      type: "cure_status",
      power: 0,
      target: "single",
    },
  },
  spring_water: {
    id: "spring_water",
    name: "Spring Water",
    description: "Pure water from a mountain spring. Refreshes the mind gently.",
    type: "consumable",
    rarity: "common",
    value: 25,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableInField: true,
    effect: {
      type: "heal_mp",
      power: 15,
      target: "single",
    },
  },
  travelers_stew: {
    id: "travelers_stew",
    name: "Traveler's Stew",
    description: "Hearty meal in a sealed clay pot. Restores both body and spirit.",
    type: "consumable",
    rarity: "uncommon",
    value: 80,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableInField: true,
    effect: {
      type: "heal_hp",
      power: 50,
      target: "single",
    },
  },
  warding_incense: {
    id: "warding_incense",
    name: "Warding Incense",
    description: "Fragrant smoke that cleanses all afflictions of the humors.",
    type: "consumable",
    rarity: "rare",
    value: 150,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableInField: true,
    effect: {
      type: "cure_status",
      power: 0,
      target: "single",
    },
  },
  antidote_draught: {
    id: "antidote_draught",
    name: "Antidote Draught",
    description: "A bitter mixture of charcoal and herbs. Neutralizes poisons quickly.",
    type: "consumable",
    rarity: "common",
    value: 35,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableInField: true,
    effect: {
      type: "cure_status",
      power: 0,
      target: "single",
    },
  },
  speed_tonic: {
    id: "speed_tonic",
    name: "Speed Tonic",
    description: "A fizzing alchemical brew that quickens the body. Grants Haste for 3 turns.",
    type: "consumable",
    rarity: "uncommon",
    value: 80,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableInField: false,
    effect: {
      type: "buff",
      power: 50, // Speed boost percentage
      target: "single",
      stat: "speed",
      duration: 3,
    },
  },
  barrier_scroll: {
    id: "barrier_scroll",
    name: "Barrier Scroll",
    description: "An enchanted scroll that conjures a protective shield. Grants Protect for 4 turns.",
    type: "consumable",
    rarity: "uncommon",
    value: 100,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableInField: false,
    effect: {
      type: "buff",
      power: 25, // Defense boost percentage
      target: "single",
      stat: "defense",
      duration: 4,
    },
  },
  smelling_salts: {
    id: "smelling_salts",
    name: "Smelling Salts",
    description: "Pungent ammonia crystals. Instantly awakens someone from magical sleep.",
    type: "consumable",
    rarity: "common",
    value: 40,
    stackable: true,
    maxStack: 99,
    usableInBattle: true,
    usableInField: true,
    effect: {
      type: "cure_status",
      power: 0,
      target: "single",
    },
  },
};

// ============================================
// KEY ITEMS - Story items
// ============================================

export const KEY_ITEMS: Record<string, Item> = {
  elara_pendant: {
    id: "elara_pendant",
    name: "Elara's Pendant",
    description:
      "A pendant that once belonged to Kai's sister. It feels warm to the touch.",
    type: "key",
    rarity: "legendary",
    value: 0,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
  },
  ancient_key: {
    id: "ancient_key",
    name: "Ancient Key",
    description:
      "A key of unknown origin. The metal seems to shimmer with an inner light.",
    type: "key",
    rarity: "rare",
    value: 0,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
  },
  moonpetal_flower: {
    id: "moonpetal_flower",
    name: "Moonpetal Flower",
    description:
      "A delicate silver-white bloom that glows faintly with captured moonlight. Prized by herbalists for its healing properties.",
    type: "key",
    rarity: "uncommon",
    value: 0,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableInField: false,
  },
  herbalist_notes: {
    id: "herbalist_notes",
    name: "Herbalist's Notes",
    description:
      "Elara's handwritten notes on medicinal remedies. Her writing is meticulous.",
    type: "key",
    rarity: "rare",
    value: 0,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
  },
  broken_mechanism: {
    id: "broken_mechanism",
    name: "Broken Mechanism",
    description:
      "A strange device found in the bandit cellar. It sparks occasionally with residual energy. This is no ordinary craftsmanship.",
    type: "key",
    rarity: "rare",
    value: 0,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
  },
  vorns_orders: {
    id: "vorns_orders",
    name: "Vorn's Orders",
    description:
      "A thin metal slate covered in strange glowing text that shifts and changes. The words speak of 'harvesting subjects' and 'payment upon delivery.' Someone was paying Vorn to kidnap villagers, but who? And what do they want with people?",
    type: "key",
    rarity: "epic",
    value: 0,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
  },
  rusty_key: {
    id: "rusty_key",
    name: "Rusty Key",
    description:
      "An old key found at the bottom of a well. What could it unlock?",
    type: "key",
    rarity: "uncommon",
    value: 0,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
  },
  fragment_of_truth: {
    id: "fragment_of_truth",
    name: "Fragment of Truth",
    description:
      "A shard of crystallized data. When held, brief visions of the world's true nature flash before your eyes.",
    type: "key",
    rarity: "legendary",
    value: 0,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
  },
  observers_token: {
    id: "observers_token",
    name: "Observer's Token",
    description:
      "A coin with an unblinking eye symbol. It feels like something is watching through it. (+10% XP)",
    type: "key",
    rarity: "rare",
    value: 0,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
  },
  ancient_core: {
    id: "ancient_core",
    name: "Ancient Core",
    description:
      "The power source of the Corrupted Guardian. It pulses with a warm, rhythmic glow—almost like a heartbeat. The technology is impossibly advanced.",
    type: "key",
    rarity: "epic",
    value: 0,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
  },
};

// ============================================
// TREASURE ITEMS - Crafting materials
// ============================================

export const TREASURES: Record<string, Item> = {
  iron_ore: {
    id: "iron_ore",
    name: "Iron Ore",
    description: "Raw iron from deep mines. Used for smithing weapons and armor.",
    type: "treasure",
    rarity: "common",
    value: 25,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableInField: false,
  },
  leather_scraps: {
    id: "leather_scraps",
    name: "Leather Scraps",
    description: "Cured animal hide. Good for repairs and light armor crafting.",
    type: "treasure",
    rarity: "common",
    value: 15,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableInField: false,
  },
  beast_fang: {
    id: "beast_fang",
    name: "Beast Fang",
    description: "Sharp fang from a wild creature. Could be fashioned into a weapon.",
    type: "treasure",
    rarity: "common",
    value: 30,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableInField: false,
  },
  shadow_essence: {
    id: "shadow_essence",
    name: "Shadow Essence",
    description: "Dark mist coalesced into solid form. Unsettling to touch.",
    type: "treasure",
    rarity: "uncommon",
    value: 75,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableInField: false,
  },
  moonstone_shard: {
    id: "moonstone_shard",
    name: "Moonstone Shard",
    description: "Fragment of pale stone that glows faintly at night.",
    type: "treasure",
    rarity: "uncommon",
    value: 100,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableInField: false,
  },
  ancient_cog: {
    id: "ancient_cog",
    name: "Ancient Cog",
    description: "Tarnished metal gear of unknown origin. Feels oddly precise.",
    type: "treasure",
    rarity: "rare",
    value: 150,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableInField: false,
  },
  crystal_fragment: {
    id: "crystal_fragment",
    name: "Crystal Fragment",
    description: "A sliver of luminous crystal. Hums faintly when held.",
    type: "treasure",
    rarity: "uncommon",
    value: 80,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableInField: false,
  },
  rusted_chain: {
    id: "rusted_chain",
    name: "Rusted Chain",
    description: "Old chain links. Could be reforged with skill.",
    type: "treasure",
    rarity: "common",
    value: 20,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableInField: false,
  },
  ancient_coin: {
    id: "ancient_coin",
    name: "Ancient Coin",
    description: "A coin from an era long forgotten. The markings are unlike any known script.",
    type: "treasure",
    rarity: "uncommon",
    value: 50,
    stackable: true,
    maxStack: 99,
    usableInBattle: false,
    usableInField: false,
  },
};

// ============================================
// EQUIPMENT - Weapons, Armor, Accessories
// ============================================

export const EQUIPMENT: Record<string, Item> = {
  // ============================================
  // WEAPONS
  // ============================================

  // Common Weapons (0 shard slots)
  rusty_sword: {
    id: "rusty_sword",
    name: "Rusty Sword",
    description: "A weathered blade, barely holding together. Better than nothing.",
    type: "weapon",
    rarity: "common",
    value: 50,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { attack: 8 },
    shardSlots: 0,
  },
  iron_sword: {
    id: "iron_sword",
    name: "Iron Sword",
    description: "A sturdy iron blade. Standard issue for soldiers.",
    type: "weapon",
    rarity: "common",
    value: 200,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { attack: 15 },
    shardSlots: 0,
  },
  wooden_staff: {
    id: "wooden_staff",
    name: "Wooden Staff",
    description: "Simple staff of polished oak. Channels magical energy.",
    type: "weapon",
    rarity: "common",
    value: 120,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { attack: 8, magicAttack: 3 },
    shardSlots: 0,
  },
  bronze_dagger: {
    id: "bronze_dagger",
    name: "Bronze Dagger",
    description: "Quick blade for swift strikes. Favored by rogues.",
    type: "weapon",
    rarity: "common",
    value: 150,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { attack: 10, speed: 2 },
    shardSlots: 0,
  },

  // Uncommon Weapons (1 shard slot)
  steel_longsword: {
    id: "steel_longsword",
    name: "Steel Longsword",
    description: "Expertly forged steel blade. A warrior's trusted companion.",
    type: "weapon",
    rarity: "uncommon",
    value: 450,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { attack: 22 },
    shardSlots: 1,
  },
  oak_staff: {
    id: "oak_staff",
    name: "Oak Staff",
    description: "Ancient oak imbued with natural energy. Mages prize its focus.",
    type: "weapon",
    rarity: "uncommon",
    value: 380,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { attack: 12, magicAttack: 8 },
    shardSlots: 1,
  },

  // Rare Weapons (2 shard slots)
  knights_blade: {
    id: "knights_blade",
    name: "Knight's Blade",
    description: "Sword of the royal guard. Its edge never dulls.",
    type: "weapon",
    rarity: "rare",
    value: 900,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { attack: 30 },
    shardSlots: 2,
  },
  crystal_staff: {
    id: "crystal_staff",
    name: "Crystal Staff",
    description: "Topped with a crystal that hums with power. Amplifies all magic.",
    type: "weapon",
    rarity: "rare",
    value: 850,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { attack: 15, magicAttack: 15 },
    shardSlots: 2,
  },

  // Epic Weapons (3 shard slots)
  moonblade: {
    id: "moonblade",
    name: "Moonblade",
    description: "Silver blade that glows faintly. Said to be forged from moonlight itself.",
    type: "weapon",
    rarity: "epic",
    value: 2500,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { attack: 38, speed: 5 },
    shardSlots: 3,
  },

  // Legendary Weapons (4 shard slots)
  the_anomaly: {
    id: "the_anomaly",
    name: "The Anomaly",
    description: "A blade that shouldn't exist. Reality warps around its edge.",
    type: "weapon",
    rarity: "legendary",
    value: 10000,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { attack: 50, magicAttack: 10, speed: 3 },
    shardSlots: 4,
  },
  lightning_blade: {
    id: "lightning_blade",
    name: "Lightning Blade",
    description: "Vorn's fearsome weapon. It crackles with strange energy, but your mind cannot grasp how to wield it.",
    type: "weapon",
    rarity: "legendary",
    value: 0, // Cannot be sold
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { attack: 65, magicAttack: 25, speed: 8 },
    shardSlots: 4,
    requiredFlag: "awareness_restored", // Cannot equip until Act III
    lockedDescription: "The weapon hums with alien energy. When you try to grip it, your fingers pass through as if it were made of light. Something is blocking your connection to it...",
  },

  // ============================================
  // ARMOR
  // ============================================

  // Common Armor (0 shard slots)
  traveler_clothes: {
    id: "traveler_clothes",
    name: "Traveler's Clothes",
    description: "Simple but durable traveling attire. Practical for long journeys.",
    type: "armor",
    rarity: "common",
    value: 50,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { defense: 5 },
    shardSlots: 0,
  },
  travelers_cloak: {
    id: "travelers_cloak",
    name: "Traveler's Cloak",
    description: "Weathered cloak offering light protection from the elements.",
    type: "armor",
    rarity: "common",
    value: 80,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { defense: 5, magicDefense: 3 },
    shardSlots: 0,
  },
  noble_dress: {
    id: "noble_dress",
    name: "Noble Dress",
    description: "Elegant attire that offers some magical protection. Favored by noble mages.",
    type: "armor",
    rarity: "common",
    value: 100,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { defense: 3, magicDefense: 8 },
    shardSlots: 0,
  },
  leather_armor: {
    id: "leather_armor",
    name: "Leather Armor",
    description: "Basic leather armor offering decent protection.",
    type: "armor",
    rarity: "common",
    value: 150,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { defense: 10 },
    shardSlots: 0,
  },

  // Uncommon Armor (1 shard slot)
  chainmail: {
    id: "chainmail",
    name: "Chainmail",
    description: "Interlocking metal rings. Reliable protection for soldiers.",
    type: "armor",
    rarity: "uncommon",
    value: 400,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { defense: 18 },
    shardSlots: 1,
  },
  mage_robes: {
    id: "mage_robes",
    name: "Mage Robes",
    description: "Enchanted robes that protect against magical attacks.",
    type: "armor",
    rarity: "uncommon",
    value: 380,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { defense: 8, magicDefense: 12 },
    shardSlots: 1,
  },

  // Rare Armor (2 shard slots)
  plate_armor: {
    id: "plate_armor",
    name: "Plate Armor",
    description: "Heavy steel plates. Maximum protection for those strong enough to bear it.",
    type: "armor",
    rarity: "rare",
    value: 800,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { defense: 28, speed: -2 },
    shardSlots: 2,
  },

  // Epic Armor (3 shard slots)
  wardens_plate: {
    id: "wardens_plate",
    name: "Warden's Plate",
    description: "Armor of the ancient wardens. Protects body and mind alike.",
    type: "armor",
    rarity: "epic",
    value: 2200,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { defense: 40, magicDefense: 15 },
    shardSlots: 3,
  },

  // ============================================
  // HELMETS
  // ============================================

  // Common Helmets (0 shard slots)
  cloth_hood: {
    id: "cloth_hood",
    name: "Cloth Hood",
    description: "Simple hood worn by commoners. Offers minimal protection.",
    type: "helmet",
    rarity: "common",
    value: 40,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { defense: 2, magicDefense: 2 },
    shardSlots: 0,
  },
  iron_helm: {
    id: "iron_helm",
    name: "Iron Helm",
    description: "A simple iron helmet. Protects the head adequately.",
    type: "helmet",
    rarity: "common",
    value: 100,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { defense: 5 },
    shardSlots: 0,
  },

  // Uncommon Helmets (1 shard slot)
  steel_helm: {
    id: "steel_helm",
    name: "Steel Helm",
    description: "Well-crafted steel helmet with reinforced crown.",
    type: "helmet",
    rarity: "uncommon",
    value: 250,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { defense: 10 },
    shardSlots: 1,
  },

  // Rare Helmets (2 shard slots)
  circlet_of_clarity: {
    id: "circlet_of_clarity",
    name: "Circlet of Clarity",
    description: "A thin metal band that sharpens the wearer's focus.",
    type: "helmet",
    rarity: "rare",
    value: 600,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { defense: 5, magicDefense: 10, magicAttack: 3 },
    shardSlots: 2,
  },

  // ============================================
  // ACCESSORIES
  // ============================================

  // Common Accessories (0 shard slots)
  worn_boots: {
    id: "worn_boots",
    name: "Worn Boots",
    description: "Well-traveled boots, still serviceable. Good for long journeys.",
    type: "accessory",
    rarity: "common",
    value: 60,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { speed: 3 },
    shardSlots: 0,
  },
  copper_ring: {
    id: "copper_ring",
    name: "Copper Ring",
    description: "A simple copper band. Slightly empowers the wearer.",
    type: "accessory",
    rarity: "common",
    value: 50,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { attack: 2 },
    shardSlots: 0,
  },

  // Uncommon Accessories (1 shard slot)
  lucky_charm: {
    id: "lucky_charm",
    name: "Lucky Charm",
    description: "A small trinket that seems to bring good fortune.",
    type: "accessory",
    rarity: "uncommon",
    value: 300,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { speed: 5 },
    shardSlots: 1,
  },
  silver_amulet: {
    id: "silver_amulet",
    name: "Silver Amulet",
    description: "Blessed silver that wards against dark magic.",
    type: "accessory",
    rarity: "uncommon",
    value: 350,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { magicDefense: 8 },
    shardSlots: 1,
  },

  // Rare Accessories (2 shard slots)
  warriors_band: {
    id: "warriors_band",
    name: "Warrior's Band",
    description: "Iron band worn by veterans. Empowers combat abilities.",
    type: "accessory",
    rarity: "rare",
    value: 700,
    stackable: false,
    maxStack: 1,
    usableInBattle: false,
    usableInField: false,
    equipStats: { attack: 5, speed: 3 },
    shardSlots: 2,
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get item by ID from any category
export function getItemById(id: string): Item | undefined {
  return ITEMS[id] || KEY_ITEMS[id] || TREASURES[id] || EQUIPMENT[id];
}

// Get all items as a single record
export function getAllItems(): Record<string, Item> {
  return { ...ITEMS, ...KEY_ITEMS, ...TREASURES, ...EQUIPMENT };
}

// Create initial inventory for new game
export function createInitialInventory(): Inventory {
  return {
    items: [
      { item: ITEMS.sanguine_draught, quantity: 3 },
      { item: ITEMS.stale_bread, quantity: 2 },
      { item: ITEMS.spring_water, quantity: 1 },
    ],
    maxSlots: 30,
    gold: 100,
  };
}

// Get rarity color for UI display
export function getRarityColor(rarity: Item["rarity"]): string {
  switch (rarity) {
    case "common":
      return "text-gray-300";
    case "uncommon":
      return "text-green-400";
    case "rare":
      return "text-blue-400";
    case "epic":
      return "text-purple-400";
    case "legendary":
      return "text-amber-400";
    default:
      return "text-gray-300";
  }
}

// Check if item is consumable
export function isConsumable(item: Item): boolean {
  return item.type === "consumable";
}

// Check if item is equipment
export function isEquipment(item: Item): boolean {
  return ["weapon", "armor", "helmet", "accessory"].includes(item.type);
}

// ============================================
// ITEM ICONS - Get icon path for item display
// ============================================

/**
 * Get the icon path for an item
 * Uses explicit icon field if set, otherwise derives from item properties
 */
export function getItemIcon(item: Item): string {
  // If item has explicit icon, use it
  if (item.icon) {
    return `/icons/items/${item.icon}.png`;
  }

  // Derive icon from item type and properties
  switch (item.type) {
    case "consumable":
      // Derive from effect type
      if (item.effect) {
        switch (item.effect.type) {
          case "heal_hp":
            // High power = better potion
            if (item.effect.power >= 150) return "/icons/items/potion_red_large.png";
            if (item.effect.power >= 50) return "/icons/items/potion_red.png";
            return "/icons/items/food.png"; // Low heal = food item
          case "heal_mp":
            return "/icons/items/potion_blue.png";
          case "revive":
            return "/icons/items/potion_gold.png";
          case "cure_status":
            return "/icons/items/potion_green.png";
          case "buff":
            return "/icons/items/scroll.png";
          case "damage":
            return "/icons/items/bomb.png";
          default:
            return "/icons/items/potion_red.png";
        }
      }
      return "/icons/items/potion_red.png";

    case "weapon":
      // Check name for weapon type hints
      const weaponName = item.name.toLowerCase();
      if (weaponName.includes("staff") || weaponName.includes("rod")) return "/icons/items/staff.png";
      if (weaponName.includes("dagger") || weaponName.includes("knife")) return "/icons/items/dagger.png";
      if (weaponName.includes("axe")) return "/icons/items/axe.png";
      if (weaponName.includes("bow")) return "/icons/items/bow.png";
      if (weaponName.includes("blade") && item.rarity === "legendary") return "/icons/items/sword_lightning.png";
      return "/icons/items/sword.png";

    case "armor":
      // Check for robe/dress vs heavy armor
      const armorName = item.name.toLowerCase();
      if (armorName.includes("robe") || armorName.includes("dress") || armorName.includes("cloak")) {
        return "/icons/items/robe.png";
      }
      if (armorName.includes("plate") || armorName.includes("mail")) {
        return "/icons/items/armor_heavy.png";
      }
      return "/icons/items/armor_light.png";

    case "helmet":
      const helmName = item.name.toLowerCase();
      if (helmName.includes("circlet") || helmName.includes("crown") || helmName.includes("hood")) {
        return "/icons/items/circlet.png";
      }
      return "/icons/items/helmet.png";

    case "accessory":
      const accName = item.name.toLowerCase();
      if (accName.includes("ring") || accName.includes("band")) return "/icons/items/ring.png";
      if (accName.includes("amulet") || accName.includes("pendant") || accName.includes("necklace")) return "/icons/items/amulet.png";
      if (accName.includes("boot") || accName.includes("shoe")) return "/icons/items/boots.png";
      if (accName.includes("charm")) return "/icons/items/charm.png";
      return "/icons/items/ring.png";

    case "key":
      // Key items - check for specific types
      const keyName = item.name.toLowerCase();
      if (keyName.includes("key")) return "/icons/items/key.png";
      if (keyName.includes("pendant") || keyName.includes("amulet")) return "/icons/items/amulet_key.png";
      if (keyName.includes("flower") || keyName.includes("petal")) return "/icons/items/flower.png";
      if (keyName.includes("note") || keyName.includes("letter") || keyName.includes("order")) return "/icons/items/scroll_key.png";
      if (keyName.includes("mechanism") || keyName.includes("device") || keyName.includes("core")) return "/icons/items/artifact.png";
      if (keyName.includes("fragment") || keyName.includes("shard")) return "/icons/items/crystal.png";
      if (keyName.includes("token") || keyName.includes("coin")) return "/icons/items/coin.png";
      return "/icons/items/key_item.png";

    case "treasure":
      // Crafting materials
      const treasureName = item.name.toLowerCase();
      if (treasureName.includes("ore") || treasureName.includes("metal")) return "/icons/items/ore.png";
      if (treasureName.includes("leather") || treasureName.includes("hide")) return "/icons/items/leather.png";
      if (treasureName.includes("fang") || treasureName.includes("claw") || treasureName.includes("bone")) return "/icons/items/fang.png";
      if (treasureName.includes("essence") || treasureName.includes("mist")) return "/icons/items/essence.png";
      if (treasureName.includes("stone") || treasureName.includes("shard") || treasureName.includes("crystal")) return "/icons/items/gem.png";
      if (treasureName.includes("cog") || treasureName.includes("gear")) return "/icons/items/cog.png";
      if (treasureName.includes("chain")) return "/icons/items/chain.png";
      if (treasureName.includes("coin")) return "/icons/items/coin.png";
      return "/icons/items/treasure.png";

    case "shard":
      return "/icons/items/shard.png";

    default:
      return "/icons/items/unknown.png";
  }
}

// ============================================
// STEAL SYSTEM - Rarity-based steal resistance
// ============================================

/**
 * Get steal resistance based on item rarity
 * Higher values = harder to steal
 * Returns a value from 0-100 representing base resistance percentage
 */
export function getStealResistance(rarity: Item["rarity"]): number {
  switch (rarity) {
    case "common":
      return 10;      // 10% base resistance - easy to steal
    case "uncommon":
      return 35;      // 35% base resistance
    case "rare":
      return 60;      // 60% base resistance - difficult
    case "epic":
      return 80;      // 80% base resistance - very difficult
    case "legendary":
      return 95;      // 95% base resistance - nearly impossible
    default:
      return 50;
  }
}

/**
 * Get all stealable items from inventory (excludes key items and equipment)
 */
export function getStealableItems(inventory: Inventory): { item: Item; quantity: number }[] {
  return inventory.items.filter(
    (slot) =>
      slot.quantity > 0 &&
      slot.item &&
      slot.item.type !== "key" &&
      !isEquipment(slot.item)
  );
}

/**
 * Calculate steal success chance
 * @param itemRarity - Rarity of the target item
 * @param thiefLuck - Luck stat of the thief (0-20 typical range)
 * @param targetLuck - Luck stat of the target (0-20 typical range)
 * @returns Success chance as a percentage (0-100)
 */
export function calculateStealChance(
  itemRarity: Item["rarity"],
  thiefLuck: number,
  targetLuck: number
): number {
  const baseResistance = getStealResistance(itemRarity);

  // Base success chance: 100 - resistance
  let successChance = 100 - baseResistance;

  // Thief luck bonus: +2% per luck point
  successChance += thiefLuck * 2;

  // Target luck penalty: -1.5% per luck point (harder to steal from lucky targets)
  successChance -= targetLuck * 1.5;

  // Clamp between 5% (always some chance) and 95% (never guaranteed)
  return Math.max(5, Math.min(95, successChance));
}

/**
 * Select a random item to attempt to steal, weighted by rarity
 * Common items are more likely to be targeted
 */
export function selectItemToSteal(stealableItems: { item: Item; quantity: number }[]): Item | null {
  if (stealableItems.length === 0) return null;

  // Weight items by inverse rarity (common items more likely to be targeted)
  const weights: { item: Item; weight: number }[] = stealableItems.map((slot) => {
    let weight: number;
    switch (slot.item.rarity) {
      case "common":
        weight = 50;
        break;
      case "uncommon":
        weight = 30;
        break;
      case "rare":
        weight = 15;
        break;
      case "epic":
        weight = 4;
        break;
      case "legendary":
        weight = 1;
        break;
      default:
        weight = 20;
    }
    return { item: slot.item, weight };
  });

  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let random = Math.random() * totalWeight;

  for (const { item, weight } of weights) {
    random -= weight;
    if (random <= 0) return item;
  }

  return stealableItems[0]?.item ?? null;
}
