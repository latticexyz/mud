import { existsSync } from "fs";
import { $, execa } from "execa";
import { join, dirname } from "path";
import { deployerClient, devPrivateKey } from "./deployLocal";
import worlds from "@latticexyz/gas-tank/worlds.json" assert { type: "json" };

const accountKitPath = join(dirname(process.argv[1]), "..");
const gasTankPath = join(accountKitPath, "node_modules/@latticexyz/gas-tank");

export async function deployGasTank() {
  const expectedAddress = worlds[31337]?.address;
  console.log(`Checking for GasTank at ${expectedAddress}.`);
  if (expectedAddress) {
    const bytecodeBefore = await deployerClient.getBytecode({
      address: expectedAddress,
    });
    if (bytecodeBefore && bytecodeBefore !== "0x") {
      console.log(`Found GasTank at ${expectedAddress}, skipping deployment.`);
      return;
    }
  }

  if (!existsSync(gasTankPath)) {
    console.log("Installing GasTank Paymaster.");
    const result = await $({ cwd: accountKitPath })`pnpm install`;
    if (result.failed) {
      console.log(result.stderr);
    }

    if (!existsSync(gasTankPath)) {
      console.log("GasTank not found. Is `@latticexyz/gas-tank` installed?");
      return;
    }
  }

  console.log("Installing GasTank Paymaster dependencies.");
  const result = await $({ cwd: gasTankPath })`pnpm install`;
  if (result.failed) {
    console.log(result.stderr);
  }

  console.log("Deploying GasTank Paymaster.");
  try {
    await execa("pnpm", ["deploy:local"], {
      cwd: gasTankPath,
      stdio: "inherit",
      env: {
        PRIVATE_KEY: devPrivateKey,
      },
    });
  } catch (e) {
    console.error("Deploying GasTank Paymaster failed.", e);
  }
}
