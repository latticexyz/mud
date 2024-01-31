import { bench, describe } from "vitest";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { buildTable, getTables } from "./sqlite";
import {
  components,
  db,
  recsStorageAdapter,
  sqliteStorageAdapter,
  tables,
  useStore,
  zustandStorageAdapter,
} from "../test/utils";
import { logsToBlocks } from "../test/logsToBlocks";
import worldRpcLogs from "../../../test-data/world-logs-1000.json";

const blocks = logsToBlocks(worldRpcLogs);

for (const block of blocks) {
  await Promise.all([recsStorageAdapter(block), zustandStorageAdapter(block), sqliteStorageAdapter(block)]);
}

describe("Get all records for table 1000 logs", () => {
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
