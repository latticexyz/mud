import { defineConfig } from "vitest/config";
import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry: "src/index.ts",
      formats: ["cjs", "es"],
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
  plugins: [(typescript as any)(), peerDepsExternal()],
});
