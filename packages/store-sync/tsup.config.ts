import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/sqlite/index.ts",
    "src/postgres/index.ts",
    "src/postgres-decoded/index.ts",
    "src/recs/index.ts",
    "src/trpc-indexer/index.ts",
    "src/indexer-client/index.ts",
    "src/zustand/index.ts",
  ],
  target: "esnext",
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
});
