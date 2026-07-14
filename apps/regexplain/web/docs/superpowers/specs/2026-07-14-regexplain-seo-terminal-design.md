# Regexplain SEO and Terminal UI Design

**Date:** 2026-07-14
**Status:** Approved design, pending implementation planning

## Goal

Turn Regexplain from a thin single-page utility into a memorable, secure, search-ready regex explainer: a redesigned terminal-style homepage, five genuinely useful worked-example pages, complete technical discovery metadata, and a lightweight Buy Me a Coffee support link.

The result should be easier for people, Google, Bing, and answer engines to understand without sacrificing the speed or simplicity of the existing tool.

## Current-state evidence

Verified on 2026-07-14:

- `https://www.regexplain.cc/` returns `200` and is statically prerendered by Vercel.
- The live page has only the title `Regexplain` and a generic description.
- `https://www.regexplain.cc/robots.txt` and `/sitemap.xml` return `404`.
- A public `site:regexplain.cc` search did not return the site.
- The homepage is one client component with very little permanent explanatory copy.
- The browser reads `NEXT_PUBLIC_GROQ_API_KEY` and calls Groq directly, exposing the credential.
- Lighthouse measured Performance 99, Accessibility 95, Best Practices 100, and SEO 100. The SEO score is incomplete evidence because canonical, robots, and structured-data checks were not applicable or manual. The two confirmed accessibility failures are low-contrast placeholder messages.
- `npm run build` completes, although it reports the existing ESLint plugin configuration error. `npm run lint` fails on that pre-existing configuration problem.

Verify the volatile live claims with:

```bash
curl -sS -I https://www.regexplain.cc/
curl -sS -o /dev/null -w '%{http_code}\n' https://www.regexplain.cc/robots.txt
curl -sS -o /dev/null -w '%{http_code}\n' https://www.regexplain.cc/sitemap.xml
```

## Product principles

1. **The tool stays first.** A visitor should be able to paste a regex immediately.
2. **Crawlable by default.** Important explanations, examples, and navigation must exist in initial HTML and ordinary links.
3. **Distinctive, not noisy.** The selected Regex Terminal direction should feel memorable while long-form content remains readable.
4. **One source of truth.** Example content should drive cards, routes, metadata, and sitemap entries.
5. **Truthful discovery.** No fabricated reviews, invisible schema, keyword stuffing, AI-targeted prose, or thin generated pages.
6. **Secure traffic growth.** The Groq credential must never be delivered to browsers.

## Information architecture

### Homepage: `/`

The homepage contains, in order:

1. A compact header with the Regexplain wordmark and links to Examples, How It Works, and Support.
2. A hero/workbench combining the primary value proposition with the interactive explainer.
3. A crawlable explanation of how the tool works, supported JavaScript/ECMAScript syntax, and limitations.
4. A linked grid of five worked regex examples.
5. A concise FAQ written for users, without FAQ structured data.
6. A footer containing methodology/privacy language, a source-repository link, and the Buy Me a Coffee link.

### Worked examples

The site will statically generate exactly these initial pages:

- `/examples/email-regex`
- `/examples/password-regex`
- `/examples/phone-number-regex`
- `/examples/url-regex`
- `/examples/hex-color-regex`

Each page must include:

- A unique title, description, canonical URL, and social metadata.
- The full pattern and its JavaScript/ECMAScript flavor.
- A plain-English summary.
- Token-by-token explanations.
- Positive and negative test strings.
- Limitations and common mistakes. The password example must explicitly say that regex alone is not a complete password-strength strategy.
- A link that loads or returns to the homepage workbench and links to related examples.

No arbitrary user-entered regex receives an indexable URL. This prevents a thin or unbounded page-generation system.

## Visual direction

The selected direction is **Regex Terminal**.

### Visual language

- Near-black graphite background and slightly lighter terminal surfaces.
- Acid green for primary commands and successful states.
- Cyan for secondary syntax categories and informational states.
- Warm red/amber only for errors and warnings.
- Monospace typography for patterns, tokens, labels, and terminal details; a highly legible sans-serif may support explanatory prose.
- Fine borders, restrained glow, static scan-line or grid texture, and brief state transitions.
- No remote decorative imagery and no large animation library.

### Layout

- The workbench is the dominant above-the-fold element.
- On wide screens, explanation and test output may use a balanced split layout; on narrow screens, all controls and results stack in logical DOM order.
- The learning content below uses calmer document-like spacing and lower visual intensity.
- Focus, hover, loading, error, and success states are all visible without relying on color alone.

