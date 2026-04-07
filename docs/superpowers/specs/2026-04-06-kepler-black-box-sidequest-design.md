# Sector Zero: Kepler Black Box Sidequest Design

**Date:** 2026-04-06
**Status:** Approved for implementation
**Scope:** World 4 replayable first-person story sidequest unlocked from campaign progression

---

## Goal

Introduce first-person mode into the main game as a story-driven World 4 sidequest that unlocks after `4-2`, launches immediately on first reveal, and remains replayable from the ship hub afterward.

---

## Narrative Placement

- World 4 (`The Graveyard`) already establishes that the wreckage is human and tied to the Kepler Exodus.
- After first completion of `4-2` (`The Kepler Graveyard`), Reyes interrupts with a live mission prompt.
- Reyes has detected a surviving recorder beacon inside a drifting Kepler hull and wants the pilot to recover its black box before the Hollow erase it.
- This is the first explicit interior investigation mission in the campaign and the first story deployment of first-person mode.

---

## Unlock Flow

- Trigger condition: first completion of campaign level `4-2`.
- On first completion only, the player is shown a prompt from Reyes.
- Prompt choices:
  - `BOARD THE WRECK`
  - `RETURN`
- Choosing `BOARD THE WRECK` launches the sidequest immediately.
- Choosing `RETURN` skips the immediate launch but still unlocks the mission for later.
- After the first unlock event, the mission is permanently selectable from the Mission Board.

---

## Mission Structure

- Mission name: `Kepler Black Box`
- Gameplay mode: `first-person` only
- Mission scale: compact, self-contained wreck interior
- Objective: reach the recorder room and recover the black box
- First-pass structure:
  - breach / airlock entry
  - corridor progression with a few combat chokepoints
  - one or two small branch rooms
  - recorder room / vault
  - placeholder black box pickup

The mission should feel slower and more oppressive than shooter levels, emphasizing salvage and investigation rather than wave-clear pacing.

---

## Completion and Failure

- The mission uses normal game-over behavior:
  - `Retry`
  - `Return`
- `Retry` restarts the mission from mission start.
- `Return` exits without awarding the black box.
- If the mission has been unlocked once, returning never removes access from the Mission Board.
- On successful completion:
  - award the unique quest item `Kepler Black Box`
  - mark the sidequest complete
  - keep the mission replayable

---

## Unique Item Rules

- `Kepler Black Box` is a unique quest item, not a repeatable drop and not a normal material.
- On first successful recovery:
  - the black box is removed from the mission permanently
  - the item is added to persistent save state
  - related story content is unlocked in the hub
- On replay:
  - the black box does not appear
  - no duplicate quest-item or story reward is granted
  - standard combat / replay rewards may still apply

---

## Hub and Story Integration

- The mission is replayable from the Mission Board after unlock.
- The recovered black box becomes a persistent story item in the ship hub.
- The black box should unlock or drive:
  - at least one Reyes-focused story/log entry
  - optional codex follow-up
  - future story hooks tied to the Kepler wreckage arc

This mission exists to make alternate modes part of the RPG structure: missions, story items, objectives, unlocks, and replayable content.

---

## Content Pipeline

- Use the existing boarding / first-person shared ASCII map pipeline for the first implementation.
- No new environment asset pack is required for MVP.
- The black box can use a placeholder presentation initially:
  - glow marker
  - terminal stand-in
  - simple pickup prop
- If art is added later, highest-value assets are:
  - black box pickup sprite
  - Kepler interior texture variant
  - objective-room dressing

---

## Implementation Boundaries

- This is one dedicated World 4 sidequest, not a full generalized mission framework rewrite.
- The implementation may add narrowly scoped reusable support for:
  - replayable non-planet mission definitions
  - one-time immediate launch prompt after level completion
  - unique quest-item persistence
- Planet missions and existing challenge quests should keep their current behavior.

---

## Success Criteria

- First completion of `4-2` triggers the Reyes prompt once.
- Accepting the prompt launches the first-person sidequest immediately.
- Declining still unlocks the mission for later replay.
- The Mission Board exposes the unlocked sidequest afterward.
- The mission is playable and completable in first-person mode.
- The black box appears only before first recovery.
- Recovering the black box updates persistent save state and unlocks hub/story follow-up.
