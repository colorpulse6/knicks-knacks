# Sector Zero Repo Extraction - Design Spec

**Date:** 2026-04-07
**Status:** Approved

## Overview

Extract the Sector Zero game and companion site from the `knicks-knacks` monorepo into a standalone open-source repo at `colorpulse6/sector-zero`. Clean up the monorepo after extraction.

## New Repo

**Name:** `sector-zero`
**GitHub:** `colorpulse6/sector-zero`
**Local path:** `/Users/nichalasbarnes/Desktop/projects/sector-zero`
**History:** Fresh start (clean first commit, old history stays in knicks-knacks)

## Repo Structure

```
sector-zero/
├── game/                        # The game (from games/sector-zero/web/)
│   ├── app/
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── CLAUDE.md
├── site/                        # Companion site (from sites/sector-zero-site/web/)
│   ├── app/
│   ├── components/
│   ├── content/
│   ├── lib/
│   ├── data/
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── CLAUDE.md
├── docs/
│   ├── game/                    # From games/sector-zero/web/docs/
│   │   └── colony-system-design.md
│   ├── site/                    # From docs/sector-zero-site/
│   │   └── README.md
│   ├── specs/                   # Relevant specs from docs/superpowers/specs/
│   │   ├── 2026-04-05-sector-zero-expansion-design.md
│   │   └── 2026-04-07-sector-zero-site-design.md
│   └── plans/                   # Relevant plans from docs/superpowers/plans/
│       └── (sector-zero related plans)
├── .github/
│   └── workflows/
│       └── deploy.yml           # Deploys both game and site to GitHub Pages
├── package.json                 # Root with convenience scripts (no Turborepo)
├── .gitignore
├── LICENSE                      # MIT
├── CONTRIBUTING.md              # Contribution guidelines with creative vision gate
├── README.md                    # Project overview, screenshots, play link
└── CLAUDE.md                    # Root dev guide for the new repo
```

## What Moves

| Source (knicks-knacks) | Destination (sector-zero) |
|---|---|
| `games/sector-zero/web/*` | `game/` |
| `sites/sector-zero-site/web/*` | `site/` |
| `games/sector-zero/web/docs/*` | `docs/game/` |
| `docs/sector-zero-site/*` | `docs/site/` |
| `docs/superpowers/specs/2026-04-05-sector-zero-expansion-design.md` | `docs/specs/` |
| `docs/superpowers/specs/2026-04-07-sector-zero-site-design.md` | `docs/specs/` |
| `docs/superpowers/plans/2026-04-07-sector-zero-site.md` | `docs/plans/` |
| All other sector-zero related plans from `docs/superpowers/plans/` (2026-04-05-*) | `docs/plans/` |

## What Stays in Knicks-Knacks

Everything not listed above: other games (Wordle, 2048, Asteroids, Brickles, Chimera), apps (BotBattle, CalorieCam, Leaf, RegExplain), packages, and unrelated docs/specs/plans.

## Root package.json (New Repo)

No Turborepo. Minimal convenience scripts:

```json
{
  "name": "sector-zero",
  "private": true,
  "scripts": {
    "game:dev": "cd game && yarn dev",
    "site:dev": "cd site && yarn dev",
    "build": "cd game && yarn build && cd ../site && yarn build"
  }
}
```

Game and site each retain their own `package.json` with all dependencies. They are independent - no shared packages.

### Package Name Updates

- `game/package.json` name: `@knicks-knacks/sector-zero` → `sector-zero-game`
- `site/package.json` name: `@knicks-knacks/sector-zero-site` → `sector-zero-site`

### Package Manager

Root repo uses Yarn. Include `.yarnrc.yml` and `yarn.lock`. Each sub-project (game/, site/) has its own `yarn.lock`.

## Deployment

### New Repo Workflow (`deploy.yml`)

Single GitHub Actions workflow triggered on push to `main`:

**Setup steps:** Node.js 20, corepack enable, yarn install.

