/**
 * Shared ESLint configuration for React packages (non-Next.js)
 */
module.exports = {
    extends: [
        "./base.js",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended"
    ],
    parserOptions: {
        warnOnUnsupportedTypeScriptVersion: false
    },
    settings: {
        react: {
            version: "detect"
        }
    },
    rules: {
        "react/react-in-jsx-scope": "off",
        "@typescript-eslint/no-explicit-any": "warn",
    },
};
