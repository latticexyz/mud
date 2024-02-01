import { bench, describe } from "vitest";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { buildTable, getTables } from "../sqlite";
import { logsToBlocks } from "../../test/logsToBlocks";
import { createRecsStorage, createSqliteStorage, createZustandStorage, tables } from "../../test/utils";
import worldRpcLogs10 from "../../../../test-data/world-logs-10.json";
import worldRpcLogs100 from "../../../../test-data/world-logs-100.json";
import worldRpcLogs1000 from "../../../../test-data/world-logs-1000.json";

describe.each([
  { numRecords: 10, logs: worldRpcLogs10 },
  { numRecords: 100, logs: worldRpcLogs100 },
  { numRecords: 1000, logs: worldRpcLogs1000 },
] as const)("Get all records for table: $numRecords records", async ({ logs }) => {
  const blocks = logsToBlocks(logs);

  const { components, storageAdapter: recsStorageAdapter } = createRecsStorage();
  const { useStore, storageAdapter: zustandStorageAdapter } = createZustandStorage();
  const { database, storageAdapter: sqliteStorageAdapter } = await createSqliteStorage();

  for (const block of blocks) {
    await Promise.all([recsStorageAdapter(block), zustandStorageAdapter(block), sqliteStorageAdapter(block)]);
  }

  bench("recs: `getComponentValue`", async () => {
    for (const entity of getComponentEntities(components.Number)) {
      getComponentValue(components.Number, entity);
    }
  });

  bench("zustand: `getRecords`", async () => {
    useStore.getState().getRecords(tables.Number);
  });

  bench("sqlite: `select`", async () => {
    const tables = getTables(database).filter((table) => table.name === "Number");
    const sqlTable = buildTable(tables[0]);

    database.select().from(sqlTable).all();
  });
});
