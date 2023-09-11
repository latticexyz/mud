import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/abi-ts.ts"],
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true,
});
