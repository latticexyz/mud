import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: [`${__dirname}/test-setup/global/arktype.ts`],
    passWithNoTests: true,
    teardownTimeout: 1000,
    hookTimeout: 15000,
    // doing parallel MUD deploys from the same project dir
    // still seems to have race conditions so disable for now
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
