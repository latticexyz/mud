import { Options, defineConfig } from "tsup";

export default defineConfig((opts) => {
  const commonConfig: Options = {
    target: "esnext",
    format: ["esm"],
    sourcemap: true,
    minify: true,
    loader: { ".css": "text" },
    // don't generate DTS during watch mode because it's slow
    // we're likely using TS source in this mode anyway
    dts: !opts.watch,
    // don't clean during watch mode to avoid removing
    // previously-built DTS files, which other build tasks
    // depend on
    clean: !opts.watch,

    // Because we're injecting CSS via shadow DOM, we'll disable style injection and load CSS as a base64 string.
    // TODO: figure out how to do this conditionally for only specific imports?
    injectStyle: false,
  };

  return [
    {
      ...commonConfig,
      entry: ["src/exports/index.ts", "src/exports/internal.ts", "src/bin/deploy-local-prereqs.ts"],
    },
    {
      ...commonConfig,
      entry: ["src/exports/vanilla.ts"],
      noExternal: ["react", "react-dom", "@tanstack/react-query"],
    },
  ];
});
