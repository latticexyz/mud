import { defineConfig, mergeConfig } from "vitest/config";

export const baseConfig = defineConfig({
  test: {
    globalSetup: [`${__dirname}/test-setup/global/arktype.ts`],
    setupFiles: [],
  },
  server: {
    watch: {
      // we build+import this file in test setup, which causes vitest to restart in a loop unless we ignore it here
      ignored: ["**/mock-game-contracts/out/IWorld.sol/IWorld.abi.json"],
    },
  },
});

// TODO: migrate to prool: https://github.com/wevm/prool
// note that using this across packages running tests in parallel may cause port issues
export const anvilConfig = mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      globalSetup: [`${__dirname}/test-setup/global/anvil.ts`],
      // Temporarily set a low teardown timeout because anvil hangs otherwise
      // Could move this timeout to anvil setup after https://github.com/wevm/anvil.js/pull/46
      teardownTimeout: 500,
      hookTimeout: 15000,
    },
  }),
);

export default baseConfig;
