import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: "#00FFFF",
          magenta: "#FF00FF",
          yellow: "#FFD700",
          lime: "#39FF14",
          orange: "#FF6600",
          pink: "#FF1493",
        },
      },
    },
  },
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  plugins: [],
} satisfies Config;

export default config;
