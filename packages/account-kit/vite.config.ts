import { defineConfig } from "vite";

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
  },
});
