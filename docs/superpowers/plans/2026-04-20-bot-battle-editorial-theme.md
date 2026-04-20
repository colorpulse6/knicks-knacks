# BotBattle Editorial Theme — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved "paper & espresso" editorial theme across the BotBattle app — warm cream + rusty accent in light mode, warm dark espresso + amber accent in dark mode, serif body + sans UI, hairline borders, class-based theme toggle with localStorage persistence.

**Architecture:** Define the palette as CSS variables at `:root` and under `.dark`, expose them to Tailwind 4 via the existing `@theme inline` block in `globals.css` so components reference token utilities (`bg-paper`, `text-ink`, `border-rule`, etc.). Sweep existing components to replace hardcoded color classes with token utilities. Add a `ThemeToggle` that flips the `.dark` class on `<html>` and persists the choice.

**Tech Stack:** Tailwind 4.0.5, Next.js 15.3 App Router, React 18.3, Vitest 1.0, @testing-library/react 14. The app already has `darkMode: "class"` in `tailwind.config.ts` but currently uses `prefers-color-scheme` in the stylesheet — this plan aligns them on class-based toggling.

**Spec:** `docs/superpowers/specs/2026-04-20-bot-battle-editorial-theme-design.md`

**Working directory (all paths relative to):** `apps/bot-battle/web`

---

## Preconditions

- Registry refresh work landed in prior commits (Task 1 `b25e06f` through Task 20 `1051079`). 36 component tests pass.
- `@theme inline` is already wired in `globals.css` with a minimal `--color-background` / `--color-foreground` pair. This plan extends that pattern.
- The plan has two advisory notes from spec review to honor:
  1. `ModelSelector.tsx` going from list to chip-row is a structural change (Task 7 below makes this explicit).
  2. Don't assume the Tailwind `@theme` is pre-wired for our tokens — Task 1 adds them.
- Commit directly to `main` (per prior user authorization).

---

### Task 1: Define design tokens in `globals.css`

**Files:**
- Modify: `apps/bot-battle/web/app/globals.css` (full rewrite of the CSS — small file)

- [ ] **Step 1: Replace `globals.css` with the token system**

```css
@import "tailwindcss";

/* Light palette ("Paper") — default */
:root {
  --paper: #faf6ee;
  --paper-sunk: #f2ecdc;
  --ink: #2b241c;
  --ink-soft: #5c503f;
  --rust: #8a4b2f;
  --rust-tint: #f4e8df;
  --rule: #d9cdb4;
  --rule-soft: #e5d9bf;
}

/* Dark palette ("Espresso") — applied via .dark class on <html> */
.dark {
  --paper: #221a14;
  --paper-sunk: #1a1410;
  --ink: #e8dcc5;
  --ink-soft: #a69780;
  --rust: #d18c55;
  --rust-tint: #2e2218;
  --rule: #3a2e24;
  --rule-soft: #2e2319;
}

@theme inline {
  --color-paper: var(--paper);
  --color-paper-sunk: var(--paper-sunk);
  --color-ink: var(--ink);
  --color-ink-soft: var(--ink-soft);
  --color-rust: var(--rust);
  --color-rust-tint: var(--rust-tint);
  --color-rule: var(--rule);
  --color-rule-soft: var(--rule-soft);

  --font-serif: Georgia, "Source Serif Pro", "Iowan Old Style", serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

body {
  background: var(--paper-sunk);
  color: var(--ink);
  font-family: var(--font-sans);
}
```

**Why this shape:** `@theme inline` in Tailwind 4 generates utility classes for every `--color-*` / `--font-*` entry. After this task, `bg-paper`, `text-ink`, `border-rule`, `font-serif`, etc. all work as utilities. The previous `--background` / `--foreground` pair is removed — nothing references them (verify in Step 2).

- [ ] **Step 2: Confirm nothing references `--background` / `--foreground`**

Run: `grep -rn "var(--background)\|var(--foreground)" /Users/nichalasbarnes/Desktop/projects/knicks-knacks/apps/bot-battle/web/app`
Expected: no matches outside `globals.css` itself (which we just overwrote).

If there are matches, decide: either keep the old vars as aliases to `--paper` / `--ink`, or update the references. Prefer update.

- [ ] **Step 3: Build + tests**

