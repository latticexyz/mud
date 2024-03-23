import { defineConfig } from "vite";
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    fs: {
      strict: false,
    },
  },
  build: {
    target: "es2022",
    minify: true,
    sourcemap: true,
  },
});
