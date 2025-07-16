import { defineConfig } from "tsup";
import { baseConfig } from "../../tsup.config.base";

export default defineConfig((opts) => ({
  ...baseConfig(opts),
  entry: [
    "src/index.ts",
    "src/bin/postgres-frontend.ts",
    "src/bin/postgres-indexer.ts",
    "src/bin/postgres-decoded-indexer.ts",
    "src/bin/sqlite-indexer.ts",
  ],
}));
