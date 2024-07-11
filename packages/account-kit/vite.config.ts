import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/global",
    sourcemap: true,
    lib: {
      entry: "src/global/global.ts",
      name: "__AccountKit",
      fileName: "global",
      formats: ["iife"],
    },
  },
  define: {
    "process.env": {},
  },
});
