module.exports = {
  root: true,
  extends: ["@knicks-knacks/eslint-config/base"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: "./tsconfig.json",
  },
  // Exclude non-TypeScript files from TypeScript-specific rules
  overrides: [
    {
      files: [".eslintrc.js"],
      parser: "espree",
      parserOptions: {
        ecmaVersion: 2020
      }
    }
  ]
};
