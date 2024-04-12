import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "mud.config": "mud.config.ts",
    index: "ts/exports/index.ts",
    internal: "ts/exports/internal.ts",
    codegen: "ts/codegen/index.ts",
    config: "ts/config/index.ts",
    "config/v2": "ts/config/v2/index.ts",
    register: "ts/register/index.ts",
  },
  target: "esnext",
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
});
