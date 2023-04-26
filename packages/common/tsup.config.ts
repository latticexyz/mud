import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    codegen: "src/codegen/index.ts",
    dev: "src/dev/index.ts",
    foundry: "src/foundry/index.ts",
  },
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true,
});
