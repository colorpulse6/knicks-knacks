# Regexplain SEO Terminal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Regexplain as a secure, server-rendered terminal-style regex explainer with five substantive example pages, complete search discovery assets, and a lightweight Buy Me a Coffee link.

**Architecture:** Keep the permanent page shell and example content in Server Components while isolating pattern input, local parsing/testing, and AI request state in one client workbench. A typed examples module feeds every route and discovery artifact; a validated server route calls Groq with a server-only key and returns one contextual summary while local code owns token breakdowns.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, regexp-tree, Vitest, Testing Library, jsdom, Lighthouse.

---

## Working context

- Worktree root: `/Users/nichalasbarnes/Desktop/projects/knicks-knacks/apps/regexplain/web/.worktrees/regexplain-seo-terminal`
- App root: `/Users/nichalasbarnes/Desktop/projects/knicks-knacks/apps/regexplain/web/.worktrees/regexplain-seo-terminal/apps/regexplain/web`
- Spec: `docs/superpowers/specs/2026-07-14-regexplain-seo-terminal-design.md`
- Branch: `codex/regexplain-seo-terminal`
- Baseline: `npx tsc --noEmit` passes; `npm run build` exits successfully and prerenders `/`; there is no test script.
- Known baseline limitation: `npm run lint` fails because the shared Next ESLint plugin is not resolved. Do not silently claim lint is green or widen this feature into the monorepo ESLint repair.
- Run test, typecheck, build, server, and content commands from the app root. Run each task's `git add`/`git commit` block from the worktree root because those blocks use monorepo-relative paths.

## File structure and responsibilities

### Core configuration and data

- `app/lib/site.ts` — immutable canonical site identity and absolute URL helper.
- `app/lib/regex.ts` — pattern/flag validation and safe JavaScript `RegExp` compilation helpers.
- `app/data/examples.ts` — typed source of truth for the five worked examples.
- `app/lib/groq.ts` — server-only Groq request and structured response validation.
- `app/lib/seo.ts` — metadata and JSON-LD factories shared by the homepage and examples.

### Routes and discovery

- `app/api/explain/route.ts` — validated `POST` boundary with stable error responses.
- `app/examples/[slug]/page.tsx` — statically generated example articles and metadata.
- `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts` — crawler and install discovery.
- `app/opengraph-image.tsx` — code-generated terminal social card.

### UI

- `app/page.tsx` — server-rendered homepage composition.
- `app/components/RegexWorkbench.tsx` — client interaction and AI summary state.
- `app/components/SiteHeader.tsx`, `LearningSections.tsx`, `ExampleGrid.tsx`, `SiteFooter.tsx` — semantic server-rendered site chrome and crawlable content.
- `app/components/JsonLd.tsx` — safe JSON-LD serialization.
- Existing `RegexInput.tsx`, `RegexBreakdown.tsx`, `RegexTester.tsx`, `ExplanationDisplay.tsx`, and `CommonPatterns.tsx` — retained but given focused pattern/flags APIs and terminal semantics.
- `app/globals.css` — terminal tokens, responsive layout, motion reduction, focus, and accessible state styling.

### Tests and operations

- `vitest.config.mts`, `test/setup.ts` — app-local unit/component test harness.
- `playwright.config.ts`, `e2e/workbench.spec.ts` — deterministic production-mode browser verification with intercepted AI responses.
- Co-located `*.test.ts(x)` files — data, metadata, API, and interaction behavior.
- `docs/webmaster-onboarding.md` — Google Search Console and Bing runbook.
- `.env.example`, `README.md` — server-only environment and local verification documentation.

## Task 1: Establish the test harness and site identity

**Files:**
- Modify: `package.json`
- Modify: `../../../yarn.lock`
- Create: `vitest.config.mts`
- Create: `test/setup.ts`
- Create: `app/lib/site.test.ts`
- Create: `app/lib/site.ts`

- [ ] **Step 1: Add the app-local test dependencies and scripts**

From the app root, run:

```bash
yarn add -D vitest jsdom @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
```

