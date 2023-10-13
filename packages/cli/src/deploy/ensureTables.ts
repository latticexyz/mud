import { Client, Transport, Chain, Account, Hex } from "viem";
import { Table } from "./configToTables";
import { writeContract } from "@latticexyz/common";
import { WorldDeploy, worldAbi } from "./common";
import { valueSchemaToFieldLayoutHex, keySchemaToHex, valueSchemaToHex } from "@latticexyz/protocol-parser";
import { debug } from "./debug";
import { resourceLabel } from "./resourceLabel";
import { getTables } from "./getTables";
import pRetry from "p-retry";
import { wait } from "@latticexyz/common/utils";

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
    debug("existing tables", existingTables.map(resourceLabel).join(", "));
  }

  const missingTables = tables.filter((table) => !worldTableIds.includes(table.tableId));
  if (missingTables.length) {
    debug("registering tables", missingTables.map(resourceLabel).join(", "));
    return await Promise.all(
      missingTables.map((table) =>
        pRetry(
          () =>
            writeContract(client, {
              chain: client.chain ?? null,
              address: worldDeploy.address,
              abi: worldAbi,
              // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
              functionName: "registerTable",
              args: [
                table.tableId,
                valueSchemaToFieldLayoutHex(table.valueSchema),
                keySchemaToHex(table.keySchema),
                valueSchemaToHex(table.valueSchema),
                Object.keys(table.keySchema),
                Object.keys(table.valueSchema),
              ],
            }),
          {
            retries: 3,
            onFailedAttempt: async (error) => {
              const delay = error.attemptNumber * 500;
              debug(`failed to register table ${resourceLabel(table)}, retrying in ${delay}ms...`);
              await wait(delay);
            },
          }
        )
      )
    );
  }

  return [];
}
