import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  target: "esnext",
  format: ["esm"],
  sourcemap: true,
  clean: true,
  minify: true,
});