Add scripts:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test"
```

Configure jsdom, `test/setup.ts`, `app/**/*.test.{ts,tsx}`, and the `@` alias rooted at the app directory. Import `@testing-library/jest-dom/vitest` in the setup file and call `cleanup()` after each test.

- [ ] **Step 2: Write the failing site identity test**

```ts
import { describe, expect, it } from "vitest";
import { absoluteUrl, siteConfig } from "./site";

describe("siteConfig", () => {
  it("uses the canonical production origin", () => {
    expect(siteConfig.url).toBe("https://www.regexplain.cc");
    expect(absoluteUrl("/examples/email-regex")).toBe(
      "https://www.regexplain.cc/examples/email-regex",
    );
  });
});
```

- [ ] **Step 3: Run RED**

Run: `yarn test app/lib/site.test.ts`

Expected: FAIL because `app/lib/site.ts` does not exist.

- [ ] **Step 4: Implement the minimal immutable site configuration**

Include the canonical URL, `Regexplain`, default title/description, creator `Nic Barnes`, publisher `Regexplain`, source URL, support URL, and `absoluteUrl(path)` with one-slash joining.

- [ ] **Step 5: Run GREEN and typecheck**

Run: `yarn test app/lib/site.test.ts && npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/regexplain/web/package.json apps/regexplain/web/vitest.config.mts apps/regexplain/web/test apps/regexplain/web/app/lib/site.ts apps/regexplain/web/app/lib/site.test.ts yarn.lock
git commit -m "test(regexplain): establish app test harness"
```

## Task 2: Define examples and the pattern/flags contract

**Files:**
- Create: `app/data/examples.test.ts`
- Create: `app/data/examples.ts`
- Create: `app/lib/regex.test.ts`
- Create: `app/lib/regex.ts`

- [ ] **Step 1: Write failing example-integrity tests**

Test that there are exactly five examples with the approved slugs, all slugs are unique, every related slug exists, every example has at least two matches and two non-matches, and every example has nonempty token explanations, a use-case-specific limitation, and at least one common mistake. For each example, assert the checked-in list of expected meaningful token groups exactly matches its token-entry `part` values so missing explanations cannot pass through a generic length check.

Also assert `getExample("email-regex")` returns the email example and an unknown slug returns `undefined`.

- [ ] **Step 2: Write failing pattern/flags tests**

Cover:

```ts
expect(validateRegexInput({ pattern: "^[a-z]+$", flags: "i" })).toEqual({
  ok: true,
  value: { pattern: "^[a-z]+$", flags: "i" },
});
expect(validateRegexInput({ pattern: "", flags: "" }).ok).toBe(false);
expect(validateRegexInput({ pattern: "a", flags: "ii" }).ok).toBe(false);
expect(validateRegexInput({ pattern: "a", flags: "x" }).ok).toBe(false);
expect(validateRegexInput({ pattern: "a", flags: "uv" }).ok).toBe(false);
expect(validateRegexInput({ pattern: "a".repeat(1001), flags: "" }).ok).toBe(false);
expect(validateRegexInput({ pattern: "/a/i", flags: "" })).toMatchObject({
  ok: true,
  value: { pattern: "/a/i", flags: "" },
});
```

The `/a/i` assertion protects the approved contract: slash-delimited notation is not parsed; slashes remain literal pattern content. Test that `compileGlobalRegex("a", "i")` includes both `i` and `g` without duplicating `g`.

- [ ] **Step 3: Run RED**

Run: `yarn test app/data/examples.test.ts app/lib/regex.test.ts`

Expected: FAIL because the data and helpers do not exist.

- [ ] **Step 4: Implement the typed examples module**

Define `RegexExample` with `slug`, `name`, `pattern`, `flags`, `description`, `summary`, `tokens`, `matches`, `nonMatches`, `limitations`, `commonMistakes`, and `relatedSlugs`. Every token entry has a nonempty `part` and `explanation`, and together the entries account for every meaningful token group presented in that page's pattern. Supply unique prose for email, password, US phone number, URL, and hex color. Keep the password caveat explicit: regex checks format, not strength or breach history.

- [ ] **Step 5: Implement regex validation**

Accept only object input, a nonempty string pattern of at most 1,000 characters, and a string of unique `dgimsuvy` flags. Use `new RegExp(pattern, flags)` to reject syntax errors and runtime-incompatible combinations such as `u` plus `v`. Return a discriminated result with stable error codes/messages. Export `compileGlobalRegex` for the tester.

- [ ] **Step 6: Run GREEN**

Run: `yarn test app/data/examples.test.ts app/lib/regex.test.ts && npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/regexplain/web/app/data apps/regexplain/web/app/lib/regex.ts apps/regexplain/web/app/lib/regex.test.ts
git commit -m "feat(regexplain): define examples and regex input contract"
```

## Task 3: Move Groq behind a validated server boundary

**Files:**
- Create: `app/lib/groq.test.ts`
- Create: `app/lib/groq.ts`
- Create: `app/api/explain/route.test.ts`
- Create: `app/api/explain/route.ts`
- Modify: `.env.example`
- Delete: `app/utils/groq.ts`

- [ ] **Step 1: Write failing Groq client tests**

Mock `fetch` and assert that the server client:

- sends `openai/gpt-oss-20b` by default and permits a `GROQ_MODEL` override;
- uses Groq JSON Schema response format for `{ summary: string }`;
- includes `/pattern/flags` in the user prompt;
- returns a trimmed summary for a valid response;
- throws typed `upstream_timeout`, `upstream_error`, and `invalid_upstream_response` errors without including the provider body or submitted pattern in the public message.

- [ ] **Step 2: Write failing route tests**

Call `POST(new Request(...))` directly. Cover malformed JSON, wrong-type/missing/empty/too-long pattern, invalid flags, missing `GROQ_API_KEY`, success, timeout, and malformed upstream response. Assert stable shapes such as:

```json
{ "error": { "code": "invalid_flags", "message": "Use unique JavaScript flags: d, g, i, m, s, u, v, y." } }
```

- [ ] **Step 3: Run RED**

Run: `yarn test app/lib/groq.test.ts app/api/explain/route.test.ts`

Expected: FAIL because neither server module exists.

- [ ] **Step 4: Implement the server-only Groq client**

Use `https://api.groq.com/openai/v1/chat/completions`, `GROQ_API_KEY`, default model `openai/gpt-oss-20b`, a 15-second abort signal, low reasoning effort, and JSON Schema structured output. Request one concise contextual summary; do not request token breakdowns. Accept a fetch implementation in the internal function signature so tests do not make network calls.

