import type { Config } from 'tailwindcss';

export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4f46e5", // Indigo-600
          dark: "#4338ca", // Indigo-700
        },
        secondary: {
          DEFAULT: "#14b8a6", // Teal-500
          dark: "#0d9488", // Teal-600
        },
        accent: {
          DEFAULT: "#f59e0b", // Amber-500
          dark: "#d97706", // Amber-600
        },
        neutral: {
          light: "#f9fafb", // Gray-50
          dark: "#111827", // Gray-900
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    '../../../packages/ui/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [],
  // Tailwind v4 metadata to enable optimizations
  metadata: {
    version: "4.0.0",
    layers: ["base", "components", "utilities"],
  }
} satisfies Config;
