import { defineConfig } from "tsup";
import { globSync } from "glob";
import { readFileSync } from "node:fs";
import path from "node:path";
import { MudPackages } from "./src/common";

const mudWorkspace = path.normalize(`${__dirname}/../..`);

const mudPackages: MudPackages = Object.fromEntries(
  globSync(path.join(mudWorkspace, `packages/*/package.json`))
    .sort()
    .map((filename) => [
      path.relative(mudWorkspace, path.dirname(filename)),
      JSON.parse(readFileSync(filename, "utf8")),
    ])
    .filter(([, packageJson]) => !packageJson.private)
    .map(([localPath, packageJson]) => [packageJson.name, { localPath }]),
);

export default defineConfig((opts) => ({
  entry: ["src/index.ts", "src/mud.ts"],
  target: "esnext",
  format: ["esm"],
  sourcemap: true,
  minify: true,
  env: {
    MUD_PACKAGES: JSON.stringify(mudPackages),
  },
  // don't generate DTS during watch mode because it's slow
  // we're likely using TS source in this mode anyway
  dts: !opts.watch,
  // don't clean during watch mode to avoid removing
  // previously-built DTS files, which other build tasks
  // depend on
  clean: !opts.watch,
}));
