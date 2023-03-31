import type { CommandModule } from "yargs";
import { deployHandler, DeployOptions } from "./deploy-v2.js";
import { yDeployOptions } from "./deploy-v2.js";
import { anvil } from "../utils/foundry.js";
import chalk from "chalk";

type Options = DeployOptions & { port?: number; forkUrl?: string; worldAddress?: string };

const commandModule: CommandModule<Options, Options> = {
  command: "test-v2",

  describe: "Run tests in MUD v2 contracts",

  builder(yargs) {
    return yargs.options({
      ...yDeployOptions,
      port: { type: "number", description: "Port to run internal node for fork testing on", default: 4242 },
      forkUrl: { type: "string", description: "Run tests by forking from a node" },
      worldAddress: {
        type: "string",
        description: "Address of an existing world contract. If provided, deployment is skipped.",
      },
    });
  },

  async handler(args) {
    const anvilArgs = ["--block-base-fee-per-gas", "0"];
    if (args.port) anvilArgs.push("--port", String(args.port));
    if (args.forkUrl) anvilArgs.push("--fork-url", args.forkUrl);

    anvil(anvilArgs);

    const worldAddress =
      args.worldAddress ??
      (
        await deployHandler({
          ...args,
          saveDeployment: false,
          rpc: args.port ? `http://127.0.0.1:${args.port}` : undefined,
        })
      ).worldAddress;

    console.log(chalk.blue("World address", worldAddress));

    process.exit(0);
  },
};

export default commandModule;
