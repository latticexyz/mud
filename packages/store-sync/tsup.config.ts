import { defineConfig } from "tsup";
import { baseConfig } from "../../tsup.config.base";

export default defineConfig((opts) => ({
  ...baseConfig(opts),
  entry: [
    "src/index.ts",
    "src/sqlite/index.ts",
    "src/postgres/index.ts",
    "src/postgres-decoded/index.ts",
    "src/recs/index.ts",
    "src/trpc-indexer/index.ts",
    "src/indexer-client/index.ts",
    "src/world/index.ts",
    "src/zustand/index.ts",
    "src/exports/internal.ts",
    "src/exports/react.ts",
  ],
}));
