import { Client, Transport, Chain, Account, Hex } from "viem";
import { resourceToLabel } from "@latticexyz/common";
import { WorldDeploy, worldAbi } from "./common";
import {
  valueSchemaToFieldLayoutHex,
  keySchemaToHex,
  valueSchemaToHex,
  getSchemaTypes,
  getValueSchema,
  getKeySchema,
} from "@latticexyz/protocol-parser/internal";
import { debug } from "./debug";
import { getTables } from "./getTables";
import pRetry from "p-retry";
import { Table } from "@latticexyz/config";
import { isDefined } from "@latticexyz/common/utils";
import { writeContract } from "viem/actions";
import { getAction } from "viem/utils";

export async function ensureTables({
  client,
  worldDeploy,
  tables,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly worldDeploy: WorldDeploy;
  readonly tables: readonly Table[];
}): Promise<readonly Hex[]> {
  const configTables = new Map(
    tables.map((table) => {
      const keySchema = getSchemaTypes(getKeySchema(table));
      const valueSchema = getSchemaTypes(getValueSchema(table));
      const keySchemaHex = keySchemaToHex(keySchema);
      const valueSchemaHex = valueSchemaToHex(valueSchema);
      return [
        table.tableId,
        {
          ...table,
          keySchema,
          keySchemaHex,
          valueSchema,
          valueSchemaHex,
        },
      ];
    }),
  );

  const worldTables = await getTables({ client, worldDeploy });
  const existingTables = worldTables.filter(({ tableId }) => configTables.has(tableId));
  if (existingTables.length) {
    debug("existing tables:", existingTables.map(resourceToLabel).join(", "));

    const schemaErrors = existingTables
      .map((table) => {
        const configTable = configTables.get(table.tableId)!;
        if (table.keySchemaHex !== configTable.keySchemaHex || table.valueSchemaHex !== configTable.valueSchemaHex) {
          return [
            `"${resourceToLabel(table)}" table:`,
            `  Registered schema: ${JSON.stringify({ schema: getSchemaTypes(table.schema), key: table.key })}`,
            `      Config schema: ${JSON.stringify({ schema: getSchemaTypes(configTable.schema), key: configTable.key })}`,
          ].join("\n");
        }
      })
      .filter(isDefined);

    if (schemaErrors.length) {
      throw new Error(
        [
          "Table schemas are immutable, but found registered tables with a different schema than what you have configured.",
          ...schemaErrors,
          "You can either update your config with the registered schema or change the table name to register a new table.",
        ].join("\n\n") + "\n",
      );
    }
  }

  const existingTableIds = new Set(existingTables.map(({ tableId }) => tableId));
  const missingTables = tables.filter((table) => !existingTableIds.has(table.tableId));
  if (missingTables.length) {
    debug("registering tables:", missingTables.map(resourceToLabel).join(", "));
    return await Promise.all(
      missingTables.map((table) => {
        const keySchema = getSchemaTypes(getKeySchema(table));
        const valueSchema = getSchemaTypes(getValueSchema(table));
        return pRetry(
          () =>
            getAction(
              client,
              writeContract,
              "writeContract",
            )({
              chain: client.chain ?? null,
              account: client.account,
              address: worldDeploy.address,
              abi: worldAbi,
              // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
              functionName: "registerTable",
              args: [
                table.tableId,
                valueSchemaToFieldLayoutHex(valueSchema),
                keySchemaToHex(keySchema),
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
