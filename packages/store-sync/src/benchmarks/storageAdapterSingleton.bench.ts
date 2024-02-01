import { bench, describe } from "vitest";

import { blocks } from "../../test/blocks";
import { createRecsStorage, createSqliteStorage, createZustandStorage } from "../../test/utils";

const { storageAdapter: recsStorageAdapter } = createRecsStorage();
const { storageAdapter: zustandStorageAdapter } = createZustandStorage();
const { storageAdapter: sqliteStorageAdapter } = await createSqliteStorage();

describe("Hydrate Storage Adapter: singleton", () => {
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
