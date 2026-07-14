# BotBattle SEO and Support Design

**Date:** 2026-07-14  
**Status:** Approved design, pending implementation plan  
**Production URL:** `https://www.botbattle.cc/`

## Goal

Make BotBattle reliably understandable and discoverable to search engines and
search-oriented AI crawlers without turning the benchmark into a marketing
landing page. Add a native Buy Me a Coffee entry point and leave the site ready
for Google Search Console and Bing Webmaster Tools registration.

## Verified baseline

As observed on 2026-07-14:

- `https://www.botbattle.cc/` returns `200`, and the apex domain redirects to
  the `www` hostname.
- The initial homepage HTML contains a client-rendering bailout and only a
  `Loading...` shell for the body content.
- The deployed document has a basic `BotBattle` title and description, but no
  canonical URL, Open Graph/Twitter metadata, or structured data.
- `/robots.txt` and `/sitemap.xml` both return `404`.
- `/settings` inherits the homepage metadata even though it is a utility page.
- The homepage has no visible or server-rendered `<h1>`.
- The existing support destination used by the owner's other projects is
  `https://buymeacoffee.com/nicbarnes`.

Verify the live baseline with:

```bash
curl -sS -D - https://www.botbattle.cc/ -o /tmp/botbattle-home.html
curl -sS -I https://botbattle.cc/
curl -sS -I https://www.botbattle.cc/robots.txt
curl -sS -I https://www.botbattle.cc/sitemap.xml
```

## Chosen approach

Use a tool-first SEO foundation. The benchmark remains the primary experience,
with a compact server-rendered introduction above it and concise explanatory
content below it. This fixes the initial-HTML problem without making users pass
through a full marketing page.

Rejected alternatives:

- **Metadata only:** too small because it leaves the body as a JavaScript-only
  loading shell for crawlers that do not render the application.
- **Full marketing landing page:** creates more content surface but adds friction
  before the product and exceeds the current need.

## Page architecture

The root route will become a Server Component responsible for the public,
indexable shell:

1. A compact hero with one `<h1>` and a factual value proposition.
2. The existing interactive benchmark as a focused Client Component.
3. A short server-rendered explainer describing the workflow, measured outputs,
   provider/key model, and privacy behavior.
4. Truthful `WebApplication` JSON-LD matching the visible content.

The current interactive homepage behavior moves intact into a dedicated client
component. The API-key provider must render children during server rendering and
hydrate browser-only key state after mount. No API key value may be serialized
into HTML or transferred from browser storage to the server as part of this
change.

## Content design

The visible copy will target the real user intent rather than keyword variants:

- Compare responses from multiple AI models side by side.
- Run the same prompt against selected providers.
- Review latency, token counts, throughput, and response-level comparison data.
- Use shared free-tier access where available or supply provider keys in the
  browser.
- State the current key-storage behavior accurately and link to API Settings for
  details.

The introduction stays short enough that the prompt controls remain visible
near the top of a normal desktop viewport. The lower explainer carries the
additional crawlable context.

## Metadata and discovery

Use Next.js App Router metadata APIs with one canonical site constant and clear
route ownership:

- Canonical origin: `https://www.botbattle.cc`.
- The root layout owns only genuinely shared fields: `metadataBase`, title
  template/default, application name, icons, and manifest.
- The homepage owns its descriptive title/description, canonical alternate,
  Open Graph fields, and Twitter card fields.
- `/settings` explicitly owns its `noindex, follow` robots directive,
  `/settings` canonical, title, and description. Its rendered head must not
  contain the homepage URL or social image.
- Homepage social metadata includes the canonical URL, title, description,
  `website` Open Graph type, `summary_large_image` Twitter card type, and the
  generated image's absolute URL, width, height, MIME type, and alt text. The
  same generated image is wired into both Open Graph and Twitter metadata.
- A code-generated 1200 x 630 Open Graph image using BotBattle's paper, ink, and
  rust visual language.
- A web manifest with the existing icon assets.
- `/robots.txt` allowing public pages, disallowing `/api/`, and advertising the
  sitemap. Search-oriented AI crawlers are not blocked. Training-crawler policy
  is left at the default rather than claiming a discoverability benefit.
- `/sitemap.xml` containing only the canonical homepage for now. Utility, API,
  error, and non-indexable pages are excluded.

Do not add `llms.txt`. Current official Google guidance says it is ignored, and
there is no primary-source evidence that it improves ranking or AI citation.