```bash
yarn workspace @knicks-knacks/bot-battle-web build
yarn workspace @knicks-knacks/bot-battle-web test --run
```

Both should pass. The UI will still render with old Tailwind color classes (bg-white, text-gray-900, etc.) — those aren't swapped yet.

- [ ] **Step 4: Commit**

```bash
git add apps/bot-battle/web/app/globals.css
git commit -m "feat(bot-battle): define paper/espresso design tokens in globals.css"
```

---

### Task 2: Build `ThemeToggle` component (TDD)

**Files:**
- Create: `apps/bot-battle/web/app/components/ThemeToggle.tsx`
- Create: `apps/bot-battle/web/app/components/ThemeToggle.test.tsx`

- [ ] **Step 1: Write failing tests**

Write to `app/components/ThemeToggle.test.tsx`:
```tsx
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });
  afterEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("renders a button with Toggle theme label", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
  });

  it("adds .dark class on click when in light mode", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: /toggle theme/i }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes .dark class on click when in dark mode", () => {
    document.documentElement.classList.add("dark");
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: /toggle theme/i }));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persists choice to localStorage under botbattle.theme", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: /toggle theme/i }));
    expect(localStorage.getItem("botbattle.theme")).toBe("dark");
    fireEvent.click(screen.getByRole("button", { name: /toggle theme/i }));
    expect(localStorage.getItem("botbattle.theme")).toBe("light");
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
yarn workspace @knicks-knacks/bot-battle-web test --run app/components/ThemeToggle.test.tsx
```

- [ ] **Step 3: Implement**

Write to `app/components/ThemeToggle.tsx`:
```tsx
"use client";
import React from "react";

const STORAGE_KEY = "botbattle.theme";

export const ThemeToggle: React.FC = () => {
  function toggle() {
    const root = document.documentElement;
    const isDark = root.classList.toggle("dark");
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  }
  return (
    <button
      type="button"
      onClick={toggle}
      className="text-xs uppercase tracking-widest border border-rule text-ink-soft px-2.5 py-1 rounded-sm hover:text-ink hover:border-ink-soft"
      aria-label="Toggle theme"
    >
      Toggle theme
    </button>
  );
};
```

- [ ] **Step 4: Run — expect 4 tests PASS, 40 tests total**

- [ ] **Step 5: Commit**

```bash
git add apps/bot-battle/web/app/components/ThemeToggle.tsx apps/bot-battle/web/app/components/ThemeToggle.test.tsx
git commit -m "feat(bot-battle): add ThemeToggle component with localStorage persistence"
```

---

### Task 3: Wire theme-init script + toggle into `layout.tsx`

**Files:**
- Modify: `apps/bot-battle/web/app/layout.tsx`

- [ ] **Step 1: Add a pre-render init script and restructure the header**

Replace the entire contents of `layout.tsx` with:

```tsx
import "./globals.css";
import React from "react";
import Link from "next/link";
import { ClientProviders } from "./providers/ClientProviders";
import { ThemeToggle } from "./components/ThemeToggle";

export const metadata = {
  title: "BotBattle",
  description: "Benchmark and analyze responses from multiple LLM APIs.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/botbattle-icon.png", type: "image/png" },
    ],
  },
};

const THEME_INIT = `
try {
  var t = localStorage.getItem("botbattle.theme");
  if (t === "dark") document.documentElement.classList.add("dark");
} catch (_) {}
`.trim();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper-sunk text-ink font-sans">
        {/* Theme-init must run before React hydrates to avoid a white flash for dark-mode users.
            Placed here (not <head>) to avoid Next.js App Router hydration warnings about manual head tags. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <ClientProviders>
          <div className="max-w-[1100px] mx-auto px-7">
            <header className="flex justify-between items-baseline pt-5 pb-4 border-b border-rule">
              <Link href="/" className="font-serif text-[22px] font-bold tracking-tight no-underline text-ink">
                BotBattle<span className="text-rust">.</span>
              </Link>
              <nav className="flex gap-5 text-xs uppercase tracking-[0.08em] text-ink-soft">
                <Link href="/" className="pb-1 no-underline text-inherit hover:text-ink">Benchmark</Link>
                <Link href="/settings" className="pb-1 no-underline text-inherit hover:text-ink">API Keys</Link>
              </nav>
              <ThemeToggle />
            </header>
            <main className="py-6">{children}</main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
```

