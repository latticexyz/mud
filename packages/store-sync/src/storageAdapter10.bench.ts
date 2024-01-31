import { bench, describe } from "vitest";
import { createRecsStorage, createSqliteStorageAdapter, createZustandStorageAdapter } from "../test/utils";
import { logsToBlocks } from "../test/logsToBlocks";
import worldRpcLogs from "../../../test-data/world-logs-10.json";

const blocks = logsToBlocks(worldRpcLogs);

describe("Storage Adapter 10 logs", () => {
  bench("recs: `storageAdapter`", async () => {
    const { storageAdapter } = createRecsStorage();

    for (const block of blocks) {
      await storageAdapter(block);
    }
  });

  bench("zustand: `storageAdapter`", async () => {
    const storageAdapter = createZustandStorageAdapter();

    for (const block of blocks) {
      await storageAdapter(block);
    }
  });

  bench("sqlite: `storageAdapter`", async () => {
    const storageAdapter = await createSqliteStorageAdapter();

    for (const block of blocks) {
      await storageAdapter(block);
    }
  });
});
