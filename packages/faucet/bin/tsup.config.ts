import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "faucet-server": "bin/faucet-server.ts",
  },
  outDir: "dist/bin",
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
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
