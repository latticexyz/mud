import { bench, describe } from "vitest";
import { getComponentValue } from "@latticexyz/recs";
import { createRecsStorage, createSqliteStorage, createZustandStorage, tables } from "../../test/utils";
import { encodeEntity } from "../recs";
import { logsToBlocks } from "../../test/logsToBlocks";
import { buildTable, getTables } from "../sqlite";
import { eq } from "drizzle-orm";
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

  describe("Get single record by key: 10 logs", () => {
    bench("recs: `getComponentValue`", async () => {
      getComponentValue(components.Number, encodeEntity(components.Number.metadata.keySchema, { key: 0 }));
    });

    bench("zustand: `getRecord`", async () => {
      useStore.getState().getRecord(tables.Number, { key: 0 });
    });

    bench("sqlite: `select`", async () => {
      const tables = getTables(db).filter((table) => table.name === "Number");
      const sqlTable = buildTable(tables[0]);

      db.select()
        .from(sqlTable)
        .where(eq(sqlTable.__key, "0x0000000000000000000000000000000000000000000000000000000000000000"))
        .all();
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

  describe("Get single record by key: 100 logs", () => {
    bench("recs: `getComponentValue`", async () => {
      getComponentValue(components.Number, encodeEntity(components.Number.metadata.keySchema, { key: 0 }));
    });

    bench("zustand: `getRecord`", async () => {
      useStore.getState().getRecord(tables.Number, { key: 0 });
    });

    bench("sqlite: `select`", async () => {
      const tables = getTables(db).filter((table) => table.name === "Number");
      const sqlTable = buildTable(tables[0]);

      db.select()
        .from(sqlTable)
        .where(eq(sqlTable.__key, "0x0000000000000000000000000000000000000000000000000000000000000000"))
        .all();
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

  describe("Get single record by key: 1000 logs", () => {
    bench("recs: `getComponentValue`", async () => {
      getComponentValue(components.Number, encodeEntity(components.Number.metadata.keySchema, { key: 0 }));
    });

    bench("zustand: `getRecord`", async () => {
      useStore.getState().getRecord(tables.Number, { key: 0 });
    });

    bench("sqlite: `select`", async () => {
      const tables = getTables(db).filter((table) => table.name === "Number");
      const sqlTable = buildTable(tables[0]);

      db.select()
        .from(sqlTable)
        .where(eq(sqlTable.__key, "0x0000000000000000000000000000000000000000000000000000000000000000"))
        .all();
    });
  });
}
