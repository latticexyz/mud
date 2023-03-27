import { defineConfig } from "vitest/config";
import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  build: {
    lib: {
      name: "@latticexyz/react",
      entry: "src/index.ts",
      formats: ["cjs", "es"],
    },
    outDir: "dist",
    minify: false,
    sourcemap: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
  plugins: [typescript() as any, peerDepsExternal()],
});
