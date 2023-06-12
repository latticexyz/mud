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
  build: {
    target: "es2022",
    // TODO: enable minify/sourcemaps once we can do this in CI without OOM errors
    // minify: true,
    // sourcemap: true,
  },
});
