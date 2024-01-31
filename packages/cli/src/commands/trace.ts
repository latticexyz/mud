import { existsSync, readFileSync } from "fs";
import type { CommandModule } from "yargs";
import { ethers } from "ethers";

import { loadConfig } from "@latticexyz/config/node";
import { MUDError } from "@latticexyz/common/errors";
import { cast, getRpcUrl, getSrcDirectory } from "@latticexyz/common/foundry";
import { StoreConfig } from "@latticexyz/store";
import { resolveWorldConfig, WorldConfig } from "@latticexyz/world";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json" assert { type: "json" };
import worldConfig from "@latticexyz/world/mud.config";
import { resourceToHex } from "@latticexyz/common";
import { getExistingContracts } from "../utils/getExistingContracts";
import { createClient, http } from "viem";
import { getChainId } from "viem/actions";

// TODO account for multiple namespaces (https://github.com/latticexyz/mud/issues/994)
const systemsTableId = resourceToHex({
  type: "system",
  namespace: worldConfig.namespace,
  name: worldConfig.tables.Systems.name,
});

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

    // Get worldAddress either from args or from worldsFile
    const worldAddress = args.worldAddress ?? (await getWorldAddress(mudConfig.worldsFile, rpc));

    // Create World contract instance from deployed address
    const provider = new ethers.providers.StaticJsonRpcProvider(rpc);
    const WorldContract = new ethers.Contract(worldAddress, IBaseWorldAbi, provider);

    // TODO account for multiple namespaces (https://github.com/latticexyz/mud/issues/994)
    const namespace = mudConfig.namespace;
    const names = Object.values(resolvedConfig.systems).map(({ name }) => name);

    // Fetch system table field layout from chain
    const systemTableFieldLayout = await WorldContract.getFieldLayout(systemsTableId);
    const labels: { name: string; address: string }[] = [];
    for (const name of names) {
      const systemSelector = resourceToHex({ type: "system", namespace, name });
      // Get the first field of `Systems` table (the table maps system name to its address and other data)
      const address = await WorldContract.getField(systemsTableId, [systemSelector], 0, systemTableFieldLayout);
      labels.push({ name, address });
    }

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

async function getWorldAddress(worldsFile: string, rpc: string) {
  if (existsSync(worldsFile)) {
    const client = createClient({ transport: http(rpc) });
    const chainId = await getChainId(client);
    const deploys = JSON.parse(readFileSync(worldsFile, "utf-8"));

    if (!deploys[chainId]) {
      throw new MUDError(`chainId ${chainId} is missing in worldsFile "${worldsFile}"`);
    }
    return deploys[chainId].address as string;
  } else {
    throw new MUDError("worldAddress is not specified and worldsFile is missing");
  }
}
