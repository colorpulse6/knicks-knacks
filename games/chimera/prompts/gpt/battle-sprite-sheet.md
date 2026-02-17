# GPT Prompt: Battle Sprite Sheet

## Template

Create a battle sprite sheet for a JRPG enemy character.

**Enemy:** [NAME] — [DESCRIPTION]

**Layout:** 4 columns x 2 rows on a transparent background.
- **Column 1:** Idle stance (both rows show slight variation for breathing animation)
- **Column 2:** Attack pose (lunging/striking)
- **Column 3:** Hurt/recoil pose (staggering back)
- **Column 4:** Defeated/collapsed pose

**Requirements:**
- Character faces LEFT (toward the player's party position)
- Semi-realistic proportions, detailed rendering
- Each frame approximately 384x512 pixels
- Consistent character across all 8 frames — same colors, proportions, details
- Dark/neutral background or transparent
- Clear visual difference between idle, attack, hurt, and defeat states

## Variables to Replace
- [NAME]: Enemy name
- [DESCRIPTION]: Size, features, colors, threatening elements, equipment

## After Generation
1. Save to: `games/chimera/drafts/sprites/enemies/[name].png`
2. Run: `/import-sprite [path] --type enemy --name [name]`

## Enemy Style by Act
- Act I: Mundane creatures and humanoids (bandits, wolves, rats, rogues)
- Act II: Corrupted/glitched versions (static overlay, chromatic aberration)
- Act III: Digital entities (wireframe, chrome, geometric shapes)
