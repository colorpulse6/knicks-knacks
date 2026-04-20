# BotBattle Editorial Theme ("Paper & Espresso")

**Date:** 2026-04-20
**Scope:** `apps/bot-battle/web/`
**Status:** Design approved, pending implementation plan

## Problem

The BotBattle UI is functional but visually bland — the default Tailwind "neutral SaaS" look (gray-on-white, standard blue dark mode). The app's purpose is to read, compare, and reason about model outputs, which is closer to reading an article than operating a dashboard. The current palette does not reflect that.

We want a single coherent aesthetic — "paper and espresso" — that feels like a printed editorial page in light mode and a warm, lamp-lit desk at night in dark mode. Same content, same layout, distinctive personality.

## Goals

1. A light palette rooted in warm cream + dark ink + rusty accent.
2. A dark palette that is the *same story inverted* — dark espresso paper + warm cream ink + amber accent — not a sterile invert of light.
3. A typography pairing that signals "this is for reading": serif for body copy and brand voice, system sans for UI chrome, tabular numerals for metrics.
4. Shape tokens that feel like paper: 4px radius (not sharp, not balloon-soft), hairline borders, no heavy shadows.
5. Accent used sparingly and as a *role* — reserved for active/selected state and the reasoning badge — so it stays meaningful rather than decorative.

## Non-goals

- Brand redesign beyond the wordmark treatment (a rust period after "BotBattle").
- Animation or motion design.
- Re-doing the layout — the tabbed reasoning cell, model picker, and settings page all stay as-is structurally.
- Custom fonts that require web-font loading. Use system fonts for sans and a safe serif stack for body.

## Design Tokens

### Palette (light — "Paper")

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#faf6ee` | Card / surface background |
| `--paper-sunk` | `#f2ecdc` | Page background, input wells |
| `--ink` | `#2b241c` | Primary text |
| `--ink-soft` | `#5c503f` | Secondary text, labels |
| `--rust` | `#8a4b2f` | Accent: reasoning badge, active tab, selected chip, focus ring, brand dot |
| `--rust-tint` | `#f4e8df` | Rust background tint (rare — e.g. selected-state backgrounds if needed) |
| `--rule` | `#d9cdb4` | Hairline borders (primary) |
| `--rule-soft` | `#e5d9bf` | Hairline borders (intra-card, softer) |

### Palette (dark — "Espresso")

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#221a14` | Card / surface background |
| `--paper-sunk` | `#1a1410` | Page background, input wells |
| `--ink` | `#e8dcc5` | Primary text |
| `--ink-soft` | `#a69780` | Secondary text, labels |
| `--rust` | `#d18c55` | Accent (amber — rust lifted for contrast) |
| `--rust-tint` | `#2e2218` | Rust background tint |
| `--rule` | `#3a2e24` | Hairline borders (primary) |
| `--rule-soft` | `#2e2319` | Hairline borders (softer) |

The tokens share names across modes; only the hex values swap.

### Typography

- **Body copy, brand, headings:** `Georgia, "Source Serif Pro", "Iowan Old Style", serif`
- **UI chrome** (buttons, chips, tabs, metrics, nav, labels): `"Inter", ui-sans-serif, system-ui, sans-serif`
- **Metrics rows:** sans + `font-variant-numeric: tabular-nums` for aligned numbers
- **Body font size:** 14px line-height 1.65 for serif bodies; 13–14px for sans UI.
- **Uppercase meta** (nav links, section labels): letter-spacing 0.08em, size 11–12px, color `--ink-soft`.

### Shapes

- **Radius:** 4px for cards and surfaces; 3px for inputs; 2px for small badges; 999px for chips.
- **Borders:** hairline 1px, color `--rule` or `--rule-soft`.
- **Shadows:** none by default. Cards sit flat against `--paper-sunk`. Use shadow only if an element genuinely floats (e.g. dropdowns).
- **Spacing:** cards pad 16–20px. Section gaps 20–24px.

## Component patterns

### Buttons

- **Primary ("Run"):** `background: --ink; color: --paper;` — inverted, solid. Feels like "submit the work." Never rust-filled (rust is reserved for state, not action).
- **Secondary / ghost:** transparent + 1px `--rule` border + `--ink-soft` text; hover lifts to `--ink`.
- **Toggle theme button** uses the secondary pattern.

### Badges

- `REASONING`: filled rust, paper text, 2px radius.
- `PREVIEW`: outlined rust (transparent bg, rust text, 1px rust border), 2px radius. Was filled amber in the prior design; move to outline so only REASONING is filled — keeps the filled accent rare.
- `LEGACY`: outlined `--ink-soft` with `--ink-soft` text. Also outlined — per the curation policy, most legacy entries were culled, so this badge is now a quiet marker.

### Chips (model picker in prompt panel)

