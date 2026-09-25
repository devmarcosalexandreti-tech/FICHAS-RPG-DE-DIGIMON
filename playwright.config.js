import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    browserName: "chromium",
    headless: true,
    acceptDownloads: true
  }
});
