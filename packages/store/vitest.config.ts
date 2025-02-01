import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // doing parallel MUD deploys from the same project dir
    // still seems to have race conditions so disable for now
    fileParallelism: false,
  },
});
