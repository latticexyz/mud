import { bench, describe } from "vitest";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { buildTable, getTables } from "../sqlite";
import { logsToBlocks } from "../../test/logsToBlocks";
import { createRecsStorage, createSqliteStorage, createZustandStorage, tables } from "../../test/utils";
import worldRpcLogs10 from "../../../../test-data/world-logs-10.json";
import worldRpcLogs100 from "../../../../test-data/world-logs-100.json";
import worldRpcLogs1000 from "../../../../test-data/world-logs-1000.json";

{
  const blocks = logsToBlocks(worldRpcLogs10);

  const { components, storageAdapter: recsStorageAdapter } = createRecsStorage();
  const { useStore, storageAdapter: zustandStorageAdapter } = createZustandStorage();
  const { db, storageAdapter: sqliteStorageAdapter } = await createSqliteStorage();

  for (const block of blocks) {
    await Promise.all([recsStorageAdapter(block), zustandStorageAdapter(block), sqliteStorageAdapter(block)]);
  }

  describe("Get all records for table: 10 logs", () => {
    bench("recs: `getComponentValue`", async () => {
      for (const entity of getComponentEntities(components.Number)) {
        getComponentValue(components.Number, entity);
      }
    });

    bench("zustand: `getRecords`", async () => {
      useStore.getState().getRecords(tables.Number);
    });

    bench("sqlite: `select`", async () => {
      const tables = getTables(db).filter((table) => table.name === "Number");
      const sqlTable = buildTable(tables[0]);

      db.select().from(sqlTable).all();
    });
  });
}

{
  const blocks = logsToBlocks(worldRpcLogs100);

  const { components, storageAdapter: recsStorageAdapter } = createRecsStorage();
  const { useStore, storageAdapter: zustandStorageAdapter } = createZustandStorage();
  const { db, storageAdapter: sqliteStorageAdapter } = await createSqliteStorage();

  for (const block of blocks) {
    await Promise.all([recsStorageAdapter(block), zustandStorageAdapter(block), sqliteStorageAdapter(block)]);
  }

  describe("Get all records for table: 100 logs", () => {
    bench("recs: `getComponentValue`", async () => {
      for (const entity of getComponentEntities(components.Number)) {
        getComponentValue(components.Number, entity);
      }
    });

    bench("zustand: `getRecords`", async () => {
      useStore.getState().getRecords(tables.Number);
    });

    bench("sqlite: `select`", async () => {
      const tables = getTables(db).filter((table) => table.name === "Number");
      const sqlTable = buildTable(tables[0]);

      db.select().from(sqlTable).all();
    });
  });
}

{
  const blocks = logsToBlocks(worldRpcLogs1000);

  const { components, storageAdapter: recsStorageAdapter } = createRecsStorage();
  const { useStore, storageAdapter: zustandStorageAdapter } = createZustandStorage();
  const { db, storageAdapter: sqliteStorageAdapter } = await createSqliteStorage();

  for (const block of blocks) {
    await Promise.all([recsStorageAdapter(block), zustandStorageAdapter(block), sqliteStorageAdapter(block)]);
  }

  describe("Get all records for table: 1000 logs", () => {
    bench("recs: `getComponentValue`", async () => {
      for (const entity of getComponentEntities(components.Number)) {
        getComponentValue(components.Number, entity);
      }
    });

    bench("zustand: `getRecords`", async () => {
      useStore.getState().getRecords(tables.Number);
    });

    bench("sqlite: `select`", async () => {
      const tables = getTables(db).filter((table) => table.name === "Number");
      const sqlTable = buildTable(tables[0]);

      db.select().from(sqlTable).all();
    });
  });
}
