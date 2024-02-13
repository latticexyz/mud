import { bench, describe } from "vitest";
import { Has, runQuery } from "@latticexyz/recs";
import { createRecsStorage, createZustandStorage, tables } from "../test/utils";
import { logsToBlocks } from "../test/logsToBlocks";
import worldRpcLogs from "../../../test-data/world-logs.json.json";

describe.each("Get records with query: $numRecords records", async ({ logs }) => {
  const blocks = logsToBlocks(logs);

  const { components, storageAdapter: recsStorageAdapter } = createRecsStorage();
  const { useStore, storageAdapter: zustandStorageAdapter } = createZustandStorage();

  for (const block of blocks) {
    await Promise.all([recsStorageAdapter(block), zustandStorageAdapter(block)]);
  }

  bench("recs: `runQuery`", async () => {
    runQuery([Has(components.Number), Has(components.Vector)]);
  });

  bench("zustand: `getRecords`", async () => {
    const records = useStore.getState().getRecords(tables.Number);

    Object.keys(useStore.getState().getRecords(tables.Number)).filter((x) => x in records);
  });
});
