import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 1,
  workers: 3,
  use: {
    trace: 'on-first-retry',
  },
});
