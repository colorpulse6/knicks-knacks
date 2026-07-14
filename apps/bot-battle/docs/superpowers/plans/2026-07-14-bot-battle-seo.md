# BotBattle SEO Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make BotBattle's tool-first homepage server-readable, complete its search/social discovery surface, add accessible support and form controls, and document Google/Bing onboarding.

**Architecture:** Keep benchmark behavior in a Client Component, but render a compact public homepage shell through a Server Component. Replace the app-wide no-SSR API-key boundary with an empty-on-server provider that hydrates browser state after mount. Centralize canonical site facts, derive Next.js metadata routes from them, and keep route-specific metadata out of the root layout.

**Tech Stack:** Next.js 15 App Router, React 18, TypeScript 5, Tailwind CSS 4, Zustand, Vitest, Testing Library, Next `Metadata`/`MetadataRoute`, `next/og` ImageResponse.

**Approved spec:** `apps/bot-battle/docs/superpowers/specs/2026-07-14-bot-battle-seo-design.md`

**Execution note:** Begin with `superpowers:using-git-worktrees`. The primary checkout contains unrelated untracked root-level documents; never stage, commit, move, or delete them.

---

## File map

### New files

- `apps/bot-battle/web/app/config/site.ts` — canonical product facts and social-image descriptor.
- `apps/bot-battle/web/app/config/site.test.ts` — exact contract tests for shared site facts.
- `apps/bot-battle/web/app/structured-data.ts` — truthful WebApplication payload and XSS-safe serializer.
- `apps/bot-battle/web/app/structured-data.test.ts` — schema and serializer tests.
- `apps/bot-battle/web/app/BenchmarkClient.tsx` — existing interactive homepage behavior moved intact from `page.tsx`.
- `apps/bot-battle/web/app/components/HomeSeoContent.tsx` — server-rendered intro and lower explainer.
- `apps/bot-battle/web/app/components/HomeSeoContent.test.tsx` — semantic and visible-copy tests.
- `apps/bot-battle/web/app/components/SupportLink.tsx` — native Buy Me a Coffee header control.
- `apps/bot-battle/web/app/components/SupportLink.test.tsx` — link, security, and accessibility contract.
- `apps/bot-battle/web/app/providers/ClientProviders.test.tsx` — raw server-render and hydration privacy regression tests.
- `apps/bot-battle/web/app/metadata-routes.test.ts` — robots, sitemap, manifest, and social-image metadata tests.
- `apps/bot-battle/web/app/robots.ts` — crawler policy and sitemap pointer.
- `apps/bot-battle/web/app/sitemap.ts` — canonical indexable URL list.
- `apps/bot-battle/web/app/manifest.ts` — web manifest.
- `apps/bot-battle/web/app/social-card/SocialCard.tsx` — pure visual content for the generated card.
- `apps/bot-battle/web/app/social-card/SocialCard.test.tsx` — generated-card content contract.
- `apps/bot-battle/web/app/social-card/route.tsx` — explicit 1200 x 630 PNG endpoint, avoiding inherited file metadata.
- `apps/bot-battle/web/app/home-metadata.test.ts` — actual homepage metadata contract.
- `apps/bot-battle/web/app/settings/layout.tsx` — settings-specific canonical and noindex metadata.
- `apps/bot-battle/web/app/settings/layout.test.ts` — settings metadata inheritance guard.
- `apps/bot-battle/docs/seo/search-console-bing.md` — post-deploy webmaster runbook.

### Modified files

- `apps/bot-battle/web/app/providers/ClientProviders.tsx` — remove dynamic no-SSR loading boundary.
- `apps/bot-battle/web/app/providers/ApiKeyProvider.tsx` — initialize empty and hydrate persisted keys after mount.
- `apps/bot-battle/web/app/layout.tsx` — shared-only metadata, responsive header, support control.
- `apps/bot-battle/web/app/page.tsx` — server homepage, route metadata, JSON-LD, and benchmark composition.
- `apps/bot-battle/web/app/components/PromptSelector.tsx` — associate label and select.
- `apps/bot-battle/web/app/components/PromptInput.tsx` — associate label and textarea.
- `apps/bot-battle/web/app/components/ApiKeyInput.tsx` — associate provider label and password input.
- `apps/bot-battle/web/app/components/ApiKeyInput.test.tsx` — query the key field by accessible name.

No API route, model registry, key value, pricing record, deployment configuration, or external webmaster account is changed.

