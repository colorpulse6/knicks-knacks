# Chimera Quest Map - Chapter 1

## Visual Overview

```
                            ┌─────────────────────────────────────────────────────────────┐
                            │                    CHAPTER 1: HAVENWOOD                      │
                            └─────────────────────────────────────────────────────────────┘

    ╔═══════════════════════════════════════════════════════════════════════════════════════╗
    ║                                    MAIN STORY                                          ║
    ╚═══════════════════════════════════════════════════════════════════════════════════════╝

                                        [GAME START]
                                             │
                                             ▼
                            ┌────────────────────────────────┐
                            │     WHISPERS OF TROUBLE        │
                            │    ─────────────────────────   │
                            │  Giver: Elder Morris           │
                            │  Location: Havenwood Village   │
                            ├────────────────────────────────┤
                            │  1. Talk to Captain Bren       │
                            │  2. Patrol the Outskirts       │
                            │  3. Find bandit evidence       │
                            │  4. Report to Elder Morris     │
                            ├────────────────────────────────┤
                            │  Rewards: 75g, 40 XP           │
                            │  Unlocks: outskirts_unlocked   │
                            │           bandit_camp_discovered│
                            └────────────────────────────────┘
                                             │
                                             │ [bandit_threat_known]
                                             ▼
                            ┌────────────────────────────────┐
                            │      THE BANDIT PROBLEM        │
                            │    ─────────────────────────   │
                            │  Giver: Elder Morris           │
                            │  Location: Bandit Camp         │
                            ├────────────────────────────────┤
                            │  1. Enter the Bandit Camp      │
                            │  2. Free prisoners (0/3)       │
                            │  3. Defeat Bandit Chief Vorn   │
                            │  4. Investigate hidden cellar  │
                            │  5. Return artifact to Morris  │
                            ├────────────────────────────────┤
                            │  Rewards: 200g, 100 XP         │
                            │           broken_mechanism     │
                            │           3x sanguine_draught  │
                            │  Unlocks: found_mechanism      │
                            │           strange_tech_seen    │
                            └────────────────────────────────┘
                                             │
                                             │ [found_mechanism]
                                             ▼
                            ┌────────────────────────────────┐
                            │       SEEKING ANSWERS          │
                            │    ─────────────────────────   │
                            │  Giver: Elder Morris           │
                            │  Location: Havenwood → Lumina  │
                            ├────────────────────────────────┤
                            │  1. Ask villagers about scholars│
                            │  2. Learn about Lumina archives│
                            │  3. Gain audience with Lyra    │
                            ├────────────────────────────────┤
                            │  Rewards: 50g, 60 XP           │
                            │  Unlocks: met_lyra             │
                            │           noble_invitation     │
                            └────────────────────────────────┘
                                             │
                                             │ [met_lyra + noble_invitation]
                                             ▼
                            ┌────────────────────────────────┐
                            │     THE LADY'S CURIOSITY       │
                            │    ─────────────────────────   │
                            │  Giver: Lady Lyra Lumina       │
                            │  Location: Whispering Ruins    │
                            ├────────────────────────────────┤
                            │  1. Escort Lyra to the Ruins   │
                            │  2. Navigate to Terminal       │
                            │  3. Witness Lyra's reaction    │
                            ├────────────────────────────────┤
                            │  Rewards: 150 XP               │
                            │  Unlocks: lyra_recruited       │
                            │           lyra_saw_terminal    │
                            │  Party: +LYRA LUMINA           │
                            └────────────────────────────────┘
                                             │
                                             ▼
                                      [END CHAPTER 1]
                                      [BEGIN CHAPTER 2]


    ╔═══════════════════════════════════════════════════════════════════════════════════════╗
    ║                                    SIDE QUESTS                                         ║
    ╚═══════════════════════════════════════════════════════════════════════════════════════╝


  ┌─────────────────────────────┐     ┌─────────────────────────────┐     ┌─────────────────────────────┐
  │  THE HERBALIST'S REQUEST    │     │      LOST SHIPMENT          │     │    THE HOODED STRANGER      │
  │  ─────────────────────────  │     │  ─────────────────────────  │     │  ─────────────────────────  │
  │  Giver: Herbalist Mira      │     │  Giver: Merchant Aldric     │     │  Giver: Barkeep Greta       │
  │  Location: Havenwood/Forest │     │  Location: Outskirts        │     │  Location: Rusted Cog Tavern│
  │  Requires: [none]           │     │  Requires: outskirts_unlocked│    │  Requires: [none]           │
  ├─────────────────────────────┤     ├─────────────────────────────┤     ├─────────────────────────────┤
  │  1. Gather Moonpetals (0/3) │     │  1. Find ambushed cart      │     │  1. Approach the stranger   │
  │  2. Return to Mira          │     │  2. Defeat bandits          │     │  2. Follow the compulsion   │
  ├─────────────────────────────┤     │  3. Return supplies         │     │  3. Find cache in ruins     │
  │  Rewards: 100g, 50 XP       │     ├─────────────────────────────┤     │  4. Return to stranger      │
  │           2x sanguine_draught│    │  Rewards: 100g, 40 XP       │     ├─────────────────────────────┤
  │  Flags: helped_herbalist    │     │           2x sanguine_draught│    │  Rewards: 75 XP             │
  │         mira_shop_discount  │     │  Flags: helped_aldric       │     │           observer's_token  │
  └─────────────────────────────┘     │         aldric_discount     │     │  Flags: met_observer        │
           │                          └─────────────────────────────┘     │         ai_first_contact    │
           │                                     │                        └─────────────────────────────┘
           │                                     │                                   │
           ▼                                     ▼                                   ▼
    [Available from start]              [After: outskirts_unlocked]         [Available from start]
                                                                             [STRANGER VANISHES]
                                                                             [Ties to ECHO-7 in Act II]
```

