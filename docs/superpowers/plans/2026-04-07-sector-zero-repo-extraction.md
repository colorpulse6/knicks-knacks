# Sector Zero Repo Extraction - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract Sector Zero game and companion site from knicks-knacks monorepo into a standalone open-source repo at `/Users/nichalasbarnes/Desktop/projects/sector-zero`.

**Architecture:** Create a new git repo with flat `game/` and `site/` directories. Copy files from knicks-knacks (no history preservation). Set up GitHub Actions deployment, open-source docs, then clean up knicks-knacks.

**Tech Stack:** Git, GitHub CLI (`gh`), Next.js 15, Yarn, GitHub Actions

**Spec:** `docs/superpowers/specs/2026-04-07-sector-zero-repo-extraction-design.md`

---

## File Structure Overview (New Repo)

```
/Users/nichalasbarnes/Desktop/projects/sector-zero/
├── game/                    # Copied from knicks-knacks/games/sector-zero/web/
├── site/                    # Copied from knicks-knacks/sites/sector-zero-site/web/
├── docs/
│   ├── game/
│   │   └── colony-system-design.md
│   ├── site/
│   │   └── README.md
│   ├── specs/               # 2 spec files
│   └── plans/               # 8 plan files
├── .github/workflows/
│   └── deploy.yml
├── package.json
├── .gitignore
├── .yarnrc.yml
├── LICENSE
├── CONTRIBUTING.md
├── README.md
└── CLAUDE.md
```

---

### Task 1: Create New Repo & Copy Files

**Files:**
- Create: `/Users/nichalasbarnes/Desktop/projects/sector-zero/` (entire directory)

- [ ] **Step 1: Create the repo directory and initialize git**

```bash
mkdir -p /Users/nichalasbarnes/Desktop/projects/sector-zero
cd /Users/nichalasbarnes/Desktop/projects/sector-zero
git init
```

- [ ] **Step 2: Copy game files**

```bash
cp -r /Users/nichalasbarnes/Desktop/projects/knicks-knacks/games/sector-zero/web/ /Users/nichalasbarnes/Desktop/projects/sector-zero/game/
```

Remove build artifacts and node_modules from the copy:
```bash
rm -rf game/.next game/out game/node_modules
```

- [ ] **Step 3: Copy site files**

```bash
cp -r /Users/nichalasbarnes/Desktop/projects/knicks-knacks/sites/sector-zero-site/web/ /Users/nichalasbarnes/Desktop/projects/sector-zero/site/
```

Remove build artifacts and node_modules:
```bash
rm -rf site/.next site/out site/node_modules
```

- [ ] **Step 4: Copy docs**

```bash
mkdir -p docs/game docs/site docs/specs docs/plans

# Game docs
cp /Users/nichalasbarnes/Desktop/projects/knicks-knacks/games/sector-zero/web/docs/colony-system-design.md docs/game/

# Site docs
cp /Users/nichalasbarnes/Desktop/projects/knicks-knacks/docs/sector-zero-site/README.md docs/site/

# Specs
cp /Users/nichalasbarnes/Desktop/projects/knicks-knacks/docs/superpowers/specs/2026-04-05-sector-zero-expansion-design.md docs/specs/
cp /Users/nichalasbarnes/Desktop/projects/knicks-knacks/docs/superpowers/specs/2026-04-07-sector-zero-site-design.md docs/specs/

# Plans (all sector-zero related)
cp /Users/nichalasbarnes/Desktop/projects/knicks-knacks/docs/superpowers/plans/2026-04-05-ground-run-poc.md docs/plans/
cp /Users/nichalasbarnes/Desktop/projects/knicks-knacks/docs/superpowers/plans/2026-04-05-multi-phase-levels.md docs/plans/
cp /Users/nichalasbarnes/Desktop/projects/knicks-knacks/docs/superpowers/plans/2026-04-05-pilot-leveling-system.md docs/plans/
cp /Users/nichalasbarnes/Desktop/projects/knicks-knacks/docs/superpowers/plans/2026-04-05-reward-economy-stage1.md docs/plans/
cp /Users/nichalasbarnes/Desktop/projects/knicks-knacks/docs/superpowers/plans/2026-04-05-weapon-affinity-and-enemy-classes.md docs/plans/
cp /Users/nichalasbarnes/Desktop/projects/knicks-knacks/docs/superpowers/plans/2026-04-06-kepler-black-box-sidequest.md docs/plans/
cp /Users/nichalasbarnes/Desktop/projects/knicks-knacks/docs/superpowers/plans/2026-04-07-ashfall-forward-camp-explore.md docs/plans/
cp /Users/nichalasbarnes/Desktop/projects/knicks-knacks/docs/superpowers/plans/2026-04-07-sector-zero-site.md docs/plans/
```

