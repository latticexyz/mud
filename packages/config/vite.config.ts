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
      entry: "src/index.ts",
      formats: ["es"],
    },
    outDir: "dist",
    minify: true,
    sourcemap: true,
    target: "esnext",
  },
  ssr: {
    // Include everything but node dependencies
    noExternal: /^(?!node).*$/,
    // optimizeDeps: { disabled: false },
  },
  // ssr: {
  //   noExternal: ["esbuild", "zod", "chalk", "zod-validation-error", "ethers"],
  //   optimizeDeps: { include: ["esbuild"], disabled: false },
  // },
  /**
   * @see https://vitest.dev/config/
   */
  test: {
    environment: "node",
    globals: true,
  },
  plugins: [peerDepsExternal()] as any,
});
