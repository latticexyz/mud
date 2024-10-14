import { defineConfig } from "tsup";

export default defineConfig({
  outDir: "dist/tsup",
  entry: {
    index: "src/exports/index.ts",
    internal: "src/exports/internal.ts",
  },
  target: "esnext",
  format: ["esm"],
  dts: !process.env.TSUP_SKIP_DTS,
  sourcemap: true,
  clean: true,
  minify: true,
  // Because we're injecting CSS via shadow DOM, we'll disable style injection and load CSS as a base64 string.
  // TODO: figure out how to do this conditionally for only specific imports?
  injectStyle: false,
  loader: {
    ".css": "text",
  },
  external: ["react", "react-dom", "wagmi", "viem"],
});
