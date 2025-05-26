/**
 * Shared ESLint configuration for Next.js applications
 */
import baseConfig from "./base.mjs";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  ...baseConfig,
  {
    plugins: { next: nextPlugin },
    rules: {
      ...nextPlugin.configs["core-web-vitals"].rules,
      "react/react-in-jsx-scope": "off",
      "next/no-html-link-for-pages": "off",
      "next/no-img-element": "off",
      "next/no-sync-scripts": "off",
    },
  },
];
