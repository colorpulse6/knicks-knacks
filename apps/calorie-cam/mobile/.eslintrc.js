module.exports = {
  root: true,
  extends: ["@knicks-knacks/eslint-config"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: "./tsconfig.json",
  }
};
