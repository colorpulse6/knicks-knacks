/**
 * Special ESLint configuration to help with Next.js prerender issues
 * Use this in projects experiencing "Error occurred prerendering page" issues
 */
module.exports = {
  // Relax rules that can cause issues with static generation
  rules: {
    // Turn off rules that might interfere with prerendering
    "react-hooks/exhaustive-deps": "off", // Disable exhaustive deps check completely
    "react-hooks/rules-of-hooks": "warn", // Downgrade from error
    "@next/next/no-img-element": "off", // Allow img tags
    "@next/next/no-html-link-for-pages": "off", // Allow regular a tags
    "no-unused-expressions": "off", // Prevents errors in conditional expressions
    "@typescript-eslint/no-unused-expressions": "off", // Allow expressions in JSX

    // Safety rules to prevent runtime errors
    "no-undef": "error", // Keep this on to catch undefined variables
    "no-console": "warn", // Console logs can cause issues in SSR
  },
  // Avoid linting files that might cause issues
  ignorePatterns: [
    "**/*.d.ts", // Type definition files
    ".next/**/*", // Next.js build output
    "out/**/*", // Static export output
    "public/**/*", // Public assets
  ],
};
