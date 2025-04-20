# Knicks Knacks Monorepo

A modern monorepo structure using TurboRepo, Next.js, Vite, React Native, and more.

## Structure

```
/apps
  /<app-name>
    /web         # Web frontend (Next.js or Vite)
    /mobile      # Mobile frontend (Expo/React Native)
    /backend     # Express-based API
    /tests       # App-specific tests

/packages
  /ui            # Shared UI components (cross-platform: React + RN)
  /eslint-config # Central ESLint rules
  /shared        # Common hooks, types
  /config        # Shared TS config, Tailwind config, PostCSS, etc.
```

## Getting Started

### Prerequisites

- Node.js 16+
- PNPM

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Run all projects in dev mode
pnpm dev

# Build all projects
pnpm build

# Lint all projects
pnpm lint

# Test all projects
pnpm test
```

## Tech Stack

- **Monorepo Management**: TurboRepo
- **Web**: React, Next.js, Vite
- **Mobile**: React Native, Expo
- **Backend**: Node.js, Express
- **Styling**: Tailwind CSS
- **State**: Zustand, TanStack Query
- **Database**: Supabase (PostgreSQL)
- **UI Toolkit**: Shared UI library in `/packages/ui` (React + React Native)
- **Code Quality**: TypeScript (strict mode), ESLint, Prettier
- **Testing**: Vitest, Testing Library, Playwright
- **Icons**: Lucide React
