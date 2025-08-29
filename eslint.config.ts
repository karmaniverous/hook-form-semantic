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
      'playground/**/*',
    ],
  },

  // Base JS + TS (non type-checked) recommendations.
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Test files: Vitest recommended rules.
  {
    ...vitestPlugin.configs.recommended,
    files: ['**/*.test.ts', '**/*.test.tsx'],
  },

  // Common plugins & rules.
  {
    plugins: {
      prettier: prettierPlugin,
      'simple-import-sort': simpleImportSortPlugin,
      tsdoc: tsDocPlugin,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'no-unused-vars': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'tsdoc/syntax': 'warn',
    },
  },

  // Disable stylistic conflicts with Prettier.
  prettierConfig,
);

