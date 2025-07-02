import { defineConfig } from "tsup";
import { baseConfig } from "../../tsup.config.base";

export default defineConfig((opts) => ({
  ...baseConfig(opts),
  entry: ["src/exports/internal.ts"],
}));
