import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 1000 * 60 * 2,
    hookTimeout: 1000 * 60 * 2,
    minWorkers: 1,
    maxWorkers: 1,
    globalSetup: ["./setup/globalSetup.ts"],
    exclude: [...configDefaults.exclude, "compare"],
  },
});
