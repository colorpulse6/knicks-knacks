# Havenwood Village — Map Layout

## Overview

Havenwood is composed of 8 interconnected maps forming a village hub with surrounding areas. The Village Square is the central node connecting to all districts.

```
                    ┌─────────────────┐
                    │  Lumina Estate   │
                    │   40x32 @32px   │
                    └───────┬─────────┘
                            │ (19-20, 31) ↔ (21, 9)
                    ┌───────┴─────────┐
                    │  Estate Road    │
                    │   32x48 @32px   │
                    └───────┬─────────┘
                            │ (0-16, 47) ↔ (30-31, 5)
                            │ North: (30-31, 4)
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    West: (0, 21-22)        │          East: (47, 19-22)
         │     ┌────────────┴────────────┐     │
         │     │   Havenwood Square      │     │
         │     │      48x32 @32px        │     │
         │     │                         │     │
         │     │  Tavern: (36, 11)       │     │
         │     └────────────┬────────────┘     │
         │                  │                  │
┌────────┴────────┐  South: (9-34, 31)  ┌─────┴──────────┐
│  Market Row     │         │           │ Residential    │
│  24x16 @64px    │         │           │ Lane           │
│                 │  ┌──────┴──────┐    │ 24x16 @64px    │
│ Shop: (9, 5)   │  │ Waterfront  │    │                │
│                 │  │ 24x16 @64px │    │ Inn: (3-4, 6)  │
└────────┬────────┘  └─────────────┘    └────────────────┘
         │
    West: (0, 8)
         │
┌────────┴────────┐
│   Outskirts     │
│   35x25 @16px   │──→ Bandit Camp / Whispering Ruins
└─────────────────┘
```

## Map Details

### Havenwood Square (central hub)
- **ID:** `havenwood`
- **Size:** 48x32 tiles @ 32px = 1536x1024px
- **Background:** `/backgrounds/havenwood_square.png`
- **Key features:** Central fountain (blocked ~x19-29, y14-18), overhead tree canopy regions
- **Exits:**
  - North → Estate Road: (30-31, 4) → estate road (9-10, 46)
  - East → Residential: (47, 19-22) → residential (1, 7-8)
  - South → Waterfront: (9-34, 31) → waterfront (11, 1)
  - West → Market: (0, 21-22) → market (22, 7-8)
  - Tavern entrance: (36, 11) → rusted_cog_tavern (7, 10)
- **NPCs:** Elder Morris (14, 18), Tom (12, 22), Anna (34, 20), Town Crier (20, 12)
- **Events:** Save point (22, 19), notice board (35, 11), fountain examine (18, 14), secret chest (2, 4)

### Estate Road
- **ID:** `havenwood_estate_road`
- **Size:** 32x48 tiles @ 32px = 1024x1536px (portrait)
- **Background:** `/backgrounds/havenwood_estate_road.png`
- **Key features:** Winding S-curve cobblestone road, hedgerows, lampposts
- **Exits:**
  - North → Lumina Estate: (19-21, 8) → estate (19-20, 29) [requires `found_mechanism`]
  - South → Square: (0-16, 47) → square (30-31, 5)
- **NPCs:** Gate Guard (19, 9), Servant (20, 25)

### Lumina Estate (interior)
- **ID:** `lumina_estate`
- **Size:** 40x32 tiles @ 32px = 1280x1024px
- **Background:** `/backgrounds/lumina_estate.png`
- **Key features:** Pillars with walk-behind, study desk, bookshelves, chandelier
- **Exits:**
  - South → Estate Road: (19-20, 31) → estate road (21, 9)
- **NPCs:** Lady Lyra (20, 6), Sebastian butler (12, 20), Estate Guard (24, 26)
- **Events:** Save point (28, 20), desk examine, bookshelves, portrait, armor

### The Rusted Cog Tavern (interior)
- **ID:** `rusted_cog_tavern`
- **Size:** 16x12 tiles @ 32px = 512x384px
- **Background:** `/backgrounds/rusted_cog_tavern.png`
- **Key features:** Bar counter, tables, fireplace, exit barrel frames
- **Exits:**
  - South → Square: (7, 11) → square (36, 12)
- **NPCs:** Barkeep Greta (7, 1), Weary Traveler (4, 5), Local Farmer (11, 8), Hooded Figure (14, 5) [hidden after `ai_first_contact`]

### Market Row
- **ID:** `havenwood_market`
- **Size:** 24x16 tiles @ 64px = 1536x1024px
- **Background:** `/backgrounds/havenwood_market.png`
- **Key features:** Shop facades, guardhouse, market stalls
- **Exits:**
  - East → Square: (23, 7-8) → square (2, 15-16)
  - West → Outskirts: (0, 8) → outskirts (17, 23)
- **NPCs:** Merchant Aldric (8, 7), Captain Bren (3, 8), Frida (13, 6), Weaver Holt (17, 10), Street Urchin (19, 12)
- **Events:** Aldric's shop (9, 5), weapon chest (21, 3), moonpetal #2 (21, 12)

### Residential Lane
- **ID:** `havenwood_residential`
- **Size:** 24x16 tiles @ 64px = 1536x1024px
- **Background:** `/backgrounds/havenwood_residential.png`
- **Key features:** Inn, cottages, herb garden with hedge, stone well
- **Exits:**
  - West → Square: (0, 7-8) → square (45, 15-16)
- **NPCs:** Herbalist Mira (16, 9), Innkeeper Rowan (5, 6), Grandmother Edith (10, 11), Whiskers the cat (18, 12)
- **Events:** Inn (3-4, 6), healing chest (19, 6), moonpetal #1 (19, 12), moonpetal #3 (3, 13), well examine (11, 8)

### Havenwood Waterfront
- **ID:** `havenwood_waterfront`
- **Size:** 48x32 tiles @ 32px = 1536x1024px
- **Background:** `/backgrounds/havenwood_waterfront.png`
- **Key features:** Docks, fishing boats, beach, marsh with hidden path
- **Exits:**
  - North → Square: (14-22, 5) → square (23-24, 29)
- **NPCs:** Old Reed (10, 17), Sal (20, 13), Orin the hermit (26, 17) [visible after `found_mechanism`]
- **Events:** Save point (15, 15), shard chest (29, 18), fishing boat examine (5, 18), marsh examine (28, 17), tide pool (8, 22)

### Havenwood Outskirts
- **ID:** `havenwood_outskirts`
- **Size:** 35x25 tiles @ 16px = 560x400px
- **Key features:** Connecting area to wilderness, paths to ruins and bandit camp
- **Exits:**
  - South → Market: (17, 23) → market (0, 8)
  - North → Whispering Ruins
  - East → Bandit Camp
- **Random encounters:** Enabled in wilderness zones

## Connection Summary

| From | Direction | To | Source Tiles | Target Tiles |
|------|-----------|-----|-------------|-------------|
| Square | North | Estate Road | (30-31, 4) | (9-10, 46) |
| Square | East | Residential | (47, 19-22) | (1, 7-8) |
| Square | South | Waterfront | (9-34, 31) | (14, 6) |
| Square | West | Market | (0, 21-22) | (22, 7-8) |
| Square | Tavern | Rusted Cog | (36, 11) | (7, 10) |
| Estate Road | North | Lumina Estate | (19-21, 8) | (19-20, 29) |
| Market | West | Outskirts | (0, 8) | (17, 23) |
