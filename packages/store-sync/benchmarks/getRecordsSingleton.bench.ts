import { bench, describe } from "vitest";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { buildTable, getTables } from "../src/sqlite";
import { createRecsStorage, createSqliteStorage, createZustandStorage, tables } from "../test/utils";
import { logsToBlocks } from "../test/logsToBlocks";
import worldRpcLogs from "../../../test-data/world-logs.json";

const blocks = logsToBlocks(worldRpcLogs);

const { components, storageAdapter: recsStorageAdapter } = createRecsStorage();
const { useStore, storageAdapter: zustandStorageAdapter } = createZustandStorage();
const { database, storageAdapter: sqliteStorageAdapter } = await createSqliteStorage();

for (const block of blocks) {
  await Promise.all([recsStorageAdapter(block), zustandStorageAdapter(block), sqliteStorageAdapter(block)]);
}

describe("Get all records for table: singleton", () => {
  bench("recs: `getComponentValue`", async () => {
    for (const entity of getComponentEntities(components.NumberList)) {
      getComponentValue(components.NumberList, entity);
    }
  });

  bench("zustand: `getRecords`", async () => {
    useStore.getState().getRecords(tables.NumberList);
  });

  bench("sqlite: `select`", async () => {
    const tables = getTables(database).filter((table) => table.name === "NumberList");
    const sqlTable = buildTable(tables[0]);

    database.select().from(sqlTable).all();
  });
});
