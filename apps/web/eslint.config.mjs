import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Relax some rules for faster development
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      // Allow unused vars prefixed with underscore
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Allow @ts-nocheck temporarily while fixing type issues
      "@typescript-eslint/ban-ts-comment": "off",
      // Allow explicit any temporarily (too many instances to fix at once)
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow empty interfaces (common in React component patterns)
      "@typescript-eslint/no-empty-object-type": "off",
      // Allow require imports temporarily
      "@typescript-eslint/no-require-imports": "warn",
      // Downgrade prefer-const to warning
      "prefer-const": "warn",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "coverage/**",
    ],
  },
];

export default eslintConfig;
