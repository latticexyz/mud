import { defineConfig } from "tsup";
import { baseConfig } from "../../tsup.config.base";
// import packageJson from "./package.json";

export default defineConfig((opts) => ({
  ...baseConfig(opts),
  outDir: "dist/tsup",
  entry: ["src/exports/index.ts", "src/exports/internal.ts", "src/bin/deploy.ts"],
  // Because we're injecting CSS via shadow DOM, we'll disable style injection and load CSS as a base64 string.
  // TODO: figure out how to do this conditionally for only specific imports?
  injectStyle: false,
  loader: { ".css": "text" },
}));
