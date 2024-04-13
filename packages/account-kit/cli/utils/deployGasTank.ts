import { existsSync } from "fs";
import { $, execa } from "execa";
import { join, dirname } from "path";
import { devPrivateKey } from "./deployLocal";

const accountKitPath = join(dirname(process.argv[1]), "..");
const gasTankPath = join(accountKitPath, "node_modules/@latticexyz/gas-tank");

export async function deployGasTank() {
  if (!existsSync(gasTankPath)) {
    console.log("Installing GasTank Paymaster.");
    const result = await $({ cwd: accountKitPath })`pnpm install`;
    if (result.failed) {
      console.log(result.stderr);
    }

    if (!existsSync(gasTankPath)) {
      console.log("Alto not found. Is `@latticexyz/gas-tank` installed?");
    }
  }

  console.log("Deploying GasTank Paymaster.");
  try {
    await execa("pnpm", ["deploy:local"], {
      cwd: gasTankPath,
      stdio: "pipe",
      env: {
        PRIVATE_KEY: devPrivateKey,
      },
    });
  } catch (e) {
    console.error("Deploying GasTank Paymaster failed.", e);
  }
}
