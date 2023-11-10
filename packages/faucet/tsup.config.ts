import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  outDir: "dist/js",
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  minify: true,
});
