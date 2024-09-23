import { defineConfig } from "vite";
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
  plugins: [!process.env.TSUP_SKIP_DTS ? dts() : undefined],
});
