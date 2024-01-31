import { bench, describe } from "vitest";
import { getComponentValue } from "@latticexyz/recs";
import {
  components,
  recsStorageAdapter,
  sqliteStorageAdapter,
  tables,
  useStore,
  zustandStorageAdapter,
} from "../test/utils";
import { encodeEntity } from "./recs";
import { logsToBlocks } from "../test/logsToBlocks";
import worldRpcLogs from "../../../test-data/world-logs-1000.json";

const blocks = logsToBlocks(worldRpcLogs);

for (const block of blocks) {
  await Promise.all([recsStorageAdapter(block), zustandStorageAdapter(block), sqliteStorageAdapter(block)]);
}

describe("Get single record by key 1000 logs", () => {
  bench("recs: `getComponentValue`", async () => {
    getComponentValue(components.Number, encodeEntity({ key: "uint256" }, { key: 0n }));
  });

  bench("zustand: `getRecord`", async () => {
    useStore.getState().getRecord(tables.Number, { key: 0 });
  });
});
