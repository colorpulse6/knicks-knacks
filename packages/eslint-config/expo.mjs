import baseConfig from "./base.mjs";
import expoConfig from "eslint-config-expo/flat";

export default [
  ...baseConfig,
  ...expoConfig,
  {
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
];
