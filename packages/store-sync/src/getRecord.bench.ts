import { bench, describe } from "vitest";
import { getComponentValue } from "@latticexyz/recs";
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
import { singletonEntity } from "./recs";
import { buildTable, getTables } from "./sqlite";
import { eq } from "drizzle-orm";

for (const block of blocks) {
  await Promise.all([recsStorageAdapter(block), zustandStorageAdapter(block), sqliteStorageAdapter(block)]);
}

describe("Get single record by key", () => {
  bench("recs: `getComponentValue`", async () => {
    getComponentValue(components.NumberList, singletonEntity);
  });

  bench("zustand: `getRecord`", async () => {
    useStore.getState().getRecord(tables.NumberList, {});
  });

  bench("sqlite: `select`", async () => {
    const tables = getTables(db).filter((table) => table.name === "NumberList");
    const sqlTable = buildTable(tables[0]);

    db.select().from(sqlTable).where(eq(sqlTable.__key, "0x")).all();
  });
});
