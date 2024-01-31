import { bench, describe } from "vitest";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { buildTable, getTables } from "./sqlite";
import { blocks } from "../test/blocks";
import {
  components,
  db,
  recsStorageAdapter,
  sqliteStorageAdapter,
  tables,
  useStore,
  zustandStorageAdapter,
} from "../test/utils";

for (const block of blocks) {
  await Promise.all([recsStorageAdapter(block), zustandStorageAdapter(block), sqliteStorageAdapter(block)]);
}

describe("Get all records for table", () => {
  bench("recs: `getComponentValue`", async () => {
    for (const entity of getComponentEntities(components.NumberList)) {
      getComponentValue(components.NumberList, entity);
    }
  });

  bench("zustand: `getRecords`", async () => {
    useStore.getState().getRecords(tables.NumberList);
  });

  bench("sqlite: `select`", async () => {
    const tables = getTables(db).filter((table) => table.name === "NumberList");
    const sqlTable = buildTable(tables[0]);

    db.select().from(sqlTable).all();
  });
});
