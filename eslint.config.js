import baseConfig from "@ferrite/eslint-config/base";
import nextConfig from "@ferrite/eslint-config/next";

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: ["**/dist/**", "**/.next/**", "**/node_modules/**"] },
  ...baseConfig,
  ...nextConfig.map((config) => ({
    ...config,
    files: ["apps/web/**/*.{ts,tsx}"],
  })),
  {
    // Disable import/order from eslint-config-next's bundled eslint-plugin-import,
    // which is incompatible with ESLint 10+. Import ordering is handled by
    // eslint-plugin-import-x in the base config.
    files: ["apps/web/**/*.{ts,tsx}"],
    rules: {
      "import/order": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
];
