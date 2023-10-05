import { Client, Transport, Chain, Account, Address, Hex } from "viem";
import { Table } from "./configToTables";
import { writeContract } from "@latticexyz/common";
import { worldAbi } from "./common";
import { valueSchemaToFieldLayoutHex, keySchemaToHex, valueSchemaToHex } from "@latticexyz/protocol-parser";
import { debug } from "./debug";

export async function ensureTables({
  client,
  worldAddress,
  resourceIds,
  tables,
}: {
  client: Client<Transport, Chain | undefined, Account>;
  worldAddress: Address;
  tables: Table[];
  resourceIds: Hex[];
}): Promise<Hex[]> {
  const existingTables = tables.filter((table) => resourceIds.includes(table.tableId));
  if (existingTables.length > 0) {
    debug("existing tables", existingTables.map((table) => table.label).join(", "));
  }

  const missingTables = tables.filter((table) => !resourceIds.includes(table.tableId));
  if (missingTables.length > 0) {
    debug("registering tables", missingTables.map((table) => table.label).join(", "));
    return await Promise.all(
      missingTables.map((table) =>
        writeContract(client, {
          chain: client.chain ?? null,
          address: worldAddress,
          abi: worldAbi,
          // TODO: replace with batchCall
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