**Notes:**
- `THEME_INIT` runs before React hydrates, so it avoids the white flash when a user has persisted dark mode.
- The wordmark gets the rust period.
- Navigation replaces the previous "API Settings" positioned-absolute link with flex layout.
- Image icon is dropped — the serif wordmark carries the brand now. Delete related image import.

- [ ] **Step 2: Build + tests**

```bash
yarn workspace @knicks-knacks/bot-battle-web build
yarn workspace @knicks-knacks/bot-battle-web test --run
```

Build must pass. Tests still at 40/40.

- [ ] **Step 3: Commit**

```bash
git add apps/bot-battle/web/app/layout.tsx
git commit -m "feat(bot-battle): restructure layout with editorial header + theme init"
```

---

### Task 4: Update `ModelBadge` — filled reasoning, outlined legacy/preview

**Files:**
- Modify: `apps/bot-battle/web/app/components/ModelBadge.tsx`
- Modify: `apps/bot-battle/web/app/components/ModelBadge.test.tsx`

Current `ModelBadge` uses `bg-purple-600`, `bg-gray-400`, `bg-amber-500`. Swap to tokens + the new outlined rules per the spec.

- [ ] **Step 1: Update the test assertions for the new color scheme**

Existing tests check `getByText("REASONING")`, `getByText("LEGACY")`, etc. — these keep passing (text content unchanged). Add one new test that checks the outline/fill distinction:

Append to `ModelBadge.test.tsx`:
```tsx
it("REASONING badge is filled; LEGACY/PREVIEW are outlined", () => {
  const { container: reasoningEl } = render(<ModelBadge modelType="reasoning" status="current" />);
  const reasoning = reasoningEl.querySelector("[data-badge='reasoning']");
  expect(reasoning?.className).toMatch(/bg-rust/);

  const { container: legacyEl } = render(<ModelBadge modelType="standard" status="legacy" />);
  const legacy = legacyEl.querySelector("[data-badge='legacy']");
  expect(legacy?.className).toMatch(/border/);
  expect(legacy?.className).not.toMatch(/bg-ink-soft\b/); // not filled

  const { container: previewEl } = render(<ModelBadge modelType="standard" status="preview" />);
  const preview = previewEl.querySelector("[data-badge='preview']");
  expect(preview?.className).toMatch(/border/);
  expect(preview?.className).not.toMatch(/bg-rust\b/); // not filled
});
```

- [ ] **Step 2: Run — expect FAIL on the new test**

- [ ] **Step 3: Update `ModelBadge.tsx`**

Replace the `PILL` constant and variant classes:
```tsx
const PILL_BASE = "inline-block text-[10px] font-semibold uppercase tracking-wide rounded-sm px-2 py-0.5 ml-1.5";

export const ModelBadge: React.FC<ModelBadgeProps> = ({ status, modelType }) => {
  const pills: React.ReactNode[] = [];
  if (modelType === "reasoning") {
    pills.push(<span key="r" data-badge="reasoning" className={`${PILL_BASE} bg-rust text-paper`}>REASONING</span>);
  }
  if (status === "legacy") {
    pills.push(<span key="l" data-badge="legacy" className={`${PILL_BASE} border border-ink-soft text-ink-soft`}>LEGACY</span>);
  }
  if (status === "preview") {
    pills.push(<span key="p" data-badge="preview" className={`${PILL_BASE} border border-rust text-rust`}>PREVIEW</span>);
  }
  if (pills.length === 0) return null;
  return <>{pills}</>;
};
```

- [ ] **Step 4: Run — expect all tests PASS (6 in ModelBadge, 41 total)**

- [ ] **Step 5: Commit**

```bash
git add apps/bot-battle/web/app/components/ModelBadge.tsx apps/bot-battle/web/app/components/ModelBadge.test.tsx
git commit -m "feat(bot-battle): restyle ModelBadge — filled reasoning, outlined legacy/preview"
```

---

### Task 5: Sweep `LLMResponsePanel` to token utilities

**Files:**
- Modify: `apps/bot-battle/web/app/components/LLMResponsePanel.tsx`

Existing panel uses `border-gray-200 dark:border-gray-700`, `bg-gray-50 dark:bg-gray-800`, `text-gray-500`, etc. Replace with paper/ink/rule tokens.

