import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    faucet: "ts/faucet/index.ts",
  },
  target: "esnext",
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
});
