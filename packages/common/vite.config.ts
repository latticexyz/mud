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
        "codegen/index": "src/codegen/index.ts",
        "foundry/index": "src/foundry/index.ts",
      },
      formats: ["es"],
    },
    outDir: "dist",
    minify: true,
    sourcemap: true,
    target: "esnext",
  },
  ssr: {
    noExternal: ["execa", "is-stream", "npm-run-path", "@latticexyz/solidity-parser"],
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
