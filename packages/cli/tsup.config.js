import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/commands/*"],
  outDir: "dist",
  platform: "node",
  format: ["cjs"],
  sourcemap: false,
  clean: true,
  bundle: true,
  dts: "src/types.ts",
  noExternal: ["execa", "chalk", "@latticexyz/services"],
});