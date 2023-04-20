/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig } from "vitest/config";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry: {
        "codegen/index.js": "src/codegen/index.ts",
        "foundry/index.js": "src/foundry/index.ts",
      },
      formats: ["es"],
    },
    outDir: "dist",
    minify: false,
    sourcemap: true,
  },
  /**
   * @see https://vitest.dev/config/
   */
  test: {
    environment: "node",
    globals: true,
  },
  plugins: [peerDepsExternal()] as any,
});
