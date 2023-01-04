import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm"],
  sourcemap: true,
  clean: true,
  dts: true,
  noExternal: ["goober", "shiki"],
});