1. Build game: `cd game && yarn build` with `NEXT_PUBLIC_BASE_PATH=/sector-zero`
2. Build site: `cd site && yarn build` with `NEXT_PUBLIC_BASE_PATH=/sector-zero/site`
3. Assemble deploy directory:
   ```
   deploy/
   ├── (game out/ contents)    # Root = the game
   └── site/                    # Site nested under /site/
   ```
4. Deploy to GitHub Pages

### New URLs

| What | Old URL | New URL |
|---|---|---|
| Game | `colorpulse6.github.io/knicks-knacks/sector-zero/` | `colorpulse6.github.io/sector-zero/` |
| Site | `colorpulse6.github.io/knicks-knacks/sector-zero-site/` | `colorpulse6.github.io/sector-zero/site/` |

### BasePath Updates

- `game/next.config.ts` - basePath reads from `NEXT_PUBLIC_BASE_PATH` (unchanged pattern)
- `site/next.config.ts` - same pattern
- `site/` internal links updated to point to new game URL:
  - `site/app/page.tsx` - PLAY NOW CTA href
  - `site/components/Nav.tsx` - PLAY link href
  - `site/CLAUDE.md` - all hardcoded URLs
  - `game/CLAUDE.md` - all hardcoded URLs

## Knicks-Knacks Cleanup

### deploy-games.yml
- Remove "Build Sector Zero" step
- Remove "Build Sector Zero Site" step
- Remove `sites/**` from trigger paths
- Remove sector-zero and sector-zero-site copy steps from deploy preparation
- Update arcade hub `index.html`: replace the Sector Zero game card with an external link to `https://colorpulse6.github.io/sector-zero/`. Remove the Sector Zero stats card, `card-sector-zero` CSS, and `sector-zero` entry from `createDefaultProfile()` (localStorage stats will no longer work across origins).

### Root CLAUDE.md
- Remove Sector Zero from the games table
- Remove any sector-zero specific references

### Root package.json
- Remove `"sector-zero:dev"` script
- Remove `"sector-zero-site:dev"` script
- Remove `"sites/*/web"` from workspaces array (no remaining sites)

### File Removal
- Delete `games/sector-zero/` directory
- Delete `sites/sector-zero-site/` directory
- Delete `docs/sector-zero-site/` directory
- Remove sector-zero specific specs/plans from `docs/superpowers/` (copies exist in new repo)
- Note: the extraction spec itself (`2026-04-07-sector-zero-repo-extraction-design.md`) stays in knicks-knacks since it describes the extraction process, not the game

## Open Source Setup

### LICENSE
MIT license.

### README.md
- One-paragraph game description
- Screenshot (boss-fight or shooter screenshot)
- "Play Now" link to live game
- Feature highlights (6 modes, RPG systems, colony management coming soon)
- Quick start for contributors (`yarn install`, `yarn game:dev`, `yarn site:dev`)
- Link to companion site
- "Built with" section (Next.js, Canvas 2D, TypeScript)

### CONTRIBUTING.md

**What we accept PRs for (no issue required):**
- Bug fixes
- Performance improvements
- Code quality and refactoring
- Accessibility improvements
- Documentation improvements

**What needs an issue + approval first:**
- New gameplay mechanics or modes
- Story, lore, or dialog changes
- Balance changes (enemy HP, damage, drop rates)
- UI/UX redesigns
- New features (colony system, etc.)

**Development workflow:**
- Fork, create feature branch, submit PR
- All PRs require review from maintainer
- Label system: `good-first-issue`, `help-wanted`, `needs-design-approval`, `bug`, `enhancement`

### CLAUDE.md (Root)
Combined dev guide covering both game and site:
- Repo structure overview
- How to run game and site
- Game architecture overview (modes, engine files, sprite system)
- Site architecture overview (MDX posts, components, styling)
- How to add content (new posts, new sprites)
- Deployment process
