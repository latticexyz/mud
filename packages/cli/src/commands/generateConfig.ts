import { formatAndWriteTypescript } from "@latticexyz/common/codegen";
import { getRpcUrl } from "@latticexyz/common/foundry";
import { Hex, createWalletClient, http } from "viem";
import type { CommandModule, InferredOptionTypes } from "yargs";
import { getTables } from "../deploy/getTables";
import { getWorldDeploy } from "../deploy/getWorldDeploy";
import { Table } from "../deploy/configToTables";
import { getSystems } from "../deploy/getSystems";

function tableToV2({ keySchema, valueSchema }: Table) {
  return {
    schema: { ...keySchema, ...valueSchema },
    key: Object.keys(keySchema),
  };
}

const generateConfigOptions = {
  worldAddress: { type: "string", required: true, desc: "Verify an existing World at the given address" },
  profile: { type: "string", desc: "The foundry profile to use" },
  rpc: { type: "string", desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml" },
} as const;

type Options = InferredOptionTypes<typeof generateConfigOptions>;

const commandModule: CommandModule<Options, Options> = {
  command: "generate-config",

  describe: "Generate a MUD config given a world address",

  builder(yargs) {
    return yargs.options(generateConfigOptions);
  },

  async handler(opts) {
    const profile = opts.profile ?? process.env.FOUNDRY_PROFILE;

    const rpc = opts.rpc ?? (await getRpcUrl(profile));

    const client = createWalletClient({
      transport: http(rpc),
    });

    const worldDeploy = await getWorldDeploy(client, opts.worldAddress as Hex);

    const worldTables = await getTables({ client, worldDeploy });
    const tables: Record<string, unknown> = {};
    worldTables.forEach((table) => (tables[table.name] = tableToV2(table)));

    const systems: Record<string, unknown> = {};
    const worldSystems = await getSystems({ client, worldDeploy });
    worldSystems.forEach((system) => (systems[system.name] = { name: system.name, openAccess: system.allowAll }));

    formatAndWriteTypescript(
      `
      import { defineWorld } from "@latticexyz/world";
      
      export default defineWorld({
        systems: ${JSON.stringify(systems)},
        tables: ${JSON.stringify(tables)}
      });
      `,
      "world.config.ts",
      "generating MUD config from world",
    );
  },
};

export default commandModule;
