import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

import packageJson from "./package.json";

const deps = Object.keys(packageJson.dependencies);

export default defineConfig({
  build: {
    outDir: "dist/vite",
    sourcemap: true,
    lib: {
      entry: "src/exports/bundle.ts",
      name: "MUD Account Kit",
      fileName: "bundle",
      // TODO: more formats?
      formats: ["es"],
    },
    rollupOptions: {
      // TODO: move these to peer deps?
      external: [...deps, "vite-plugin-node-polyfills/shims/global"],
    },
  },
  plugins: [nodePolyfills({ include: ["events"] })],
});
