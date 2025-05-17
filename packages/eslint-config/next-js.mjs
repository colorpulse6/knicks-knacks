/**
 * ESLint configuration for Next.js applications
 * Using ESLint flat config format (v9+)
 */

import nextPlugin from "@next/eslint-plugin-next";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import js from "@eslint/js";

export const nextJsConfig = [
    // Base JavaScript/TypeScript configuration
    js.configs.recommended,
    {
        files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
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
        }
    },

    // Next.js specific configuration
    {
        files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
        plugins: {
            next: nextPlugin
        },
        settings: {
            next: {
                rootDir: ".",
            }
        },
        rules: {
            "react/react-in-jsx-scope": "off",
            ...nextPlugin.configs["core-web-vitals"].rules
        }
    }
];
