import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

/**
 * Shared base ESLint flat config for all packages in the monorepo.
 * @type {import("eslint").Linter.Config[]}
 */
export default tseslint.config(
  {
    ignores: [
      "dist/**",
      ".next/**",
      ".next-build/**",
      "node_modules/**",
      ".turbo/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);
