import { Client, Transport, Chain, Account, Address, Hex } from "viem";
import { Table } from "./configToTables";
import { hasResource } from "./hasResource";
import { writeContract } from "@latticexyz/common";
import { worldAbi } from "./common";
import { valueSchemaToFieldLayoutHex, keySchemaToHex, valueSchemaToHex } from "@latticexyz/protocol-parser";
import { debug } from "./debug";

export async function ensureTables({
  client,
  worldAddress,
  tables: tables_,
}: {
  client: Client<Transport, Chain | undefined, Account>;
  worldAddress: Address;
  tables: Table[];
}): Promise<Hex[]> {
  debug("checking tables");
  const tables = await Promise.all(
    Object.values(tables_).map(async (table) => ({
      ...table,
      exists: await hasResource(client, worldAddress, table.tableId),
    }))
  );

  const existingTables = tables.filter((table) => table.exists);
  if (existingTables.length > 0) {
    debug("existing tables", existingTables.map((table) => table.label).join(", "));
  }

  const missingTables = tables.filter((table) => !table.exists);
  if (missingTables.length > 0) {
    debug("registering tables", missingTables.map((table) => table.label).join(", "));
    return await Promise.all(
      missingTables.map((table) =>
        writeContract(client, {
          chain: client.chain ?? null,
          address: worldAddress,
          abi: worldAbi,
          functionName: "registerTable",
          args: [
            table.tableId,
            valueSchemaToFieldLayoutHex(table.valueSchema),
            keySchemaToHex(table.keySchema),
            valueSchemaToHex(table.valueSchema),
            Object.keys(table.keySchema),
            Object.keys(table.valueSchema),
          ],
        })
      )
    );
  }

  return [];
}
