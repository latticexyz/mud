import { bench, describe } from "vitest";
import { getComponentValue } from "@latticexyz/recs";
import { createRecsStorage, createSqliteStorage, createZustandStorage, tables } from "../test/utils";
import { encodeEntity } from "../src/recs";
import { logsToBlocks } from "../test/logsToBlocks";
import { buildTable, getTables } from "../src/sqlite";
import { eq } from "drizzle-orm";
import worldRpcLogs10 from "../../../test-data/world-logs-10.json";
import worldRpcLogs100 from "../../../test-data/world-logs-100.json";
import worldRpcLogs1000 from "../../../test-data/world-logs-1000.json";

describe.each([
  { numRecords: 10, logs: worldRpcLogs10 },
  { numRecords: 100, logs: worldRpcLogs100 },
  { numRecords: 1000, logs: worldRpcLogs1000 },
] as const)("Get single record by key: $numRecords records", async ({ logs }) => {
  const blocks = logsToBlocks(logs);

  const { components, storageAdapter: recsStorageAdapter } = createRecsStorage();
  const { useStore, storageAdapter: zustandStorageAdapter } = createZustandStorage();
  const { database, storageAdapter: sqliteStorageAdapter } = await createSqliteStorage();

  for (const block of blocks) {
    await Promise.all([recsStorageAdapter(block), zustandStorageAdapter(block), sqliteStorageAdapter(block)]);
  }

  bench("recs: `getComponentValue`", async () => {
    getComponentValue(components.Number, encodeEntity(components.Number.metadata.keySchema, { key: 0 }));
  });

  bench("zustand: `getRecord`", async () => {
    useStore.getState().getRecord(tables.Number, { key: 0 });
  });

  bench("sqlite: `select`", async () => {
    const tables = getTables(database).filter((table) => table.name === "Number");
    const sqlTable = buildTable(tables[0]);

    database
      .select()
      .from(sqlTable)
      .where(eq(sqlTable.__key, "0x0000000000000000000000000000000000000000000000000000000000000000"))
      .all();
  });
});
