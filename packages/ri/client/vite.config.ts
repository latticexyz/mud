import { defineConfig } from "vite";
import GlobalPolyFill from "@esbuild-plugins/node-globals-polyfill";
import ModulesPolyFill from "@esbuild-plugins/node-modules-polyfill";

export default defineConfig({
  root: "src",
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
      define: {
        global: "globalThis",
      },
      plugins: [
        GlobalPolyFill({
          process: true,
          buffer: true,
        }),
        ModulesPolyFill({}),
      ],
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: true,
    assetsInlineLimit: 0,
    target: "es2020",
  },
  preview: {
    port: 3000,
  },
  resolve: {
    dedupe: ["proxy-deep"],
    alias: {
      util: "rollup-plugin-node-polyfills/polyfills/util",
    },
  },
});
