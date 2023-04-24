/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig } from "vitest/config";

/**
 * @see https://vitest.dev/config/
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
});