- [ ] **Step 5: Implement the route**

Validate before reading/calling Groq. Map validation to `400`, missing configuration to `503`, timeout to `504`, and safe upstream failures to `502`. Do not log the submitted pattern, API key, provider body, or stack trace.

- [ ] **Step 6: Replace the public environment contract**

Set `.env.example` to:

```dotenv
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=openai/gpt-oss-20b
GOOGLE_SITE_VERIFICATION=
BING_SITE_VERIFICATION=
```

Delete `app/utils/groq.ts` after no import references remain.

- [ ] **Step 7: Run GREEN**

Run: `yarn test app/lib/groq.test.ts app/api/explain/route.test.ts && npx tsc --noEmit`

Expected: PASS and `rg "NEXT_PUBLIC_GROQ|apiKey" app .env.example` finds no browser credential path.

- [ ] **Step 8: Commit**

```bash
git add apps/regexplain/web/app/api apps/regexplain/web/app/lib/groq.ts apps/regexplain/web/app/lib/groq.test.ts apps/regexplain/web/.env.example apps/regexplain/web/app/utils/groq.ts
git commit -m "feat(regexplain): secure AI explanations behind server route"
```

## Task 4: Build the technical SEO foundation

**Files:**
- Create: `app/lib/seo.test.ts`
- Create: `app/lib/seo.ts`
- Create: `app/components/JsonLd.test.tsx`
- Create: `app/components/JsonLd.tsx`
- Create: `app/robots.test.ts`
- Create: `app/robots.ts`
- Create: `app/sitemap.test.ts`
- Create: `app/sitemap.ts`
- Create: `app/manifest.test.ts`
- Create: `app/manifest.ts`
- Create: `app/lib/social-image.test.ts`
- Create: `app/lib/social-image.ts`
- Create: `app/opengraph-image.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write failing metadata and JSON-LD tests**

Assert homepage metadata uses `metadataBase`, canonical `/`, title `Regexplain — Regex Explainer & Tester`, full Open Graph/Twitter fields, and optional verification values only when their environment variables are present.

Assert JSON-LD contains truthful `WebSite` and `WebApplication` nodes with a zero-price offer and no review/rating fields. Render `JsonLd` with a value containing `<` and assert it serializes as `\\u003c`.

- [ ] **Step 2: Write failing robots and sitemap tests**

Assert robots allows `/`, disallows `/api/`, names the absolute sitemap, and does not block named search crawlers. Assert the sitemap contains exactly the homepage plus the five example URLs with no `/api/` or query URLs.

- [ ] **Step 3: Write failing manifest and social-image model tests**

Assert the manifest has the approved full/short names, canonical start URL, standalone display, terminal theme/background colors, and description. Put social-image text/layout inputs in `app/lib/social-image.ts`; test that they include `Regexplain`, the regex explainer/tester value proposition, a visible example pattern, `1200x630`, and no remote asset URL.

- [ ] **Step 4: Run RED**

Run: `yarn test app/lib/seo.test.ts app/components/JsonLd.test.tsx app/robots.test.ts app/sitemap.test.ts app/manifest.test.ts app/lib/social-image.test.ts`

Expected: FAIL because the factories/routes do not exist.

- [ ] **Step 5: Implement metadata, JSON-LD, robots, sitemap, and manifest**

Centralize all URLs through `siteConfig`/`absoluteUrl`. Use Next `MetadataRoute` types. Keep verification tags absent when values are blank. Add `msvalidate.01` through `verification.other` for Bing.

- [ ] **Step 6: Implement the code-generated social image**

Use `ImageResponse` with the tested `social-image.ts` model, terminal palette, and text-only pattern motif. Keep it deterministic and free of remote fetches.

- [ ] **Step 7: Update the root layout**

Retain optimized Geist/Geist Mono fonts, set the terminal body classes and theme color, export complete metadata, and render the homepage JSON-LD in the page rather than duplicating it across routes.

- [ ] **Step 8: Run GREEN**

Run: `yarn test app/lib/seo.test.ts app/components/JsonLd.test.tsx app/robots.test.ts app/sitemap.test.ts app/manifest.test.ts app/lib/social-image.test.ts && npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add apps/regexplain/web/app/layout.tsx apps/regexplain/web/app/lib/seo.ts apps/regexplain/web/app/lib/seo.test.ts apps/regexplain/web/app/lib/social-image.ts apps/regexplain/web/app/lib/social-image.test.ts apps/regexplain/web/app/components/JsonLd.tsx apps/regexplain/web/app/components/JsonLd.test.tsx apps/regexplain/web/app/robots.ts apps/regexplain/web/app/robots.test.ts apps/regexplain/web/app/sitemap.ts apps/regexplain/web/app/sitemap.test.ts apps/regexplain/web/app/manifest.ts apps/regexplain/web/app/manifest.test.ts apps/regexplain/web/app/opengraph-image.tsx
git commit -m "feat(regexplain): add search discovery foundation"
```

## Task 5: Rebuild the interactive workbench

**Files:**
- Create: `app/components/RegexWorkbench.test.tsx`
- Create: `app/components/RegexWorkbench.tsx`
- Modify: `app/components/RegexInput.tsx`
- Modify: `app/components/CommonPatterns.tsx`
- Modify: `app/components/ExplanationDisplay.tsx`
- Modify: `app/components/RegexBreakdown.tsx`
- Modify: `app/components/RegexTester.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write failing workbench interaction tests**

