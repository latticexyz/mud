import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: [`${__dirname}/test-setup/global/arktype.ts`],
    passWithNoTests: true,
    // Temporarily set a low teardown timeout because anvil hangs otherwise
    // Could move this timeout to anvil setup after https://github.com/wevm/anvil.js/pull/46
    teardownTimeout: 500,
    hookTimeout: 15000,
    fileParallelism: false,
    env: {
      // For MacOS users, set up PostgreSQL with
      //   brew update
      //   brew install postgresql@14
      //   /opt/homebrew/opt/postgresql@14/bin/createuser -s postgres
      DATABASE_URL: process.env.DATABASE_URL || "postgres://postgres@localhost:5432/postgres",
    },
  },
  server: {
    watch: {
      // we build+import this file in test setup, which causes vitest to restart in a loop unless we ignore it here
      ignored: ["**/mock-game-contracts/out/IWorld.sol/IWorld.abi.json"],
    },
  },
});
