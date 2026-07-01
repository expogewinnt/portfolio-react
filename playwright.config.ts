import { defineConfig, devices } from "@playwright/test";

const e2ePort = process.env.E2E_PORT ?? "4873";
const e2eBaseUrl = `http://127.0.0.1:${e2ePort}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: e2eBaseUrl,
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: {
    command: `PORT=${e2ePort} npm run start`,
    url: e2eBaseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
