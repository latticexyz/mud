import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: [
      `${__dirname}/test-setup/global/polyfill.ts`,
      `${__dirname}/test-setup/global/arktype.ts`,
      `${__dirname}/test-setup/global/anvil.ts`,
    ],
    setupFiles: [`${__dirname}/test-setup/anvil.ts`],
    passWithNoTests: true,
    typecheck: { enabled: true },
    // Temporarily set a low teardown timeout because anvil hangs otherwise
    // Could move this timeout to anvil setup after https://github.com/wevm/anvil.js/pull/46
    teardownTimeout: 30_000,
    hookTimeout: 15000,
    // Temporarily disable file parallelism until we improve MUD config imports (https://github.com/latticexyz/mud/pull/3290)
    fileParallelism: false,
    env: {
      VITEST_PID: String(process.pid),
    },
  },
  server: {
    watch: {
      // we build+import this file in test setup, which causes vitest to restart in a loop unless we ignore it here
      ignored: ["**/mock-game-contracts/out/IWorld.sol/IWorld.abi.json"],
    },
  },
});
