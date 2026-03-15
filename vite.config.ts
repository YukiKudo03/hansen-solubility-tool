import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/core/**/*.ts'],
      exclude: ['src/core/types.ts'],
    },
  },
  resolve: {
    alias: {
      '@core': '/src/core',
      '@db': '/src/db',
    },
  },
});
