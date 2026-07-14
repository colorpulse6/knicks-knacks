import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3010",
    channel: "chrome",
    contextOptions: { reducedMotion: "reduce" },
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "npm run start -- -p 3010",
    url: "http://127.0.0.1:3010",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
