import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

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
  plugins: [react(), !process.env.TSUP_SKIP_DTS ? dts() : undefined],
});