### Motion and accessibility

- Motion is limited to short transitions, progress feedback, and focus/result changes. There is no essential continuously moving content.
- `prefers-reduced-motion` removes nonessential transitions and effects.
- Text and controls must meet WCAG AA contrast.
- Existing section labels become semantic headings.
- Breakdown tokens that expose details must be native buttons or otherwise fully keyboard-operable, with visible focus and state.
- Inputs retain programmatic labels, and asynchronous explanation/error output uses an appropriate live region without stealing focus.

## Component and rendering architecture

### Server-rendered shell

`app/page.tsx` becomes a Server Component responsible for the permanent homepage content, metadata-adjacent JSON-LD, and the initial workbench wrapper. The interactive state moves into a focused client component.

The server-rendered HTML must contain the H1, introduction, feature explanation, example links, FAQ, support/footer links, and structured data before hydration.

### Interactive workbench

A client-side `RegexWorkbench` owns:

- Current regex input.
- Example selection.
- Explanation request state.
- Deterministic breakdown and test state.
- Loading, success, validation, and remote-error presentation.

Existing parsing/testing components may be retained and restyled where their behavior remains sound. The refactor should avoid rewriting working regex parsing merely for visual consistency.

### Shared example data

One typed, checked-in examples module supplies:

- Slug, name, pattern, flags, summary, and description.
- Token explanations.
- Positive/negative test strings.
- Limitations and related-example slugs.

The homepage cards, static routes, metadata, and sitemap derive from this module. Duplicate slugs and broken related-example references are test failures.

## Explanation API and privacy

### Server route

`POST /api/explain` becomes the only browser-facing AI explanation interface.

Request:

```json
{ "regex": "^[a-z]+$" }
```

Successful response:

```json
{
  "summary": "Matches a string containing one or more lowercase letters.",
  "breakdown": [
    { "part": "^", "explanation": "Start of the string" }
  ]
}
```

The route must:

- Read only the server-side `GROQ_API_KEY`.
- Reject missing, non-string, empty, and over-1,000-character input with `400`.
- Apply a 15-second upstream timeout.
- Validate the provider response before returning it.
- Return stable `4xx`/`5xx` JSON error shapes without leaking credentials, provider payloads, or stack traces.
- Avoid logging the full user-supplied regex by default.

The UI tells users that patterns are sent to Groq for AI explanation. The deterministic breakdown and tester remain available if the request fails.

Durable distributed rate limiting is not added in this scope because it requires external state. Vercel firewall/rate-limit controls are an operator follow-up if traffic or abuse warrants them.

## SEO and search discovery

### Metadata

Central site configuration defines:

- Canonical origin: `https://www.regexplain.cc`
- Default title: `Regexplain — Regex Explainer & Tester`
- Descriptive default summary.
- Title template for example pages.
- Creator/publisher identity appropriate to the product.
- Open Graph and Twitter card defaults.

The root layout uses `metadataBase`, canonical alternates, robots directives, and verification fields. Optional environment variables control verification tags:

- `GOOGLE_SITE_VERIFICATION`
- `BING_SITE_VERIFICATION`

If a token is absent, its meta tag is omitted rather than emitting an empty value.

### Discovery endpoints

- `robots.txt` allows public pages and disallows `/api/`. It points to the sitemap.
- `sitemap.xml` contains the homepage and five example pages with absolute canonical URLs.
- A web manifest provides the app name, short name, description, theme/background colors, and standalone display metadata.
- A code-generated Open Graph image uses the Regex Terminal identity without adding a remote asset dependency.

### Structured data

The homepage emits truthful JSON-LD for:

- `WebSite`
- `WebApplication`

Fields include name, URL, description, browser application category, operating-system independence, and a free offer. The schema does not claim ratings, reviews, or features that are not visible on the page.

### LLM and answer-engine discovery

- Important content remains in initial semantic HTML.
- Normal internal links connect the homepage and examples.
- Robots policy does not block Googlebot, Bingbot, OAI-SearchBot, or Claude-SearchBot.
- Training-crawler policy is not changed independently of search-crawler policy in this scope.
- `llms.txt` is intentionally omitted because current authoritative guidance does not establish dependable discovery or ranking value.
- IndexNow is omitted initially because the site has six stable URLs and infrequent publishing. Sitemap submission and URL inspection are sufficient.

## Buy Me a Coffee

The support destination is:

`https://buymeacoffee.com/nicbarnes`

Use the lightweight Perfect Portfolio pattern:

