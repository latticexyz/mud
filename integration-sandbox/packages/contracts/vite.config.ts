import { defineConfig } from "vitest/config";

// TODO should this along with `.test.ts` be in `client-vanilla`?
export default defineConfig({
  test: {
    environment: "jsdom",
    testTimeout: 180_000,
    hookTimeout: 180_000,
    // load .env for world deploy
    setupFiles: ["dotenv/config"],
  },
});
