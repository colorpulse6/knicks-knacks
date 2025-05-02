# Regexplain

A modern, minimal web app to explain and test regex patterns using AI (Groq API). Built with Next.js, TypeScript, and Tailwind CSS.

## Features
- Input a regex and get a plain-English explanation (powered by AI).
- See a character-by-character breakdown of regex.
- Live testing on sample strings.

## Getting Started
1. Install dependencies with `yarn install` from the monorepo root.
2. Copy `.env.example` to `.env.local` and add your Groq API key.
3. Run the app with `yarn dev` from the monorepo root.

## Environment Variables
- `GROQ_API_KEY` – Your Groq API key.

## Tech Stack
- Next.js (React 18+, TypeScript)
- Tailwind CSS
- TanStack Query

## Development
- Lint: `yarn lint`
- Test: `yarn test`
- E2E: `yarn e2e`

## License
MIT