Cover:

- pattern and flags fields render with visible labels;
- visible help says to enter the pattern without surrounding slash delimiters and that slashes typed in the pattern field remain literal content;
- clicking the email example loads its pattern and flags;
- `?example=hex-color-regex#workbench` loads the corresponding checked-in example after mount;
- invalid or empty input shows local validation and does not fetch;
- submit renders a loading state, calls `/api/explain` with `{ pattern, flags }`, then displays only the AI summary;
- an API failure retains input and leaves the syntax map/tester present;
- the privacy note states that the pattern is sent to Groq.

- [ ] **Step 2: Write failing local-tool tests**

Add focused tests proving `RegexTester` respects flags and `RegexBreakdown` exposes token details through keyboard-focusable buttons rather than clickable spans. Test the selected token description is visible and associated with the active button.

- [ ] **Step 3: Run RED**

Run: `yarn test app/components/RegexWorkbench.test.tsx app/components/RegexTester.test.tsx app/components/RegexBreakdown.test.tsx`

Expected: FAIL against the current component APIs.

- [ ] **Step 4: Implement `RegexWorkbench`**

Own `{ pattern, flags }`, request state, summary, and error. On mount, read only the `example` query key from `window.location.search` and load a known checked-in slug; ignore unknown values. Use `aria-live="polite"` for status and preserve focus/input on failure.

