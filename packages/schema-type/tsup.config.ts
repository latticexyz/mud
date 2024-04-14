import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/typescript/exports/index.ts",
    internal: "src/typescript/exports/internal.ts",
    deprecated: "src/typescript/exports/deprecated.ts",
  },
  outDir: "dist",
  target: "esnext",
  format: ["esm"],
  dts: !process.env.TSUP_SKIP_DTS,
  sourcemap: true,
  clean: true,
  minify: true,
  injectStyle: true,
});
