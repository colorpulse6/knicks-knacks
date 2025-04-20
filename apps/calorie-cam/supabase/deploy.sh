#!/bin/bash

# CalorieCam Supabase Deployment Script
# This script helps with linking and pushing schema to Supabase

# Check if project reference is provided
if [ -z "$1" ]; then
  echo "Usage: ./deploy.sh <your-project-ref>"
  echo "Example: ./deploy.sh abcdefghijklm"
  exit 1
fi

PROJECT_REF=$1

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Error: Supabase CLI is not installed."
  echo "Please install it with 'npm install -g supabase' or visit https://github.com/supabase/cli#install-the-cli"
  exit 1
fi

# Link to the Supabase project
echo "Linking to Supabase project $PROJECT_REF..."
supabase link --project-ref $PROJECT_REF

# Push the database schema
echo "Pushing database schema to Supabase..."
supabase db push

echo "Deployment to Supabase complete!"
echo "Remember to set your environment variables in both your backend and mobile app:"
echo "  SUPABASE_URL=https://$PROJECT_REF.supabase.co"
echo "  SUPABASE_ANON_KEY=<your-anon-key>"
echo "  SUPABASE_SERVICE_KEY=<your-service-key>" 