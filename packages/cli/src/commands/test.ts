import type { CommandModule, InferredOptionTypes, Options } from "yargs";
import { anvil, forge, getRpcUrl } from "@latticexyz/common/foundry";
import chalk from "chalk";
import { deployOptions, runDeploy } from "../runDeploy";

const testOptions = {
  ...deployOptions,
  port: { type: "number", description: "Port to run internal node for fork testing on", default: 4242 },
  worldAddress: {
    type: "string",
    description:
      "Address of an existing world contract. If provided, deployment is skipped and the RPC provided in the foundry.toml is used for fork testing.",
  },
  forgeOptions: { type: "string", description: "Options to pass to forge test" },
} as const satisfies Record<string, Options>;

type TestOptions = InferredOptionTypes<typeof testOptions>;

const commandModule: CommandModule<typeof testOptions, TestOptions> = {
  command: "test",

  describe: "Run tests in MUD contracts",

  builder(yargs) {
    return yargs.options(testOptions);
  },

  async handler(opts) {
    // Start an internal anvil process if no world address is provided
    if (!opts.worldAddress) {
      const anvilArgs = ["--block-base-fee-per-gas", "0", "--port", String(opts.port)];
      anvil(anvilArgs);
    }

    const forkRpc = opts.worldAddress ? await getRpcUrl(opts.profile) : `http://127.0.0.1:${opts.port}`;

    const worldAddress =
      opts.worldAddress ??
      (
        await runDeploy({
          ...opts,
          saveDeployment: false,
          rpc: forkRpc,
        })
      ).address;

    console.log(chalk.blue("World address", worldAddress));

    const userOptions = opts.forgeOptions?.replaceAll("\\", "").split(" ") ?? [];
    try {
      await forge(["test", "--fork-url", forkRpc, ...userOptions], {
        profile: opts.profile,
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