---

## Quest Dependency Chart

```
                                    ┌──────────────────┐
                                    │    GAME START    │
                                    └────────┬─────────┘
                                             │
               ┌─────────────────────────────┼─────────────────────────────┐
               │                             │                             │
               ▼                             ▼                             ▼
    ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
    │  Herbalist's     │         │  Whispers of     │         │  The Hooded      │
    │  Request [SIDE]  │         │  Trouble [MAIN]  │         │  Stranger [SIDE] │
    └──────────────────┘         └────────┬─────────┘         └──────────────────┘
                                          │
                          ┌───────────────┴───────────────┐
                          │                               │
                          ▼                               ▼
              ┌──────────────────┐            ┌──────────────────┐
              │  Lost Shipment   │            │  The Bandit      │
              │  [SIDE]          │            │  Problem [MAIN]  │
              │  (needs outskirts│            └────────┬─────────┘
              │   unlocked)      │                     │
              └──────────────────┘                     │
                                                       ▼
                                          ┌──────────────────┐
                                          │  Seeking Answers │
                                          │  [MAIN]          │
                                          └────────┬─────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │  The Lady's      │
                                          │  Curiosity [MAIN]│
                                          └────────┬─────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │  LYRA JOINS      │
                                          │  PARTY           │
                                          └──────────────────┘
```

---

## Quick Reference Table

| Quest | Type | Giver | Required Flags | Key Reward | Unlocks |
|-------|------|-------|----------------|------------|---------|
| Whispers of Trouble | MAIN | Elder Morris | - | 75g, 40 XP | `bandit_threat_known`, `outskirts_unlocked` |
| The Bandit Problem | MAIN | Elder Morris | `bandit_threat_known` | 200g, 100 XP | `found_mechanism` |
| Seeking Answers | MAIN | Elder Morris | `found_mechanism` | 50g, 60 XP | `met_lyra`, `noble_invitation` |
| The Lady's Curiosity | MAIN | Lady Lyra | `met_lyra`, `noble_invitation` | 150 XP, **LYRA** | `lyra_recruited` |
| The Herbalist's Request | SIDE | Herbalist Mira | - | 100g, 50 XP | `mira_shop_discount` |
| Lost Shipment | SIDE | Merchant Aldric | `outskirts_unlocked` | 100g, 40 XP | `aldric_discount` |
| The Hooded Stranger | SIDE | Barkeep Greta | - | 75 XP, Observer's Token | `ai_first_contact` |

---

## Location Map

```
                              HAVENWOOD REGION - CHAPTER 1
    ═══════════════════════════════════════════════════════════════════════

                                    [LUMINA ESTATE]
                                         │
                                         │ (north)
                                         │
    [RUSTED COG TAVERN] ◄──── [HAVENWOOD VILLAGE] ────► [HAVENWOOD OUTSKIRTS]
          │                        │                            │
          │                        │                            │ (east)
          │                        │                            │
     Hooded Stranger          Elder Morris                [BANDIT CAMP]
     Barkeep Greta            Captain Bren                      │
                              Herbalist Mira                    │
                              Merchant Aldric              [BANDIT CELLAR]
                                                          (hidden tech)
                                         │
                                         │ (south)
                                         │
                               [WHISPERING RUINS]
                                    │
                               [TERMINAL CHAMBER]
                               (Lyra recruitment)
                               (Observer's cache)
```

---

## Story Flags Summary

### Chapter 1 Progression Flags
| Flag | Set By | Enables |
|------|--------|---------|
| `bandit_threat_known` | Whispers of Trouble | The Bandit Problem |
| `outskirts_unlocked` | Whispers of Trouble | Lost Shipment, exploration |
| `bandit_camp_discovered` | Whispers of Trouble | Map marker |
| `bandits_defeated` | The Bandit Problem | - |
| `found_mechanism` | The Bandit Problem | Seeking Answers |
| `strange_tech_seen` | The Bandit Problem | - |
| `met_lyra` | Seeking Answers | The Lady's Curiosity |
| `noble_invitation` | Seeking Answers | The Lady's Curiosity |
| `lyra_recruited` | The Lady's Curiosity | **Lyra joins party** |
| `lyra_saw_terminal` | The Lady's Curiosity | - |

### Side Quest Flags
| Flag | Set By | Effect |
|------|--------|--------|
| `helped_herbalist` | Herbalist's Request | - |
| `mira_shop_discount` | Herbalist's Request | Shop discount |
| `helped_aldric` | Lost Shipment | - |
| `aldric_discount` | Lost Shipment | Shop discount |
| `met_observer` | The Hooded Stranger | - |
| `ai_first_contact` | The Hooded Stranger | **Stranger vanishes**, foreshadows Echo-7 |

---

## Future: Act II Connections

```
    CHAPTER 1 END                              CHAPTER 2
    ─────────────                              ─────────────

    ┌─────────────────┐                   ┌─────────────────┐
    │ Lyra recruited  │ ─────────────────►│ Lyra companion  │
    │ (party member)  │                   │ questlines      │
    └─────────────────┘                   └─────────────────┘

    ┌─────────────────┐                   ┌─────────────────┐
    │ ai_first_contact│ ─────────────────►│ ECHO-7          │
    │ (stranger quest)│                   │ (recruitable    │
    │                 │                   │  stranger)      │
    └─────────────────┘                   └─────────────────┘

    ┌─────────────────┐                   ┌─────────────────┐
    │ found_mechanism │ ─────────────────►│ Tech discovery  │
    │ (bandit cellar) │                   │ questlines      │
    └─────────────────┘                   └─────────────────┘
```
