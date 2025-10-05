import { defineConfig } from "tsup";
import { baseConfig } from "../../tsup.config.base";

export default defineConfig((opts) => ({
  ...baseConfig(opts),
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
}));
