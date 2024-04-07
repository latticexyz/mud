import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/exports/index.ts",
  },
  target: "esnext",
  format: ["esm"],
  // dts: true, // TODO: enable this
  sourcemap: true,
  clean: true,
  minify: true,
  injectStyle: true,
});