## Structured data

Add JSON-LD for `WebApplication` with only visible, verifiable claims:

- `name`, `url`, and `description`
- `applicationCategory: "DeveloperApplication"`
- `operatingSystem: "Web"`
- `isAccessibleForFree: true`
- `offers` with zero price for using the BotBattle application itself
- A concise `featureList` reflected in the visible page copy

Do not add ratings, reviews, or unsupported claims. Because BotBattle does not
have a genuine public `review` or `aggregateRating`, this payload is for semantic
understanding and is intentionally **not eligible** for Google's software-app
rich result. Validate it with Schema Markup Validator; run Google's Rich Results
Test as well and record the expected outcome that no software-app rich result is
eligible.

Render the JSON-LD server-side with XSS-safe serialization:

```ts
JSON.stringify(payload).replace(/</g, "\\u003c")
```

No user input, provider response, API key, or other runtime string may enter the
structured-data payload.

## Buy Me a Coffee

Add one compact support control in the persistent header beside the theme
toggle. It will reuse the existing `lucide-react` dependency and BotBattle's
native styling instead of loading the remote Buy Me a Coffee button image.

Required link contract:

```tsx
href="https://buymeacoffee.com/nicbarnes"
target="_blank"
rel="noopener noreferrer"
aria-label="Support BotBattle - buy me a coffee"
title="Buy me a coffee"
```

At a 360 x 800 CSS-pixel viewport, the control and header must remain unclipped
without horizontal scrolling. The control must provide at least a 40 x 40
CSS-pixel hit area, be keyboard-focusable, and show a visible focus treatment in
both paper and espresso themes. It uses an accessible text alternative even
when only the icon is visually shown.

## Accessibility and agent usability

Repair the labels on the prompt template, prompt textarea, and API-key inputs as
part of this work. Labels must be programmatically associated with their
controls. These changes improve keyboard/screen-reader use and give browser
agents a more reliable accessibility tree; they are not presented as a ranking
hack.

## Search Console and Bing handoff

No verification token will be hard-coded during implementation. The recommended
operator sequence is:

1. Add `botbattle.cc` to Google Search Console as a Domain property.
2. Verify ownership with the DNS TXT record and keep that record in DNS.
3. Submit `https://www.botbattle.cc/sitemap.xml` and inspect/request indexing for
   the canonical homepage after deployment.
4. Import the verified property into Bing Webmaster Tools from Search Console,
   then run Bing URL Inspection and Site Scan.

A short repo runbook will record these steps and post-deploy checks.

## Testing and verification

Implementation follows red-green-refactor. Automated tests will cover:

- Canonical/global metadata and social metadata.
- Robots and sitemap output.
- Manifest data.
- Settings `noindex` metadata.
- Server rendering of provider children without a loading-only bailout.
- Identical empty provider state for the server render and initial client render,
  with no synchronous `localStorage` read during render.
- A seeded browser API key is absent from raw HTML and server requests, then
  becomes available only after client hydration without a hydration-mismatch
  warning.
- Programmatic form labels.
- Buy Me a Coffee URL and accessibility/security attributes.

Fresh verification before completion must include the focused tests, full
BotBattle test suite, TypeScript checking, production build, and local HTTP
inspection of `/`, `/settings`, `/robots.txt`, `/sitemap.xml`, and a missing
route. The homepage response body must contain the H1, canonical link, and JSON-LD
without requiring browser JavaScript.

Inspect the complete `/settings` head to confirm it contains its own canonical
and `noindex, follow`, with no homepage social image or canonical URL. Confirm
the generated social-image endpoint returns `200`, the expected image MIME type,
and 1200 x 630 dimensions. At a 1440 x 900 CSS-pixel viewport, the hero and the
first benchmark input must be visible without scrolling; at 360 x 800, confirm
the header has no clipping or horizontal overflow and the support control meets
the keyboard, focus, and target-size contract above.

Deployment and search-engine registration are intentionally out of scope until
the user explicitly requests outward-facing changes. Live production remains
unchanged until a deploy occurs.

## Residual risks

- Search indexing and AI citation cannot be guaranteed; the work improves
  eligibility, clarity, and crawl reliability.
- Existing provider/model copy changes frequently and may become stale. Public
  SEO copy should describe capabilities at the provider/category level instead
  of duplicating the full model registry.
- Removing the client-rendering bailout may expose hydration assumptions in the
  API-key store. The SSR and local production checks are the acceptance gate.
