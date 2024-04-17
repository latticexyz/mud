import { existsSync } from "fs";
import { $, execa } from "execa";
import config from "./altoV1.localhost.json" assert { type: "json" };
import { join } from "path";

export async function alto() {
  // process.argv[1] is the path to the currently executing script
  const nodeModulesPath = (await $`pnpm root`).stdout;
  const altoPath = join(nodeModulesPath, "@pimlicolabs/alto");
  const altoCliPath = join(altoPath, "src/lib/cli/alto.js");

  if (!existsSync(altoPath)) {
    console.log("Alto not found. Is `@pimlicolabs/alto` installed?");
    return;
  }

  console.log("Installing alto dependencies.");
  const result = await $({ cwd: altoPath })`pnpm install`;
  if (result.failed) {
    console.log(result.stderr);
  }

  // TODO: remove this once alto is in npm and has this binary prebuilt
  if (!existsSync(altoCliPath)) {
    console.log("Building alto.");
    const result = await $({ cwd: altoPath })`pnpm build`;
    if (result.failed) {
      console.log(result.stderr);
    }

    if (!existsSync(altoCliPath)) {
      console.error("Building alto failed.");
      return;
    }
  }

  // Pass user provided arguments, or use default arguments
  const args = process.argv[2]
    ? process.argv.slice(2)
    : Object.entries(config).flatMap(([option, value]) => [`--${option}`, `${value}`]);

  console.log("Starting alto with arguments:", args.join(" "));
  try {
    await execa("pnpm", ["start", ...args], {
      cwd: altoPath,
      stdio: "inherit",
    });
  } catch (e) {
    console.error("Alto failed.", e);
  }
}
