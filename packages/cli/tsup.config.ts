import { defineConfig } from "tsup";
import { globSync } from "glob";
import { readFileSync } from "node:fs";
import path from "node:path";
import { MudPackages } from "./src/common";
import { baseConfig } from "../../tsup.config.base";

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
  ...baseConfig(opts),
  entry: ["src/index.ts", "src/mud.ts"],
  env: {
    MUD_PACKAGES: JSON.stringify(mudPackages),
  },
}));
