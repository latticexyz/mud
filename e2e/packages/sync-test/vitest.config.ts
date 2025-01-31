import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 1000 * 60 * 2,
    hookTimeout: 1000 * 60 * 2,
    singleThread: true,
    maxConcurrency: 1,
    globalSetup: [`${__dirname}/setup/globalSetup.ts`],
    exclude: [...configDefaults.exclude, "compare"],
  },
});
