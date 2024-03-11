import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["test/globalSetup.ts"],
    setupFiles: ["test/setup.ts"],
    // Temporarily set a low teardown timeout because anvil hangs otherwise
    // Could move this timeout to anvil setup after https://github.com/wevm/anvil.js/pull/46
    teardownTimeout: 500,
    hookTimeout: 15000,
  },
});
