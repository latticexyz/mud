import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    codegen: "src/codegen/index.ts",
    foundry: "src/foundry/index.ts",
  },
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
});
