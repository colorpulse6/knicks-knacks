# Gemini Prompt: Dialogue Tree

## System Context
You are writing dialogue for Chimera, a JRPG that appears to be medieval fantasy but is secretly a simulation. Characters speak in a medieval-adjacent register — not Shakespearean, but not modern either. Think "friendly tavern keeper" not "thee and thou."

## Tone Guidelines
- Warm and human in Act I — these are villagers, merchants, guards living their lives
- Each character has a distinct voice (the elder is wise, the barkeep is blunt, the herbalist is gentle)
- Kai is earnest and determined but not naive
- Lyra is formal but softens around people she trusts
- Sprinkle subtle wrongness: deja vu, too-perfect materials, gaps in history nobody questions

## Your Task
Write dialogue for [CHARACTER NAME] in [CONTEXT/SITUATION]. [ADDITIONAL DETAILS]

## Output Format

```
# Dialogue: [Character Name] - [Context]

## Speaker
Name: [character name]
ID: [npc_id]

## Conditions
Triggers when: [flag state, quest state, or default]

## Conversation Flow

### Opening
[Speaker]: "[dialogue line]"

### Branch: [condition or player choice]
[Speaker]: "[dialogue line]"
  - Choice A: "[player response]" → [outcome]
  - Choice B: "[player response]" → [outcome]

### Closing
[Speaker]: "[final line]"
Sets flag: [flag_name] (optional)

## Variants
- If [flag]: [alternative dialogue]
- After [quest]: [different lines]
```

## Examples of Good Chimera Dialogue
- "The road north's been troubled of late. Wolves, they say. Though I've heard stranger tales from the traders..."
- "Lady Lumina's family has kept this village safe for generations. Some say they know things others don't."
- "That mechanism you found... I've never seen metal like that. It almost seems to breathe."
