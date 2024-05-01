import type { CommandModule, InferredOptionTypes } from "yargs";
import { getRpcUrl, getSrcDirectory } from "@latticexyz/common/foundry";
import { Hex, createWalletClient, http } from "viem";
import chalk from "chalk";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json" assert { type: "json" };
import { readContract } from "viem/actions";
import { resourceToHex } from "@latticexyz/common";
import { getExistingContracts } from "../utils/getExistingContracts";
import { loadConfig } from "@latticexyz/config/node";
import { worldToV1 } from "@latticexyz/world/config/v2";
import { WorldConfig, resolveWorldConfig } from "@latticexyz/world/internal";
import { decodeValue } from "@latticexyz/protocol-parser/internal";
import { worldTables } from "../deploy/common";

const listOptions = {
  deployerAddress: {
    type: "string",
    desc: "Deploy using an existing deterministic deployer (https://github.com/Arachnid/deterministic-deployment-proxy)",
  },
  worldAddress: { type: "string", required: true, desc: "Verify an existing World at the given address" },
  configPath: { type: "string", desc: "Path to the MUD config file" },
  profile: { type: "string", desc: "The foundry profile to use" },
  rpc: { type: "string", desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml" },
  rpcBatch: {
    type: "boolean",
    desc: "Enable batch processing of RPC requests in viem client (defaults to batch size of 100 and wait of 1s)",
  },
  srcDir: { type: "string", desc: "Source directory. Defaults to foundry src directory." },
  verifier: { type: "string", desc: "The verifier to use. Defaults to blockscout", default: "blockscout" },
  verifierUrl: {
    type: "string",
    desc: "The verification provider.",
  },
} as const;

type Options = InferredOptionTypes<typeof listOptions>;

const SYSTEMS_TABLE_ID = resourceToHex({ type: "table", namespace: "world", name: "Systems" });

const commandModule: CommandModule<Options, Options> = {
  command: "list",

  describe: "List contracts",

  builder(yargs) {
    return yargs.options(listOptions);
  },

  async handler(opts) {
    const profile = opts.profile ?? process.env.FOUNDRY_PROFILE;

    const configV2 = (await loadConfig(opts.configPath)) as WorldConfig;
    const config = worldToV1(configV2);

    const srcDir = opts.srcDir ?? (await getSrcDirectory(profile));

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

    const contractNames = getExistingContracts(srcDir).map(({ basename }) => basename);
    const resolvedWorldConfig = resolveWorldConfig(config, contractNames);

    Object.keys(resolvedWorldConfig.systems).map(async (name) => {
      const systemId = resourceToHex({ type: "system", namespace: "", name });

      const record = await readContract(client, {
        address: opts.worldAddress as Hex,
        abi: IBaseWorldAbi,
        functionName: "getRecord",
        args: [SYSTEMS_TABLE_ID, [systemId]],
      });

      const { system } = decodeValue(worldTables.world_Systems.valueSchema, record[0]);

      console.log(`${name}: ${system}`);
    });
  },
};

export default commandModule;
