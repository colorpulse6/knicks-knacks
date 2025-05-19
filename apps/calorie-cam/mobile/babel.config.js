module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "babel-plugin-syntax-hermes-parser",
      [
        "module-resolver",
        {
          root: ["./src"],
          extensions: [
            ".ios.ts",
            ".android.ts",
            ".ts",
            ".ios.tsx",
            ".android.tsx",
            ".tsx",
            ".jsx",
            ".js",
            ".json",
          ],
          alias: {
            "@knicks-knacks/shared": "../../../packages/shared/src",
            "@knicks-knacks/ui": "../../../packages/ui/src"
          },
        },
      ],
    ],
  };
};