---

### Task 1: Restore server rendering without exposing browser API keys

**Files:**

- Create: `apps/bot-battle/web/app/providers/ClientProviders.test.tsx`
- Modify: `apps/bot-battle/web/app/providers/ClientProviders.tsx`
- Modify: `apps/bot-battle/web/app/providers/ApiKeyProvider.tsx`

- [ ] **Step 1: Write failing provider regression tests**

Create `ClientProviders.test.tsx` with three behaviors:

```tsx
import React from "react";
import { act } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClientProviders } from "./ClientProviders";
import { useApiKeyStore } from "./ApiKeyProvider";

function KeyProbe() {
  const hasOpenAiKey = useApiKeyStore((state) => Boolean(state.apiKeys.openai));
  return <span>{hasOpenAiKey ? "key-present" : "key-absent"}</span>;
}

describe("ClientProviders server rendering", () => {
  let root: Root | undefined;

  afterEach(() => {
    act(() => root?.unmount());
    root = undefined;
    localStorage.clear();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("renders children in server HTML instead of a loading bailout", () => {
    const html = renderToString(
      <ClientProviders><span>benchmark-content</span></ClientProviders>,
    );
    expect(html).toContain("benchmark-content");
    expect(html).not.toContain("Loading...");
  });

  it("never serializes a persisted API key into server HTML", () => {
    vi.stubEnv("NEXT_PUBLIC_PERSIST_API_KEYS", "true");
    localStorage.setItem("botbattle_apikeys", JSON.stringify({ openai: "sk-private" }));
    const html = renderToString(
      <ClientProviders><KeyProbe /></ClientProviders>,
    );
    expect(html).toContain("key-absent");
    expect(html).not.toContain("sk-private");
  });

  it("hydrates persisted state after a matching empty client render", async () => {
    vi.stubEnv("NEXT_PUBLIC_PERSIST_API_KEYS", "true");
    localStorage.setItem("botbattle_apikeys", JSON.stringify({ openai: "sk-private" }));
    const serverHtml = renderToString(
      <ClientProviders><KeyProbe /></ClientProviders>,
    );
    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await act(async () => {
      root = hydrateRoot(container, <ClientProviders><KeyProbe /></ClientProviders>);
    });

    expect(container).toHaveTextContent("key-present");
    expect(consoleError.mock.calls.flat().join(" ")).not.toMatch(/hydration/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
```

If React's test environment requires it, add
`globalThis.IS_REACT_ACT_ENVIRONMENT = true` to `web/test/setup.ts`; do not
weaken the assertions.

- [ ] **Step 2: Run the focused test and verify RED**

```bash
yarn workspace @knicks-knacks/bot-battle-web test --run app/providers/ClientProviders.test.tsx
```

Expected: FAIL because server markup is `Loading...`.

- [ ] **Step 3: Remove the no-SSR provider boundary**

Replace `ClientProviders.tsx` with:

```tsx
"use client";

import type { ReactNode } from "react";
import { ApiKeyProvider } from "./ApiKeyProvider";

export function ClientProviders({ children }: { children: ReactNode }) {
  return <ApiKeyProvider>{children}</ApiKeyProvider>;
}
```

- [ ] **Step 4: Make provider state identical on server and initial client render**

In `ApiKeyProvider.tsx`, delete `globalStore` and `getOrCreateStore`, then use:

```tsx
const [store] = useState<ApiKeyStoreApi>(() => createApiKeyStore());

useEffect(() => {
  const persistedState = initApiKeyStore();
  store.setState({ apiKeys: persistedState.apiKeys });
  setIsHydrated(true);
}, [store]);
```

Keep the existing post-hydration synchronization behavior. It may read
`localStorage` only through `initApiKeyStore()` inside the effect. It must not
log or render key values.

- [ ] **Step 5: Run focused and existing key tests and verify GREEN**

```bash
yarn workspace @knicks-knacks/bot-battle-web test --run \
  app/providers/ClientProviders.test.tsx \
  app/components/ApiKeyInput.test.tsx
```

Expected: PASS with no hydration warning.

- [ ] **Step 6: Commit the SSR/hydration slice**

```bash
git add apps/bot-battle/web/app/providers/ClientProviders.tsx \
  apps/bot-battle/web/app/providers/ApiKeyProvider.tsx \
  apps/bot-battle/web/app/providers/ClientProviders.test.tsx
git commit -m "fix(bot-battle): render provider content on the server"
```

