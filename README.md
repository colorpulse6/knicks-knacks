# Knicks Knacks Monorepo

A modern monorepo structure using TurboRepo, Next.js, React Native, and TypeScript. This repository uses Yarn workspaces to manage dependencies and Turborepo to orchestrate builds, linting, and testing across all projects.

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

## Apps in this Monorepo

This monorepo contains multiple full-stack apps, each with their own mobile, backend, and (optionally) web frontends. Here are the main apps:

### Leaf

- **Description:** A mobile-first reading companion for discovering, cataloging, and sharing books. Integrates with Open Library APIs and supports social sharing.
- **Location:** `apps/leaf`
  - `mobile/`: React Native (Expo) app for iOS/Android
  - `backend/`: Express API for user/book data
  - `supabase/`: Database migrations and SQL for the backend

### CalorieCam

- **Description:** A mobile application that analyzes food images and provides nutritional information using OpenAI and Supabase.
- **Location:** `apps/calorie-cam`
  - `mobile/`: React Native (Expo) app for iOS/Android
  - `backend/`: Express API for food/nutrition data
  - `supabase/`: Database migrations and SQL for the backend

### Regexplain

- **Description:** A modern web app for explaining, breaking down, and interactively testing regular expressions. Powered by AI (Groq Llama3) for natural language explanations and a rich, interactive breakdown UI. Features include:
  - Plain-English regex explanations
  - Character-by-character breakdown with tooltips
  - Live regex tester with match highlighting
  - Smart warnings for common regex mistakes (e.g., double backslashes)
  - Robust error handling for non-regex input
- **Location:** `apps/regexplain/web`
  - `web/`: Next.js (React) web frontend
- **Live URL:** https://www.regexplain.cc/

### BotBattle

- **Description:** A web application for benchmarking different LLM APIs and comparing their performance.
- **Location:** `apps/bot-battle/web`
  - `web/`: Next.js (React) web frontend
- **Live URL:** https://www.botbattle.cc/

## Games

Web-based games built with Next.js and deployed to GitHub Pages at https://colorpulse6.github.io/

### Wordle

- **Description:** A daily word guessing game where players have six attempts to guess a five-letter word.
- **Location:** `games/wordle/web`
- **Live URL:** https://colorpulse6.github.io/wordle/

### 2048

- **Description:** A number sliding puzzle game where players combine tiles to reach the 2048 tile.
- **Location:** `games/2048/web`
- **Live URL:** https://colorpulse6.github.io/2048/

### Asteroids

- **Description:** A space shooter game with collision detection where players destroy asteroids while avoiding collisions.
- **Location:** `games/asteroids/web`
- **Live URL:** https://colorpulse6.github.io/asteroids/

See each app's own README for setup and usage details.

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn Berry (v4+) - automatically handled by Corepack

### Installation

```bash
# Enable Corepack (if not already enabled)
corepack enable

# Install dependencies
yarn install
```

## Package Manager

This monorepo uses **Yarn Berry (v4)** instead of PNPM because:

1. **Expo Compatibility**: PNPM has compatibility issues with Expo's dependency management system
2. **Turborepo Integration**: Yarn provides more stable integration with Turborepo for our specific configuration
3. **Performance**: Yarn Berry offers improved performance with its modern architecture

### Yarn Berry Usage

This project uses Yarn Berry (v4) with the Node Modules linker for maximum compatibility. Use Yarn for all package operations:

```bash
# Install dependencies
yarn install

# Run all apps in development mode
yarn dev

# Run specific apps
yarn calorie-cam:mobile    # For the mobile app
yarn calorie-cam:backend   # For the backend

# Add a dependency to a specific app
yarn workspace @knicks-knacks/calorie-cam-mobile add [package-name]

# Add a dependency to a specific shared package
yarn workspace @knicks-knacks/ui add [package-name]

# Update Yarn Berry to a newer version
yarn set version latest

# Check for dependency issues
yarn dlx @yarnpkg/doctor
```

### Troubleshooting

If you encounter dependency resolution issues:

1. Clear all dependencies: `yarn clean`
2. Reinstall from scratch: `yarn install`
3. Run a specific app directly from its directory for better error messages

## CalorieCam App

CalorieCam is a mobile application that analyzes food images and provides nutritional information using GPT-4o and Supabase. See [`/apps/calorie-cam/README.md`](apps/calorie-cam/README.md) for full setup and usage details.

