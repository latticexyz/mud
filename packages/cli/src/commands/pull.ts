import type { CommandModule, InferredOptionTypes } from "yargs";
import { getRpcUrl } from "@latticexyz/common/foundry";
import { Address, createClient, http } from "viem";
import chalk from "chalk";
import { WriteFileExistsError, pull } from "../pull/pull";
import path from "node:path";
import { build } from "../build";
import { getChainId } from "viem/actions";
import { defaultChains } from "../defaultChains";

const options = {
  worldAddress: { type: "string", required: true, desc: "Remote world address" },
  profile: { type: "string", desc: "The foundry profile to use" },
  rpc: { type: "string", desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml" },
  rpcBatch: {
    type: "boolean",
    desc: "Enable batch processing of RPC requests in viem client (defaults to batch size of 100 and wait of 1s)",
  },
  replace: {
    type: "boolean",
    desc: "Replace existing files and directories with data from remote world.",
  },
  indexerUrl: {
    type: "string",
    desc: "The indexer URL to pull from.",
    required: false,
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
    const rpc = opts.rpc ?? (await getRpcUrl({ profile }));
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
    const chainId = await getChainId(client);
    const indexerUrl = opts.indexerUrl ?? defaultChains.find((chain) => chain.id === chainId)?.indexerUrl;

    console.log(chalk.bgBlue(chalk.whiteBright(`\n Pulling MUD config from world at ${opts.worldAddress} \n`)));
    const rootDir = process.cwd();

    try {
      const { config } = await pull({
        rootDir,
        client,
        worldAddress: opts.worldAddress as Address,
        indexerUrl,
        chainId,
        replace: opts.replace,
      });
      await build({ rootDir, config, foundryProfile: profile });
    } catch (error) {
      if (error instanceof WriteFileExistsError) {
        console.log();
        console.log(chalk.bgRed(chalk.whiteBright(" Error ")));
        console.log(`  Attempted to write file at "${path.relative(rootDir, error.filename)}", but it already exists.`);
        console.log();
        console.log("  To overwrite files, use `--replace` when running this command.");
        console.log();
        return;
      }
      throw error;
    }
  },
};

export default commandModule;
