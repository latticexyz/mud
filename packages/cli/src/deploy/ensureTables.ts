import { Client, Transport, Chain, Account, Hex } from "viem";
import { resourceToLabel, writeContract } from "@latticexyz/common";
import { WorldDeploy, worldAbi } from "./common";
import {
  valueSchemaToFieldLayoutHex,
  keySchemaToHex,
  valueSchemaToHex,
  getSchemaTypes,
  getValueSchema,
  getKeySchema,
  KeySchema,
} from "@latticexyz/protocol-parser/internal";
import { debug } from "./debug";
import { getTables } from "./getTables";
import pRetry from "p-retry";
import { Table } from "@latticexyz/config";

export async function ensureTables({
  client,
  worldDeploy,
  tables,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly worldDeploy: WorldDeploy;
  readonly tables: readonly Table[];
}): Promise<readonly Hex[]> {
  const worldTables = await getTables({ client, worldDeploy });
  const worldTableIds = worldTables.map((table) => table.tableId);

  const existingTables = tables.filter((table) => worldTableIds.includes(table.tableId));
  if (existingTables.length) {
    debug("existing tables:", existingTables.map(resourceToLabel).join(", "));
  }

  const missingTables = tables.filter((table) => !worldTableIds.includes(table.tableId));
  if (missingTables.length) {
    debug("registering tables:", missingTables.map(resourceToLabel).join(", "));
    return await Promise.all(
      missingTables.map((table) => {
        const keySchema = getSchemaTypes(getKeySchema(table));
        const valueSchema = getSchemaTypes(getValueSchema(table));
        return pRetry(
          () =>
            writeContract(client, {
              chain: client.chain ?? null,
              address: worldDeploy.address,
              abi: worldAbi,
              // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
              functionName: "registerTable",
              args: [
                table.tableId,
                valueSchemaToFieldLayoutHex(valueSchema),
                keySchemaToHex(keySchema as KeySchema),
                valueSchemaToHex(valueSchema),
                Object.keys(keySchema),
                Object.keys(valueSchema),
              ],
            }),
          {
            retries: 3,
            onFailedAttempt: () => debug(`failed to register table ${resourceToLabel(table)}, retrying...`),
          },
        );
      }),
    );
  }

  return [];
}
