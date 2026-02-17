# GPT Prompt: Static NPC Sprite

## Template

Create a single chibi-style RPG character on a plain white background.

**Character:** [NAME] — [ROLE] in a medieval fantasy village.

**Appearance:** [DESCRIPTION — hair, build, clothing, accessories, colors]

**Facing:** [toward the camera (front) / away (back) / left / right]

**Style:**
- Chibi proportions with a large head relative to the body (roughly 1:1 ratio)
- Big detailed eyes with visible irises
- Soft cel-shading with clean highlights
- High-quality detailed rendering like a premium mobile JRPG overworld sprite
- Plain white background, no shadows or scenery

## Variables to Replace
- [NAME]: Character name or role
- [ROLE]: Merchant, guard, servant, villager, etc.
- [DESCRIPTION]: Detailed appearance for consistency
- Facing: Match the NPC's `facing` property in their map definition

## After Generation
1. Save to: `games/chimera/drafts/sprites/characters/[name].png`
2. Move to: `web/public/sprites/characters/[name].png`
3. Reference in map data: `sprite: "/sprites/characters/[name].png"`
