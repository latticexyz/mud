import { bench, describe } from "vitest";
import { createRecsStorage, createSqliteStorage, createZustandStorage } from "../../test/utils";
import { logsToBlocks } from "../../test/logsToBlocks";
import worldRpcLogs10 from "../../../../test-data/world-logs-10.json";
import worldRpcLogs100 from "../../../../test-data/world-logs-100.json";
import worldRpcLogs1000 from "../../../../test-data/world-logs-1000.json";

{
  const blocks = logsToBlocks(worldRpcLogs10);

  describe("Hydrate Storage Adapter: 10 logs", () => {
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
}

{
  const blocks = logsToBlocks(worldRpcLogs100);

  describe("Hydrate Storage Adapter: 100 logs", () => {
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
}

{
  const blocks = logsToBlocks(worldRpcLogs1000);

  describe("Hydrate Storage Adapter: 1000 logs", () => {
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
}
