/**
 * Shared ESLint configuration for Next.js applications
 */
module.exports = {
  extends: ["./base.js", "next/core-web-vitals"],
  rules: {
    "react/react-in-jsx-scope": "off",
    // Help with preventing build-time errors
    "no-unused-expressions": "off", // Prevents errors in conditional expressions
    "@typescript-eslint/no-unused-expressions": "off", // Allow expressions in JSX
    "@next/next/no-html-link-for-pages": "off", // More permissive link handling
    "react-hooks/exhaustive-deps": "warn", // Downgrade from error to warning
  },
  // Avoid parsing errors in build files
  ignorePatterns: [".next/", "node_modules/", "dist/", "out/"],
};
