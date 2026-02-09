# The Source Code Lattice - Leveling System

## Overview

The Source Code Lattice is Project Chimera's progression system, designed to bridge the gap between the medieval facade and sci-fi reality. As characters gain **Legacy Data** (experience points), they earn **Optimization Points (OP)** to unlock nodes on their personal Lattice—a skill grid that visually transforms as the player's understanding of the simulation deepens.

## Visual Progression

The Lattice's appearance evolves with "System Awareness":

| Awareness Level | Visual Style |
|-----------------|--------------|
| 0-30% | Medieval constellation chart on aged parchment |
| 31-60% | Subtle circuitry patterns emerge beneath the stone |
| 61-100% | Full circuit-board aesthetic with data flowing through nodes |

---

## Stat Terminology

While the UI displays standard RPG terms to maintain the facade, the underlying system uses technological terminology that becomes visible as System Awareness increases.

| Medieval Term | System Term | Description |
|---------------|-------------|-------------|
| HP | Integrity | Stability of the character's physical projection |
| MP | Bandwidth | Resource pool for spells and special abilities |
| Strength | Throughput | Physical damage output |
| Defense | Firewall | Resistance to physical damage |
| Magic | Processing | Efficacy of Echo Shard spells |
| Magic Defense | Encryption | Resistance to magical damage |
| Speed | Latency | Turn order and evasion (lower = faster) |
| Luck | Entropy | Critical hit chance and beneficial glitches |

---

## Experience & Leveling

### Experience Formula
```
XP to next level = 100 × 1.5^(level-1)
```

| Level | XP Required | Cumulative XP |
|-------|-------------|---------------|
| 2 | 100 | 100 |
| 3 | 150 | 250 |
| 4 | 225 | 475 |
| 5 | 338 | 813 |
| 10 | 2,563 | 8,850 |
| 20 | 96,993 | 296,985 |

### Optimization Points (OP)

OP are earned on level-up and spent to unlock Lattice nodes.

**Formula:**
```
OP per level = 2 + floor(level / 5)
```

| Level Range | OP per Level |
|-------------|--------------|
| 1-4 | 2 |
| 5-9 | 3 |
| 10-14 | 4 |
| 15-19 | 5 |
| 20+ | 6+ |

---

## Node Types

### Stat Nodes (Circle icons)
Small incremental stat increases. Most common node type.
- Cost: 1 OP
- Examples: +10 HP, +2 STR, +1 SPD

### Tech Nodes (Hexagon icons)
Unlock new abilities (physical skills, not magic).
- Cost: 2-3 OP
- Examples: Heavy Strike, Quick Slash, Parry

### Passive Routines (Diamond icons)
Permanent passive effects that modify battle behavior.
- Cost: 2-4 OP
- Examples: Counter (5% counter chance), Critical Edge (+5% crit)

### Core Nodes (Star icons)
Major upgrades at ring boundaries. Require adjacent nodes unlocked first.
- Cost: 5 OP
- Unlocked at milestone levels (10, 20, 30...)
- Define build direction

---

## Glitch Sector (Every 10 Levels)

At levels 10, 20, 30, 40, 50, 60, 70, 80, and 90, the character reaches a **Glitch Sector**—a mandatory choice point between safety and power.

### The Patch (Safe Choice)
- Significant but standard stat boost
- No drawbacks
- Medieval flavor: "Strengthen the Foundation"

### The Mutation (Risky Choice)
- Massive power spike
- Permanent drawback
- Sci-fi flavor: "Overclock the Code"

### Mutation Examples

| Level | Mutation | Benefit | Drawback |
|-------|----------|---------|----------|
| 10 | Overclocked CPU | +30% Speed | 10% chance stunned when hit |
| 20 | Memory Leak | +50% MP | -15% Max HP |
| 30 | Unstable Core | +25% all damage | 5% self-damage on attack |
| 40 | Buffer Overflow | Double crit damage | -10% accuracy |
| 50 | Ghost Protocol | 20% evasion | Cannot heal above 50% HP |

---

## Character Lattice Designs

### Kai - The Anomaly

**Archetype:** Magic Knight / Glitch User
**Lattice Shape:** Expanding spiral from center
**Theme:** Unpredictable paths that loop back, representing his glitched nature

**Key Nodes:**
- Temporal Edge enhancements
- Reality Slip passives
- Balanced physical/magical growth

**Starting Stats (Level 1):**
- HP: 120 | MP: 40
- STR: 12 | MAG: 8
- DEF: 10 | MDEF: 8
- SPD: 10 | LUCK: 8

**Unique Techs:**
- **Render Break** - Physical strike that lowers enemy Defense
- **Timeline Skip** (Passive) - 5% chance to skip enemy's turn

### Lyra - The Diplomat

**Archetype:** Support / Buffer
**Lattice Shape:** Symmetrical radial star with 6 rays
**Theme:** Balanced harmony reflecting her diplomatic nature

**Key Nodes:**
- Lucky Star enhancements
- Protective Aura passives
- Support magic and luck-based nodes

**Starting Stats (Level 1):**
- HP: 90 | MP: 60
- STR: 6 | MAG: 14
- DEF: 6 | MDEF: 12
- SPD: 12 | LUCK: 15

### Future Characters

| Character | Class | Lattice Shape | Focus |
|-----------|-------|---------------|-------|
| Rex | Architect | Blocky grid | Tank/Crafter |
| Seraph | Enforcer | Lightning bolt | Speed/DPS |
| Zenith | Entropy | Fractured web | Black Magic/Chaos |
| Valerian | Archivist | Geometric mandala | Support/Analyst |

---

## System Override (Limit Break)

### Dissonance Gauge

A limit break system that fills from:
- Taking damage (1% per 10 damage taken)
- Using glitch abilities (5% per use)
- Story events (variable)
- Choosing mutations (10% after choosing)

### Override Abilities

When the gauge reaches 100%, the character can use their Override once per battle:

| Character | Override | Effect |
|-----------|----------|--------|
| Kai | Reality Fracture | Heavy damage to all + chance to stun |
| Lyra | Probability Cascade | Full party heal + buffs |

---

## Integration with Echo Weaving

The Source Code Lattice complements the weapon-based magic system:

- **Echo Weaving (Weapons):** Provides active spells (Fire, Cure, Haste)
- **Lattice (Leveling):** Provides stats to use them effectively and passives to modify them

**Example:** Kai slots an Ignis Shard into his sword (weapon system) to gain "Fire". He then unlocks the "Pyromancer" passive node on the Lattice, making all Fire spells burn for extra damage.

---

## Lore: The System's Hidden Hand

The Source Code Lattice appears to be a medieval skill chart, but it's actually the System's interface for upgrading character "processes." The nodes represent:

- **Stat Nodes:** Memory allocation increases
- **Tech Nodes:** Subroutine installations
- **Passive Routines:** Background process activations
- **Core Nodes:** Major version updates

The Glitch Sectors are "system instability" events where the character must choose between a stable patch or accept a potentially powerful but buggy mutation.

Characters with high System Awareness (like Kai after discovering his true nature) begin to see through the medieval facade to the underlying code structure.
