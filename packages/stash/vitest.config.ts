import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: "vitestSetup.ts",
  },
});
