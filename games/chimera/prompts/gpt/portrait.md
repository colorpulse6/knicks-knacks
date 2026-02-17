# GPT Prompt: Character Portrait

## Template

Create an upper-body portrait illustration of a JRPG character, cropped from the chest up.

**Character:** [NAME] — [DESCRIPTION]

**Expression:** [neutral/determined/kind/menacing/worried/cheerful]

**Style:**
- Semi-realistic anime illustration with detailed painterly rendering
- Warm lighting from above-left
- Subtle worn textures on fabric — these are working people, not pristine models
- Dark neutral gradient background (charcoal to dark grey)
- The rendering should feel grounded and atmospheric, like a character portrait for a high-production JRPG
- High resolution, rich color palette with muted earth tones

**Requirements:**
- Head and upper torso visible, slight three-quarter angle
- Detailed face and hair
- No text, frames, or UI elements
- No background scenery — gradient only

## Variables to Replace
- [NAME]: Character name
- [DESCRIPTION]: Hair, eye color, clothing, accessories, age, build
- Expression: Match the character's personality

## After Generation
1. Save to: `games/chimera/drafts/sprites/portraits/[name].png`
2. Move to: `web/public/portraits/[name].png` (or use `/import-sprite --type portrait`)
