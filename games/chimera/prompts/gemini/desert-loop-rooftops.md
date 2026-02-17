# Desert Loop & Havenwood Rooftop Entry — Scene Direction for Claude Code

## Your Role
You are the creative director for **Chimera**, an FF6-style JRPG. I need you to write creative content for two connected sequences: the **desert collapse** (Kai wanders the desert in circles until he passes out) and the **Havenwood rooftop entry** (Kai wakes in an isolated garden and descends through the village rooftops into the streets below).

## What the Player Has Already Seen
1. **Title Screen** → **Intro Cinematic** → **SystemBootScreen** → **Execution Scene**
2. **Desert Awakening** — Kai wakes in a tent surrounded by hooded strangers. Text over black fades in/out, gradually revealing the tent interior with Kai lying on a cot and three hooded figures standing around him. Player-paced text.
3. **Tent Exploration** — Kai can walk around the tent, examine objects, interact with the silent hooded strangers. They say nothing. Just watch.
4. **Desert Exploration** — Kai exits the tent and explores the desert:
   - **Desert Plateau** — Rocky terrain outside the tent. Paths lead east and south.
   - **Desert Wastes** — Open sand expanse with shimmer-patches (Temporal Distortion echoes).
   - **Desert Ridge** — Elevated terrain. Can SEE Havenwood in the distance but can't reach it.
   - The maps form a **confusing loop**: plateau ↔ wastes, plateau ↔ ridge, ridge → wastes → plateau. There is no exit. The player wanders in circles.

## What This Content Must Do

### Part 1: The Desert Collapse
After enough wandering (6 map transitions), Kai collapses from exhaustion and heat. This is an **auto-advancing cinematic** — text appears on a black screen, each line dimmer than the last (consciousness fading). The player can press Enter to snap typing but lines auto-advance after a pause.

**What I need:**

#### Desert Collapse Lines (4-6 lines)
```
LINE [N]:
Text: "[exact text]"
Purpose: [what this conveys]
```

**Guidelines:**
- Short, fragmented — a mind shutting down
- Build from disorientation to physical failure to blackout
- Sensory: heat, sameness, legs failing, sand
- The desert should feel hostile through repetition, not violence
- NO mention of the tent or strangers — Kai is alone now
- Last line should be very short — a single word or fragment as consciousness ends
- Each line should be dimmer/quieter in tone (text literally fades in the game)

