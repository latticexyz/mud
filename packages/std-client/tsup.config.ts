import { defineConfig } from "tsup";

export default defineConfig({
  entry: { deprecated: "src/deprecated/index.ts" },
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true,
});
