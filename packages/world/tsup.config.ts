import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "mud.config.ts",
    ".mud/expandedConfig.ts",
    "ts/library/index.ts",
    "ts/node/index.ts",
    "ts/plugins/snapsync/index.ts",
  ],
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true,
});
