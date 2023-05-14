import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/library/index.ts", "src/register/index.ts", "src/node/index.ts"],
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true,
});
