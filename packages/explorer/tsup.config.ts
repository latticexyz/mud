import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["bin/explorer.ts"],
  target: "esnext",
  format: ["esm"],
  sourcemap: true,
  clean: true,
  minify: true,
});
