import sharedConfig from '../../../packages/config/tailwind.config.js';
import type { Config } from 'tailwindcss';

export default {
  ...sharedConfig,
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../../packages/ui/**/*.{js,ts,jsx,tsx}',
  ],
} as Config;