- [ ] **Step 1: Read the file fresh** at `app/components/LLMResponsePanel.tsx` — it was touched by the reasoning UX work, so the structure is: card root → header (model + badge + EffortSelector) → tabs (if reasoning) → body → metrics.

- [ ] **Step 2: Apply these class replacements (find→replace within the file)**

| Find | Replace |
|---|---|
| `border-gray-200 dark:border-gray-700` | `border-rule` |
| `border-gray-200` | `border-rule` |
| `bg-gray-50 dark:bg-gray-800` | `bg-paper-sunk` |
| `bg-gray-50` | `bg-paper-sunk` |
| `text-gray-500` | `text-ink-soft` |
| `text-gray-700 dark:text-gray-300` | `text-ink-soft` |
| `text-blue-600` | `text-rust` |
| `bg-gray-900 text-white` | `bg-ink text-paper` (primary button) |

Card root background should use `bg-paper`. Intra-card rules (between tabs, between metrics and body) should use `border-rule-soft`.

Tabs: active tab adds `border-b-2 border-rust text-rust font-semibold`, inactive is `text-ink-soft`.

Body (`<pre>`): add `font-serif text-[14px] leading-[1.65]` for the reading-forward voice. Metrics row stays `font-sans` with tabular-nums — add `font-variant-numeric-tabular` via inline style if Tailwind doesn't expose it; or use `tabular-nums` class.

- [ ] **Step 3: Tests + build**

```bash
yarn workspace @knicks-knacks/bot-battle-web test --run
yarn workspace @knicks-knacks/bot-battle-web build
```

