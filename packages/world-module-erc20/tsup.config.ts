import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "mud.config": "mud.config.ts",
    module: "ts/module.ts",
  },
  target: "esnext",
  format: ["esm"],
  dts: !process.env.TSUP_SKIP_DTS,
  sourcemap: true,
  clean: true,
  minify: true,
});
