import { existsSync, readFileSync } from "fs";
import type { CommandModule } from "yargs";

import { loadConfig } from "@latticexyz/config/node";
import { MUDError } from "@latticexyz/common/errors";
import { cast, getRpcUrl, getSrcDirectory } from "@latticexyz/common/foundry";
import { StoreConfig } from "@latticexyz/store";
import { resolveWorldConfig, WorldConfig } from "@latticexyz/world";
import worldConfig from "@latticexyz/world/mud.config.js";
import { resourceToHex } from "@latticexyz/common";
import { getExistingContracts } from "../utils/getExistingContracts";
import { Hex, createClient, http } from "viem";
import { getChainId, readContract } from "viem/actions";
import { worldAbi } from "../common";

// TODO account for multiple namespaces (https://github.com/latticexyz/mud/issues/994)
const systemsTableId = resourceToHex({
  type: "system",
  namespace: worldConfig.namespace,
  name: worldConfig.tables.Systems.name,
});

function getWorldAddress(worldsFile: string, chainId: number) {
  if (!existsSync(worldsFile)) {
    throw new MUDError(`Missing file "${worldsFile}`);
  }

  const deploys = JSON.parse(readFileSync(worldsFile, "utf-8"));

  if (!deploys[chainId]) {
    throw new MUDError(`Missing chain ID ${chainId} in "${worldsFile}"`);
  }

  return deploys[chainId].address as string;
}

type Options = {
  tx: string;
  worldAddress?: string;
  configPath?: string;
  profile?: string;
  srcDir?: string;
  rpc?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "trace",

  describe: "Display the trace of a transaction",

  builder(yargs) {
    return yargs.options({
      tx: { type: "string", required: true, description: "Transaction hash to replay" },
      worldAddress: {
        type: "string",
        description: "World contract address. Defaults to the value from worlds.json, based on rpc's chainId",
      },
      configPath: { type: "string", description: "Path to the config file" },
      profile: { type: "string", description: "The foundry profile to use" },
      srcDir: { type: "string", description: "Source directory. Defaults to foundry src directory." },
      rpc: { type: "string", description: "json rpc endpoint. Defaults to foundry's configured eth_rpc_url" },
    });
  },

  async handler(args) {
    args.profile ??= process.env.FOUNDRY_PROFILE;
    const { profile } = args;
    args.srcDir ??= await getSrcDirectory(profile);
    args.rpc ??= await getRpcUrl(profile);
    const { tx, configPath, srcDir, rpc } = args;

    const existingContracts = getExistingContracts(srcDir);

    // Load the config
    const mudConfig = (await loadConfig(configPath)) as StoreConfig & WorldConfig;

    const resolvedConfig = resolveWorldConfig(
      mudConfig,
      existingContracts.map(({ basename }) => basename)
    );

    const client = createClient({ transport: http(rpc) });
    const chainId = await getChainId(client);

    // Get worldAddress either from args or from worldsFile
    const worldAddress = (args.worldAddress ?? getWorldAddress(mudConfig.worldsFile, chainId)) as Hex;

    // TODO account for multiple namespaces (https://github.com/latticexyz/mud/issues/994)
    const namespace = mudConfig.namespace;
    const systemNames = Object.values(resolvedConfig.systems).map(({ name }) => name);

    const labels = await Promise.all(
      systemNames.map(async (name) => ({
        name,
        address: await readContract(client, {
          abi: worldAbi,
          address: worldAddress,
          functionName: "getField",
          args: [systemsTableId, [resourceToHex({ type: "system", namespace, name })], 0],
        }),
      }))
    );

    const result = await cast([
      "run",
      "--label",
      `${worldAddress}:World`,
      ...labels.map(({ name, address }) => ["--label", `${address}:${name}`]).flat(),
      `${tx}`,
    ]);
    console.log(result);

    process.exit(0);
  },
};

export default commandModule;
