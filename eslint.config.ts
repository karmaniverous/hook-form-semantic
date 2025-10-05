import path from 'node:path';

import eslint from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import tsDocPlugin from 'eslint-plugin-tsdoc';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  // Global ignores to keep lint focus on source.
  {
    ignores: [
      '.rollup.cache/**/*',
      '.stan/**/*',
      'assets/**/*',
      'coverage/**/*',
      'diagrams/out/**/*',
      'dist/**/*',
      'docs/**/*',
      'node_modules/**/*',
    ],
  },

  // JavaScript files: ESLint recommended base.
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs', '**/*.jsx'],
    ...eslint.configs.recommended,
  },

  // TypeScript (type-checked) recommendations.
  ...tseslint.configs.recommendedTypeChecked,

  // Test files: Vitest recommended rules.
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.test.js', '**/*.test.jsx'],
    plugins: { vitest },
    rules: {
      // Use Vitest's recommended rules under flat config
      ...vitest.configs.recommended.rules,
    },
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
        // Use the TypeScript Project Service so type-aware rules run across the repo
        // (tests/mocks included) without hard-coding a project list.
        // See: https://typescript-eslint.io/linting/typed-linting/project-service/
        projectService: true,
        // Ensure relative resolution is correct on Windows and CI
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

  // React + Hooks + a11y (JSX/TSX files)
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // React core recommended
      ...(reactPlugin.configs?.recommended?.rules ?? {}),
      // New JSX transform
      ...(reactPlugin.configs?.['jsx-runtime']?.rules ?? {}),
      // Hooks recommended
      ...(reactHooksPlugin.configs?.recommended?.rules ?? {}),
      // a11y recommended
      ...(jsxA11yPlugin.configs?.recommended?.rules ?? {}),
      'react/prop-types': 'off',
    },
  },

  // Disable stylistic conflicts with Prettier.
  prettierConfig,
);
