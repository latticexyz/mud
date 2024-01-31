import { bench, describe } from "vitest";
import { getComponentValue } from "@latticexyz/recs";
import {
  components,
  db,
  recsStorageAdapter,
  sqliteStorageAdapter,
  tables,
  useStore,
  zustandStorageAdapter,
} from "../test/utils";
import { encodeEntity } from "./recs";
import { logsToBlocks } from "../test/logsToBlocks";
import worldRpcLogs from "../../../test-data/world-logs-1000.json";
import { buildTable, getTables } from "./sqlite";
import { eq } from "drizzle-orm";

const blocks = logsToBlocks(worldRpcLogs);

for (const block of blocks) {
  await Promise.all([recsStorageAdapter(block), zustandStorageAdapter(block), sqliteStorageAdapter(block)]);
}

describe("Get single record by key 1000 logs", () => {
  bench("recs: `getComponentValue`", async () => {
    getComponentValue(components.Number, encodeEntity({ key: "uint32" }, { key: 0 }));
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
