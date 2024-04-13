import { existsSync } from "fs";
import { $, execa } from "execa";
import config from "./config.localhost.json" assert { type: "json" };
import { join, dirname } from "path";

const accountKitPath = join(dirname(process.argv[1]), "..");
const altoPath = join(accountKitPath, "node_modules/@pimlicolabs/alto");
const altoCliPath = join(altoPath, "src/lib/cli/alto.js");

export async function alto() {
  if (!existsSync(altoPath)) {
    console.log("Installing alto.");
    const result = await $({ cwd: accountKitPath })`pnpm install`;
    if (result.failed) {
      console.log(result.stderr);
    }

    if (!existsSync(altoPath)) {
      console.log("Alto not found. Is `@pimlicolabs/alto` installed?");
    }
  }

  if (!existsSync(altoCliPath)) {
    console.log("Installing alto dependencies.");
    let result = await $({ cwd: altoPath })`pnpm install`;
    if (result.failed) {
      console.log(result.stderr);
    }

    console.log("Building alto.");
    result = await $({ cwd: altoPath })`pnpm build`;
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
      stdout: process.stdout,
      stderr: process.stderr,
    });
  } catch (e) {
    console.error("Alto failed.", e);
  }
}