Add `web/test/setup.ts` only if it was actually changed.

---

### Task 2: Centralize site facts and add discovery endpoints

**Files:**

- Create: `apps/bot-battle/web/app/config/site.ts`
- Create: `apps/bot-battle/web/app/config/site.test.ts`
- Create: `apps/bot-battle/web/app/metadata-routes.test.ts`
- Create: `apps/bot-battle/web/app/robots.ts`
- Create: `apps/bot-battle/web/app/sitemap.ts`
- Create: `apps/bot-battle/web/app/manifest.ts`
- Modify: `apps/bot-battle/web/app/layout.tsx`

- [ ] **Step 1: Write failing site/discovery contract tests**

Test these exact facts:

```ts
import { describe, expect, it } from "vitest";
import { SITE } from "./site";

describe("SITE", () => {
  it("uses the verified canonical production origin", () => {
    expect(SITE.url).toBe("https://www.botbattle.cc");
    expect(new URL(SITE.socialImage.url, SITE.url).origin).toBe(SITE.url);
  });

  it("defines one 1200 by 630 social image contract", () => {
    expect(SITE.socialImage).toMatchObject({
      url: "/social-card",
      width: 1200,
      height: 630,
      type: "image/png",
    });
    expect(SITE.socialImage.alt).toMatch(/BotBattle/i);
  });
});
```

In `metadata-routes.test.ts`, import the default functions from `robots`,
`sitemap`, and `manifest`. Assert robots uses `userAgent: "*"`, `allow: "/"`,
`disallow: "/api/"`, and the absolute sitemap URL. Assert sitemap equals one
canonical homepage entry with no invented freshness/priority fields. Assert the
manifest uses BotBattle's name/description, `/` start URL, `standalone`, paper
colors, and the existing 1024 x 1024 PNG icon.

Also import `metadata as rootMetadata` from `layout.tsx` and assert the actual
object has the canonical `metadataBase`, title template, icons, and manifest,
while lacking `alternates`, `description`, `openGraph`, and `twitter`. This is
the failing test that licenses the shared-metadata layout change in Step 5.

- [ ] **Step 2: Run tests and verify RED**

```bash
yarn workspace @knicks-knacks/bot-battle-web test --run \
  app/config/site.test.ts app/metadata-routes.test.ts
```

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Create the canonical site configuration**

Create `app/config/site.ts`:

```ts
export const SITE = {
  name: "BotBattle",
  url: "https://www.botbattle.cc",
  homeTitle: "Compare AI Models Side by Side | BotBattle",
  pageTitle: "Compare AI Models Side by Side",
  description:
    "Compare responses from leading AI models side by side, then review latency, token usage, throughput, and comparative analysis in one benchmark.",
  supportUrl: "https://buymeacoffee.com/nicbarnes",
  socialImage: {
    url: "/social-card",
    width: 1200,
    height: 630,
    type: "image/png",
    alt: "BotBattle - compare AI models side by side",
  },
} as const;

export const SITE_URL = new URL(SITE.url);
```

- [ ] **Step 4: Implement typed robots, sitemap, and manifest routes**

Use `MetadataRoute.Robots`, `MetadataRoute.Sitemap`, and
`MetadataRoute.Manifest`. The sitemap is exactly:

```ts
return [{ url: `${SITE.url}/` }];
```

Do not add fake freshness fields. The robots route points to
`${SITE.url}/sitemap.xml`; the manifest icon uses `/botbattle-icon.png`,
`sizes: "1024x1024"`, and `type: "image/png"`.

- [ ] **Step 5: Restrict root metadata to shared fields**

Type `metadata` in `layout.tsx` as `Metadata` and keep only:

```ts
export const metadata: Metadata = {
  metadataBase: SITE_URL,
  applicationName: SITE.name,
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/botbattle-icon.png", type: "image/png", sizes: "1024x1024" },
    ],
    apple: [{ url: "/botbattle-icon.png", sizes: "1024x1024" }],
  },
  manifest: "/manifest.webmanifest",
};
```

Do not put homepage canonical, description, Open Graph, Twitter, or verification
tokens in the root layout.

- [ ] **Step 6: Run discovery tests and verify GREEN**

