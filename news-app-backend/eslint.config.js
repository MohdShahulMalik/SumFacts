import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    languageOptions: {
      globals: globals.node,
    },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json", // optional if you don't want type-aware linting
      },
      globals: globals.node,
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: { // turn off a base rule
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "semi": ["error", "always"],
      "quotes": ["error", "double"]
    },
    
  },
  // Enables recommended rules from typescript-eslint
  ...tseslint.configs.recommended,
]);