- Unselected: `--paper` bg + `--rule` border + `--ink-soft` text; 999px radius; 4px × 10px padding.
- Selected: `--rust` bg + `--paper` text; same shape.
- `+ N more` overflow chip: same shape as unselected, italic or muted.

### Tabs (reasoning result cell)

- Active: 2px bottom border `--rust`, text `--rust`, weight 600.
- Inactive: `--ink-soft`, no border.

### Cards (result cells, prompt panel)

- `--paper` bg, 1px `--rule` border, 4px radius. Internal rules between header/tabs/body/metrics use `--rule-soft` (the quieter hairline).

### Header

- `BotBattle<span class="dot">.</span>` — wordmark in serif, rust period as the only colored mark.
- Nav links: uppercase, `--ink-soft`, active link gets rust bottom-border.
- Theme toggle at the right.
- Separator: 1px `--rule` along the bottom of the nav.

### Prompt panel

- Card surface with a serif "Prompt" heading, textarea using `--paper-sunk` for the well, serif body for the user's typing (aligns with the reading-forward voice).
- Focus ring on textarea: border color becomes `--rust` on focus (no outline glow).
- Below the textarea: left-side model chip row (wraps), right-side Run button.

### Settings page

- Same card pattern. Each provider gets its own card with a section heading, password input using the same well pattern, and the Test button uses the secondary button style.

## Dark-mode mechanism

- Toggle attached to `<body>` (or the root `<html>` / `<div>`).
- Tokens declared at `:root` for light, overridden under a `.dark` (or `[data-theme="dark"]`) selector for dark.
- Existing Tailwind `darkMode: "class"` config is compatible — we just stop using color classes like `bg-white dark:bg-neutral-800` and start referring to our tokens.
- Theme preference persisted to `localStorage` under key `botbattle.theme`. Default is light if no preference exists and the system preference isn't strongly dark.

## Implementation approach (Tailwind 4)

Tailwind 4's `@theme` directive supports custom color tokens that resolve to CSS variables. Approach:

1. Add a `@theme` block in `app/globals.css` defining color utilities that reference the CSS variables (e.g. `--color-paper: var(--paper)`). This generates Tailwind classes like `bg-paper`, `text-ink`, `border-rule`.
2. Declare the raw variables (`--paper`, `--ink`, `--rust`, etc.) at `:root` and under `.dark` in the same stylesheet.
3. Sweep the existing components and replace hardcoded color classes (`bg-white`, `text-gray-900`, `dark:bg-neutral-800`, `border-gray-200`, etc.) with the token utilities. This is the bulk of the implementation work.
4. Add a `<ThemeToggle />` component that toggles the `.dark` class on the root and writes to localStorage.
5. Update `ModelBadge` variants to match the new badge rules (REASONING filled; LEGACY/PREVIEW outlined).

File-level layout:

| File | Change |
|---|---|
| `web/app/globals.css` | Define `:root` / `.dark` CSS variables; add `@theme` color block |
| `web/tailwind.config.ts` | Ensure `darkMode: "class"` (already set); no color additions needed if `@theme` covers them |
| `web/app/layout.tsx` | Add theme-init script (reads localStorage before render to avoid flash), render `<ThemeToggle />` in the header |
| `web/app/components/ThemeToggle.tsx` | New — small button, toggles the root class, persists to localStorage |
| `web/app/components/ModelBadge.tsx` | Update pill color rules to new scheme (filled REASONING, outlined LEGACY/PREVIEW) |
| `web/app/components/ModelSelector.tsx` | Swap to chip pattern for model picking — current selector is list-based; this becomes a chip-row |
| `web/app/components/LLMResponsePanel.tsx` | Replace Tailwind color classes with token utilities; update tab styles |
| `web/app/components/ApiKeyInput.tsx` | Swap button + field styling to token utilities |
| `web/app/components/PromptInput.tsx` | Switch to card + serif textarea pattern |
| `web/app/page.tsx` | Page background / layout uses `--paper-sunk`; brand wordmark |
| `web/app/settings/page.tsx` | Apply the card-per-provider pattern to the settings page |
| `web/app/components/*.test.tsx` | Existing component tests should still pass — none of them assert on color classes directly; verify. |

### Testing

- Existing 36 tests must still pass (no behavior changes).
- Add one component test for `ThemeToggle` — clicking the button adds/removes the `.dark` class on document root.
- Visual regression testing is not in scope (no Chromatic / Percy setup). Manual QA covers both modes.

## Out of scope / follow-ups

- Custom web fonts (Source Serif Pro locally loaded instead of Georgia fallback).
- Animation on theme toggle (cross-fade, rotate icon).
- Printable stylesheet.
- User-selectable accent (rust is hard-coded; could become a preference later).
- Accessibility audit for WCAG contrast on the `--rust` accent in both palettes. A quick calculator check should pass, but a formal audit is follow-up.
