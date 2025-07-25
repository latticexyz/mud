import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5155,
  },
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        popup: "popup/index.html",
      },
    },
  },
});
