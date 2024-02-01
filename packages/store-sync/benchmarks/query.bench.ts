import { bench, describe } from "vitest";
import { Has, runQuery } from "@latticexyz/recs";
import { createRecsStorage, createZustandStorage, tables } from "../test/utils";
import { logsToBlocks } from "../test/logsToBlocks";
import worldRpcLogs10 from "../../../test-data/world-logs-10.json";
import worldRpcLogs100 from "../../../test-data/world-logs-100.json";
import worldRpcLogs1000 from "../../../test-data/world-logs-1000.json";

describe.each([
  { numRecords: 10, logs: worldRpcLogs10 },
  { numRecords: 100, logs: worldRpcLogs100 },
  { numRecords: 1000, logs: worldRpcLogs1000 },
] as const)("Get records with query: $numRecords records", async ({ logs }) => {
  const blocks = logsToBlocks(logs);

  const { components, storageAdapter: recsStorageAdapter } = createRecsStorage();
  const { useStore, storageAdapter: zustandStorageAdapter } = createZustandStorage();

  for (const block of blocks) {
    await Promise.all([recsStorageAdapter(block), zustandStorageAdapter(block)]);
  }

  bench("recs: `runQuery`", async () => {
    runQuery([Has(components.Number), Has(components.Number)]);
  });

  bench("zustand: `getRecords`", async () => {
    const records = useStore.getState().getRecords(tables.Number);

    Object.keys(useStore.getState().getRecords(tables.Number)).filter((x) => x in records);
  });
});
