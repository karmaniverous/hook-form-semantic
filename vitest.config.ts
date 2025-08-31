import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['.rollup.cache/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        'docs/**',
        'dist/**',
        'playground/**',
        '.rollup.cache/**',
      ],
    },
  },
});
