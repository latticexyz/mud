import { bench, describe } from "vitest";
import { createRecsStorage, createSqliteStorage, createZustandStorage } from "../test/utils";
import { logsToBlocks } from "../test/logsToBlocks";
import worldRpcLogs10 from "../../../test-data/world-logs-10.json";
import worldRpcLogs100 from "../../../test-data/world-logs-100.json";
import worldRpcLogs1000 from "../../../test-data/world-logs-1000.json";

describe.each([
  { numRecords: 10, logs: worldRpcLogs10 },
  { numRecords: 100, logs: worldRpcLogs100 },
  { numRecords: 1000, logs: worldRpcLogs1000 },
] as const)("Hydrate Storage Adapter: $numRecords records", async ({ logs }) => {
  const blocks = logsToBlocks(logs);

  bench("recs: `storageAdapter`", async () => {
    const { storageAdapter } = createRecsStorage();

    for (const block of blocks) {
      await storageAdapter(block);
    }
  });

  bench("zustand: `storageAdapter`", async () => {
    const { storageAdapter } = createZustandStorage();

    for (const block of blocks) {
      await storageAdapter(block);
    }
  });

  bench("sqlite: `storageAdapter`", async () => {
    const { storageAdapter } = await createSqliteStorage();

    for (const block of blocks) {
      await storageAdapter(block);
    }
  });
});
