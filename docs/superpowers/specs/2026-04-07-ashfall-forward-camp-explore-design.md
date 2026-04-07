# Ashfall Forward Camp: Explore Vertical Slice

**Date:** 2026-04-07
**Status:** Design approved, ready for planning
**Scope:** First playable planet-surface exploration area for the RPG layer, launched from the Dev Panel

---

## Executive Summary

This spec introduces `Ashfall Forward Camp`, a compact first-person exploration vertical slice set on Planet 6: Ashfall. The area is a temporary crew outpost built from modular shelters, salvage gear, and field equipment on a desert scrapyard world.

The slice is intentionally narrow. It is not an open world, a permanent town, or a full quest framework. Its purpose is to prove that Sector Zero can support a slower RPG-style loop built around:

- a distinct place with strong environmental identity
- NPC interaction and shop usage
- a safe social hub with one enterable interior
- a short exterior route beyond the camp perimeter
- a simple objective-driven excursion

For the first release, the area is accessible only from the Dev Panel. Campaign integration is deferred until the exploration loop feels good and the mission placement is decided.

---

## Design Goals

- **Prove the explore loop.** The player should arrive, talk, prepare, walk out, retrieve something, and return with context.
- **Stay within existing engine patterns.** Build on the current first-person raycaster, NPC billboards, dialog state, shop flow, and objective pickup logic.
- **Keep scope small and authored.** One handcrafted map, one short route, one small objective site.
- **Establish planet-surface identity.** This should feel different from the cockpit hub, boarding interiors, and combat-first missions.
- **Support future expansion.** The slice should become the template for later camps, surface missions, and RPG exploration areas.

---

## Area Identity

`Ashfall Forward Camp` is a temporary expedition outpost assembled by the crew on Ashfall.

It should feel:

- practical rather than decorative
- recently assembled rather than permanent
- capable rather than desperate
- mission-focused rather than civilian

The camp is not a local city, survivor colony, or outlaw bazaar. It is a Coalition foothold built to investigate wreckage, recover salvage, and stage field operations. The visual language should emphasize:

- modular shelter walls
- portable comms and power gear
- supply crates and salvage containers
- floodlights and utility lamps
- cable runs and antenna rigs
- scrap barriers adapted to the desert environment

This keeps the tone aligned with the crew while making the surface setting feel grounded and distinct.

---

## Player Experience

The first-play experience should be:

1. Launch the area from the Dev Panel.
2. Spawn at a landing pad or entry point with the camp landmark in view.
3. Enter the camp yard and immediately identify:
   - the command shelter
   - the quartermaster / merchant
   - one or two other crew NPCs
   - the perimeter gate leading outside
4. Talk to NPCs for context, flavor, and shop access.
5. Receive or imply a simple objective outside the camp.
6. Leave through the perimeter gate and follow a short route across Ashfall terrain.
7. Reach a small salvage site or equipment location.
8. Retrieve an objective item or trigger completion.
9. Return to camp or end the slice with a clear success state.

The core loop is deliberately simple:

`arrive -> socialize -> orient -> step outside -> retrieve -> return`

---

## Layout

The map should be compact, legible, and centered around one obvious hub.

### Recommended Layout Zones

- **Landing / Entry Pad**
  - Player spawn point
  - Immediate line of sight to the camp landmark rig

- **Camp Yard**
  - Main safe social space
  - Contains props, circulation space, and multiple NPCs

- **Command Shelter**
  - Enterable interior
  - Houses mission terminal, briefing NPC, or both

- **Quartermaster Station**
  - Merchant interaction point
  - Can be a kiosk, bench, or small side shelter

- **Perimeter Gate**
  - Visual and spatial transition from safety to exterior exposure

- **Exterior Route**
  - A short authored path using wreckage, barriers, dunes, or utility markers
  - Should feel exposed, but not huge

- **Objective Pocket**
  - A small salvage site, beacon location, or equipment cache
  - Goal of the excursion

### Layout Principles

- The player should understand the camp in one glance.
- The route outside should be short enough to stay intentional.
- Landmark visibility should help orientation at all times.
- The map should feel denser in the camp and looser outside the perimeter.

---

## Content Scope

### Included In First Version

- Dev Panel launch entry for `Ashfall Forward Camp`
- one dedicated exploration map
- safe first-person area with no mandatory combat
- 2-3 NPCs using the current dialog system
- 1 merchant / quartermaster using the current shop flow
- 1 enterable shelter interior
- 1 short exterior objective route
- 1 objective marker or pickup
- simple success feedback / completion messaging

### Explicitly Out Of Scope

- campaign or planet mission integration
- open-ended free-roam across Ashfall
- branching quests
- faction reputation
- combat as the main activity
- procedural terrain
- full inventory UI expansion
- large settlement simulation
- day/night or weather systems as required mechanics

This vertical slice should prove `place + interaction + objective`, not attempt to become a full RPG overworld.

---

## Systems Fit

