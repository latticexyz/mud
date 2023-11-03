import { Client, Transport, Chain, Account, Hex, encodeFunctionData } from "viem";
import { Table } from "./configToTables";
import { writeContract } from "@latticexyz/common";
import { WorldDeploy, worldAbi } from "./common";
import { valueSchemaToFieldLayoutHex, keySchemaToHex, valueSchemaToHex } from "@latticexyz/protocol-parser";
import { debug } from "./debug";
import { resourceLabel } from "./resourceLabel";
import { getTables } from "./getTables";
import pRetry from "p-retry";
import { wait } from "@latticexyz/common/utils";
import { getBatchCallData } from "../utils/getBatchCallData";

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
  const encodedFunctionDataList = missingTables.map((table) => {
    const encodedFunctionData = encodeFunctionData({
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
    });
    return encodedFunctionData;
  });

  // Slice register calls to avoid hitting the block gas limit
  // TODO: the batchSize can be configurable
  const batchSize = 10;
  const iterations = Math.ceil(encodedFunctionDataList.length / batchSize);
  const slicedFunctionDataList = Array.from({ length: iterations }, (_, i) => {
    return encodedFunctionDataList.slice(i * batchSize, (i + 1) * batchSize);
  });

  if (missingTables.length) {
    debug("Batch registering tables", missingTables.map(resourceLabel).join(", "));
    return await Promise.all(
      slicedFunctionDataList.map((encodedFunctionDataList) =>
        pRetry(
          () =>
            writeContract(client, {
              chain: client.chain ?? null,
              address: worldDeploy.address,
              abi: worldAbi,
              functionName: "batchCall",
              args: [getBatchCallData(encodedFunctionDataList)],
            }),
          {
            retries: 3,
            onFailedAttempt: async (error) => {
              const delay = error.attemptNumber * 500;
              debug(`failed to register tables, retrying in ${delay}ms...`);
              await wait(delay);
            },
          }
        )
      )
    );
  }

  return [];
}
