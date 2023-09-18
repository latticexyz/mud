import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    testTimeout: 1000 * 60 * 2,
    hookTimeout: 1000 * 60 * 2,
    singleThread: true,
    globalSetup: ["./setup/globalSetup.ts"],
  },
});
