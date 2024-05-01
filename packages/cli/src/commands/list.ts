import type { CommandModule, InferredOptionTypes } from "yargs";
import { getRpcUrl } from "@latticexyz/common/foundry";
import { Hex, createWalletClient, http } from "viem";
import chalk from "chalk";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json" assert { type: "json" };
import { readContract } from "viem/actions";
import { resourceToHex } from "@latticexyz/common";

const listOptions = {
  worldAddress: { type: "string", required: true, desc: "Verify an existing World at the given address" },
  profile: { type: "string", desc: "The foundry profile to use" },
  rpc: { type: "string", desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml" },
  rpcBatch: {
    type: "boolean",
    desc: "Enable batch processing of RPC requests in viem client (defaults to batch size of 100 and wait of 1s)",
  },
} as const;

type Options = InferredOptionTypes<typeof listOptions>;

const commandModule: CommandModule<Options, Options> = {
  command: "list",

  describe: "List contracts",

  builder(yargs) {
    return yargs.options(listOptions);
  },

  async handler(opts) {
    const profile = opts.profile ?? process.env.FOUNDRY_PROFILE;

    const rpc = opts.rpc ?? (await getRpcUrl(profile));
    console.log(
      chalk.bgBlue(
        chalk.whiteBright(`\n Listing MUD contracts${profile ? " with profile " + profile : ""} to RPC ${rpc} \n`),
      ),
    );

    const client = createWalletClient({
      transport: http(rpc, {
        batch: opts.rpcBatch
          ? {
              batchSize: 100,
              wait: 1000,
            }
          : undefined,
      }),
    });

    const record = await readContract(client, {
      address: opts.worldAddress as Hex,
      abi: IBaseWorldAbi,
      functionName: "getRecord",
      args: [
        resourceToHex({ type: "table", namespace: "", name: "Systems" }),
        [resourceToHex({ type: "system", namespace: "", name: "BalanceTransferSystem" })],
      ],
    });
    console.log(record);
  },
};

export default commandModule;
