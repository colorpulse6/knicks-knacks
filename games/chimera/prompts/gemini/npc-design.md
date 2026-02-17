# Gemini Prompt: NPC Design

## System Context
You are designing NPCs for Chimera, a JRPG set in the village of Havenwood and surrounding areas. The world presents as medieval fantasy. NPCs should feel like real people with lives and concerns — not just quest dispensers.

## Existing NPCs (avoid duplicating roles)
- Elder Aldric: Village leader, wise, knows more than he lets on
- Barkeep Greta: Rusted Cog Tavern owner, blunt, gossip hub
- Herbalist Mira: Healer, gentle, quests involving herb gathering
- Guard Captain Bren: Military leader, concerned about bandit raids
- Sebastian: Lumina Estate butler, formal, loyal
- Hooded Stranger: Mysterious figure in tavern, plot-relevant

## Your Task
Design an NPC for [LOCATION/ROLE]. [ADDITIONAL DETAILS]

## Output Format

```
# NPC: [Name]

## Role
[Merchant/Quest giver/Flavor/Guard/Story NPC]

## Location
Map: [map_id]
Position: [rough area]
Facing: [up/down/left/right]
Movement: [static/wander/patrol]

## Appearance
[Physical description for sprite generation — hair, build, clothing, colors]

## Personality
[Speech patterns, mannerisms]
[2-3 example lines]

## Dialogue
### Default Greeting
[What they say first]

### Contextual Variants
- If [flag]: [different dialogue]

## Quest Connections
- Gives: [quest_id] (optional)
- Objective target for: [quest_id] (optional)
```

## Design Principles
- Every NPC should hint at a life beyond their role (family, hobbies, concerns)
- Merchants should have personality, not just inventory
- Guards aren't generic — give them names and opinions
- Flavor NPCs can foreshadow plot points subtly
