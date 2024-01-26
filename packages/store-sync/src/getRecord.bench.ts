import { bench, describe } from "vitest";
import { getComponentValue } from "@latticexyz/recs";
import { blocks } from "../test/blocks";
import {
  components,
  recsStorageAdapter,
  sqliteStorageAdapter,
  tables,
  useStore,
  zustandStorageAdapter,
} from "../test/utils";
import { singletonEntity } from "./recs";

await Promise.all(
  blocks.flatMap((block) => [recsStorageAdapter(block), zustandStorageAdapter(block), sqliteStorageAdapter(block)])
);

describe("Get single record by key", () => {
  bench("recs: `getComponentValue`", async () => {
    getComponentValue(components.NumberList, singletonEntity);
  });

  bench("zustand: `getRecord`", async () => {
    useStore.getState().getRecord(tables.NumberList, {});
  });
});
