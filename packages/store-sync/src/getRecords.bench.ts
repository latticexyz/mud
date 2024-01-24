import { bench, describe } from "vitest";
import { resolveConfig } from "@latticexyz/store";
import { createWorld, getComponentValue } from "@latticexyz/recs";
import { drizzle } from "drizzle-orm/sql-js";
import { createPublicClient, http } from "viem";
import { foundry } from "viem/chains";

import mudConfig from "../../../e2e/packages/contracts/mud.config";
import { recsStorage, singletonEntity } from "./recs";
import initSqlJs from "sql.js";
import { mudStoreTables, sqliteStorage } from "./sqlite";
import { createStorageAdapter } from "./zustand/createStorageAdapter";
import { createStore } from "./zustand/createStore";
import { blocks } from "../test/constants";
import { eq } from "drizzle-orm";

const tables = resolveConfig(mudConfig).tables;

// RECS setup
const world = createWorld();
const { components, storageAdapter: recsStorageAdapter } = recsStorage({ world, tables });
for (const block of blocks) {
  await recsStorageAdapter(block);
}

// Zustand setup
const useStore = createStore({ tables });
const zustandStorageAdapter = createStorageAdapter({ store: useStore });
for (const block of blocks) {
  await zustandStorageAdapter(block);
}

// SQLite setup
const SqlJs = await initSqlJs();
const db = drizzle(new SqlJs.Database(), {});
const publicClient = createPublicClient({
  chain: foundry,
  transport: http(),
});
const sqliteStorageAdapter = await sqliteStorage({ database: db, publicClient });
for (const block of blocks) {
  await sqliteStorageAdapter(block);
}

describe("Get Records", () => {
  bench("recs: `getComponentValue`", async () => {
    getComponentValue(components.NumberList, singletonEntity);
  });

  bench("zustand: `getRecords`", async () => {
    useStore.getState().getRecords(tables.NumberList);
  });

  bench("zustand: `getValue`", async () => {
    useStore.getState().getValue(tables.NumberList, {});
  });

  bench("sqlite: `select`", async () => {
    db.select().from(mudStoreTables).where(eq(mudStoreTables.name, "NumberList")).all();
  });
});
