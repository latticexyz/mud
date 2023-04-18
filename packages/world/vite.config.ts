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
      entry: ["src/render-solidity/index.ts", "mud.config.mts", "scripts/worldgen.ts"],
      formats: ["es"],
    },
    outDir: "dist",
    minify: false,
    sourcemap: true,
    target: "esnext",
  },
  ssr: {
    external: ["@solidity-parser/parser"],
  },
  plugins: [typescript() as any, peerDepsExternal()],
});
