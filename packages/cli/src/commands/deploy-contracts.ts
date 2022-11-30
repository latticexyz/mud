import type { Arguments, CommandBuilder } from "yargs";
import { DeployOptions, generateAndDeploy, hsr } from "../utils";

type Options = DeployOptions & {
  watch?: boolean;
  dev?: boolean;
};

export const command = "deploy-contracts";
export const desc = "Deploy mud contracts";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    config: { type: "string", default: "./deploy.json", desc: "Component and system deployment configuration" },
    deployerPrivateKey: { type: "string", desc: "Deployer private key. If omitted, deployment is not broadcasted." },
    worldAddress: { type: "string", desc: "World address to deploy to. If omitted, a new World is deployed." },
    rpc: { type: "string", default: "http://localhost:8545", desc: "RPC URL of the network to deploy to." },
    systems: { type: "string", desc: "Only upgrade the given systems. Requires World address." },
    watch: { type: "boolean", desc: "Automatically redeploy changed systems" },
    dev: { type: "boolean", desc: "Automatically use funded dev private key for local development" },
  });

export const handler = async (args: Arguments<Options>): Promise<void> => {
  if (args.system != null && !args.worldAddress) {
    console.error("Error: Upgrading systems requires a World address.");
    process.exit(1);
  }

  const deployerPrivateKey =
    args.deployerPrivateKey ?? args.dev
      ? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" // Default anvil private key
      : undefined;

  // Deploy world, components and systems
  const { deployedWorldAddress: worldAddress, initialBlockNumber } = await generateAndDeploy({
    ...args,
    deployerPrivateKey,
    clear: true,
  });
  console.log("World deployed at", worldAddress, "at block", initialBlockNumber);

  // Set up watcher for system files to redeploy on change
  if (args.watch) {
    const { config, rpc } = args;

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
