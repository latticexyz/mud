import { defineConfig } from "tsup";
import packageJson from "./package.json";

export default defineConfig([
  {
    entry: {
      index: "src/exports/index.ts",
      internal: "src/exports/internal.ts",
      "bin/local-bundler": "cli/local-bundler.ts",
    },
    target: "esnext",
    format: ["esm"],
    dts: false, // TODO: figure out how to reenable
    sourcemap: true,
    clean: true,
    minify: true,
    // Because we're injecting CSS via shadow DOM, we'll disable style injection and load CSS as a base64 string.
    // TODO: figure out how to do this conditionally for only specific imports?
    injectStyle: false,
    loader: {
      ".css": "text",
    },
  },
  {
    entry: {
      bundle: "src/exports/bundle.ts",
    },
    target: "esnext",
    format: ["esm"],
    dts: false, // TODO: figure out how to reenable
    sourcemap: true,
    clean: true,
    minify: true,
    // Because we're injecting CSS via shadow DOM, we'll disable style injection and load CSS as a base64 string.
    // TODO: figure out how to do this conditionally for only specific imports?
    injectStyle: false,
    loader: {
      ".css": "text",
    },
    // don't code split otherwise dep imports in bundle seem to break
    splitting: false,
    noExternal: Object.keys(packageJson.dependencies),
  },
]);
