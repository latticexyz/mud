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
import { singletonEntity } from "./recs";

for (const block of blocks) {
  await recsStorageAdapter(block);
  await zustandStorageAdapter(block);
  await sqliteStorageAdapter(block);
}

describe("Get single record by key", () => {
  bench("recs: `getComponentValue`", async () => {
    getComponentValue(components.NumberList, singletonEntity);
  });

  bench("zustand: `getRecord`", async () => {
    useStore.getState().getRecord(tables.NumberList, {});
  });
});
