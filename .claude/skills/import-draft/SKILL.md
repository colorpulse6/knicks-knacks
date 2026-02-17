---
name: import-draft
description: Convert a Gemini creative draft from games/chimera/drafts/ into game code (dialogues, quests, NPCs, enemies, items). Handles mixed content with multiple entity types in one file. Use when importing story content.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(npx tsc *)
---

# Import Draft

Read a Gemini creative draft and convert it into Chimera game code.

## Usage
`/import-draft [path-to-draft-file]`

Path is relative to `games/chimera/drafts/` or can be absolute. Use $ARGUMENTS as the path.

## Steps

### 1. Read and parse the draft file

Read the file at the provided path. Gemini drafts may contain **mixed content** — multiple entity types in a single file.

Scan for ALL content blocks by detecting these markers:
- `QUEST:` → Quest definition
- `NPC:` → NPC definition
- `DIALOGUE:` → Dialogue tree
- `ENEMY:` → Enemy definition
- `MAP:` → Map/location definition
- `ITEM:` or section headers like `## NEW ITEMS` → Item entries
- `## ENVIRONMENTAL STORYTELLING` or `## FLAVOR TEXT` → Interactable object text for existing maps

If no markers are found, fall back to **directory-based detection**:
- `story/quests/` → Quest + dialogue + map events
- `story/dialogues/` → Dialogue tree file
- `characters/npcs/` → NPC in map + dialogue
- `characters/party/` → Character definition
- `enemies/` → Enemy definition + animation config
- `maps/` → Map file scaffold
- `items/` → Item entries

### 2. Process each content block

Process ALL detected blocks, in this order:

**Items first** (other entities may reference them):
- Add to `web/app/data/items.ts`
- Key items → `keyItems` array
- Consumables → appropriate category using Four Humors naming
- Treasures/materials → `treasures` array

**Enemies** (quests may reference them):
- Add to `web/app/data/enemies.ts` following existing patterns
- Add sprite config stub to `web/app/data/animations.ts` (mark as TODO if no sprite exists yet)

**NPCs** (quests reference their positions):
- Add to appropriate map file's `npcs` array in `web/app/data/maps/`
- Set sprite path (mark as TODO if no sprite exists)
- Create dialogue if specified

**Dialogues:**
- Create `web/app/data/dialogues/[name].ts`
- Register in `dialogues/index.ts` (add to imports, exports, and `getDynamicDialogue` switch)
- For simple NPC dialogue, can add inline to map NPC definition instead
- For branched/dynamic dialogue, create separate file

**Quests:**
- Add to `web/app/data/quests.ts`
- Create associated dialogue files
- Add story flags to quest objectives
- Wire map events if specified

**Maps/Locations:**
- Create new map file in `web/app/data/maps/[name].ts`
- Scaffold tile grid, collision layer, NPCs, events
- Register in map index/connections

**Environmental storytelling / Flavor text:**
- Add as `events` entries in existing map files
- Use `type: "examine"` with the flavor text as dialogue
- Place at appropriate coordinates (use existing objects nearby or add new interactable)

### 3. Validate

Run `npx tsc --noEmit` in `games/chimera/web/` to ensure all imports resolve and types check.

### 4. Report

Print a summary with:

**Files created/modified:**
- List each file and what was added

**Art assets needed:**
For each new entity that needs a sprite/image, print the `/art-prompt` command:
```
/art-prompt [entity-name] --type [npc-static|battle-sheet|portrait|background]
```

**Manual steps remaining:**
- Map coordinates that need adjusting (NPCs placed at default positions)
- Collision/overhead layers that need paint tool work
- Any TODO markers left in code

## Reference Files
- Quest pattern: `web/app/data/quests.ts`
- Dialogue pattern: `web/app/data/dialogues/herbalist-mira.ts` (dynamic), `web/app/data/dialogues/havenwood-villagers.ts` (simple)
- NPC in map: any file in `web/app/data/maps/` (see npcs arrays)
- Enemy pattern: `web/app/data/enemies.ts`
- Item pattern: `web/app/data/items.ts`
- Map pattern: `web/app/data/maps/havenwood_square.ts`
- Content guidelines: `games/chimera/CLAUDE.md`
- Philosophical framework: `games/chimera/docs/story/concept/philosophy_1.md`

## Rules
- Use `snake_case` for all IDs (quest IDs, dialogue IDs, NPC IDs)
- Follow medieval naming (no modern terms in Act I content)
- Use Four Humors for consumables (Sanguine Tonic, Choleric Salve, etc.)
- Validate all imports resolve before finishing
- Never reveal simulation truth in Act I dialogue — use medieval metaphors only
- Environmental storytelling should be subtle, not expositional
