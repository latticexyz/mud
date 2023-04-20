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
      entry: ["ts/scripts/worldgen.ts", "ts/scripts/tablegen.ts", "ts/index.ts", "mud.config.ts"],
      formats: ["es"],
    },
    outDir: "dist",
    minify: true,
    sourcemap: true,
    target: "esnext",
  },
  plugins: [peerDepsExternal()] as any,
});