All 41 tests should still pass (they don't assert on color class names, only on structure and labels).

- [ ] **Step 4: Commit**

```bash
git add apps/bot-battle/web/app/components/LLMResponsePanel.tsx
git commit -m "style(bot-battle): sweep LLMResponsePanel to editorial tokens"
```

---

### Task 6: Update `EffortSelector` styling

**Files:**
- Modify: `apps/bot-battle/web/app/components/EffortSelector.tsx`

Tiny file; just swap the inline colors to tokens.

- [ ] **Step 1: Replace the element classes**

```tsx
<label className="text-xs text-ink-soft flex items-center gap-1">
  Effort:
  <select
    value={value}
    onChange={(e) => onChange(e.target.value as Effort)}
    className="text-xs border border-rule rounded-sm px-1 py-0.5 bg-paper text-ink"
  >
    <option value="low">low</option>
    <option value="medium">medium</option>
    <option value="high">high</option>
  </select>
</label>
```

- [ ] **Step 2: Tests**

```bash
yarn workspace @knicks-knacks/bot-battle-web test --run app/components/EffortSelector.test.tsx
```
3 tests should still pass.

- [ ] **Step 3: Commit**

```bash
git add apps/bot-battle/web/app/components/EffortSelector.tsx
git commit -m "style(bot-battle): EffortSelector tokens"
```

---

### Task 7: Convert `ModelSelector` from list → chip row

**Files:**
- Modify: `apps/bot-battle/web/app/components/ModelSelector.tsx`

This is a structural change, not just a color swap. The current selector is 381 lines of list/group rendering. The new shape is a flat chip row where each chip is a pill button showing `displayName` + badge, with selected state in `bg-rust text-paper`, unselected in `bg-paper border border-rule text-ink-soft`.

- [ ] **Step 1: Read the full `ModelSelector.tsx`** to understand:
  - Its props API (used by `page.tsx`)
  - How it signals selection changes to the parent
  - Any side-effects (effort state, key status) it's doing beyond pure rendering

- [ ] **Step 2: Preserve the public API**

Whatever props the parent passes (e.g. `selectedModels`, `onSelectionChange`, `availableKeys`) must keep working. The internal rendering changes; the contract does not.

- [ ] **Step 3: Replace the internal layout**

The container becomes:
```tsx
<div className="flex flex-wrap gap-1.5">
  {allModels.map((m) => {
    const selected = selectedModels.includes(m.id);
    const disabled = !isKeyAvailableFor(m.providerId);
    return (
      <button
        key={m.id}
        type="button"
        onClick={() => toggle(m.id)}
        disabled={disabled}
        className={[
          "text-xs px-2.5 py-1 rounded-full border",
          selected
            ? "bg-rust text-paper border-rust"
            : "bg-paper text-ink-soft border-rule hover:text-ink",
          disabled && "opacity-50 cursor-not-allowed",
        ].filter(Boolean).join(" ")}
      >
        {m.displayName}
        <ModelBadge status={m.status} modelType={m.modelType} />
      </button>
    );
  })}
</div>
```

Where `allModels` is a flattened `LLM_REGISTRY.flatMap(p => p.models.map(m => ({ ...m, providerId: p.id })))`.

If the existing component has additional UX (effort-per-model selector embedded, "select all" affordances, provider grouping), consider which are still wanted with the chip layout. If uncertain, keep them as a small row ABOVE the chips — don't delete features during a theme pass. Flag any removals in the commit message.

- [ ] **Step 4: Run build + tests**

```bash
yarn workspace @knicks-knacks/bot-battle-web build
yarn workspace @knicks-knacks/bot-battle-web test --run
```

- [ ] **Step 5: Manual sanity check**

Start dev server briefly: `yarn workspace @knicks-knacks/bot-battle-web dev`. Open `http://localhost:3000`. Confirm chips render, selection toggles, badges show on REASONING and PREVIEW models.

- [ ] **Step 6: Commit**

```bash
git add apps/bot-battle/web/app/components/ModelSelector.tsx
git commit -m "feat(bot-battle): convert ModelSelector from list to chip row"
```

---

### Task 8: Update `PromptInput` to card + serif textarea

**Files:**
- Modify: `apps/bot-battle/web/app/components/PromptInput.tsx`

The file is 22 lines — probably just a textarea + submit. Wrap it in the editorial card pattern.

- [ ] **Step 1: Read the file** to see what props it takes.

- [ ] **Step 2: Update structure**

```tsx
// Inside the rendered JSX:
<section className="bg-paper border border-rule rounded-sm p-5 mb-6">
  <h2 className="font-serif text-base font-bold mb-3">Prompt</h2>
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Type a prompt..."
    className="w-full min-h-[80px] bg-paper-sunk border border-rule-soft rounded-sm p-3 text-ink font-serif text-[15px] leading-[1.55] resize-y focus:outline-none focus:border-rust"
  />
  {/* keep existing controls layout below textarea */}
</section>
```

Do NOT change the component's props contract.

- [ ] **Step 3: Build + tests**

- [ ] **Step 4: Commit**

```bash
git add apps/bot-battle/web/app/components/PromptInput.tsx
git commit -m "style(bot-battle): editorial card + serif textarea for PromptInput"
```

---

### Task 9: Update `ApiKeyInput` styling

**Files:**
- Modify: `apps/bot-battle/web/app/components/ApiKeyInput.tsx`

Replace color classes with tokens. The Test button (added in the earlier cycle) should use the secondary-button style.

- [ ] **Step 1: Replace classes**

- Input field: `bg-paper border border-rule rounded-sm px-3 py-2 text-ink placeholder:text-ink-soft focus:outline-none focus:border-rust`
- Test button (secondary style): `text-xs px-2.5 py-1 border border-rule rounded-sm text-ink-soft hover:text-ink hover:border-ink-soft disabled:opacity-50`
- Save/primary button if present: `bg-ink text-paper px-5 py-1.5 rounded-sm text-sm font-semibold`
- Success text: `text-rust` (works in both modes thanks to token)
- Error text: keep a red tint for error (`text-red-600` is fine — it's an error, not a brand color)

- [ ] **Step 2: Run tests**

All 3 `ApiKeyInput.test.tsx` tests (and the 41 total) should still pass.

- [ ] **Step 3: Commit**

```bash
git add apps/bot-battle/web/app/components/ApiKeyInput.tsx
git commit -m "style(bot-battle): ApiKeyInput editorial tokens"
```

---

### Task 10: Update `app/page.tsx` main page layout

**Files:**
- Modify: `apps/bot-battle/web/app/page.tsx`

`page.tsx` is 507 lines — many color classes to sweep. Replace everything that was a hardcoded gray / white / blue color with tokens.

- [ ] **Step 1: Apply find→replace**

| Find | Replace |
|---|---|
| `bg-white dark:bg-gray-800` | `bg-paper` |
| `bg-white` | `bg-paper` |
| `bg-gray-100 dark:bg-gray-900` | `bg-paper-sunk` |
| `bg-gray-100` | `bg-paper-sunk` |
| `text-gray-900 dark:text-white` | `text-ink` |
| `text-gray-900` | `text-ink` |
| `text-gray-500` | `text-ink-soft` |
| `text-gray-600 dark:text-gray-300` | `text-ink-soft` |
| `border-gray-200 dark:border-gray-700` | `border-rule` |
| `border-gray-200` | `border-rule` |
| `text-blue-600 hover:underline` | `text-rust hover:underline` |
| `bg-blue-600 hover:bg-blue-700 text-white` | `bg-ink hover:bg-ink-soft text-paper` |

- [ ] **Step 2: Layout container**

The outer layout wrapper in `page.tsx` should use `max-w-[1100px] mx-auto` (matching the layout header) — if the existing container class is `container mx-auto`, leave it if it works, or align both to the same max-width.

- [ ] **Step 3: Grid for result cells**

Current grid is likely `grid-cols-1 md:grid-cols-2`. Keep it but ensure cell gap is `gap-4` and background is `bg-paper-sunk` so cards (bg-paper) sit against the sunk page.

- [ ] **Step 4: Run build + tests**

- [ ] **Step 5: Commit**

```bash
git add apps/bot-battle/web/app/page.tsx
git commit -m "style(bot-battle): editorial tokens across main page"
```

---

### Task 11: Update `/settings` page

**Files:**
- Modify: `apps/bot-battle/web/app/settings/page.tsx`

Apply the card-per-provider pattern. Each `<ApiKeyInput>` already handles its own internal styling after Task 9. This page mostly needs the section heading and container styling updated.

- [ ] **Step 1: Sweep color classes** using the same find→replace from Task 10.

- [ ] **Step 2: Wrap each provider section in a card**

```tsx
<section className="bg-paper border border-rule rounded-sm p-5 mb-4">
  <h3 className="font-serif text-base font-bold mb-3">OpenAI</h3>
  <ApiKeyInput ... />
</section>
```

- [ ] **Step 3: Page heading uses serif**

```tsx
<h1 className="font-serif text-2xl font-bold mb-6">API Keys</h1>
```

- [ ] **Step 4: Build + tests**

- [ ] **Step 5: Commit**

```bash
git add apps/bot-battle/web/app/settings/page.tsx
git commit -m "style(bot-battle): settings page card-per-provider editorial"
```

---

### Task 12: Final sweep + manual QA

- [ ] **Step 1: Grep for residual hardcoded colors**

Run:
```bash
grep -rn "bg-gray-\|bg-white\|bg-neutral-\|text-gray-\|border-gray-\|dark:bg-\|dark:text-\|dark:border-\|bg-blue-\|text-blue-" apps/bot-battle/web/app --include="*.tsx" --include="*.ts"
```

Expected: zero matches (or only inside test files where color classes don't matter). Any real matches should be swept to tokens or flagged as intentional (e.g. `text-red-600` for errors is intentional).

- [ ] **Step 2: Run full test suite + build**

```bash
yarn workspace @knicks-knacks/bot-battle-web test --run
yarn workspace @knicks-knacks/bot-battle-web build
```

41+ tests pass, build clean.

- [ ] **Step 3: Start dev server, manually walk both modes**

```bash
yarn workspace @knicks-knacks/bot-battle-web dev
```

Check in-browser:
1. Light mode renders cream + rust correctly
2. Toggle flips to espresso without a flash
3. Reload — espresso persists (init script works)
4. Prompt panel, chips, Run button all use the palette
5. Result cells: reasoning model shows tabs + effort selector, badge is filled rust
6. Preview-badge model shows outlined rust badge
7. Settings page: card-per-provider, Test button secondary style
8. Nav link hover states work

Fix any visible mismatches in a follow-up commit if found.

- [ ] **Step 4: Final commit (if cleanup needed)**

```bash
git add -u apps/bot-battle/web/app
git commit -m "style(bot-battle): final editorial theme cleanup"
```

---

## Follow-ups (not implemented — logged for next cycle)

- Custom web fonts (self-host Source Serif Pro instead of Georgia fallback)
- Cross-fade animation on theme toggle
- Printable stylesheet
- User-selectable accent color (rust is currently hard-coded)
- Formal WCAG contrast audit on the rust accent in both palettes
- Remove unused legacy `primary` / `secondary` / `accent` / `neutral` color extensions in `tailwind.config.ts` once nothing in the app references them
