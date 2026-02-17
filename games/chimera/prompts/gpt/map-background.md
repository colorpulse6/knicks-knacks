# GPT Prompt: Map Background

## Template

A pre-rendered background illustration for a 2D JRPG, in the style of Final Fantasy IX.

**Scene:** [SCENE_DESCRIPTION]

**Key Details:** [DETAILS — objects, textures, structural elements, visible landmarks]

**Lighting:** [LIGHTING — time of day, color temperature, shadows, atmosphere]

**Style:**

- Painterly, semi-realistic illustration with rich hand-painted textures
- Warm, storybook quality — detailed cobblestone, weathered wood grain, aged stone, lush foliage
- High-angle isometric perspective for interiors/villages, or eye-level for exteriors/landscapes
- Soft atmospheric lighting with volumetric light and natural shadows
- Dense environmental storytelling — props, clutter, signs of life
- No characters, UI, or text in the image

## Variables to Replace

- [SCENE_DESCRIPTION]: What the location is — e.g., "a narrow medieval back alley between tall stone walls"
- [DETAILS]: Specific objects and textures that define the space
- [LIGHTING]: Time of day and color mood

## After Generation

1. Save to: `games/chimera/drafts/backgrounds/[map_id].png`
2. Move to: `web/public/backgrounds/[map_id].png`
3. Reference in map data: `background: "/backgrounds/[map_id].png"`

---

## Current Map Prompts

### Palace Garden (`palace_garden`)

A pre-rendered background illustration for a 2D JRPG, in the style of Final Fantasy IX's pre-rendered backgrounds.

**Scene:** A hidden, walled garden — serene and idyllic, like a secret that time forgot. High stone walls covered in thick ivy enclose the space on all sides. There is no visible gate or door — the garden feels completely sealed off from the outside world. Inside, the garden is lush and overgrown with wildflowers, tall grass, ferns, and climbing roses spilling over every surface. The atmosphere is peaceful, dreamlike, almost too perfect.

**Composition (top-down, high-angle view looking into the garden):**

- **Center:** A dry stone fountain covered in moss, its basin cracked and filled with fallen petals. A stone maiden statue holds an empty pitcher. Despite being dry, the surrounding vegetation is impossibly lush — as if the garden waters itself.
- **Upper area:** A soft, sunlit flower bed — prominent and inviting, with colorful wildflowers (blues, purples, soft yellows) growing in a natural, overgrown sprawl. This bed should be large enough and visible enough that a character sprite could be placed sleeping in it. A folded cloth and a small water flask sit on the ground near the flowers.
- **Left and right:** Thick hedgerows line the inner walls, about waist-height, well-maintained but ancient. Ornamental stone urns sit at intervals along the hedge line, some cracked, some overflowing with vines.
- **Far edge (bottom of image):** A wooden ladder leans against and over a tall hedge — clearly a way out, propped there by someone. It looks rough and out of place against the garden's elegant stonework, as if it was brought here in a hurry.
- **Scattered details:** Moss-covered stone benches, a worn garden path of pale flagstones winding between the beds, small butterflies or firefly-like motes of light drifting in the air, faintly blue-tinged wildflowers with subtly geometric petal patterns mixed in among the normal flowers (a hint of wrongness in the beauty).

**Lighting:** Early morning. Soft, hazy golden light filtering through a thin layer of mist. Gentle god-rays coming from the upper left. The whole scene has a dreamy, warm glow — safe and impossibly serene after the harshness of the desert.

**Mood:** Secret Garden meets Studio Ghibli. Peaceful, beautiful, but with an uncanny stillness — like a painting that's too perfect to be real. The player should feel safe here but slightly unsettled by how pristine it is.

**Style:** Painterly, semi-realistic illustration. Rich hand-painted textures — mossy stone, soft petals, weathered wood, ivy tendrils. Warm storybook quality with lush greens and soft golds. No characters in the image. Dense environmental detail.

**Save to:** `web/public/backgrounds/palace_garden.png`

---

### Havenwood Rooftops West (`havenwood_rooftops_west`)

A pre-rendered background illustration for a 2D JRPG, in the style of Final Fantasy IX's pre-rendered backgrounds — specifically inspired by the sprawling rooftops of Alexandria and Lindblum.

