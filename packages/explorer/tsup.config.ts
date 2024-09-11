import { defineConfig } from "tsup";

export default defineConfig({
  tsconfig: "tsconfig.tsup.json",
  entry: ["src/bin/explorer.ts", "src/exports/observer.ts"],
  target: "esnext",
  format: ["esm"],
  dts: !process.env.TSUP_SKIP_DTS,
  sourcemap: true,
  clean: true,
  minify: false,
});
