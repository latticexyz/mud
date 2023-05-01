import type { CommandModule } from "yargs";
import { DeployOptions, generateAndDeploy, hsr } from "../../utils/deprecated";
import openurl from "openurl";
import chalk from "chalk";
import { getSrcDirectory } from "@latticexyz/common/foundry";

type Options = DeployOptions & {
  watch?: boolean;
  dev?: boolean;
  openUrl?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "deploy-contracts",

  describe: "Deploy mud contracts",

  builder(yargs) {
    return yargs.options({
      config: { type: "string", default: "./deploy.json", desc: "Component and system deployment configuration" },
      deployerPrivateKey: { type: "string", desc: "Deployer private key. If omitted, deployment is not broadcasted." },
      worldAddress: { type: "string", desc: "World address to deploy to. If omitted, a new World is deployed." },
      rpc: { type: "string", default: "http://localhost:8545", desc: "RPC URL of the network to deploy to." },
      systems: { type: "string", desc: "Only upgrade the given systems. Requires World address." },
      reuseComponents: { type: "boolean", desc: "Skip deploying components and initialization." },
      watch: { type: "boolean", desc: "Automatically redeploy changed systems" },
      dev: { type: "boolean", desc: "Automatically use funded dev private key for local development" },
      openUrl: {
        type: "string",
        desc: "Opens a browser at the provided url with the worldAddress url param prefilled",
      },
      gasPrice: { type: "number", desc: "Gas price to set for deploy transactions" },
    });
  },

  async handler({
    config,
    deployerPrivateKey,
    worldAddress,
    rpc,
    systems,
    reuseComponents,
    watch,
    dev,
    openUrl,
    gasPrice,
  }) {
    if (systems != null && !worldAddress) {
      console.error("Error: Upgrading systems requires a World address.");
      process.exit(1);
    }

    deployerPrivateKey =
      deployerPrivateKey ??
      (dev
        ? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" // Default anvil private key
        : undefined);

    // Deploy world, components and systems
    let genDeployResult: Awaited<ReturnType<typeof generateAndDeploy>>;
    try {
      genDeployResult = await generateAndDeploy({
        config,
        deployerPrivateKey,
        worldAddress,
        rpc,
        systems,
        reuseComponents,
        clear: true,
        gasPrice,
      });
    } catch (e: any) {
      if (!e.stderr) {
        // log error if it wasn't piped
        console.log(e);
      }
      console.log(chalk.red("\n-----------\nError during generateAndDeploy (see above)"));
      process.exit();
    }
    const { deployedWorldAddress, initialBlockNumber } = genDeployResult;
    console.log("World deployed at", worldAddress, "at block", initialBlockNumber);

    if (deployedWorldAddress && openUrl) {
      const url = new URL(openUrl);
      url.searchParams.set("worldAddress", deployedWorldAddress);
      console.log("");
      console.log(chalk.cyan("Opening client URL to", url.toString()));
      console.log("");
      openurl.open(url.toString());
    }

    // Set up watcher for system files to redeploy on change
    if (watch) {
      const srcDir = await getSrcDirectory();
      hsr(srcDir, async (systems: string[]) => {
        try {
          return await generateAndDeploy({
            config,
            deployerPrivateKey,
            worldAddress,
            rpc,
            systems,
            gasPrice,
            reuseComponents: true,
          });
        } catch (e: any) {
          if (!e.stderr) {
            // log error if it wasn't piped
            console.log(e);
          }
          console.log(chalk.red("\n-----------\nError during generateAndDeploy in HSR (see above)"));
        }
      });
    } else {
      process.exit(0);
    }
  },
};

export default commandModule;
