import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  reporter: "list",
  use: {
    browserName: "chromium",
    channel: "msedge",
    headless: true,
    acceptDownloads: true
  }
});