```bash
yarn workspace @knicks-knacks/bot-battle-web test --run \
  app/config/site.test.ts app/metadata-routes.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit discovery infrastructure**

```bash
git add apps/bot-battle/web/app/config \
  apps/bot-battle/web/app/metadata-routes.test.ts \
  apps/bot-battle/web/app/robots.ts apps/bot-battle/web/app/sitemap.ts \
  apps/bot-battle/web/app/manifest.ts apps/bot-battle/web/app/layout.tsx
git commit -m "feat(bot-battle): add search discovery metadata"
```

---

### Task 3: Create the server-rendered tool-first homepage

**Files:**

- Create: `apps/bot-battle/web/app/BenchmarkClient.tsx` by moving current `page.tsx`
- Create: `apps/bot-battle/web/app/components/HomeSeoContent.tsx`
- Create: `apps/bot-battle/web/app/components/HomeSeoContent.test.tsx`
- Create: `apps/bot-battle/web/app/structured-data.ts`
- Create: `apps/bot-battle/web/app/structured-data.test.ts`
- Create: `apps/bot-battle/web/app/home-metadata.test.ts`
- Modify: `apps/bot-battle/web/app/page.tsx`

- [ ] **Step 1: Write failing server-content and structured-data tests**

`HomeSeoContent.test.tsx` uses `renderToStaticMarkup` and asserts exactly one
H1 named `Compare AI models side by side`; visible copy mentions one prompt,
side-by-side responses, latency, tokens, throughput, shared access, and provider
keys; and an ordinary `/settings` link exists.

`structured-data.test.ts` asserts:

```ts
expect(WEB_APPLICATION_JSON_LD).toMatchObject({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "BotBattle",
  url: "https://www.botbattle.cc/",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
});
expect(WEB_APPLICATION_JSON_LD).not.toHaveProperty("aggregateRating");
expect(WEB_APPLICATION_JSON_LD).not.toHaveProperty("review");
expect(serializeJsonLd({ value: "</script>" })).not.toContain("<");
expect(serializeJsonLd({ value: "</script>" })).toContain("\\u003c/script>");
```

`home-metadata.test.ts` imports the actual `metadata` export from `page.tsx` and
asserts the canonical `/`, description, page title, complete Open Graph
website object, `summary_large_image` Twitter card, and that both image arrays
use the `/social-card` descriptor with 1200 x 630 PNG dimensions and alt text.

- [ ] **Step 2: Run focused tests and verify RED**

```bash
yarn workspace @knicks-knacks/bot-battle-web test --run \
  app/components/HomeSeoContent.test.tsx app/structured-data.test.ts \
  app/home-metadata.test.ts
```

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Move the interactive page without changing behavior**

```bash
git mv apps/bot-battle/web/app/page.tsx apps/bot-battle/web/app/BenchmarkClient.tsx
```

Keep `"use client"`, rename the default component to `BenchmarkClient`, and
replace the `next/dynamic` `ssr: false` import of `LLMComparativeAnalysis` with a
normal static import. That component has no browser-global reads during render.
Make no model, request, stream, response, or metrics behavior change.

- [ ] **Step 4: Implement the server-visible content**

Create `HomeSeoContent.tsx` exporting `HomeIntro` and `HomeExplainer`.

```tsx
export function HomeIntro() {
  return (
    <section aria-labelledby="botbattle-heading" className="mb-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-rust">
        LLM comparison workbench
      </p>
      <h1 id="botbattle-heading" className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Compare AI models side by side
      </h1>
      <p className="mt-3 max-w-3xl text-base leading-7 text-ink-soft">
        Run one prompt across selected AI models, compare their responses, and
        inspect latency, token usage, and throughput in a single benchmark.
      </p>
    </section>
  );
}
```

`HomeExplainer` follows the benchmark and contains a compact `How BotBattle
works` section: select models/run one prompt; inspect answers and measurements;
request comparative analysis with at least two results; shared free-tier access
exists for some models while others need a provider key; keys remain
browser-side according to the current settings mode; link ordinarily to
`/settings`. Keep model versions out of this content.

- [ ] **Step 5: Implement safe WebApplication JSON-LD**

Create `structured-data.ts` with a constant derived only from `SITE` and literal
visible feature strings. Add:

```ts
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
```

The payload must not accept user input, responses, provider objects, or keys.

- [ ] **Step 6: Recreate `page.tsx` as a Server Component**

Export route-owned `metadata: Metadata` with title `SITE.pageTitle`, description,
`alternates.canonical: "/"`, complete Open Graph fields, and
`twitter.card: "summary_large_image"`. Both social objects use the same
`SITE.socialImage` descriptor. Render:

```tsx
<>
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: serializeJsonLd(WEB_APPLICATION_JSON_LD) }}
  />
  <HomeIntro />
  <BenchmarkClient />
  <HomeExplainer />
