import type { CommandModule, InferredOptionTypes } from "yargs";
import { createClient, getAddress, http } from "viem";
import chalk from "chalk";
import { getChainId } from "viem/actions";
import { defaultChains } from "../defaultChains";
import { mirror } from "../mirror/mirror";

const options = {
  rpcBatch: {
    type: "boolean",
    desc: "Enable batch processing of RPC requests via Viem client (defaults to batch size of 100 and wait of 1s).",
  },
  kms: {
    type: "boolean",
    desc: "Deploy the world with an AWS KMS key instead of local private key.",
  },
  fromWorld: {
    type: "string",
    desc: "Source world address to mirror from.",
    required: true,
  },
  fromRpc: {
    type: "string",
    desc: "RPC URL of source chain to mirror from.",
    required: true,
  },
  fromIndexer: {
    type: "string",
    desc: "MUD indexer URL of source chain to mirror from.",
  },
  toRpc: {
    type: "string",
    desc: "RPC URL of target chain to mirror to.",
    required: true,
  },
} as const;

type Options = InferredOptionTypes<typeof options>;

const commandModule: CommandModule<Options, Options> = {
  command: "mirror",

  describe: "Mirror an existing world and its data to another chain.",

  builder(yargs) {
    return yargs.options(options);
  },

  async handler(opts) {
    const fromWorld = getAddress(opts.fromWorld);
    const fromClient = createClient({
      transport: http(opts.fromRpc, {
        batch: opts.rpcBatch ? { batchSize: 100, wait: 1000 } : undefined,
      }),
    });
    const fromChainId = await getChainId(fromClient);
    const fromIndexer = opts.fromIndexer ?? defaultChains.find((chain) => chain.id === fromChainId)?.indexerUrl;

    const toClient = createClient({
      transport: http(opts.toRpc, {
        batch: opts.rpcBatch ? { batchSize: 100, wait: 1000 } : undefined,
      }),
    });
    const toChainId = await getChainId(toClient);

    console.log(
      chalk.bgBlue(
        chalk.whiteBright(
          `\n Mirroring MUD world at ${opts.fromWorld} from chain ${fromChainId} to chain ${toChainId} \n`,
        ),
      ),
    );

    // TODO: load up account from KMS or private key

    await mirror({
      from: { world: fromWorld, client: fromClient, indexer: fromIndexer },
      to: { client: toClient },
    });
  },
};

export default commandModule;
