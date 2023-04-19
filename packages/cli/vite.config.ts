import { defineConfig } from "vitest/config";
import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import shebang from "rollup-plugin-preserve-shebang";

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry: ["src/index.ts", "src/mud.ts", "src/mud2.ts"],
      formats: ["es"],
    },
    outDir: "dist",
    minify: false,
    sourcemap: true,
    target: "esnext",
  },
  plugins: [typescript() as any, peerDepsExternal(), shebang()],
});
