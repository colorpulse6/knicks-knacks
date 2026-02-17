---
name: art-prompt
description: Generate a GPT/DALL-E art prompt for a Chimera game character, enemy, or location. Use when the user needs to create new game art.
allowed-tools: Read, Glob, Grep
---

# Art Prompt Generator

Generate a ready-to-use GPT prompt for creating Chimera game art assets.

## Usage
`/art-prompt [entity-name] --type [walk-sheet|battle-sheet|portrait|background|npc-static]`

Use $ARGUMENTS for the arguments.

## Steps

### 1. Gather context
- Check `games/chimera/web/app/data/enemies.ts` for enemy descriptions
- Check `games/chimera/CLAUDE.md` for character descriptions and aesthetic rules
- Check `games/chimera/docs/story/` for extended character info
- Check existing sprites in `web/public/sprites/` for art style reference
- Read the appropriate template from `games/chimera/prompts/gpt/`

### 2. Generate prompt
Read the matching template from `games/chimera/prompts/gpt/`:
- `walk-sheet` → `prompts/gpt/walk-sprite-sheet.md`
- `battle-sheet` → `prompts/gpt/battle-sprite-sheet.md`
- `portrait` → `prompts/gpt/portrait.md`
- `background` → `prompts/gpt/map-background.md` (create if missing)
- `npc-static` → `prompts/gpt/npc-static-sprite.md`

Fill in the template variables with character/entity data from the codebase.

### 3. Output
Print the complete, ready-to-paste prompt. Then print:
- Where to save the result: `games/chimera/drafts/sprites/[type]/[name].png`
- What command to run next: `/import-sprite [path] --type [type] --name [name]`

## Style Rules
- Chimera is medieval fantasy with hidden sci-fi
- Act I: warm, earthy tones. Act II: corrupted. Act III: digital/chrome
- Kai: red spiky hair, navy armor, blue cape, sword
- Lyra: elegant, lighter palette, staff
- Avoid trademarked game names in prompts (no "Final Fantasy", etc.)
- Chibi proportions for world sprites, semi-realistic for portraits/battles