- [ ] **Step 5: Narrow the child component contracts**

- `RegexInput`: controlled pattern/flags fields and submit event.
- `CommonPatterns`: receives typed examples and returns the full selected example.
- `ExplanationDisplay`: summary/loading/error only; remove its token map and AI breakdown list.
- `RegexBreakdown`: accepts pattern/flags, parses locally, and uses native token buttons plus one stable description region.
- `RegexTester`: accepts pattern/flags and uses `compileGlobalRegex` while preserving supplied flags.

- [ ] **Step 6: Convert the page to a server shell**

Remove `"use client"` from `app/page.tsx`; temporarily render `RegexWorkbench` inside the existing main structure. Permanent learning content arrives in Task 6.

- [ ] **Step 7: Run GREEN**

Run: `yarn test app/components/RegexWorkbench.test.tsx app/components/RegexTester.test.tsx app/components/RegexBreakdown.test.tsx && npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/regexplain/web/app/page.tsx apps/regexplain/web/app/components
git commit -m "feat(regexplain): rebuild the regex workbench"
```

## Task 6: Compose the terminal homepage and support surface

**Files:**
- Create: `app/components/HomeContent.test.tsx`
- Create: `app/components/SiteHeader.tsx`
- Create: `app/components/LearningSections.tsx`
- Create: `app/components/ExampleGrid.tsx`
- Create: `app/components/SiteFooter.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `app/error.tsx`

- [ ] **Step 1: Write the failing server-content test**

Render the permanent homepage composition and assert it includes one H1; exact header links to Examples, How It Works, and Support; supported JavaScript flavor/limitations; the no-slash-delimiters input convention; five ordinary `/examples/...` links; FAQ text; footer methodology/privacy copy explaining that AI requests go to Groq; the source link; and `https://buymeacoffee.com/nicbarnes` with `target="_blank"` and `rel="noopener noreferrer"`.

- [ ] **Step 2: Run RED**

Run: `yarn test app/components/HomeContent.test.tsx`

Expected: FAIL because the composition does not exist.

- [ ] **Step 3: Implement semantic homepage components**

Use semantic `header`, `nav`, `section`, heading, list, and `footer` elements. Keep the tool first. Use a local inline coffee mark or text treatment—never the remote Buy Me a Coffee badge/script. Put the source link in the footer, not the primary header.

- [ ] **Step 4: Implement the Regex Terminal visual system**

In `globals.css`, define graphite, acid-green, cyan, amber/error, text, border, and focus tokens. Build the dominant terminal workbench, calmer document sections, responsive split/stack behavior, visible focus, AA placeholder text, and `prefers-reduced-motion`. Avoid remote decorative assets or a motion library.

- [ ] **Step 5: Restyle the global error boundary**

Match the terminal system without exposing stack details. Preserve Retry and Home actions with visible focus.

