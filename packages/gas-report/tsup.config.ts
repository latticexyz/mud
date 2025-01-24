import { defineConfig } from "tsup";

export default defineConfig((opts) => ({
  entry: ["ts/exports/internal.ts", "ts/bin/gas-report.ts"],
  target: "esnext",
  format: ["esm"],
  sourcemap: true,
  minify: true,
  // don't generate DTS during watch mode because it's slow
  // we're likely using TS source in this mode anyway
  dts: !opts.watch,
  // don't clean during watch mode to avoid removing
  // previously-built DTS files, which other build tasks
  // depend on
  clean: !opts.watch,
}));
