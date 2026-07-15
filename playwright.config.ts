import { defineConfig } from '@playwright/test';

const localChromiumPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const browserProxyServer = process.env.PLAYWRIGHT_PROXY_SERVER;
const launchOptions =
  localChromiumPath || browserProxyServer
    ? {
        ...(localChromiumPath ? { executablePath: localChromiumPath } : {}),
        ...(browserProxyServer
          ? { proxy: { server: browserProxyServer } }
          : {}),
      }
    : undefined;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    launchOptions,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
});
