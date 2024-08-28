import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  target: "esnext",
  format: ["esm"],
  minify: true,
});