The slice should be implemented as an extension of the existing first-person exploration model, not as a new engine path.

### Existing Systems To Reuse

- **First-person mode:** base movement, raycasting, rendering, and interactable objective support
- **NPC billboards:** current front-facing NPC rendering
- **Dialog flow:** current dialog advancement and portrait system
- **Shop flow:** current merchant dialog -> shop inventory transition
- **Objective pickup pattern:** same broad model used for the Kepler Black Box sidequest
- **Dev Panel shortcuts:** for direct launch during iteration

### Content Model Recommendation

Treat `Ashfall Forward Camp` as a handcrafted first-person mission-like state with:

- one map definition
- one NPC list
- one optional merchant stock list
- one objective definition
- one small amount of per-run completion state

Do not design this as a generic overworld framework in the first pass.

---

## Objective Design

The first objective should be simple and low-risk. It exists to motivate movement through the area, not to carry deep narrative weight yet.

Good first-objective examples:

- recover a dropped sensor package
- reactivate or inspect a field beacon
- retrieve supply crates from a small wreck site
- recover a salvage scanner module from the exterior perimeter

The best first option is a **recoverable field item** because it works cleanly with the current objective pickup model and does not require new mission scripting complexity.

### Completion Recommendation

For the first implementation, either of these is acceptable:

- objective pickup immediately completes the slice, or
- objective pickup updates state and sends the player back to camp for completion

The second is stronger long term, but the first is cheaper. This can be finalized during planning.

---

## Asset Contract

Custom art should live in:

- `games/sector-zero/web/public/sprites/explore/`

### Core Environment Assets

- `scrapyard-outpost-sky.png`
- `scrapyard-outpost-ground.png`
- `scrapyard-outpost-wall-exterior.png`
- `scrapyard-outpost-wall-interior.png`
- `scrapyard-outpost-floor-metal.png`

### Landmark Asset

- `scrapyard-outpost-landmark-rig.png`

### Prop Assets

- `scrapyard-outpost-prop-crates.png`
- `scrapyard-outpost-prop-antenna.png`
- `scrapyard-outpost-prop-lamp.png`
- `scrapyard-outpost-prop-terminal.png`
- `scrapyard-outpost-prop-barrel.png`
- `scrapyard-outpost-prop-signpost.png`
- `scrapyard-outpost-prop-cable-spool.png`

### Asset Priorities

Minimum viable art batch:

- `scrapyard-outpost-sky.png`
- `scrapyard-outpost-ground.png`
- `scrapyard-outpost-wall-exterior.png`
- `scrapyard-outpost-landmark-rig.png`

These four assets are enough to start implementation with a coherent visual identity.

### Art Direction Notes

- The sky should be simple and low-density for raycast readability.
- The environment should read as a temporary crew installation, not a permanent town.
- Props should have strong silhouettes and work as billboard sprites.
- Existing NPC billboards are sufficient for the first slice.

---

## Suggested NPC Roles

The first slice should reuse existing character patterns and keep staffing small.

Recommended roles:

- **Commander / mission lead**
  - Gives context for why the camp exists

- **Quartermaster / merchant**
  - Opens the shop flow

- **Engineer / researcher / crew specialist**
  - Adds lore or points the player toward the objective

These do not need a new narrative framework. They only need enough authored dialog to make the place feel inhabited and purposeful.

---

## Launch Strategy

For the first release:

- add `Ashfall Forward Camp` to the Dev Panel
- keep it off the campaign and mission board
- iterate on layout, movement, and feel without story-locking it too early

Only after the slice is fun should it be attached to:

- a planet mission
- a side mission
- or a campaign branch

This keeps iteration fast and avoids binding an unfinished exploration loop to progression.

---

## Testing And Verification

Verification for this slice should focus on readability and loop completion, not combat balance.

### Functional Checks

- Dev Panel launches the area correctly
- player spawns facing useful landmarks
- NPC interaction works reliably
- merchant opens shop correctly
- interior shelter is navigable
- objective route is traversable without getting lost
- objective can be completed consistently
- success flow exits or completes cleanly

### Quality Checks

- area feels understandable within seconds
- camp and exterior read as different spaces
- sky and terrain do not visually fight the raycaster
- the slice feels like exploration, not just an empty FPS hallway

---

## Success Criteria

This vertical slice is successful if:

- it feels like a real place rather than a test chamber
- the player can complete a simple social-to-objective loop without confusion
- the existing first-person RPG systems feel justified by the area
- the art pipeline for future exploration spaces becomes clearer
- the team can confidently decide where exploration belongs in the campaign later

---

## Follow-On Work

Likely follow-up directions after this slice proves out:

- attach the camp to a real Ashfall mission
- add return-to-camp completion flow if first pass uses immediate completion
- add a second exterior route or landmark
- introduce low-threat hazards or ambient enemies
- add planet-specific NPC variants
- generalize the asset and map pattern for future explore zones

The vertical slice should be treated as a template seed, not as disposable prototype work.
