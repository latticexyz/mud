import { bench, describe } from "vitest";
import { getComponentEntities, getComponentValue } from "@latticexyz/recs";
import { eq } from "drizzle-orm";
import { mudStoreTables } from "./sqlite";
import {
  components,
  db,
  recsStorageAdapter,
  sqliteStorageAdapter,
  tables,
  useStore,
  zustandStorageAdapter,
} from "../test/utils";
import { logsToBlocks } from "../test/logsToBlocks";
import worldRpcLogs from "../../../test-data/world-logs-100.json";

const blocks = logsToBlocks(worldRpcLogs);

for (const block of blocks) {
  await Promise.all([recsStorageAdapter(block), zustandStorageAdapter(block), sqliteStorageAdapter(block)]);
}

describe("Get all records for table 100 logs", () => {
  bench("recs: `getComponentValue`", async () => {
    for (const entity of getComponentEntities(components.Number)) {
      getComponentValue(components.Number, entity);
    }
  });

  bench("zustand: `getRecords`", async () => {
    useStore.getState().getRecords(tables.Number);
  });

  bench("sqlite: `select`", async () => {
    db.select().from(mudStoreTables).where(eq(mudStoreTables.name, "Number")).all();
  });
});
