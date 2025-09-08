import type { CommandModule, InferredOptionTypes } from "yargs";
import { createClient, getAddress, http, isHex } from "viem";
import chalk from "chalk";
import { getChainId } from "viem/actions";
import { defaultChains } from "../defaultChains";
import { mirror } from "../mirror/mirror";
import { MUDError } from "@latticexyz/common/errors";
import { kmsKeyToAccount } from "@latticexyz/common/kms";
import { privateKeyToAccount } from "viem/accounts";

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
  fromBlock: {
    type: "number",
    desc: "Block number of source world deploy.",
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
    if (!fromIndexer) {
      throw new MUDError(`No \`--fromIndexer\` provided or indexer URL configured for chain ${fromChainId}.`);
    }

    const account = await (async () => {
      if (opts.kms) {
        const keyId = process.env.AWS_KMS_KEY_ID;
        if (!keyId) {
          throw new MUDError(
            "Missing `AWS_KMS_KEY_ID` environment variable. This is required when using with `--kms` option.",
          );
        }

        return await kmsKeyToAccount({ keyId });
      } else {
        const privateKey = process.env.PRIVATE_KEY;
        if (!isHex(privateKey)) {
          throw new MUDError(
            `Missing or invalid \`PRIVATE_KEY\` environment variable. To use the default Anvil private key, run\n\n  echo "PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" > .env\n`,
          );
        }
        return privateKeyToAccount(privateKey);
      }
    })();

    const toClient = createClient({
      transport: http(opts.toRpc, {
        batch: opts.rpcBatch ? { batchSize: 100, wait: 1000 } : undefined,
      }),
      account,
    });
    const toChainId = await getChainId(toClient);

    console.log(
      chalk.bgBlue(
        chalk.whiteBright(
          `\n Mirroring MUD world at ${opts.fromWorld} from chain ${fromChainId} to chain ${toChainId} \n`,
        ),
      ),
    );

    await mirror({
      rootDir: process.cwd(),
      from: {
        world: fromWorld,
        block: opts.fromBlock != null ? BigInt(opts.fromBlock) : undefined,
        client: fromClient,
        indexer: fromIndexer,
      },
      to: {
        client: toClient,
      },
    });
  },
};

export default commandModule;
