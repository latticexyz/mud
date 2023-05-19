import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["ts/library/index.ts", "ts/register/index.ts"],
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true,
});
