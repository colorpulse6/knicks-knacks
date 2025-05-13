/**
 * Shared ESLint configuration for Next.js applications
 */
module.exports = {
    extends: [
        "./base.js",
        "next/core-web-vitals",
    ],
    rules: {
        "react/react-in-jsx-scope": "off",
    },
};
