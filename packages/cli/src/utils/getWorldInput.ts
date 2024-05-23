import { getTables } from "../deploy/getTables";
import { Table } from "../deploy/configToTables";
import { getSystems } from "../deploy/getSystems";
import { SystemsInput, WorldInput } from "@latticexyz/world/ts/config/v2/input";
import { TableInput } from "@latticexyz/store/config/v2";
import { Client } from "viem";
import { WorldDeploy } from "../deploy/common";

function tableToV2({ keySchema, valueSchema }: Table): Omit<TableInput, "namespace" | "name"> {
  return {
    schema: { ...keySchema, ...valueSchema },
    key: Object.keys(keySchema),
  };
}

export async function getWorldInput({
  client,
  worldDeploy,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
}): Promise<WorldInput> {
  const tables: {
    [key: string]: Omit<TableInput, "namespace" | "name">;
  } = {};
  const worldTables = await getTables({ client, worldDeploy });
  worldTables.forEach((table) => (tables[table.name] = tableToV2(table)));

  const systems: SystemsInput = {};
  const worldSystems = await getSystems({ client, worldDeploy });
  worldSystems.forEach((system) => (systems[system.name] = { name: system.name, openAccess: system.allowAll }));

  return { systems, tables };
}
