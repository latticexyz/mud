import { existsSync, readFileSync } from "fs";
import type { CommandModule } from "yargs";
import { ethers } from "ethers";

import { loadConfig } from "@latticexyz/config/node";
import { MUDError } from "@latticexyz/common/errors";
import { cast, getRpcUrl, getSrcDirectory } from "@latticexyz/common/foundry";
import { TableId } from "@latticexyz/utils";
import { StoreConfig } from "@latticexyz/store";
import { resolveWorldConfig, WorldConfig } from "@latticexyz/world";
import { IBaseWorld } from "@latticexyz/world/types/ethers-contracts/IBaseWorld";
import { getChainId, getExistingContracts } from "../utils";

import IBaseWorldData from "@latticexyz/world/abi/IBaseWorld.sol/IBaseWorld.json" assert { type: "json" };

const systemsTableId = new TableId("", "Systems");

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
        description: "World contract address. Defaults to the value from worlds.json, based on rpc port",
      },
      configPath: { type: "string", desc: "Path to the config file" },
      profile: { type: "string", desc: "The foundry profile to use" },
      srcDir: { type: "string", desc: "Source directory. Defaults to foundry src directory." },
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
    const WorldContract = new ethers.Contract(worldAddress, IBaseWorldData.abi, provider) as IBaseWorld;

    // TODO account for multiple namespaces (https://github.com/latticexyz/mud/issues/994)
    const namespace = mudConfig.namespace;
    const names = Object.values(resolvedConfig.systems).map(({ name }) => name);

    const labels: { name: string; address: string }[] = [];
    for (const name of names) {
      const tableId = new TableId(namespace, name);
      // Get the first field of `Systems` table (the table maps system name to its address and other data)
      const address = await WorldContract.getField(systemsTableId.toHexString(), [tableId.toHexString()], 0);
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
    const chainId = await getChainId(rpc);
    const deploys = JSON.parse(readFileSync(worldsFile, "utf-8"));

    if (!deploys[chainId]) {
      throw new MUDError(`worldsFile is missing chainId ${chainId}`);
    }
    return deploys[chainId].address as string;
  } else {
    throw new MUDError("worldAddress is not specified and worldsFile is missing");
  }
}
