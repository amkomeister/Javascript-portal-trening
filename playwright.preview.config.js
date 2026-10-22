import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';
export default defineConfig({
  ...base,
  grep: /a beginner signs in|interactive HTML is isolated|teacher guide|teacher refreshes/,
  webServer: { ...base.webServer, command: 'node scripts/local.mjs --e2e --preview' },
});