</>
```

- [ ] **Step 7: Run focused tests and verify GREEN**

```bash
yarn workspace @knicks-knacks/bot-battle-web test --run \
  app/components/HomeSeoContent.test.tsx app/structured-data.test.ts \
  app/home-metadata.test.ts \
  app/providers/ClientProviders.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit the server-homepage slice**

```bash
git add apps/bot-battle/web/app/page.tsx \
  apps/bot-battle/web/app/BenchmarkClient.tsx \
  apps/bot-battle/web/app/components/HomeSeoContent.tsx \
  apps/bot-battle/web/app/components/HomeSeoContent.test.tsx \
  apps/bot-battle/web/app/home-metadata.test.ts \
  apps/bot-battle/web/app/structured-data.ts \
  apps/bot-battle/web/app/structured-data.test.ts
git commit -m "feat(bot-battle): render crawlable homepage content"
```

---

### Task 4: Generate the social image and add the support control

**Files:**

- Create: `apps/bot-battle/web/app/social-card/SocialCard.tsx`
- Create: `apps/bot-battle/web/app/social-card/SocialCard.test.tsx`
- Create: `apps/bot-battle/web/app/social-card/route.tsx`
- Create: `apps/bot-battle/web/app/components/SupportLink.tsx`
- Create: `apps/bot-battle/web/app/components/SupportLink.test.tsx`
- Modify: `apps/bot-battle/web/app/layout.tsx`

- [ ] **Step 1: Write failing image and support tests**

Create `SocialCard.test.tsx` and server-render the pure `SocialCard` component.
Assert that it contains the `BotBattle.` wordmark, `Compare AI models side by
side` headline, and supporting response/latency/token copy. Assert the shared
site descriptor remains:

```ts
expect(SITE.socialImage).toMatchObject({
  url: "/social-card",
  width: 1200,
  height: 630,
  type: "image/png",
});
```

Create `SupportLink.test.tsx` and assert the link name matches
`support botbattle.*buy me a coffee`, URL is the approved BMC URL, target is
`_blank`, rel is `noopener noreferrer`, title is `Buy me a coffee`, and classes
include `min-h-10`, `min-w-10`, and a `focus-visible` treatment.

- [ ] **Step 2: Run focused tests and verify RED**

```bash
yarn workspace @knicks-knacks/bot-battle-web test --run \
  app/social-card/SocialCard.test.tsx app/components/SupportLink.test.tsx
```

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Implement the code-generated social image**

Implement `SocialCard.tsx` with inline styles only: paper `#faf6ee`, ink
`#2b241c`, rust `#8a4b2f`, `BotBattle.` wordmark, `Compare AI models side by
side` headline, and a short line about responses, latency, and token metrics.
In `social-card/route.tsx`, export only `GET`; return an `ImageResponse` wrapping
`<SocialCard />` with the width/height from `SITE.socialImage`. Do not use the
special `opengraph-image.tsx` convention, because root file metadata would be
inherited by `/settings`. Do not fetch a font or remote image.

- [ ] **Step 4: Implement the native support link**

Use `Coffee` from `lucide-react` and the spec's exact link contract. Give the
anchor at least 40 x 40 CSS pixels and a visible `focus-visible` ring. Mark the
icon `aria-hidden="true"` because the anchor owns the accessible name.

- [ ] **Step 5: Make the header responsive**

Render `SupportLink` beside `ThemeToggle`; use center alignment; allow wrapping;
put navigation on a full-width row at the smallest breakpoint and inline at
`sm`; use `px-4 sm:px-7` if needed. Keep semantic header/nav/main and do not add
homepage canonical/social metadata to the layout.

- [ ] **Step 6: Run tests and verify GREEN**

```bash
yarn workspace @knicks-knacks/bot-battle-web test --run \
  app/social-card/SocialCard.test.tsx app/components/SupportLink.test.tsx \
  app/components/ThemeToggle.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit the social/support slice**

```bash
git add apps/bot-battle/web/app/social-card \
  apps/bot-battle/web/app/components/SupportLink.tsx \
  apps/bot-battle/web/app/components/SupportLink.test.tsx \
  apps/bot-battle/web/app/layout.tsx
