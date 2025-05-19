/**
 * Shared ESLint configurations for the monorepo
 */
module.exports = {
  // Base config extends these
  extends: ["./base.js"],
  // Path to other configs for explicit import
  configs: {
    base: require.resolve("./base"),
    next: require.resolve("./next"),
    reactInternal: require.resolve("./react-internal"),
    prerenderFix: require.resolve("./prerender-fix"),
  },
};
