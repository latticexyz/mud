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
      target: "es2020",
    },
    exclude: ["@latticexyz/network"],
    include: [
      "proxy-deep",
      "ethers/lib/utils",
      "bn.js",
      "js-sha3",
      "hash.js",
      "bech32",
      "long",
      "protobufjs/minimal",
      "debug",
      "is-observable",
      "nice-grpc-web",
      "@improbable-eng/grpc-web",
    ],
  },
});
