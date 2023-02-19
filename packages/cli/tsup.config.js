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
  noExternal: ["@latticexyz/services", "@latticexyz/solecs"],
});