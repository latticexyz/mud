import type { CommandModule, Options } from "yargs";
import { logError } from "../utils/errors";
import { DeployOptions } from "../utils";

export const yDeployOptions = {
  configPath: { type: "string", desc: "Path to the config file" },
  clean: { type: "boolean", desc: "Remove the build forge artifacts and cache directories before building" },
  printConfig: { type: "boolean", desc: "Print the resolved config" },
  profile: { type: "string", desc: "The foundry profile to use" },
  debug: { type: "boolean", desc: "Print debug logs, like full error messages" },
  priorityFeeMultiplier: {
    type: "number",
    desc: "Multiply the estimated priority fee by the provided factor",
    default: 1,
  },
  saveDeployment: { type: "boolean", desc: "Save the deployment info to a file", default: true },
  rpc: { type: "string", desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml" },
  worldAddress: { type: "string", desc: "Deploy to an existing World at the given address" },
  srcDir: { type: "string", desc: "Source directory. Defaults to foundry src directory." },
  disableTxWait: { type: "boolean", desc: "Disable waiting for transactions to be confirmed.", default: false },
  pollInterval: {
    type: "number",
    desc: "Interval in miliseconds to use to poll for transaction receipts / block inclusion",
    default: 1000,
  },
} satisfies Record<keyof DeployOptions, Options>;

export async function deployHandler(args: Parameters<(typeof commandModule)["handler"]>[0]) {
  try {
    deployHandler(args);
  } catch (error: any) {
    logError(error);
    process.exit(1);
  }
}

const commandModule: CommandModule<DeployOptions, DeployOptions> = {
  command: "deploy",

  describe: "Deploy MUD contracts",

  builder(yargs) {
    return yargs.options(yDeployOptions);
  },

  async handler(args) {
    await deployHandler(args);
    process.exit(0);
  },
};

export default commandModule;