- [ ] **Step 5: Remove the docs subdirectory from game/ (now lives at docs/game/)**

```bash
rm -rf game/docs
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: initial import of Sector Zero game and companion site"
```

---

### Task 2: Root Config Files

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.yarnrc.yml`

- [ ] **Step 1: Create root `package.json`**

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

- [ ] **Step 2: Create `.gitignore`**

```
node_modules
.next
out
dist
.turbo
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
!**/.env.example
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
*.tsbuildinfo
.superpowers/
```

- [ ] **Step 3: Create `.yarnrc.yml`**

```yaml
nodeLinker: node-modules
enableGlobalCache: false
enableTelemetry: false
```

- [ ] **Step 4: Update `game/package.json` name**

Change `"name": "@knicks-knacks/sector-zero"` to `"name": "sector-zero-game"`.

- [ ] **Step 5: Update `site/package.json` name**

Change `"name": "@knicks-knacks/sector-zero-site"` to `"name": "sector-zero-site"`.

- [ ] **Step 6: Install dependencies in both projects**

```bash
cd /Users/nichalasbarnes/Desktop/projects/sector-zero/game && yarn install
cd /Users/nichalasbarnes/Desktop/projects/sector-zero/site && yarn install
```

- [ ] **Step 7: Verify both build**

```bash
cd /Users/nichalasbarnes/Desktop/projects/sector-zero/game && yarn build
cd /Users/nichalasbarnes/Desktop/projects/sector-zero/site && yarn build
```

Expected: Both build successfully with static export.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add root config, rename packages, install dependencies"
```

---

### Task 3: Update URLs & Internal Links

**Files:**
- Modify: `site/components/Nav.tsx` (line 29)
- Modify: `site/app/page.tsx` (line 36)
- Modify: `site/components/Footer.tsx` (line 9)
- Modify: `site/CLAUDE.md`
- Modify: `game/CLAUDE.md` (if any URLs reference knicks-knacks)

- [ ] **Step 1: Update Nav.tsx PLAY link**

In `site/components/Nav.tsx`, change:
```
https://colorpulse6.github.io/knicks-knacks/sector-zero/
```
to:
```
https://colorpulse6.github.io/sector-zero/
```

- [ ] **Step 2: Update page.tsx PLAY NOW CTA**

In `site/app/page.tsx`, change:
```
https://colorpulse6.github.io/knicks-knacks/sector-zero/
```
to:
```
https://colorpulse6.github.io/sector-zero/
```

- [ ] **Step 3: Update Footer.tsx GitHub link**

In `site/components/Footer.tsx`, change:
```
https://github.com/colorpulse6/knicks-knacks
```
to:
```
https://github.com/colorpulse6/sector-zero
```

- [ ] **Step 4: Update site/CLAUDE.md URLs**

Replace all occurrences of:
- `colorpulse6.github.io/knicks-knacks/sector-zero-site/` → `colorpulse6.github.io/sector-zero/site/`
- `colorpulse6.github.io/knicks-knacks/sector-zero/` → `colorpulse6.github.io/sector-zero/`
- Any references to the knicks-knacks repo → `sector-zero` repo

- [ ] **Step 5: Update game/CLAUDE.md URLs**

Search for and replace any `knicks-knacks` references with the new repo paths. Update deployment references.

- [ ] **Step 6: Rebuild site to verify links compile**

