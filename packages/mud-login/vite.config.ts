import { defineConfig } from "vite";

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
      // TODO: move these to peer deps
      external: ["react", "react-dom", "wagmi", "viem", "@rainbow-me/rainbowkit", "@tanstack/react-query"],
    },
  },
});
