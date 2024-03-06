import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    testTimeout: 1000 * 60 * 2,
    hookTimeout: 1000 * 60 * 2,
    singleThread: true,
    globalSetup: ["./setup/globalSetup.ts"],
    exclude: [...configDefaults.exclude, "compare"],
  },
});