### Running the Backend

```bash
# Navigate to the backend directory
cd apps/calorie-cam/backend

# Install backend dependencies (if not already installed via root)
yarn install

# Create .env file (copy from example)
cp .env.example .env
# Then edit .env to add your API keys

# Start the development server
yarn dev

# The server will run on http://localhost:3000
# Health check available at http://localhost:3000/health
# Production health check available at https://calorie-cam-production.up.railway.app/health
```

### Running the Mobile App

```bash
# Navigate to the mobile directory
cd apps/calorie-cam/mobile

# Install mobile dependencies (if not already installed via root)
yarn install

# If testing on a physical device, update the API URL
# Open src/services/api.ts and update the physical device URL with your computer's IP address:
# e.g., change "http://192.168.1.X:3000/api" to "http://192.168.1.15:3000/api"

# Start the Expo development server
npx expo start

# This will display a QR code that you can scan with:
# - iOS: Camera app
# - Android: Expo Go app (install from Play Store)

# Alternatively, you can run in specific simulators:
npx expo start --ios     # Start in iOS simulator
npx expo start --android # Start in Android emulator
```

### Deployment

- Backend: Deployed automatically to Railway on main branch push.
- Mobile: Use Expo EAS for builds and OTA updates. See `/apps/calorie-cam/README.md` for detailed deployment steps.

## Development Workflow

```bash
# Run all projects in dev mode (from root)
yarn dev

# Build all projects (from root)
yarn build

# Lint all projects (from root)
yarn lint

# Test all projects (from root)
yarn test
```

## Tech Stack

- **Monorepo Management**: TurboRepo
- **Package Manager**: Yarn (instead of PNPM due to Expo compatibility)
- **Backend**: Node.js, Express, OpenAI API (GPT-4o), Supabase (PostgreSQL)
- **Mobile**: React Native (Expo), TypeScript, TanStack Query, Tailwind CSS
- **Web**: React, Next.js, Vite
- **Shared Packages**: UI library (`/packages/ui`), shared hooks/types (`/packages/shared`), ESLint config, and build config
- **Styling**: Tailwind CSS
- **State**: Zustand, TanStack Query
- **Database**: Supabase (PostgreSQL)
- **UI Toolkit**: Shared UI library in `/packages/ui` (React + React Native)
- **Code Quality**: TypeScript (strict mode), ESLint, Prettier
- **Testing**: Vitest, Testing Library, Playwright
- **Icons**: Lucide React

## Development

### Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/colorpulse6/knicks-knacks.git
   cd knicks-knacks
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Run a specific app**

   ```bash
   # CalorieCam
   yarn calorie-cam:mobile
   yarn calorie-cam:backend

   # Leaf
   yarn leaf:mobile
   yarn leaf:backend

   # RegExplain
   yarn regexplain:dev

   # BotBattle
   yarn bot-battle:dev
   ```

4. **Run commands across all apps and packages**

   ```bash
   # Build all packages and apps
   yarn build

   # Run dev servers in all packages and apps
   yarn dev

   # Run linting across all packages and apps
   yarn lint

   # Run tests across all packages and apps
   yarn test
   ```

### Package Dependencies

- **`@knicks-knacks/ui`**: Shared UI components for web and mobile apps
- **`@knicks-knacks/shared`**: Shared utilities, hooks, and types
- **`@knicks-knacks/eslint-config`**: Standardized ESLint configuration

### Monorepo Structure

This monorepo uses:

- **Turborepo**: For efficient build caching and task running
- **Yarn Workspaces**: For package management and dependency sharing
- **TypeScript**: For type safety across all projects
- **ESLint**: For consistent code quality
- **Tailwind CSS**: For web styling (not used in mobile apps)

### Adding a New Component to the UI Package

1. Create your component in `packages/ui/src/components/`
2. For cross-platform components, use the `Platform.OS` check:

   ```tsx
   import { Platform } from "react-native";

   if (Platform.OS === "web") {
     // Web-specific rendering
   } else {
     // Native-specific rendering
   }
   ```

3. Export your component from `packages/ui/src/index.tsx`

## Additional Notes

- If you encounter dependency issues, try `yarn clean` and then `yarn install`.
- For more details on each package, see their respective directories.
