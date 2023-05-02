import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    fs: {
      strict: false,
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2022",
    },
  },
  build: {
    rollupOptions: {
      // TODO: revisit this config after splitting out mud config dependencies
      // from the cli package so we don't need to bundle the cli package
      external: ["chalk", "locate-path", "path-exists", "find-up"],
    },
    target: "es2022",
  },
  define: {
    "process.env": {},
  },
});
