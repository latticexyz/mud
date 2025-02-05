import { defineConfig } from "tsup";
import { baseConfig } from "../../tsup.config.base";

export default defineConfig((opts) => ({
  ...baseConfig(opts),
  tsconfig: "tsconfig.tsup.json",
  entry: ["src/bin/explorer.ts", "src/exports/observer.ts"],
}));
