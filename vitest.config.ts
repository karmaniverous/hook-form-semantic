import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.tsx'],
    // Only include tests from your source directory
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,tsx}'],
    // Exclude everything else, especially node_modules and test-app
    exclude: [
      'node_modules/**',
      'test-app/**',
      'dist/**',
      'docs/**',
      'playground/**',
      '.rollup.cache/**',
      '**/*.d.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      // Only include your source code in coverage
      include: ['src/**/*.{js,ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.*',
        'src/**/*.d.ts',
        'docs/**',
        'dist/**',
        'playground/**',
        '.rollup.cache/**',
      ],
    },
  },
});
