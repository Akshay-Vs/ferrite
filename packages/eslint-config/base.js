import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import-x";
import unusedImports from "eslint-plugin-unused-imports";
import cspell from "@cspell/eslint-plugin";
import prettierConfig from "eslint-config-prettier";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint,
      "import-x": importPlugin,
      "unused-imports": unusedImports,
      "@cspell": cspell,
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: { projectService: true },
    },
    rules: {
      // ── Unused imports (auto-fixable) ──────────────────────
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" }
      ],

      // ── Import ordering (auto-fixable) ─────────────────────
      "import-x/order": "off",
      "import-x/no-duplicates": "error",
      "import-x/no-cycle": "error",
      "import-x/no-self-import": "error",

      // ── TypeScript ──────────────────────────────────────────
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",

      // ── Spell checking ─────────────────────────────────────
      "@cspell/spellchecker": ["warn", {
        checkComments: true,
        autoFix: false,
        cspell: { language: "en" }
      }],
    }
  },
  prettierConfig,
];
