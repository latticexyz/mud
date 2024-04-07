import { defineConfig } from "vite";
import packageJson from "./package.json";

const deps = Object.keys(packageJson.dependencies);

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: "src/exports/index.ts",
      name: "MUDLogin",
      fileName: "index",
      // TODO: more formats?
      formats: ["es"],
    },
    rollupOptions: {
      // TODO: move these to peer deps?
      external: deps,
    },
  },
});
