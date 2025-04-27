# Leaf

Leaf is a mobile-first book tracking application with a focus on simplicity and privacy. Each device acts as its own user—no login or signup required.

## Features

- 📚 Add books with Open Library integration
- 🔍 Search for books by title/author
- 🗑️ Delete books from your list
- 📈 (Planned) Track reading progress and recommendations
- 🌱 Clean, persistent UI with a leaf-themed header

## Tech Stack

### Mobile App
- React Native (Expo)
- TypeScript
- TanStack Query for data fetching

### Backend
- Express.js
- Supabase (database)
- Open Library API

## Directory Structure

```
apps/
  leaf/
    backend/   # Express.js API, Supabase integration
    mobile/    # Expo/React Native app
    supabase/  # DB schema, migrations, deploy scripts
```

## Authentication Strategy

Leaf uses **device-based authentication**:
- On first launch, each device generates a UUID, stored securely and used as the `user_id` for all API/database operations.
- There is no login or signup screen. All data is scoped to the device.
- The backend/database does **not** enforce a foreign key to `auth.users` on `user_id` fields. Any UUID is valid.
- If the app is deleted/reinstalled, a new device/user is created.
- See `mobile/utils/deviceUser.ts` for implementation details.

## Setup Instructions

### Prerequisites
- Node.js
- npm or pnpm
- Supabase account
- Expo account (for mobile app deployment)

### Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Note your project reference ID, URL, and anon key
3. Run the schema initialization with the Supabase CLI:

   ```bash
   npm install -g supabase
   cd apps/leaf/supabase
   supabase db push
   ```

### Backend Setup

1. Install dependencies:
   ```bash
   cd apps/leaf/backend
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your Supabase credentials
3. Start the backend:
   ```bash
   npm run dev
   ```

### Mobile App Setup

1. Install dependencies:
   ```bash
   cd apps/leaf/mobile
   npm install
   ```
2. Start the Expo app:
   ```bash
   npx expo start
   ```
3. Update the API URL in `services/api.ts` if running on a physical device

## Links

- [Supabase](https://supabase.com)
- [Open Library](https://openlibrary.org/developers/api)
- [Expo](https://expo.dev)

---

For more details, see the backend and mobile README files and the `.cursor/rules/leaf/authentication.md` for the authentication strategy.
