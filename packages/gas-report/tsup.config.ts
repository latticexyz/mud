import { defineConfig } from "tsup";
import { baseConfig } from "../../tsup.config.base";

export default defineConfig((opts) => ({
  ...baseConfig(opts),
  entry: ["ts/exports/internal.ts", "ts/bin/gas-report.ts"],
}));
