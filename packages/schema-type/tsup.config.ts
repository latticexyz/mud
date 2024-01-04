import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/typescript/index.ts", "src/typescript/deprecated/index.ts"],
  outDir: "dist/typescript",
  target: "esnext",
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  injectStyle: true,
});
