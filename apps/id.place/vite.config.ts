import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
