# Regexplain

Regexplain is a local-first JavaScript regular-expression explainer and tester. It provides a deterministic syntax map and sample tester in the browser, with an optional AI summary generated through a server route backed by Groq.

Production: [https://www.regexplain.cc/](https://www.regexplain.cc/)

## Stack

- Next.js 15 App Router and React 19
- TypeScript and Tailwind CSS 4
- `regexp-tree` for local syntax analysis
- A server-only Groq integration at `POST /api/explain`
- Vitest, Testing Library, and jsdom for unit and component tests

Browser end-to-end coverage is planned, but no Playwright configuration or specs are currently checked in.

## Local setup

Install workspace dependencies from the monorepo root, then run the app from this directory:

```bash
yarn install
cd apps/regexplain/web
cp .env.example .env.local
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

Use `.env.local` for local values:

```dotenv
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=openai/gpt-oss-20b
GOOGLE_SITE_VERIFICATION=
BING_SITE_VERIFICATION=
```

- `GROQ_API_KEY` enables the optional AI summary. It is read only by the server route.
- `GROQ_MODEL` is optional and defaults to `openai/gpt-oss-20b`.
- `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` are optional webmaster-verification tokens. Use the token value only, not the full HTML tag.

Do not create a public or browser-exposed Groq key variable. The key must remain server-only.

## Commands

Run these from `apps/regexplain/web`:

```bash
yarn dev                 # development server
yarn test                # Vitest once
yarn test:watch          # Vitest in watch mode
npx tsc --noEmit         # TypeScript check
yarn build               # production build
yarn start               # serve a completed production build
```

`yarn lint` is not currently a green verification step. The shared monorepo ESLint configuration fails while resolving the `@next/next` plugin for `@next/next/no-html-link-for-pages`; fixing that shared configuration is outside this app's current scope.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Server-rendered homepage and interactive regex workbench |
| `/api/explain` | Validated `POST` endpoint for optional Groq summaries |
| `/examples/email-regex` | Static email-regex example |
| `/examples/password-regex` | Static password-format example |
| `/examples/phone-number-regex` | Static US phone-number example |
| `/examples/url-regex` | Static HTTP/HTTPS URL example |
| `/examples/hex-color-regex` | Static hex-color example |
| `/robots.txt` | Crawler policy; allows public pages and disallows `/api/` |
| `/sitemap.xml` | Homepage and five static example URLs |
| `/manifest.webmanifest` | Web app manifest |
| `/opengraph-image` | Generated social sharing image |

## Architecture and privacy

The permanent page shell, learning content, and example articles are server-rendered. Syntax breakdown and sample matching run locally in the browser. Only when a visitor requests an AI summary does the browser send the pattern and flags to Regexplain's own `/api/explain` route; the validated server route then sends those two values to Groq.

The Groq key never enters the browser, and the route does not log raw patterns, provider bodies, or secret values. Distributed rate limiting is not implemented in the app. A production operator should add suitable Vercel or edge-level rate limiting and monitoring before relying on the endpoint under sustained public traffic.

## SEO and discovery

The canonical origin is `https://www.regexplain.cc`. The homepage and five bounded example pages publish canonical and social metadata. The app also provides `robots.txt`, an XML sitemap, a web manifest, and a generated Open Graph image. Homepage JSON-LD describes the real `WebSite` and free `WebApplication`; the example pages do not claim FAQ, rating, or article structured data.

Search-console setup is an operator task performed after deployment. Follow the [webmaster onboarding runbook](docs/webmaster-onboarding.md); submitting URLs or a sitemap does not guarantee indexing or ranking.

## Links

- [Source repository](https://github.com/colorpulse6/knicks-knacks/tree/main/apps/regexplain/web)
- [Support Regexplain](https://buymeacoffee.com/nicbarnes)
- [Webmaster onboarding](docs/webmaster-onboarding.md)

## License

MIT
