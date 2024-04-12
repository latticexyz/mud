import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/exports/index.ts",
    internal: "src/exports/internal.ts",
    "deprecated/library": "src/deprecated/library/index.ts",
    "deprecated/register": "src/deprecated/register/index.ts",
    "deprecated/node": "src/deprecated/node/index.ts",
  },
  target: "esnext",
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
});