```bash
cd /Users/nichalasbarnes/Desktop/projects/sector-zero/site && yarn build
```

Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: update all URLs for standalone repo"
```

---

### Task 4: GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create the deploy workflow**

```yaml
name: Deploy Sector Zero to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Enable Corepack
        run: corepack enable

      - name: Install game dependencies
        run: cd game && yarn install

      - name: Install site dependencies
        run: cd site && yarn install

      - name: Build Game
        run: cd game && yarn build
        env:
          NODE_ENV: production
          NEXT_PUBLIC_BASE_PATH: /sector-zero

      - name: Build Site
        run: cd site && yarn build
        env:
          NODE_ENV: production
          NEXT_PUBLIC_BASE_PATH: /sector-zero/site

      - name: Prepare deployment
        run: |
          mkdir -p deploy/site
          cp -r game/out/* deploy/
          cp -r site/out/* deploy/site/

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./deploy

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/
git commit -m "ci: add GitHub Pages deployment workflow"
```

---

### Task 5: Open Source Files

**Files:**
- Create: `LICENSE`
- Create: `CONTRIBUTING.md`
- Create: `README.md`
- Create: `CLAUDE.md`

- [ ] **Step 1: Create LICENSE (MIT)**

Standard MIT license with copyright `2026 Nichalas Barnes`.

- [ ] **Step 2: Create CONTRIBUTING.md**

Content covering:
- How to contribute (fork, branch, PR)
- Development setup (`cd game && yarn install && yarn dev`, same for site)
- What we accept without prior approval: bug fixes, performance, code quality, accessibility, docs
- What needs an issue + approval first: gameplay mechanics, story/lore, balance changes, UI redesigns, new features
- PR requirements: description of changes, testing done
- Label system: `good-first-issue`, `help-wanted`, `needs-design-approval`, `bug`, `enhancement`

- [ ] **Step 3: Create README.md**

Content covering:
- Title and one-paragraph description
- Screenshot (use `site/public/images/modes/boss-fight.png` or `shooter.png`)
- "Play Now" link to `https://colorpulse6.github.io/sector-zero/`
- Feature highlights (6 modes list, RPG systems, colony coming soon)
- Quick start: clone, `cd game && yarn install && yarn dev`
- Companion site link
- "Built with" badges/list (Next.js, Canvas 2D, TypeScript, Tailwind)
- Contributing link
- License

- [ ] **Step 4: Create root CLAUDE.md**

Combined dev guide covering:
- Repo structure (`game/` and `site/` are independent Next.js apps)
- How to run: `cd game && yarn dev` (port 3000), `cd site && yarn dev` (port 3001)
- Game architecture: 6 modes, engine files at `game/app/components/engine/`, sprite system, canvas rendering
- Site architecture: MDX posts in `site/content/posts/`, custom components, Tailwind with HUD theme
- How to add a news post (create MDX, add image, build)
- How to add game content (sprites, enemies, levels)
- Deployment: push to main triggers GitHub Actions, deploys to GitHub Pages
- URLs: game at `/sector-zero/`, site at `/sector-zero/site/`

- [ ] **Step 5: Commit**

```bash
git add LICENSE CONTRIBUTING.md README.md CLAUDE.md
git commit -m "docs: add LICENSE, README, CONTRIBUTING, and CLAUDE.md"
```

---

### Task 6: Create GitHub Repo & Push

**Files:** None (git/GitHub operations)

- [ ] **Step 1: Create the GitHub repo**

```bash
cd /Users/nichalasbarnes/Desktop/projects/sector-zero
gh repo create colorpulse6/sector-zero --public --source=. --description "Vertical-scrolling space shooter with 6 gameplay modes, RPG progression, and a companion website. Built with Next.js and HTML5 Canvas." --push
```

If `gh` auth is needed, the user will provide credentials.

- [ ] **Step 2: Verify the repo exists**

```bash
gh repo view colorpulse6/sector-zero
```

- [ ] **Step 3: Enable GitHub Pages**

Go to repo Settings > Pages > Source: GitHub Actions. Or via CLI:
```bash
gh api repos/colorpulse6/sector-zero/pages -X POST -f build_type=workflow
```

---

### Task 7: Knicks-Knacks Cleanup - Workflow

**Files:**
- Modify: `/Users/nichalasbarnes/Desktop/projects/knicks-knacks/.github/workflows/deploy-games.yml`

Work from: `/Users/nichalasbarnes/Desktop/projects/knicks-knacks`

- [ ] **Step 1: Read the current workflow to identify exact lines**

```bash
cat .github/workflows/deploy-games.yml
```

- [ ] **Step 2: Remove Sector Zero build steps**

Remove the "Build Sector Zero" step (lines ~74-80) and "Build Sector Zero Site" step (lines ~82-88).

- [ ] **Step 3: Remove `sites/**` from trigger paths**

In `on.push.paths`, remove `- "sites/**"`.

- [ ] **Step 4: Remove deploy copy steps for sector-zero**

In the "Prepare deployment" step, remove:
- `cp -r games/sector-zero/web/out ./deploy/sector-zero`
- `cp -r sites/sector-zero-site/web/out ./deploy/sector-zero-site`

- [ ] **Step 5: Update arcade hub index.html**

In the generated index.html within the workflow:
- Replace the Sector Zero game card (card 05, spans full width) with an external link card pointing to `https://colorpulse6.github.io/sector-zero/`
- Remove the `sector-zero` entry from `createDefaultProfile()` stats
- Remove `card-sector-zero` specific CSS
- Mark the external link clearly (e.g., "PLAY ON SECTOR-ZERO.GH" or similar)

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/deploy-games.yml
git commit -m "ci: remove sector-zero from deploy workflow, link externally"
```

---

### Task 8: Knicks-Knacks Cleanup - Config & Files

**Files:**
- Modify: `/Users/nichalasbarnes/Desktop/projects/knicks-knacks/package.json`
- Modify: `/Users/nichalasbarnes/Desktop/projects/knicks-knacks/CLAUDE.md`
- Delete: `games/sector-zero/`
- Delete: `sites/sector-zero-site/`
- Delete: `docs/sector-zero-site/`
- Delete: sector-zero specs and plans from `docs/superpowers/`

- [ ] **Step 1: Update root package.json**

Remove these scripts:
- `"sector-zero:dev": "cd games/sector-zero/web && yarn dev"`
- `"sector-zero-site:dev": "cd sites/sector-zero-site/web && yarn dev"`

Remove `"sites/*/web"` from the workspaces array.

