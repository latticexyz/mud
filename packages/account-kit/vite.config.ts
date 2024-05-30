import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/embed",
    sourcemap: true,
    lib: {
      entry: "src/embed/global.ts",
      name: "__AccountKit",
      fileName: "embed",
      formats: ["iife"],
    },
  },
  define: {
    "process.env": {},
  },
});
