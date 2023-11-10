import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "postgres-frontend": "bin/postgres-frontend.ts",
    "postgres-indexer": "bin/postgres-indexer.ts",
    "sqlite-indexer": "bin/sqlite-indexer.ts",
  },
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true,
  platform: "node",
  noExternal: [/(.*)/],
  splitting: false,
  banner: {
    js: `
      // BANNER START
      const require = (await import("node:module")).createRequire(import.meta.url);
      const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
      const __dirname = (await import("node:path")).dirname(__filename);
      // BANNER END
    `,
  },
});