- [ ] **Step 6: Run GREEN**

Run: `yarn test app/components/HomeContent.test.tsx && npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/regexplain/web/app/page.tsx apps/regexplain/web/app/globals.css apps/regexplain/web/app/error.tsx apps/regexplain/web/app/components
git commit -m "feat(regexplain): launch terminal homepage design"
```

## Task 7: Generate the five substantive example pages

**Files:**
- Create: `app/examples/[slug]/page.test.tsx`
- Create: `app/examples/[slug]/page.tsx`

- [ ] **Step 1: Write failing route-generation tests**

Assert `generateStaticParams()` returns exactly five slugs. Loop over every example and assert `generateMetadata()` returns that page's unique title, description, canonical URL, Open Graph URL/title/description/image, and Twitter title/description/image. Assert the rendered email page includes pattern/flavor, summary, every checked-in token explanation, at least two matching and two non-matching strings, common mistakes, limitations, related links, and `/?example=email-regex#workbench`.

Assert an unknown slug invokes not-found behavior rather than rendering a soft `200` article.

- [ ] **Step 2: Run RED**

Run: `yarn test 'app/examples/[slug]/page.test.tsx'`

Expected: FAIL because the route does not exist.

- [ ] **Step 3: Implement the statically generated article route**

Use `generateStaticParams`, async Next 15 params, `notFound()`, `createPageMetadata`, semantic article sections, related-example links, and a terminal-style Try This Pattern link. Do not add FAQ, rating, or article schema merely to seek a rich result.

- [ ] **Step 4: Run GREEN**

Run: `yarn test 'app/examples/[slug]/page.test.tsx' && npx tsc --noEmit`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add 'apps/regexplain/web/app/examples/[slug]/page.tsx' 'apps/regexplain/web/app/examples/[slug]/page.test.tsx'
git commit -m "feat(regexplain): add worked regex example pages"
```

## Task 8: Add webmaster documentation and operator truth

**Files:**
- Create: `docs/webmaster-onboarding.md`
- Modify: `README.md`

- [ ] **Step 1: Write the webmaster runbook**

Document the exact production URLs and reversible steps for:

1. Google Domain property when DNS access exists, otherwise URL-prefix metadata verification.
2. Adding verification variables in Vercel and redeploying.
3. Submitting `https://www.regexplain.cc/sitemap.xml`.
4. Inspecting/requesting the homepage and one example.
5. Importing the verified Google property into Bing when available, otherwise Bing metadata verification.
6. Submitting the same sitemap and inspecting URLs in Bing.

Explicitly say these steps are not performed by the build and indexing is not guaranteed.

- [ ] **Step 2: Correct the README**

Document `GROQ_API_KEY`, optional `GROQ_MODEL`, verification variables, current test/typecheck/build commands, route map, privacy behavior, and the support URL. Remove stale TanStack Query, React 18, and nonexistent E2E claims.

- [ ] **Step 3: Verify docs and environment consistency**

Run:

```bash
rg -n "NEXT_PUBLIC_GROQ|TanStack|yarn e2e" README.md .env.example docs app
rg -n "www.regexplain.cc|sitemap.xml|GOOGLE_SITE_VERIFICATION|BING_SITE_VERIFICATION" README.md .env.example docs app
git diff --check
```

Expected: first command returns no stale hits; second command shows consistent production values; diff check passes.

- [ ] **Step 4: Commit**

```bash
git add apps/regexplain/web/docs/webmaster-onboarding.md apps/regexplain/web/README.md
git commit -m "docs(regexplain): add webmaster onboarding runbook"
```

## Task 9: Verify the complete build and rendered behavior

**Files:**
- Modify only if verification exposes an in-scope defect.
- Create: `playwright.config.ts`
- Create: `e2e/workbench.spec.ts`

- [ ] **Step 1: Run the automated suite from clean state**

```bash
yarn test
npx tsc --noEmit
npm run build
git diff --check
```

Expected: all tests/typecheck/build/diff checks pass. Record the known ESLint plugin warning separately if the build still prints it.

