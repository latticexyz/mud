import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    target: "es2022",
    minify: true,
    sourcemap: true,
  },
});
