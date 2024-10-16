import { defineConfig } from "tsup";
// import packageJson from "./package.json";

export default defineConfig((opts) => ({
  outDir: "dist/tsup",
  entry: {
    index: "src/exports/index.ts",
    internal: "src/exports/internal.ts",
  },
  target: "esnext",
  format: ["esm"],
  sourcemap: true,
  minify: true,
  // Because we're injecting CSS via shadow DOM, we'll disable style injection and load CSS as a base64 string.
  // TODO: figure out how to do this conditionally for only specific imports?
  injectStyle: false,
  loader: { ".css": "text" },
  // don't generate DTS during watch mode because it's slow
  // we're likely using TS source in this mode anyway
  dts: !opts.watch,
  // don't clean during watch mode to avoid removing
  // previously-built DTS files, which other build tasks
  // depend on
  clean: !opts.watch,
}));
