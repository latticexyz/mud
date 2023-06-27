import { defineConfig } from "tsup";

export default defineConfig({
  entry: [".mud/expandedConfig.ts", "ts/index.ts", "ts/codegen/index.ts", "ts/config/index.ts"],
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true,
});