- [ ] **Step 2: Update root CLAUDE.md**

Remove the Sector Zero entry from the games table (line ~76):
```
| Sector Zero | Vertical space shooter with 8 worlds and boss battles |
```

Add a note that Sector Zero has moved to its own repo: `https://github.com/colorpulse6/sector-zero`

- [ ] **Step 3: Delete sector-zero directories**

```bash
rm -rf games/sector-zero
rm -rf sites/sector-zero-site
rm -rf docs/sector-zero-site
```

- [ ] **Step 4: Delete sector-zero specs and plans (copies exist in new repo)**

```bash
rm docs/superpowers/specs/2026-04-05-sector-zero-expansion-design.md
rm docs/superpowers/specs/2026-04-07-sector-zero-site-design.md
rm docs/superpowers/plans/2026-04-05-ground-run-poc.md
rm docs/superpowers/plans/2026-04-05-multi-phase-levels.md
rm docs/superpowers/plans/2026-04-05-pilot-leveling-system.md
rm docs/superpowers/plans/2026-04-05-reward-economy-stage1.md
rm docs/superpowers/plans/2026-04-05-weapon-affinity-and-enemy-classes.md
rm docs/superpowers/plans/2026-04-06-kepler-black-box-sidequest.md
rm docs/superpowers/plans/2026-04-07-ashfall-forward-camp-explore.md
rm docs/superpowers/plans/2026-04-07-sector-zero-site.md
```

Note: Keep `docs/superpowers/specs/2026-04-07-sector-zero-repo-extraction-design.md` — it documents the extraction process.

- [ ] **Step 5: Run yarn install to update lockfile**

```bash
yarn install
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove sector-zero from monorepo (moved to colorpulse6/sector-zero)"
```

---

### Task 9: Final Verification

- [ ] **Step 1: Verify new repo builds**

```bash
cd /Users/nichalasbarnes/Desktop/projects/sector-zero
cd game && yarn build && cd ../site && yarn build
```

Expected: Both build successfully.

- [ ] **Step 2: Verify knicks-knacks still builds**

```bash
cd /Users/nichalasbarnes/Desktop/projects/knicks-knacks
yarn build
```

Expected: Remaining games (Wordle, 2048, Asteroids, Brickles) build successfully. No errors referencing sector-zero.

- [ ] **Step 3: Verify no orphaned sector-zero references in knicks-knacks**

```bash
cd /Users/nichalasbarnes/Desktop/projects/knicks-knacks
grep -r "sector-zero" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.yml" --include="*.md" . | grep -v node_modules | grep -v .next | grep -v "repo-extraction"
```

Expected: No matches (except possibly the extraction spec which is expected to stay).

- [ ] **Step 4: Verify no orphaned knicks-knacks references in new repo**

```bash
cd /Users/nichalasbarnes/Desktop/projects/sector-zero
grep -r "knicks-knacks" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.yml" --include="*.md" . | grep -v node_modules | grep -v .next
```

Expected: No matches. All URLs should reference `sector-zero` not `knicks-knacks`.
