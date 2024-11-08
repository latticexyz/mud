import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    headers: {
      "Permissions-Policy": "publickey-credentials-get=*, publickey-credentials-create=*",
    },
  },
});
