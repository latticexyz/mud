import { bench, describe } from "vitest";
import { Has, runQuery } from "@latticexyz/recs";
import { createRecsStorage, createZustandStorage, tables } from "../test/utils";
import { logsToBlocks } from "../test/logsToBlocks";
import worldRpcLogs from "../../../test-data/world-logs-query.json";

const blocks = logsToBlocks(worldRpcLogs);

const { components, storageAdapter: recsStorageAdapter } = createRecsStorage();
const { useStore, storageAdapter: zustandStorageAdapter } = createZustandStorage();

for (const block of blocks) {
  await Promise.all([recsStorageAdapter(block), zustandStorageAdapter(block)]);
}

describe("Get records with query", async () => {
  bench("recs: `runQuery`", async () => {
    runQuery([Has(components.Number), Has(components.Vector)]);
  });

  bench("zustand: `getRecords`", async () => {
    const records = useStore.getState().getRecords(tables.Number);

    Object.keys(useStore.getState().getRecords(tables.Vector)).filter((x) => x in records);
  });
});
