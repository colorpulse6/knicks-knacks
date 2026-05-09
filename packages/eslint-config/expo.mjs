import expoConfig from "eslint-config-expo/flat.js";

export default [
  ...expoConfig,
  {
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
];