git commit -m "feat(bot-battle): add social card and support link"
```

---

### Task 5: Isolate utility metadata and repair form semantics

**Files:**

- Create: `apps/bot-battle/web/app/settings/layout.tsx`
- Create: `apps/bot-battle/web/app/settings/layout.test.ts`
- Create: `apps/bot-battle/web/app/components/PromptSelector.test.tsx`
- Create: `apps/bot-battle/web/app/components/PromptInput.test.tsx`
- Modify: `apps/bot-battle/web/app/components/PromptSelector.tsx`
- Modify: `apps/bot-battle/web/app/components/PromptInput.tsx`
- Modify: `apps/bot-battle/web/app/components/ApiKeyInput.tsx`
- Modify: `apps/bot-battle/web/app/components/ApiKeyInput.test.tsx`

- [ ] **Step 1: Write failing metadata and label tests**

In `settings/layout.test.ts`:

```ts
expect(metadata).toMatchObject({
  title: "API Key Settings",
  alternates: { canonical: "/settings" },
  robots: { index: false, follow: true },
});
expect(metadata).not.toHaveProperty("openGraph");
expect(metadata).not.toHaveProperty("twitter");
```

Component tests assert:

```tsx
screen.getByRole("combobox", { name: /prompt template/i });
screen.getByRole("textbox", { name: /^prompt$/i });
expect(screen.getByLabelText(/openai api key/i)).toHaveAttribute("type", "password");
```

- [ ] **Step 2: Run tests and verify RED**

```bash
yarn workspace @knicks-knacks/bot-battle-web test --run \
  app/settings/layout.test.ts app/components/PromptSelector.test.tsx \
  app/components/PromptInput.test.tsx app/components/ApiKeyInput.test.tsx
```

Expected: FAIL because settings has no layout and controls lack associated
labels.

- [ ] **Step 3: Add route-specific settings metadata**

Create a pass-through Server Component layout:

```tsx
export const metadata: Metadata = {
  title: "API Key Settings",
  description: "Configure provider API keys used by BotBattle in this browser.",
  alternates: { canonical: "/settings" },
  robots: { index: false, follow: true },
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}
```

Do not add Open Graph/Twitter fields. “No homepage URL” means no exact root
canonical/social URL; the shared origin still appears in `/settings` canonical.

- [ ] **Step 4: Associate labels with controls**

- `PromptSelector`: `htmlFor="prompt-template"` plus `id="prompt-template"`.
- `PromptInput`: visible `<label htmlFor="benchmark-prompt">Prompt</label>` with
  existing heading styles and `id="benchmark-prompt"` on the textarea.
- `ApiKeyInput`: `id={`${provider}-api-key`}` on the password field and a label
  whose text is `${label} API Key`; if the H3 remains, add a separate `sr-only`
  label.
- Update API-key tests to query by accessible name.

- [ ] **Step 5: Run focused tests and verify GREEN**

```bash
yarn workspace @knicks-knacks/bot-battle-web test --run \
  app/settings/layout.test.ts app/components/PromptSelector.test.tsx \
  app/components/PromptInput.test.tsx app/components/ApiKeyInput.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit utility metadata and semantics**

```bash
git add apps/bot-battle/web/app/settings \
  apps/bot-battle/web/app/components/PromptSelector.tsx \
  apps/bot-battle/web/app/components/PromptSelector.test.tsx \
  apps/bot-battle/web/app/components/PromptInput.tsx \
  apps/bot-battle/web/app/components/PromptInput.test.tsx \
  apps/bot-battle/web/app/components/ApiKeyInput.tsx \
  apps/bot-battle/web/app/components/ApiKeyInput.test.tsx
git commit -m "fix(bot-battle): label benchmark and settings controls"
```

---

### Task 6: Add the webmaster runbook and verify the production-shaped app

**Files:**

- Create: `apps/bot-battle/docs/seo/search-console-bing.md`
- Verify all files from Tasks 1-5

- [ ] **Step 1: Write the post-deploy operator runbook**

Create a dated runbook with direct official links and these exact steps:

1. Confirm apex redirects once to `https://www.botbattle.cc/`.
2. Add `botbattle.cc` as a Google Search Console Domain property.
3. Add and retain Google's DNS TXT record.
4. Submit `https://www.botbattle.cc/sitemap.xml`.
5. Run URL Inspection/Live Test and request homepage indexing once after deploy.
6. Record the expected schema result: valid WebApplication semantics, but no
   Google software-app rich result without a genuine review/rating.
