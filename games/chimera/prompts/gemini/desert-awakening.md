# Desert Awakening — Scene Direction for Claude Code

## Your Role
You are the creative director for **Chimera**, an FF6-style JRPG. I need you to write the exact creative content for the game's **desert awakening scene** — the interactive cinematic that bridges the execution scene and Havenwood village exploration.

## What the Player Has Already Seen
1. **Title Screen** — "CHIMERA"
2. **Intro Cinematic** — Surrealist video: melting clockwork, code devolving into ancient scripture
3. **SystemBootScreen** — Terminal diagnostic text: "Prepare the Execution Platform." → Countdown → white-out
4. **Execution Scene** — Camera pans down to reveal Kai bound on an execution platform. System voice: "PURGE_ENTITY [KAI_7.34]. NULLIFICATION SEQUENCE ENGAGED." Thought bubbles flash ("My hands... can't move.", "Elara...?"). Heartbeat accelerates. The killing blow is about to land — reality fractures (chromatic aberration, block displacement, error text). White-out.
5. **Awakening text** — Over black: "Static..." → "Where is the cold?" → "Am I... still here?"

The desert awakening scene **opens from this blackness** — the player sees nothing but darkness and begins to receive sensory fragments.

## What This Scene Must Do
1. **Ground Kai in physical sensation** — After the abstract horror of the execution, anchor him in the body: warmth, sand, breathing, weight
2. **Introduce mystery** — Who are these hooded figures? How did Kai get here? Why is he alive?
3. **Establish the strangers** — These hooded creatures are silent, unknowable. Not threatening, not comforting. Just... present. Watching.
4. **Create tonal shift** — The execution was cold/clinical/terrifying. This scene is warm/quiet/alien. Like surfacing from deep water into strange air.
5. **Transition to Havenwood** — Scene ends with Kai losing consciousness again, implying time passes before he wakes in the village

## Technical Constraints
- **Two phases of interactive text** (FF-style: text types out, player presses Enter to advance each line):
  - **Darkness phase**: Black screen, white italic text centered. Kai's internal monologue as consciousness returns.
  - **Scene phase**: Background image visible (desert hut interior), text in a dialogue box at the bottom. Kai's observations of his surroundings.
- Between the two phases, the background image **fades in over ~2 seconds**
- Player controls pacing (press Enter to advance each line)
- Total scene: ~1-2 minutes depending on reading speed
- Skippable via Escape

## What I Need

### 1. Darkness Lines (4-8 lines)
Kai's internal monologue as consciousness slowly returns. Each line is a separate text advance (player presses Enter between them).

For each:
```
LINE [N]:
Text: "[exact text]"
Purpose: [what this conveys — sensory return, confusion, awareness of others]
```

**Guidelines:**
- Start from void/nothingness, build toward bodily awareness
- Short fragments, not full sentences
- Sensory: warmth, texture, sound, breathing
- The last darkness line should hint at visual awareness (shapes, light) to bridge into the reveal
- NO names, NO memories — just raw sensation returning

### 2. Scene Lines (4-8 lines)
After the background fades in, Kai's observations. These appear in a dialogue-box style at the bottom of the screen over the desert hut image.

For each:
```
LINE [N]:
Text: "[exact text]"
Purpose: [what Kai notices, what the player learns]
```

**Guidelines:**
- First line: immediate visual reaction (the shelter, the light)
- Middle lines: noticing the hooded figures, the strangeness, the quiet
- The figures should feel deeply alien — not human body language, unnervingly still
- One line where Kai tries to move or speak and can't
- Final line: consciousness slipping away again (sets up the time-skip to Havenwood)
- Slightly longer than darkness lines but still brief

### 3. GPT Art Prompt (Background Image)
Write a complete prompt for GPT-4o image generation:
- **Portrait orientation (1024x1536)**
- Interior of a rough desert shelter/hut (hide walls, wooden frame, sand floor)
- Warm amber light filtering through gaps in the walls
- A simple cot or bedroll on the ground (viewed from the perspective of someone lying on it, looking up/forward)
- 2-3 hooded robed figures standing silently, faces completely hidden in shadow
- Medieval-meets-mysterious aesthetic — could be a desert nomad camp or something stranger
- Color palette: warm ambers, deep browns, dusty orange, shadows
- Atmosphere: quiet, alien calm. Not threatening, but deeply unfamiliar
- What to AVOID: modern elements, bright colors, sci-fi technology, faces visible under hoods

### 4. Tone Guidance
A few sentences describing the emotional arc of this scene that I can reference during implementation. How should it FEEL moment to moment?

## Reference Material

**Kai**: Red spiky hair, navy armor, blue cape, amber eyes. Here he's barely conscious — no armor (stripped or lost during the Disruption). Just a young man waking in a strange place.

**The Hooded Strangers**: These are the same mysterious figures who appear later in the Rusted Cog Tavern. In-game they speak in machine code and hex values. Here they are completely silent. Their nature is unknown — are they System agents? Rebels? Something else entirely? The player should not be able to tell.

**The Desert**: This is NOT Havenwood's region. Kai has been displaced — the Temporal Distortion deposited him somewhere far from the execution platform. The desert suggests a liminal, in-between place.

**Tone**: Quiet dread giving way to exhausted acceptance. Kai has just been nearly killed. He doesn't know where he is. He can barely move. But he's alive, and that's something. The scene should feel like the moment after a car crash — ringing silence, strange details in sharp focus, everything slightly unreal.
