import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:5000",
    trace: "on-first-retry",
    // Use "domcontentloaded" instead of "load" because Vite's HMR WebSocket
    // may not connect in headless/sandboxed environments, causing the "load"
    // event to hang indefinitely.
    navigationTimeout: 30000,
  },
  webServer: {
    command: "npm run start",
    url: "http://localhost:5000/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      NODE_ENV: "production",
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test",
      AI_INTEGRATIONS_OPENAI_API_KEY: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "sk-test-dummy-key-for-playwright",
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use pre-installed Chromium when PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is set,
        // otherwise fall back to the default Playwright-managed browser.
        ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } }
          : {}),
      },
    },
  ],
});
