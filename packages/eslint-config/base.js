/**
 * Shared ESLint base configuration for JavaScript projects
 */
module.exports = {
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "turbo",
        "prettier"
    ],
    plugins: ["@typescript-eslint"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        warnOnUnsupportedTypeScriptVersion: false
    },
    rules: {
        "@typescript-eslint/no-unused-vars": ["warn"],
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-expressions": ["error", {
            allowShortCircuit: true,
            allowTernary: true,
            allowTaggedTemplates: true
        }]
    },
};
