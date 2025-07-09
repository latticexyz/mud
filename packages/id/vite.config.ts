import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5155,
    // headers: {
    //   "Permissions-Policy": "publickey-credentials-get=*, publickey-credentials-create=*",
    // },
  },
});
