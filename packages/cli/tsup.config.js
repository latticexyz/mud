import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/mud.ts"],
  outDir: "dist",
  platform: "node",
  format: ["esm"],
  sourcemap: false,
  clean: true,
  bundle: true,
  dts: "src/index.ts",
  // both inlined imports are hacks to make esm+esbuild work
  // @latticexyz/services: esm imports directly from ts files don't work properly from transpiled js
  // @latticexyz/solecs: esm requires import assertions for json, but esbuild doesn't support those (they just get stripped)
  noExternal: ["@latticexyz/services", "@latticexyz/solecs"],
});