import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "bin/faucet-server.ts"],
  target: "esnext",
  format: ["esm"],
  dts: !process.env.TSUP_SKIP_DTS,
  sourcemap: true,
  clean: true,
  minify: true,
});
