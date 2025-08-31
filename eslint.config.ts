import path from 'node:path';

import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import tsDocPlugin from 'eslint-plugin-tsdoc';
import vitestPlugin from 'eslint-plugin-vitest';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  // Global ignores to keep lint focus on source.
  {
    ignores: [
      '.rollup.cache/**/*',
      '.stan/**/*',
      'coverage/**/*',
      'dist/**/*',
      'docs/**/*',
      'node_modules/**/*',
      'assets/**/*',
      'diagrams/out/**/*',
    ],
  },

  // JavaScript files: ESLint recommended base.
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs', '**/*.jsx'],
    ...eslint.configs.recommended,
  },

  // TypeScript (non type-checked) recommendations.
  ...tseslint.configs.recommended,

  // Test files: Vitest recommended rules.
  {
    ...vitestPlugin.configs.recommended,
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.test.js', '**/*.test.jsx'],
  },

  // Shared formatting and import sorting across JS/TS.
  {
    files: ['**/*.{js,cjs,mjs,jsx,ts,tsx}'],
    plugins: {
      prettier: prettierPlugin,
      'simple-import-sort': simpleImportSortPlugin,
    },
    rules: {
      // Defer to the repo Prettier config (.prettierrc.json) as the single source of truth.
      'prettier/prettier': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },

  // TS-specific rules and parser options.
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        // Windows: force a resolved absolute path to work around a
        // typescript-eslint parser bug affecting tsconfigRootDir.
        tsconfigRootDir: path.resolve(),
      },
    },
    plugins: { tsdoc: tsDocPlugin },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'no-unused-vars': 'off',
      'tsdoc/syntax': 'warn',
    },
  },

  // Disable stylistic conflicts with Prettier.
  prettierConfig,
);
