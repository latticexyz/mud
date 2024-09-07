import { defineConfig } from "tsup";
import { globSync } from "glob";
import { readFileSync } from "node:fs";
import path from "node:path/posix";
import { MudPackages } from "./src/common";

const mudWorkspace = path.normalize(`${__dirname}/../..`);

const mudPackages: MudPackages = Object.fromEntries(
  globSync(path.join(mudWorkspace, `packages/*/package.json`), { posix: true })
    .sort()
    .map((filename) => [
      path.relative(mudWorkspace, path.dirname(filename)),
      JSON.parse(readFileSync(filename, "utf8")),
    ])
    .filter(([, packageJson]) => !packageJson.private)
    .map(([localPath, packageJson]) => [packageJson.name, { localPath }]),
);

export default defineConfig({
  entry: ["src/index.ts", "src/mud.ts"],
  target: "esnext",
  format: ["esm"],
  dts: !process.env.TSUP_SKIP_DTS,
  sourcemap: true,
  clean: true,
  minify: true,
  env: {
    MUD_PACKAGES: JSON.stringify(mudPackages),
  },
});