### Part 2: The Havenwood Rooftop Entry
Kai wakes in an **isolated garden** atop the Lumina Estate (the noble family's palace). He has no memory of how he got here. The garden is:
- Walled on all sides, no gate, no door — only a ladder down
- Overgrown and abandoned — strange blue flowers, a dry stone fountain, moss
- Beautiful but alien — Kai was in sand 5 minutes ago, now he's in green
- No people, no NPCs — total solitude

From the garden, Kai descends via ladder to the **rooftops** of Havenwood village:
- **Rooftops West** — Clay tile roofs, chimneys, narrow walkways between buildings. Can see the village streets far below. A bridge between roof peaks.
- **Rooftops East** — Tighter spaces, a skylight looking down into someone's study, a bird's nest, loose tiles. A second ladder leads down.
- **Back Alley** — Narrow alley between tall buildings. Barrels, crates, a puddle. A locked door, scratched graffiti. Opens south into the village square.

The rooftop sequence is **pure exploration** — no cinematics, no text overlays. The player walks Kai through these maps using the normal game controls. The content I need is for **examine triggers** (interactive objects the player can inspect) and **environmental flavor text**.

**What I need:**

#### Palace Garden Examine Texts (5-7 items)
```
EXAMINE: [item_id]
Object: [what it is]
Text: "[what Kai sees/thinks when examining]"
Subtext: [the hidden meaning or thematic purpose]
```

**Items to write for:**
- The stone bench where Kai woke up (impression in the moss)
- The dry fountain (cracked, mossy, abandoned)
- The strange blue flowers (geometric patterns, pulsing)
- The high garden walls (no gate — how did he get here?)
- The view over the wall (rooftops, village below, smoke, life)
- The ladder down (crude wood, the only way out)
- [Optional] Any additional detail that reinforces the mystery

#### Rooftops Examine Texts (8-10 items across both maps)
```
EXAMINE: [item_id]
Location: [rooftops_west or rooftops_east]
Object: [what it is]
Text: "[what Kai sees/thinks]"
Subtext: [hidden meaning]
```

**Items to write for (Rooftops West):**
- A chimney (warm, smoke, someone's home below)
- View down to the street (people, merchants, guards)
- A dormer window (shuttered from inside)
- A weathervane (spinning without wind)
- A balcony view (whole village visible, fountain in square)

**Items to write for (Rooftops East):**
- A skylight (looking into a dim study — bookshelves, candles)
- A bird's nest (eggs, watchful mother)
- A chimney cluster (smoke rises at exactly the same angle — simulation hint)
- A loose roof tile (thicker than it should be)
- [Optional] Anything that hints at the simulation subtly

#### Alley Examine Texts (5-6 items)
```
EXAMINE: [item_id]
Object: [what it is]
Text: "[what Kai sees/thinks]"
Subtext: [hidden meaning]
```

**Items to write for:**
- Barrels (vinegar, salt, merchant storage)
- Crates (stamped with a gear-in-circle symbol)
- A puddle (Kai sees his reflection — first time he sees himself)
- A locked door (bolted from inside)
- Scratched graffiti (eye inside triangle)
- The view of the square ahead (sunlight, voices, fountain)

### Part 3: GPT Art Prompts
Write complete GPT-4o image generation prompts for each asset:

#### 3a. Palace Garden Background (1024x1536 portrait)
- Isolated rooftop garden surrounded by high stone walls
- Overgrown: wildflowers, climbing vines, cracked stone paths
- A dry stone fountain in the center (cracked, mossy)
- A stone bench near the top (where Kai woke up)
- A wooden ladder propped against the far wall
- Soft green-gold light, early morning or late afternoon
- Medieval architecture visible beyond the walls (rooftops, towers)
- Color palette: sage green, warm stone, soft gold, moss
- What to AVOID: modern elements, people, sci-fi tech, perfectly maintained garden

#### 3b. Havenwood Rooftops West Background (1024x1536 portrait)
- Top-down perspective of clay/terracotta tile rooftops
- Multiple roof levels at different heights
- Brick chimneys with wisps of smoke
- Narrow wooden plank bridges between roofs
- A dormer window, weathervanes
- Village streets visible far below between buildings
- Color palette: warm terracotta, clay orange, aged wood brown
- Time of day: warm afternoon sunlight
- What to AVOID: modern roofing, flat roofs, sci-fi elements

#### 3c. Havenwood Rooftops East Background (1024x1536 portrait)
- Similar terracotta rooftop scene, tighter/more cramped
- A glass skylight in one roof
- Steeper roof angles
- A small wooden ladder leading down at the edge
- More shadow — buildings closer together
- Color palette: same as west but slightly cooler/shadowed
- What to AVOID: modern elements, wide open spaces

#### 3d. Havenwood Alley Background (1024x1536 portrait)
- Narrow back alley between tall medieval buildings
- Cobblestone ground, worn and uneven
- Wooden barrels and crates stacked against walls
- A puddle reflecting the narrow strip of sky above
- Tall building walls on both sides — very enclosed
- Warm light at the far end where the alley opens to the square
- Color palette: shadow grays, warm stone, amber highlights at the exit
- What to AVOID: modern elements, wide spaces, bright lighting

#### 3e. Kai Passed Out Sprite (1024x1536 portrait)
- Single character sprite of Kai lying unconscious on the ground
- **Chibi proportions** (same style as world sprites: 2-3 head-tall, oversized head)
- Lying on his side or face-down, limbs slightly splayed
- Red spiky hair visible, navy clothing (no armor — lost during Disruption)
- NO background — solid white background for easy extraction
- Style: soft cel-shading, clean outlines
- This sprite is reusable: it will be composited onto both desert sand and garden grass backgrounds
- What to AVOID: realistic proportions, detailed backgrounds, dark backgrounds

### Part 4: Tone Guidance

#### Desert Collapse Tone
A few sentences I can reference during implementation. How should this feel?

#### Rooftop Entry Tone
How should the garden → rooftops → alley sequence feel? What's the emotional arc?

## Reference Material

**Act I Writing Rules:**
- NO technical terminology (no "simulation," "code," "data," "algorithm")
- Anomalies are experienced, never explained
- Clues are environmental, not expositional
- The player should feel uneasy without knowing why
- Every examine text should carry a philosophical subtext (but expressed through medieval metaphor)
- Characters speak naturally within their medieval worldview

**Kai's current state:**
- Amnesiac — no memory of the execution
- Was tended by hooded strangers in the desert (doesn't remember clearly)
- Collapsed from heat exhaustion
- Wakes in a garden with no idea how he got there
- Confused, exhausted, alone
- Red spiky hair, amber eyes, no armor (just simple clothes)

**The desert will return later in the game** — these maps are reused in mid-to-late game when Kai revisits the desert region with more context. The hooded strangers have a larger role to play. Document this in your tone guidance.
