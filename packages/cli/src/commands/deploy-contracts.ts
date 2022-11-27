import type { Arguments, CommandBuilder } from "yargs";
import { execLog } from "../utils";
import { rmSync } from "fs";
import { constants, Wallet } from "ethers";

// Workaround to prevent tsc to transpile dynamic imports with require, which causes an error upstream
// https://github.com/microsoft/TypeScript/issues/43329#issuecomment-922544562
const importChalk = eval('import("chalk")') as Promise<typeof import("chalk")>;

type Options = {
  config: string;
  deployerPrivateKey?: string;
  worldAddress?: string;
  rpc: string;
  upgradeSystem?: string;
};

export const command = "deploy-contracts";
export const desc = "Deploy mud contracts";
const contractsDir = __dirname + "/../../src/contracts";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    config: { type: "string", default: "./deploy.json", desc: "Component and system deployment configuration" },
    deployerPrivateKey: { type: "string", desc: "Deployer private key. If omitted, deployment is not broadcasted." },
    worldAddress: { type: "string", desc: "World address to deploy to. If omitted, a new World is deployed." },
    rpc: { type: "string", default: "http://localhost:8545", desc: "RPC URL of the network to deploy to." },
    upgradeSystem: { type: "string", desc: "Only upgrade the given system. Requires World address." },
  });

export const handler = async (args: Arguments<Options>): Promise<void> => {
  const { default: chalk } = await importChalk;

  if (args.upgradeSystem != null && !args.worldAddress) {
    console.error("Error: Upgrading systems requires a World address.");
    process.exit(1);
  }

  if (args.upgradeSystem) {
    console.log("Upgrading ", args.upgradeSystem);
    console.log("World address", args.worldAddress);
  }

  try {
    // Generate LibDeploy
    await execLog("yarn", [
      "mud",
      "codegen-libdeploy",
      "--config",
      args.config,
      "--out",
      contractsDir,
      ...(args.upgradeSystem ? ["--onlySystem", args.upgradeSystem] : []),
    ]);

    // Call deploy script
    console.log("Call deployment script");
    const address = args.deployerPrivateKey ? new Wallet(args.deployerPrivateKey).address : constants.AddressZero;
    console.log(chalk.red(`>> Deployer address: ${chalk.bgYellow.black.bold(" " + address + " ")} <<`));

    await execLog("forge", [
      "script",
      contractsDir + "/Deploy.sol",
      "--target-contract",
      "Deploy",
      "-vvv",
      ...(!args.deployerPrivateKey ? [] : ["--broadcast", "--private-keys", args.deployerPrivateKey]),
      "--sig",
      "broadcastDeploy(address,address,bool)",
      address, // Deployer
      args.worldAddress || constants.AddressZero, // World address (0 = deploy a new world)
      args.upgradeSystem ? "true" : "false", // Reuse components?
      "--fork-url",
      args.rpc,
    ]);
  } catch (e) {
    console.error(e);
  } finally {
    // Remove generated LibDeploy
    console.log("Cleaning up deployment script");
    rmSync(contractsDir + "/LibDeploy.sol");
  }

  process.exit(0);
};
