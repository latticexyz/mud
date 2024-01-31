import { bench, describe } from "vitest";
import { recsStorageAdapter, sqliteStorageAdapter, zustandStorageAdapter } from "../test/utils";
import { logsToBlocks } from "../test/logsToBlocks";
import worldRpcLogs from "../../../test-data/world-logs-100.json";

const blocks = logsToBlocks(worldRpcLogs);

describe("Storage Adapter 100 logs", () => {
  bench("recs: `storageAdapter`", async () => {
    for (const block of blocks) {
      await recsStorageAdapter(block);
    }
  });

  bench("zustand: `storageAdapter`", async () => {
    for (const block of blocks) {
      await zustandStorageAdapter(block);
    }
  });

  bench("sqlite: `storageAdapter`", async () => {
    for (const block of blocks) {
      await sqliteStorageAdapter(block);
    }
  });
});
