import { defineConfig } from "tsup";
import glob from "glob";
import { readFileSync } from "node:fs";
import path from "node:path";
import { MudPackages } from "./src/common";

const mudWorkspace = path.normalize(`${__dirname}/../..`);

const mudPackages: MudPackages = Object.fromEntries(
  glob
    .sync(path.join(mudWorkspace, `packages/*/package.json`))
    .map((filename) => [
      path.relative(mudWorkspace, path.dirname(filename)),
      JSON.parse(readFileSync(filename, "utf8")),
    ])
    .filter(([, packageJson]) => !packageJson.private)
    .map(([localPath, packageJson]) => [packageJson.name, { localPath }])
);

export default defineConfig({
  entry: ["src/index.ts", "src/mud.ts"],
  target: "esnext",
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: true,
  env: {
    MUD_PACKAGES: JSON.stringify(mudPackages),
  },
});