7. Import the verified property into Bing Webmaster Tools.
8. Confirm sitemap import, then use Bing URL Inspection and Site Scan.
9. Recheck indexing/crawl errors after 7 and 28 days.

State explicitly that the runbook does not authorize deploys, DNS mutations, or
external account changes.

- [ ] **Step 2: Run the full automated suite**

```bash
yarn workspace @knicks-knacks/bot-battle-web test --run
```

Expected: zero failures.

- [ ] **Step 3: Run independent TypeScript verification**

```bash
yarn workspace @knicks-knacks/bot-battle-web exec tsc --noEmit
```

Expected: exit `0`; do not rely on Next build-error ignores.

- [ ] **Step 4: Run the production build**

```bash
env NEXT_PUBLIC_PERSIST_API_KEYS=true \
  yarn workspace @knicks-knacks/bot-battle-web build
```

Expected: exit `0`; output includes `/`, `/settings`, `/robots.txt`,
`/sitemap.xml`, `/manifest.webmanifest`, and `/social-card`.
The explicit persistence flag exercises the optional persisted-key hydration
path in the production-shaped browser check; it does not add a checked-in env
file or change production configuration.

- [ ] **Step 5: Start production locally and inspect raw HTTP**

From `apps/bot-battle/web`, run `yarn start -p 3100` in a managed background
session. Fetch `/`, `/settings`, `/robots.txt`, `/sitemap.xml`,
`/social-card`, and `/not-a-real-page` with `curl`.

Assert with `rg`, `file`, and `sips`:

- `/` is `200` and raw HTML contains H1, root canonical, description, OG/Twitter
  tags, JSON-LD, and BMC URL;
- homepage HTML is not a loading-only bailout and contains no key;
- settings has `/settings` canonical and `noindex, follow`, but no exact root
  canonical or homepage social-image tag;
- crawler endpoints have correct content types and canonical URLs;
- missing route is `404`;
- social image is `200 image/png`, exactly 1200 x 630.

- [ ] **Step 6: Verify viewports and keyboard behavior**

At 1440 x 900, H1/intro/first benchmark input are visible without scrolling.
At 360 x 800, header has no clipping or horizontal overflow. Tab through
Benchmark, API Keys, BMC, theme, prompt template, and prompt input. Confirm BMC
is at least 40 x 40 and visibly focused in both themes.

Before the first navigation, use browser automation's init-script mechanism to
seed `botbattle_apikeys` with `{ "openai": "seo-hydration-sentinel" }`. Record
every outgoing request URL, headers, and post body. Navigate to `/settings`,
wait until the UI reports the OpenAI key as active, and assert the sentinel is
absent from the document response and every recorded request. Clear the seeded
storage afterward. This is the browser-level proof that persisted state becomes
available only after hydration and never travels to the server.

- [ ] **Step 7: Validate structured data**

Validate extracted server JSON-LD with Schema Markup Validator and Google's Rich
Results Test code-input mode. Record the expected valid parse/no eligible
software-app rich result. Never invent a rating to remove the warning.

- [ ] **Step 8: Run local Lighthouse as a supplement**

```bash
npx lighthouse http://localhost:3100/ \
  --only-categories=seo,accessibility \
  --output=json --output-path=/tmp/botbattle-lighthouse-final.json \
  --chrome-flags='--headless --no-sandbox'
```

Record scores, but treat raw HTML, crawler files, schema, and keyboard checks as
the acceptance evidence.

- [ ] **Step 9: Run final diff/scope checks**

```bash
git diff --check
git status --short
git diff --stat 76b047e..HEAD
```

Confirm no unrelated root-level untracked document was staged or modified.

- [ ] **Step 10: Commit the runbook**

```bash
git add apps/bot-battle/docs/seo/search-console-bing.md
git commit -m "docs(bot-battle): add webmaster onboarding runbook"
```

- [ ] **Step 11: Request final code review**

Invoke `superpowers:requesting-code-review` against the approved spec and this
plan. Address verified in-scope findings, then rerun affected focused checks and
the full verification gate.

## Completion boundary

Implementation is complete when the local production-shaped app satisfies every
automated and raw-HTML acceptance check. Deployment, DNS changes, Google Search
Console registration, Bing import, and indexing requests remain staged operator
steps until the user explicitly authorizes those outward-facing actions.
