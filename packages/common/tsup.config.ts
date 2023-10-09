import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    chains: "src/chains/index.ts",
    codegen: "src/codegen/index.ts",
    errors: "src/errors/index.ts",
    foundry: "src/foundry/index.ts",
    "type-utils": "src/type-utils/index.ts",
    utils: "src/utils/index.ts",
  },
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true,
});
