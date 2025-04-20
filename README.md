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

## CalorieCam App

CalorieCam is a mobile application that analyzes food images and provides nutritional information using GPT-4o.

### Running the Backend

```bash
# Navigate to the backend directory
cd apps/calorie-cam/backend

# Install backend dependencies (if not already installed via root)
pnpm install

# Create .env file (copy from example)
cp .env.example .env
# Then edit .env to add your API keys

# Start the development server
pnpm dev

# The server will run on http://localhost:3000
# Health check available at http://localhost:3000/health
```

### Running the Mobile App

```bash
# Navigate to the mobile directory
cd apps/calorie-cam/mobile

# Install mobile dependencies (if not already installed via root)
pnpm install

# If testing on a physical device, update the API URL
# Open src/services/api.ts and update the physical device URL with your computer's IP address:
# e.g., change "http://192.168.1.X:3000/api" to "http://192.168.1.15:3000/api"

# Start the Expo development server
pnpm start

# This will display a QR code that you can scan with:
# - iOS: Camera app
# - Android: Expo Go app (install from Play Store)

# Alternatively, you can run in specific simulators:
pnpm ios     # Start in iOS simulator
pnpm android # Start in Android emulator
```

### Deployment

The backend is automatically deployed to Railway when changes are pushed to the `main` branch.

```bash
# The production backend is available at:
https://calorie-cam-production.up.railway.app

# Health check endpoint:
https://calorie-cam-production.up.railway.app/health
```

## Development Workflow

```bash
# Run all projects in dev mode (from root)
pnpm dev

# Build all projects (from root)
pnpm build

# Lint all projects (from root)
pnpm lint

# Test all projects (from root)
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
