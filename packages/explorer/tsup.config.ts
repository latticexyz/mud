import { defineConfig } from "tsup";

export default defineConfig({
  tsconfig: "tsup.tsconfig.json",
  entry: ["src/bin/explorer.ts", "src/exports/monitor.ts"],
  target: "esnext",
  format: ["esm"],
  dts: !process.env.TSUP_SKIP_DTS,
  sourcemap: true,
  clean: true,
  minify: false,
});
