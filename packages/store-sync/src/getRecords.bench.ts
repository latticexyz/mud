import { bench, describe } from "vitest";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { eq } from "drizzle-orm";
import { mudStoreTables } from "./sqlite";
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
  await recsStorageAdapter(block);
  await zustandStorageAdapter(block);
  await sqliteStorageAdapter(block);
}

describe("Get Records", () => {
  bench("recs: `getComponentValue`", async () => {
    for (const entity of getComponentEntities(components.NumberList)) {
      getComponentValue(components.NumberList, entity);
    }
  });

  bench("zustand: `getRecords`", async () => {
    useStore.getState().getRecords(tables.NumberList);
  });

  bench("sqlite: `select`", async () => {
    db.select().from(mudStoreTables).where(eq(mudStoreTables.name, "NumberList")).all();
  });
});
