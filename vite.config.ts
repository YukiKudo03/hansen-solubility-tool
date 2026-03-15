import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./tests/renderer/setup.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/core/**/*.ts',
        'src/renderer/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/core/types.ts',
        'src/renderer/main.tsx',
        'src/renderer/styles/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@core': '/src/core',
      '@db': '/src/db',
    },
  },
});