- A locally rendered icon or text link labeled `Support Regexplain`.
- Buy Me a Coffee yellow used as a contained accent that fits the terminal palette.
- `target="_blank"` and `rel="noopener noreferrer"`.
- A clear accessible name and visible focus state.
- No remote badge image, embedded script, click analytics, or third-party tracking request.

## Error handling

- Empty or invalid submissions show an inline actionable message and do not call the API.
- Invalid regex syntax remains distinguishable from network/provider failures.
- Provider timeouts and failures retain the user input and keep deterministic tools usable.
- Example data errors fail tests/build-time generation rather than producing broken pages.
- Unknown example slugs use the normal `404` behavior and are not soft-`200` pages.

## Testing and verification

Implementation follows test-first development for new behavior.

### Automated checks

- Example data has unique slugs, valid related references, and required fields.
- All six public canonical URLs are generated correctly.
- Sitemap and robots outputs contain the expected absolute URLs and policy.
- Homepage and example metadata/JSON-LD use the canonical site configuration.
- API request validation covers missing, empty, wrong-type, over-limit, valid, timeout, and malformed-upstream cases.
- Client behavior covers validation, loading, successful explanation, and recoverable failure.

### Build and browser verification

- Type checking succeeds.
- The production build succeeds and statically generates the homepage and five example pages.
- Local endpoint checks confirm `200` responses and correct content types for `/`, `/robots.txt`, `/sitemap.xml`, and the manifest.
- Rendered HTML contains the canonical link, unique titles/descriptions, social tags, JSON-LD, ordinary example links, and Buy Me a Coffee link.
- Keyboard smoke testing covers the input, examples, explanation action, token details, tester, navigation, and support link.
- A local Lighthouse run targets Performance at least 95, Accessibility at least 98, Best Practices 100, and SEO 100, supplemented by manual checks for canonical, robots, sitemap, and structured data.

The existing app-local ESLint configuration failure is not silently included in this feature scope. It remains a separately reported verification limitation unless fixing it becomes necessary to execute the approved tests.

## Webmaster onboarding

The repository will include a concise runbook for the post-deployment operator steps:

1. Add the production site to Google Search Console as a Domain property when DNS access is available; otherwise use a URL-prefix property and the metadata token.
2. Add the verification token to Vercel and redeploy if metadata verification is used.
3. Submit `https://www.regexplain.cc/sitemap.xml`.
4. Inspect and request indexing for the homepage and one representative example page.
5. Import the verified Google property into Bing Webmaster Tools when available, or use the Bing verification token.
6. Submit the same sitemap and inspect the representative URLs in Bing.

This implementation does not deploy, change DNS, mutate Vercel configuration, or submit external webmaster accounts without explicit user approval.

## Non-goals

- A CMS, blog, authentication, saved regex library, user accounts, comments, or analytics.
- Unlimited programmatic SEO pages or indexable user-generated URLs.
- A new regex parsing engine or support for every language-specific regex flavor.
- Fabricated SoftwareApplication ratings/reviews or FAQ rich-result targeting.
- `llms.txt`, IndexNow, distributed rate-limiting infrastructure, or paid SEO services.
- Deployment or external account changes.

## Acceptance criteria

The design is complete when:

1. The homepage is visibly transformed into the approved Regex Terminal direction and remains usable from 320px mobile width through desktop.
2. The complete permanent homepage content and five example links are present in server-rendered HTML.
3. Five substantive example pages are statically generated from one typed data source.
4. The browser no longer receives or reads the Groq API key; explanations use the validated server route.
5. Canonical metadata, social metadata, robots, sitemap, manifest, Open Graph image, and truthful JSON-LD are present and internally consistent.
6. The Buy Me a Coffee link uses the approved destination and local-rendered treatment with no third-party embed.
7. Confirmed contrast and keyboard issues in the touched interface are corrected.
8. Automated tests, type checking, production build, endpoint checks, browser smoke checks, and Lighthouse targets pass, except for any explicitly reported pre-existing lint limitation.
9. The Google/Bing onboarding runbook contains concrete post-deployment steps and URLs.

## Residual risks

- Search indexing and ranking cannot be guaranteed by code changes; console verification and post-deployment inspection remain necessary.
- AI-search crawler policies and `llms.txt` support may change, so the discovery policy should be rechecked before later GEO-specific investment.
- Moving Groq server-side protects the credential but does not by itself provide durable abuse prevention on a serverless platform.
- The exact deployed Vercel redirect/canonical-host policy remains external configuration and must be checked after deployment.
