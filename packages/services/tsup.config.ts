import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    faucet: "ts/faucet/index.ts",
  },
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
});
