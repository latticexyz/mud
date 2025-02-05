import { defineConfig } from "tsup";
import { baseConfig } from "../../tsup.config.base";

export default defineConfig((opts) => ({
  ...baseConfig(opts),
  entry: {
    index: "src/typescript/exports/index.ts",
    internal: "src/typescript/exports/internal.ts",
    deprecated: "src/typescript/exports/deprecated.ts",
  },
}));
