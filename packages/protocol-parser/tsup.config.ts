import { defineConfig } from "tsup";
import { baseConfig } from "../../tsup.config.base";

export default defineConfig((opts) => ({
  ...baseConfig(opts),
  entry: {
    index: "src/exports/index.ts",
    internal: "src/exports/internal.ts",
  },
}));
