/**
 * Shared ESLint flat configuration for Next.js applications
 * Compatible with ESLint v9+ and Next.js
 */

import nextPlugin from "@next/eslint-plugin-next";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

// Base configuration - shared rules for all projects
const baseConfig = {
    linterOptions: {
        reportUnusedDisableDirectives: true,
    },
    plugins: {
        "@typescript-eslint": typescript
    },
    languageOptions: {
        parser: typescriptParser,
        parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
    rules: {
        "@typescript-eslint/no-unused-vars": ["warn"],
        // Add more base rules here
    }
};

// Next.js specific configuration
const nextConfig = {
    plugins: {
        next: nextPlugin
    },
    rules: {
        "react/react-in-jsx-scope": "off",
        ...nextPlugin.configs["core-web-vitals"].rules
    }
};

const config = [baseConfig, nextConfig];

export default config;
