import type { CommandModule, InferredOptionTypes } from "yargs";
import { getRpcUrl } from "@latticexyz/common/foundry";
import { Address, createClient, http } from "viem";
import chalk from "chalk";
import { pull } from "../pull/pull";

const options = {
  worldAddress: { type: "string", required: true, desc: "World address" },
  profile: { type: "string", desc: "The foundry profile to use" },
  rpc: { type: "string", desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml" },
  rpcBatch: {
    type: "boolean",
    desc: "Enable batch processing of RPC requests in viem client (defaults to batch size of 100 and wait of 1s)",
  },
} as const;

type Options = InferredOptionTypes<typeof options>;

const commandModule: CommandModule<Options, Options> = {
  command: "pull",

  describe: "Pull mud.config.ts and interfaces from an existing world.",

  builder(yargs) {
    return yargs.options(options);
  },

  async handler(opts) {
    const profile = opts.profile ?? process.env.FOUNDRY_PROFILE;
    const rpc = opts.rpc ?? (await getRpcUrl(profile));
    const client = createClient({
      transport: http(rpc, {
        batch: opts.rpcBatch
          ? {
              batchSize: 100,
              wait: 1000,
            }
          : undefined,
      }),
    });

    console.log(chalk.bgBlue(chalk.whiteBright(`\n Pulling MUD config from world at ${opts.worldAddress} \n`)));

    await pull({ rootDir: process.cwd(), client, worldAddress: opts.worldAddress as Address });
  },
};

export default commandModule;
