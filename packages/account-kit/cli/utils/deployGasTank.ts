import { existsSync, readFileSync } from "fs";
import { $, execa } from "execa";
import { join } from "path";
import { deployerClient, devPrivateKey } from "./deployLocal";
import worlds from "@latticexyz/gas-tank/worlds.json" assert { type: "json" };

export async function deployGasTank() {
  // process.argv[1] is the path to the currently executing script
  const nodeModulesPath = (await $`pnpm root`).stdout;
  const gasTankPath = join(nodeModulesPath, "@latticexyz/gas-tank");

  if (!existsSync(gasTankPath)) {
    console.log("GasTank not found. Is `@latticexyz/gas-tank` installed?");
    return;
  }

  console.log("Installing gas-tank dependencies.");
  // This is a horrible workaround for making this script work both when MUD is locally linked
  // and when `account-kit` is installed from npm.
  // TODO: expose a bundled bin from `gas-tank` to deploy the gas tank contract.
  const packageJson = readFileSync(join(gasTankPath, "package.json"));
  const packageManager = packageJson.includes("workspace:*") ? "pnpm" : "npm";
  const result = await $({ cwd: gasTankPath })`${packageManager} install`;
  if (result.failed) {
    console.log(result.stderr);
  }

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

  console.log("Deploying GasTank Paymaster.");
  try {
    await execa("npm", ["run", "deploy:local"], {
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
