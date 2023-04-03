import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/mud.ts",
    "src/mud2.ts",
    "src/config/index.ts",
    "src/render-table/index.ts",
    "src/utils/index.ts",
    "src/utils/deprecated/index.ts",
    "src/render-solidity/index.ts",
    "src/render-ts/index.ts",
  ],
  outDir: "dist",
  platform: "node",
  format: ["esm"],
  sourcemap: false,
  clean: true,
  bundle: true,
  dts: true,
  // both inlined imports are hacks to make esm+esbuild work
  // @latticexyz/services: esm imports directly from ts files don't work properly from transpiled js
  // @latticexyz/solecs: esm requires import assertions for json, but esbuild doesn't support those (they just get stripped)
  noExternal: ["@latticexyz/services", "@latticexyz/solecs", "@latticexyz/schema-type"],
});
