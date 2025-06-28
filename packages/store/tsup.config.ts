import { defineConfig } from "tsup";
import { baseConfig } from "../../tsup.config.base";

export default defineConfig((opts) => ({
  ...baseConfig(opts),
  entry: {
    "mud.config": "mud.config.ts",
    index: "ts/exports/index.ts",
    internal: "ts/exports/internal.ts",
    codegen: "ts/codegen/index.ts",
  },
}));
