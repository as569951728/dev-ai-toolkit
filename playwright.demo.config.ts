import { defineConfig } from '@playwright/test';

import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,
  testMatch: 'demo-smoke.spec.ts',
  use: {
    ...baseConfig.use,
    baseURL: 'https://dev-ai-toolkit.vercel.app',
  },
  webServer: undefined,
});
