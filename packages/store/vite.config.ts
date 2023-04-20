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
      entry: ["mud.config.ts", "ts/index.ts"],
      formats: ["es"],
    },
    outDir: "dist",
    minify: true,
    sourcemap: true,
    target: "esnext",
  },
  plugins: [peerDepsExternal()] as any,
});
