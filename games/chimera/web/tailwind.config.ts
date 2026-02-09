import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Medieval theme colors
        parchment: "#f4e4c1",
        ink: "#2c1810",
        gold: "#d4af37",
        blood: "#8b0000",
        // Sci-fi glitch colors
        glitch: {
          cyan: "#00ffff",
          magenta: "#ff00ff",
          green: "#00ff00",
        },
        // UI colors
        menu: {
          bg: "#1a1a2e",
          border: "#4a4a6a",
          text: "#e0e0e0",
          highlight: "#6a6a9a",
        },
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "monospace"],
        medieval: ["var(--font-medieval)", "serif"],
      },
      animation: {
        "atb-fill": "atb-fill 3s linear",
        "damage-float": "damage-float 1s ease-out forwards",
        "glitch": "glitch 0.3s ease-in-out",
        "typewriter": "typewriter 0.05s steps(1)",
      },
      keyframes: {
        "atb-fill": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        "damage-float": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-50px)" },
        },
        "glitch": {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(2px, -2px)" },
          "60%": { transform: "translate(-2px, -2px)" },
          "80%": { transform: "translate(2px, 2px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
