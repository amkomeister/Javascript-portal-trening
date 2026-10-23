import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'e2e',
  timeout: 45000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:5176',
    headless: true,
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node scripts/local.mjs --e2e',
    url: 'http://127.0.0.1:5176/health',
    timeout: 60000,
    reuseExistingServer: false,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
});
