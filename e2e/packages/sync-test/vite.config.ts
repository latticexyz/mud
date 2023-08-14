import { defineConfig } from "vitest/config";

// TODO should this along with `.test.ts` be in `client-vanilla`?
export default defineConfig({
  test: {
    environment: "jsdom",
    testTimeout: 1000 * 60 * 2,
    hookTimeout: 1000 * 60 * 2,
    singleThread: true,
    globalSetup: ["./setup/globalSetup.ts"],
  },
});
