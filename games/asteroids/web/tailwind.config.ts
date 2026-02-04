import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        space: "#000000",
        ship: "#ffffff",
        asteroid: "#888888",
        bullet: "#ffff00",
      },
    },
  },
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  plugins: [],
} satisfies Config;

export default config;
