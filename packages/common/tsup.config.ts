import { defineConfig } from "tsup";

export default defineConfig((opts) => ({
  entry: {
    index: "src/index.ts",
    actions: "src/exports/actions.ts",
    chains: "src/chains/index.ts",
    codegen: "src/codegen/index.ts",
    errors: "src/errors/index.ts",
    foundry: "src/foundry/index.ts",
    "type-utils": "src/type-utils/index.ts",
    utils: "src/utils/index.ts",
    kms: "src/exports/kms.ts",
    internal: "src/exports/internal.ts",
  },
  target: "esnext",
  format: ["esm"],
  sourcemap: true,
  minify: true,
  // don't generate DTS during watch mode because it's slow
  // we're likely using TS source in this mode anyway
  dts: !opts.watch,
  // don't clean during watch mode to avoid removing
  // previously-built DTS files, which other build tasks
  // depend on
  clean: !opts.watch,
}));
