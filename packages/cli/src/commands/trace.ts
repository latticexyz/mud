import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import type { CommandModule } from "yargs";
import { ethers } from "ethers";
import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { MUDError } from "@latticexyz/common/errors";
import { cast, getRpcUrl } from "@latticexyz/common/foundry";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json" assert { type: "json" };
import worldConfig from "@latticexyz/world/mud.config";
import { resourceToHex } from "@latticexyz/common";
import { createClient, http } from "viem";
import { getChainId } from "viem/actions";
import { World as WorldConfig } from "@latticexyz/world";
import { resolveSystems } from "@latticexyz/world/internal";

const systemsTableId = worldConfig.tables.world__Systems.tableId;

type Options = {
  tx: string;
  worldAddress?: string;
  configPath?: string;
  profile?: string;
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
      configPath: { type: "string", description: "Path to the MUD config file" },
      profile: { type: "string", description: "The foundry profile to use" },
      rpc: { type: "string", description: "json rpc endpoint. Defaults to foundry's configured eth_rpc_url" },
    });
  },

  async handler(args) {
    const configPath = await resolveConfigPath(args.configPath);
    const rootDir = path.dirname(configPath);

    const profile = args.profile ?? process.env.FOUNDRY_PROFILE;
    const rpc = args.rpc ?? (await getRpcUrl(profile));

    // Load the config
    const config = (await loadConfig(configPath)) as WorldConfig;

    // Get worldAddress either from args or from worldsFile
    const worldAddress = args.worldAddress ?? (await getWorldAddress(config.deploy.worldsFile, rpc));

    // Create World contract instance from deployed address
    const provider = new ethers.providers.StaticJsonRpcProvider(rpc);
    const WorldContract = new ethers.Contract(worldAddress, IBaseWorldAbi, provider);

    // TODO: replace with system.namespace
    const namespace = config.namespace;
    const systems = await resolveSystems({ rootDir, config });

    // Fetch system table field layout from chain
    const systemTableFieldLayout = await WorldContract.getFieldLayout(systemsTableId);
    const labels = await Promise.all(
      systems.map(async (system) => {
        // TODO: replace with system.systemId
        const systemId = resourceToHex({ type: "system", namespace, name: system.name });
        // Get the first field of `Systems` table (the table maps system name to its address and other data)
        const address = await WorldContract.getField(systemsTableId, [systemId], 0, systemTableFieldLayout);
        return { name: system.name, address };
      }),
    );

    const result = await cast([
      "run",
      "--label",
      `${worldAddress}:World`,
      ...labels.map(({ name, address }) => ["--label", `${address}:${name}`]).flat(),
      `${args.tx}`,
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
