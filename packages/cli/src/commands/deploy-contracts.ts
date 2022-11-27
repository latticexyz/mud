import type { Arguments, CommandBuilder } from "yargs";
import { deploy, findLog, generateLibDeploy, hsr } from "../utils";
import { rmSync } from "fs";

type Options = {
  config: string;
  deployerPrivateKey?: string;
  worldAddress?: string;
  rpc: string;
  systems?: string | string[];
  watchSystems?: boolean;
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
    systems: { type: "string", desc: "Only upgrade the given systems. Requires World address." },
    watchSystems: { type: "boolean", desc: "Automatically redeploy changed systems" },
  });

export const handler = async (args: Arguments<Options>): Promise<void> => {
  if (args.system != null && !args.worldAddress) {
    console.error("Error: Upgrading systems requires a World address.");
    process.exit(1);
  }

  // Deploy world, components and systems
  const worldAddress = await generateAndDeploy(args);
  console.log("World deployed at", worldAddress);

  // Set up watcher for system files to redeploy on change
  if (args.watchSystems) {
    const { config, deployerPrivateKey, rpc } = args;
    hsr("./src", (systems: string[]) => {
      return generateAndDeploy({
        config,
        deployerPrivateKey,
        worldAddress,
        rpc,
        systems,
      });
    });
  } else {
    process.exit(0);
  }
};

async function generateAndDeploy(args: Options) {
  let libDeployPath: string | undefined;
  let deployedWorldAddress: string | undefined;

  try {
    // Generate LibDeploy
    libDeployPath = await generateLibDeploy(args.config, contractsDir, args.systems);

    // Call deploy script
    const child = await deploy(args.deployerPrivateKey, args.rpc, args.worldAddress, Boolean(args.systems));

    // Extract world address from deploy script
    const lines = child.stdout.split("\n");
    deployedWorldAddress = findLog(lines, "world: address");
  } catch (e) {
    console.error(e);
  } finally {
    // Remove generated LibDeploy
    console.log("Cleaning up deployment script");
    if (libDeployPath) rmSync(libDeployPath);
  }

  return deployedWorldAddress;
}
