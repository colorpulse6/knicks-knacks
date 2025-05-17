/** @type {import('tailwindcss').Config} */
const sharedConfig = require("../../../packages/config/tailwind.config"); // Assuming this is the shared config path

module.exports = {
  ...sharedConfig, // Spread the shared config
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    // If your shared UI package uses Tailwind and needs to be processed:
    // '../../../packages/ui/src/**/*.{js,jsx,ts,tsx}',
  ],
  // You can override or extend theme/plugins from sharedConfig here if needed
  theme: {
    ...sharedConfig.theme, // Start with shared theme
    extend: {
      ...(sharedConfig.theme?.extend || {}),
      // Add app-specific theme extensions here
    },
  },
  plugins: [
    ...(sharedConfig.plugins || []),
    // Add app-specific plugins here
  ],
};
