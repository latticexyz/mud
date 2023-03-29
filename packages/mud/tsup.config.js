import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["packages/*"],
  outDir: "dist",
  platform: "node",
  format: ["esm"],
  sourcemap: false,
  clean: true,
  bundle: true,
  dts: true,
  noExternal: ["@latticexyz/cli"],
});
