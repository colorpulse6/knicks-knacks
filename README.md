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
- Yarn (v1.x)

### Installation

```bash
# Install dependencies
yarn install
```

## Package Manager

This monorepo uses **Yarn** instead of PNPM because:

1. **Expo Compatibility**: PNPM has compatibility issues with Expo's dependency management system
2. **Turborepo Integration**: Yarn provides more stable integration with Turborepo for our specific configuration

### Yarn Usage

Make sure to use Yarn for all package operations:

```bash
# Install dependencies
yarn install

# Run all apps in development mode
yarn dev

# Run specific apps
yarn calorie-cam:mobile    # For the mobile app
yarn calorie-cam:backend   # For the backend

# Add a dependency to a specific app
yarn workspace @calorie-cam/mobile add [package-name]

# Add a dependency to a specific shared package
yarn workspace @knicks-knacks/ui add [package-name]
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

## Additional Notes

- Use Yarn workspaces for dependency management and script execution.
- If you encounter dependency issues, try `yarn clean` and then `yarn install`.
- For more details on each package, see their respective directories.
