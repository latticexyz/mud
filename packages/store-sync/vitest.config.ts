import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["vitestSetup.ts", "test/globalSetup.ts"],
    setupFiles: ["test/setup.ts"],
    // Temporarily set a low teardown timeout because anvil hangs otherwise
    // Could move this timeout to anvil setup after https://github.com/wevm/anvil.js/pull/46
    teardownTimeout: 500,
    hookTimeout: 15000,
  },
  server: {
    watch: {
      // we build+import this file in test setup, which causes vitest to restart in a loop unless we ignore it here
      ignored: ["**/test/mock-game-contracts/out/IWorld.sol/IWorld.abi.json"],
    },
  },
});
