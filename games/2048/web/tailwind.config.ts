import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "tile-2": "#eee4da",
        "tile-4": "#ede0c8",
        "tile-8": "#f2b179",
        "tile-16": "#f59563",
        "tile-32": "#f67c5f",
        "tile-64": "#f65e3b",
        "tile-128": "#edcf72",
        "tile-256": "#edcc61",
        "tile-512": "#edc850",
        "tile-1024": "#edc53f",
        "tile-2048": "#edc22e",
        "tile-super": "#3c3a32",
        "board-bg": "#bbada0",
        "cell-bg": "#cdc1b4",
        "text-light": "#f9f6f2",
        "text-dark": "#776e65",
      },
      animation: {
        "tile-pop": "tile-pop 0.2s ease-in-out",
        "tile-merge": "tile-merge 0.2s ease-in-out",
        "tile-slide": "tile-slide 0.15s ease-in-out",
      },
      keyframes: {
        "tile-pop": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "tile-merge": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
        "tile-slide": {
          "0%": { transform: "translateX(0) translateY(0)" },
        },
      },
    },
  },
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  plugins: [],
} satisfies Config;

export default config;
