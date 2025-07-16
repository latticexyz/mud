import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5155,
    // headers: {
    //   "Permissions-Policy": "publickey-credentials-get=*, publickey-credentials-create=*",
    // },
  },
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        embed: "embed/index.html",
      },
    },
  },
});
