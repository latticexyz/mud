import { bench, describe } from "vitest";
import { Has, runQuery } from "@latticexyz/recs";
import { createRecsStorage, createSqliteStorage, createZustandStorage, tables } from "../test/utils";
import { logsToBlocks } from "../test/logsToBlocks";
import worldRpcLogs from "../../../test-data/world-logs-query.json";
import { buildTable, getTables } from "../src/sqlite";
import { eq } from "drizzle-orm";

const blocks = logsToBlocks(worldRpcLogs);

const { components, storageAdapter: recsStorageAdapter } = createRecsStorage();
const { useStore, storageAdapter: zustandStorageAdapter } = createZustandStorage();
const { database, storageAdapter: sqliteStorageAdapter } = await createSqliteStorage();

for (const block of blocks) {
  await Promise.all([recsStorageAdapter(block), zustandStorageAdapter(block), sqliteStorageAdapter(block)]);
}

describe("Get records with query", async () => {
  bench("recs: `runQuery`", async () => {
    runQuery([Has(components.Number), Has(components.Vector)]);
  });

  bench("zustand: `getRecords`", async () => {
    const records = useStore.getState().getRecords(tables.Number);

    Object.keys(useStore.getState().getRecords(tables.Vector)).filter((id) => id in records);
  });

  bench("sqlite: `innerJoin`", async () => {
    const numberTable = buildTable(getTables(database).filter((table) => table.name === "Number")[0]);
    const vectorTable = buildTable(getTables(database).filter((table) => table.name === "Vector")[0]);

    await database.select().from(numberTable).innerJoin(vectorTable, eq(numberTable.key, vectorTable.key));
  });
});
