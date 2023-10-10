import type { CommandModule } from "yargs";
import { anvil, forge, getRpcUrl } from "@latticexyz/common/foundry";
import chalk from "chalk";
import { rmSync, writeFileSync } from "fs";
import { yDeployOptions } from "./deploy";
import { DeployOptions, deployHandler } from "../utils/deployHandler";

type Options = DeployOptions & { port?: number; worldAddress?: string; forgeOptions?: string };

const commandModule: CommandModule<Options, Options> = {
  command: "test",

  describe: "Run tests in MUD contracts",

  builder(yargs) {
    return yargs.options({
      ...yDeployOptions,
      port: { type: "number", description: "Port to run internal node for fork testing on", default: 4242 },
      worldAddress: {
        type: "string",
        description:
          "Address of an existing world contract. If provided, deployment is skipped and the RPC provided in the foundry.toml is used for fork testing.",
      },
      forgeOptions: { type: "string", description: "Options to pass to forge test" },
    });
  },

  async handler(args) {
    // Start an internal anvil process if no world address is provided
    if (!args.worldAddress) {
      const anvilArgs = ["--block-base-fee-per-gas", "0", "--port", String(args.port)];
      anvil(anvilArgs);
    }

    const forkRpc = args.worldAddress ? await getRpcUrl(args.profile) : `http://127.0.0.1:${args.port}`;

    const worldAddress =
      args.worldAddress ??
      (
        await deployHandler({
          ...args,
          saveDeployment: false,
          rpc: forkRpc,
        })
      ).worldAddress;

    console.log(chalk.blue("World address", worldAddress));

    const userOptions = args.forgeOptions?.replaceAll("\\", "").split(" ") ?? [];
    try {
      await forge(["test", "--fork-url", forkRpc, ...userOptions], {
        profile: args.profile,
        env: {
          WORLD_ADDRESS: worldAddress,
        },
      });
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  },
};

export default commandModule;
