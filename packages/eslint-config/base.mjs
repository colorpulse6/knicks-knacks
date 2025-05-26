/**
 * Shared ESLint base configuration for JavaScript projects
 */
import turboConfig from "eslint-config-turbo/flat";
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  ...turboConfig,
  js.configs.recommended,
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      "no-unused-expressions": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "react-hooks/exhaustive-deps": "warn",
    },
    ignores: ["node_modules/", "dist/", "out/", ".next/", ".expo/"],
  },
];