**Scene:** A wide, sprawling vista of medieval village rooftops seen from above. This is the western half of Havenwood's rooftop landscape — a maze of clay-tiled roofs at varying heights, connected by makeshift wooden walkways. The rooftops feel like their own world, separate from the village streets far below.

**Composition (high-angle bird's-eye view, looking across the rooftops):**

- **Foreground (top of image):** A flat rooftop section with aged terracotta tiles, slightly cracked. This is where the player enters from the garden — a clear walkable area.
- **Mid-ground:** The rooftops sprawl outward at multiple levels. Some roofs peak sharply, others are flat or gently sloped. Visible navigable paths include:
  - Narrow wooden plank bridges spanning gaps between buildings (2-3 planks wide, with rope handrails)
  - Flat roof sections with clotheslines strung between chimney pots (drying linens, a forgotten shirt)
  - A wider walkway along a roof ridge, tiles worn smooth by foot traffic
- **Chimneys:** Brick chimney clusters rise from the roofs — squat, round, each a slightly different shade of brick. Two or three emit thin, perfectly straight wisps of pale smoke. An iron weathervane shaped like a rooster sits atop one peak.
- **Dormers and windows:** Small dormer windows with wooden shutters (some open, some closed) break up the tile surfaces. Warm candlelight glows from a couple of open windows.
- **Background (bottom/distance):** The village streets are visible far below through gaps between buildings — tiny cobblestone paths, the tops of market stall awnings, the green canopy of a large tree in the square. The scale difference emphasizes the height.
- **Scattered details:** A cat curled on a sunny tile, potted herbs on a windowsill, a forgotten broom leaning against a chimney, moss growing in tile cracks, a pair of boots left by a dormer window, copper gutters with patina.

**Lighting:** Warm golden afternoon sun. Long amber light raking across the tiles from the left, casting warm shadows between the roof peaks. The clay tiles glow with reflected warmth. Slight atmospheric haze in the distance.

**Mood:** Adventurous and inviting — the rooftops feel like a playground, a secret path above the ordinary world. Warm and alive, full of small domestic details that tell stories. The kind of place where you want to explore every corner.

**Style:** Painterly, semi-realistic illustration. Rich hand-painted textures — weathered terracotta, aged wood grain, warm brick, copper patina. Warm orange and gold color palette. Dense environmental storytelling. No characters in the image.

**Save to:** `web/public/backgrounds/havenwood_rooftops_west.png`

---

### Havenwood Rooftops East (`havenwood_rooftops_east`)

A pre-rendered background illustration for a 2D JRPG, in the style of Final Fantasy IX's pre-rendered backgrounds — a continuation of the rooftop landscape, but tighter and more atmospheric.

**Scene:** The eastern stretch of Havenwood's rooftops. The buildings here are older, taller, and packed closer together. The roofs are steeper, the walkways narrower, and the shadows longer. Where the western rooftops felt open and inviting, these feel cramped, vertical, and maze-like. The harbor is visible in the distance.

**Composition (high-angle view, slightly more compressed/claustrophobic than the west):**

- **Foreground:** Steep terracotta roof slopes meeting at sharp angles. The tiles here are cracked and weathered — darker than the western rooftops, with patches of grey lichen.
- **Mid-ground navigable paths:**
  - A narrow walkway between two peaked roofs, barely wide enough for one person, with a rope strung at waist height as a guide
  - A flat section around a cluster of chimneys — the chimneys are packed close together, each a slightly different height, smoke rising from them at exactly the same angle (subtle wrongness)
  - Wooden steps nailed into a steep roof slope, leading between levels
- **The skylight:** A prominent glass skylight set into one of the roofs, glowing with dim warm light from the room below. Through the glass, the faint shapes of bookshelves and a desk with a candle are visible — Lyra's study, though the player doesn't know that yet.
- **The ladder down:** At the far edge (bottom-right of image), a wooden ladder descends over the edge of a roof into a narrow dark gap between buildings — the way down to the alley. The gap is shadowy and the ladder disappears into it.
- **Background:** Between building gaps, the harbor is visible in the distance — the glint of water, the masts of fishing boats, a stretch of coastline. Cooler blue-grey tones contrast with the warm clay.
- **Scattered details:** A small bird's nest tucked in a chimney pot with a brown bird sitting on it, a cracked tile revealing something grey and metallic underneath, a worn stone gargoyle on a corner, ivy creeping up between buildings, a rusted iron bracket where a sign once hung.

**Lighting:** Late afternoon, transitioning toward dusk. Cooler palette than the western rooftops — long purple-blue shadows stretching across the tiles, the warm clay tones muted. The skylight glows warm against the cooling surroundings. The harbor catches the last of the golden light in the distance.

**Mood:** Atmospheric and slightly uneasy. Tighter spaces, longer shadows, more vertical. The domestic charm of the western rooftops gives way to something older and more secretive. The player should feel they're getting deeper into the village's hidden layers.

**Style:** Painterly, semi-realistic illustration. Rich hand-painted textures — cracked terracotta, aged mortar, dark wood, rusted iron. Cooler palette (blue-grey shadows, muted clay) with warm accents (skylight glow, distant harbor light). Dense environmental detail. No characters in the image.

**Save to:** `web/public/backgrounds/havenwood_rooftops_east.png`

---

### Havenwood Alley (`havenwood_alley`)

A pre-rendered background illustration for a 2D JRPG, in the style of Final Fantasy IX's pre-rendered backgrounds.

**Scene:** A narrow medieval back alley, tall and vertical, running between the backs of buildings. This is the transition from the hidden rooftop world above to the sunlit village square below. The alley is dark and cramped at the top (where the player enters from the ladder) and opens into bright, warm light at the far end where it meets the square.

**Composition (high-angle view looking down into the alley, the length of the corridor visible):**

- **Top of alley (player entry):** The narrowest point. Tall stone and timber-frame walls rise on both sides, their upper stories almost touching overhead. The tops of the buildings frame a thin strip of blue sky. A crude wooden ladder is visible at the very top, descending from the rooftops above.
- **Left wall details:** Stacked old wooden barrels against the wall — different sizes, some with iron bands, smelling of vinegar and salt (merchant storage). A heavy wooden door bolted from the inside, with no handle on this side — someone doesn't want visitors. Scratched graffiti on the stone: an eye inside a triangle, hastily carved, like a warning.
- **Right wall details:** Wooden crates stacked against the wall, stamped with a gear-inside-a-circle insignia in fresh-looking ink on ancient-looking wood. A shuttered window with peeling paint. Iron brackets where lanterns once hung, now empty. A drainpipe with a slow trickle of water feeding the puddle below.
- **Center of alley:** Worn cobblestone ground, uneven and old. A prominent puddle in the middle of the path — still and reflective, catching a sliver of the blue sky above and the warm light from the far end. The cobblestones around the puddle are darker, slick with moisture.
- **Far end (bottom of image):** The alley opens dramatically into the bright, sunlit village square. The light from the square spills into the alley in a warm amber wash — the contrast between the dark, shadowy alley and the bright, golden exit is the strongest visual element. Through the opening, hints of the square are visible: the edge of the fountain, the canopy of a large tree, colorful market awnings, the warm stone of village buildings.
- **Scattered details:** A stray cat sitting on a barrel watching with green eyes, a broken clay pot with a dead plant, cobwebs in upper corners, moss growing between cobblestones, a forgotten wooden bucket.

**Lighting:** The alley itself is dim — cool blue-grey ambient light with deep shadows. But the far end blazes with warm golden sunlight from the square, creating a dramatic light-to-dark gradient. The puddle catches and reflects both the cool overhead sky and the warm amber exit light.

**Mood:** Transitional. Dark to light, hidden to open, alone to civilization. The alley feels like the last threshold before the real world. A liminal space — gritty, quiet, slightly tense, but with the promise of warmth and life just ahead.

**Style:** Painterly, semi-realistic illustration. Rich hand-painted textures — worn cobblestone, damp stone walls, aged timber, rusted iron, weathered wood grain. Strong contrast between cool shadows and warm golden light. Dense environmental storytelling. No characters in the image.

**Save to:** `web/public/backgrounds/havenwood_alley.png`