- [ ] **Step 2: Verify static route output**

Build output must list `/`, `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/opengraph-image`, and five `/examples/...` routes. No example route may be dynamic solely due to implementation choices.

- [ ] **Step 3: Start the production server and inspect endpoints**

Run: `npm run start -- -p 3010`

Then:

```bash
curl -sS http://localhost:3010/ | rg '<title|canonical|og:|twitter:|ld\+json|/examples/|buymeacoffee'
curl -sS http://localhost:3010/robots.txt
curl -sS http://localhost:3010/sitemap.xml
curl -sS http://localhost:3010/manifest.webmanifest
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:3010/examples/email-regex
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:3010/examples/not-real
curl -sS -I http://localhost:3010/robots.txt | rg -i '^content-type: text/plain'
curl -sS -I http://localhost:3010/ | rg -i '^content-type: text/html'
curl -sS -I http://localhost:3010/sitemap.xml | rg -i '^content-type: (application|text)/xml'
curl -sS -I http://localhost:3010/manifest.webmanifest | rg -i '^content-type: application/manifest\+json'
curl -sS -I http://localhost:3010/opengraph-image | rg -i '^content-type: image/png'
```

Expected: discovery endpoints and email page return `200` with the asserted content types; unknown example returns `404`; homepage HTML contains all required discovery/support markers.

- [ ] **Step 4: Write deterministic production-browser checks**

Configure Playwright to use the existing production server at `http://localhost:3010` and installed Chrome. In `e2e/workbench.spec.ts`:

- intercept `**/api/explain` with a successful `{ "summary": "..." }` response and verify loading then summary UI;
- intercept it with a stable `502` error and verify the pattern remains while local breakdown/test controls stay usable;
- verify keyboard access to token details and the support link attributes;
- at `320x800`, assert the document has no horizontal overflow and the workbench controls remain visible;
- capture approved visual-review screenshots at `390x844` and `1440x900` to `/tmp/regexplain-mobile.png` and `/tmp/regexplain-desktop.png`.

- [ ] **Step 5: Run and inspect browser checks**

Run: `yarn test:e2e`

Expected: PASS with no paid/network AI request. Inspect both screenshots with the image viewer and fix clipping, contrast, hierarchy, or terminal-effect problems. Also manually tab through the 320px page once to confirm native focus order.

- [ ] **Step 6: Run Lighthouse against production mode**

```bash
npx lighthouse http://localhost:3010 --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=/tmp/regexplain-lighthouse-final.json --chrome-flags="--headless --no-sandbox"
```

Expected minimums: Performance 95, Accessibility 98, Best Practices 100, SEO 100. Manually confirm canonical, robots, sitemap, and JSON-LD because Lighthouse does not fully score them.

- [ ] **Step 7: Check for credential leakage and scope drift**

```bash
rg -n "NEXT_PUBLIC_GROQ|Authorization: Bearer|Raw AI response" app .env.example README.md
git status --short
git log --oneline --decorate -12
```

Expected: no public key path or raw provider logging; only planned files changed; unrelated checkout files remain untouched.

- [ ] **Step 8: Commit browser checks and any verification-only fixes**

If fixes were needed, rerun the affected checks and commit only those files:

```bash
git add apps/regexplain/web/app apps/regexplain/web/e2e apps/regexplain/web/playwright.config.ts apps/regexplain/web/docs apps/regexplain/web/README.md apps/regexplain/web/.env.example apps/regexplain/web/package.json yarn.lock
git commit -m "fix(regexplain): resolve terminal verification findings"
```

Before committing, unstage any path in that list that was not part of the verified fix.

## External follow-up after deployment

Do not perform these actions without explicit user approval:

- Push the branch, open/merge a PR, or deploy Vercel.
- Change Vercel environment variables or DNS.
- Add the site to Google Search Console or Bing Webmaster Tools.
- Submit the sitemap or request indexing.

After deployment approval, re-run the live `curl` and Lighthouse checks against `https://www.regexplain.cc`, then follow `docs/webmaster-onboarding.md`.
