import path from "node:path";
import fs from "node:fs";
import type { CommandModule } from "yargs";
import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { MUDError } from "@latticexyz/common/errors";
import { cast, getRpcUrl } from "@latticexyz/common/foundry";
import worldConfig from "@latticexyz/world/mud.config";
import { Hex, createClient, http } from "viem";
import { getChainId, readContract } from "viem/actions";
import { World as WorldConfig } from "@latticexyz/world";
import { resolveSystems } from "@latticexyz/world/node";
import { worldAbi } from "../deploy/common";

const systemsTableId = worldConfig.namespaces.world.tables.Systems.tableId;

function getWorldAddress(worldsFile: string, chainId: number): Hex {
  if (!fs.existsSync(worldsFile)) {
    throw new MUDError(`Missing expected worlds.json file at "${worldsFile}"`);
  }

  const deploys = JSON.parse(fs.readFileSync(worldsFile, "utf-8"));

  if (!deploys[chainId]) {
    throw new MUDError(`Missing chain ID ${chainId} in "${worldsFile}"`);
  }

  return deploys[chainId].address as Hex;
}

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

    const profile = args.profile;
    const rpc = args.rpc ?? (await getRpcUrl(profile));

    const config = (await loadConfig(configPath)) as WorldConfig;

    const client = createClient({ transport: http(rpc) });
    const chainId = await getChainId(client);
    const worldAddress = (args.worldAddress ?? getWorldAddress(config.deploy.worldsFile, chainId)) as Hex;

    const systems = await resolveSystems({ rootDir, config });

    const labels = await Promise.all(
      systems.map(async (system) => ({
        label: system.label,
        address: await readContract(client, {
          abi: worldAbi,
          address: worldAddress,
          functionName: "getField",
          args: [systemsTableId, [system.systemId], 0],
        }),
      })),
    );

    const result = await cast([
      "run",
      "--label",
      `${worldAddress}:World`,
      ...labels.map(({ label, address }) => ["--label", `${address}:${label}`]).flat(),
      `${args.tx}`,
    ]);
    console.log(result);

    process.exit(0);
  },
};

export default commandModule;
