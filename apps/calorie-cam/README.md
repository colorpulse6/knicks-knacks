# CalorieCam

CalorieCam is a mobile application that uses AI (GPT-4o) to analyze food images and provide nutritional information. Take a photo of your meal, and the app will identify the food and provide calorie and macronutrient estimates.

## Features

- 📸 Take photos of food or load images from your gallery
- 🧠 AI-powered food recognition using OpenAI's GPT-4o
- 📊 Estimate calories, protein, fat, and carbs
- 📝 Track your food intake history (optional)
- 😄 Humor for non-food uploads

## Tech Stack

### Mobile App

- React Native (Expo)
- TypeScript
- TanStack Query for data fetching
- Tailwind UI

### Backend

- Express.js
- OpenAI API (GPT-4o)
- Supabase for database and storage

## Directory Structure

```
apps/
  calorie-cam/
    backend/   # Express.js API, OpenAI integration, Supabase
    mobile/    # Expo/React Native app
    supabase/  # DB schema, migrations, deploy scripts
```

## Setup Instructions

### Prerequisites

- Node.js
- npm or pnpm
- Supabase account
- OpenAI API key (with access to GPT-4o)
- Railway account (for backend deployment)
- Expo account (for mobile app deployment)

### Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Note your project reference ID, URL, anon key, and service key
3. Run the schema initialization with the Supabase CLI:

   ```bash
   # Install the CLI if you haven't already
   npm install -g supabase

   # Navigate to the supabase directory
   cd apps/calorie-cam/supabase

   # Initialize Supabase locally (optional for development)
   supabase init

   # Run the deployment script
   ./deploy.sh YOUR_PROJECT_REF
   ```

4. Alternatively, you can run the SQL script manually in the Supabase SQL Editor:
   ```
   apps/calorie-cam/supabase/migrations/0001_init_schema.sql
   ```

### Backend Setup

1. Navigate to the backend directory:

   ```
   cd apps/calorie-cam/backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Configure environment variables:

   - Copy `.env.example` to `.env`
   - Fill in your Supabase and OpenAI API credentials

4. Start the development server:
   ```
   npm run dev
   ```

### Mobile App Setup

1. Navigate to the mobile directory:

   ```
   cd apps/calorie-cam/mobile
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Configure environment variables:

   - Copy `.env.example` to `.env`
   - Set your backend API URL and Supabase credentials

4. Start the Expo development server:

   ```
   npm run start
   ```

5. Use the Expo Go app to scan the QR code and run the app on your device

## Environment Variables

- See `.env.example` in both `backend` and `mobile` for required variables.
- For backend, set your Supabase and OpenAI keys.
- For mobile, set your backend API URL and Supabase keys.

## Useful Scripts

- **Backend:**
  - `npm run dev` — Start backend in dev mode
  - `npm run build` — Build backend
- **Mobile:**
  - `npm run start` — Start Expo server
  - `eas build --profile <profile> --platform <ios|android>` — Build app with EAS

## Deployment

### Supabase Deployment

1. Create a new Supabase project from the dashboard
2. Deploy the schema:
   ```bash
   cd apps/calorie-cam/supabase
   ./deploy.sh YOUR_PROJECT_REF
   ```
3. Verify the tables and storage buckets are correctly set up in the Supabase dashboard

### Backend Deployment to Railway

1. Create a new project on Railway
2. Connect your GitHub repository to Railway
3. Set up the required environment variables in the Railway dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `OPENAI_API_KEY`
   - `NODE_ENV=production`
4. Deploy by pushing to your main branch or manually deploying via the Railway CLI:
   ```bash
   cd apps/calorie-cam/backend
   railway up
   ```

### Mobile App Deployment with Expo

1. Set up your Expo account and EAS CLI:

   ```bash
   npm install -g eas-cli
   eas login
   ```

2. Configure your app:

   ```bash
   cd apps/calorie-cam/mobile
   eas build:configure
   ```

3. Update your app.json and eas.json if necessary

4. For development builds:

   ```bash
   eas build --profile development --platform ios  # or android
   ```

5. For production builds:

   ```bash
   eas build --profile production --platform ios  # or android
   ```

6. For OTA updates without rebuilding:
   ```bash
   eas update
   ```

## CI/CD Setup

The repository includes GitHub Actions workflows for automating deployment:

1. Add your Railway token as a GitHub secret named `RAILWAY_TOKEN`
2. Enable GitHub Actions for your repository
3. Push changes to the main branch to trigger automatic deployments

## Development Tips

- To test mobile on a device, ensure your backend is accessible from your device (use your computer's local IP for the API URL).
- You can run both backend and mobile concurrently for full-stack testing.
- For troubleshooting, check logs in your terminal and ensure all env variables are set.

## Links

- [Supabase](https://supabase.com)
- [Railway](https://railway.app)
- [Expo](https://expo.dev)
- [OpenAI](https://platform.openai.com)

## Development Notes

- The app uses optional user authentication - users can analyze food without logging in
- Food logs for logged-in users are saved in Supabase
- Images are stored in Supabase Storage
- The mobile app works in both online and offline modes (offline mode has limited functionality)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
