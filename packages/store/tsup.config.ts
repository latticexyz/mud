import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["mud.config.ts", "ts/index.ts", "ts/codegen/index.ts", "ts/config/index.ts", "ts/register/index.ts"],
  target: "esnext",
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
});
