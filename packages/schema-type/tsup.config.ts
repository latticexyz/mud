import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/typescript/index.ts"],
  outDir: "dist/typescript",
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true,
  injectStyle: true,
});
