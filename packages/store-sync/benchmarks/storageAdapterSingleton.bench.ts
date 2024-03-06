import { bench, describe } from "vitest";
import { createRecsStorage, createSqliteStorage, createZustandStorage } from "../test/utils";
import { logsToBlocks } from "../test/logsToBlocks";
import worldRpcLogs from "../../../test-data/world-logs.json";

const blocks = logsToBlocks(worldRpcLogs);

describe("Hydrate Storage Adapter: singleton", () => {
  bench("recs: `storageAdapter`", async () => {
    const { storageAdapter: recsStorageAdapter } = createRecsStorage();
    for (const block of blocks) {
      await recsStorageAdapter(block);
    }
  });

  bench("zustand: `storageAdapter`", async () => {
    const { storageAdapter: zustandStorageAdapter } = createZustandStorage();
    for (const block of blocks) {
      await zustandStorageAdapter(block);
    }
  });

  bench("sqlite: `storageAdapter`", async () => {
    const { storageAdapter: sqliteStorageAdapter } = await createSqliteStorage();
    for (const block of blocks) {
      await sqliteStorageAdapter(block);
    }
  });
});
