# BotBattle Web

A Next.js + TypeScript frontend app for benchmarking and analyzing responses from multiple LLM APIs. Part of the knicks-knacks monorepo.

## Features
- Compare multiple free LLM APIs (Claude, Gemini, Groq, etc.)
- Select prompt templates or create custom prompts
- Visualize detailed analytics for LLM responses
- Built with Tailwind CSS, Zustand, TanStack Query, Framer Motion

## Getting Started
1. Copy `.env.example` to `.env` and fill in any required API keys.
2. Install dependencies: `yarn install`
3. Run the app: `yarn dev`

## Directory Structure
- `/src` - App source code
- `/public` - Static assets
- `/tests` - App-specific tests

## Environment Variables
See `.env.example` for required variables.

---

This app follows the monorepo rules and shares code via `/packages`.
