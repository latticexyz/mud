import { bench, describe } from "vitest";
import { resolveConfig } from "@latticexyz/store";
import { createWorld } from "@latticexyz/recs";
import { drizzle } from "drizzle-orm/sql-js";
import { createPublicClient, http } from "viem";
import { foundry } from "viem/chains";

import mudConfig from "../../../e2e/packages/contracts/mud.config";
import { recsStorage } from "./recs";
import initSqlJs from "sql.js";
import { sqliteStorage } from "./sqlite";
import { createStorageAdapter } from "./zustand/createStorageAdapter";
import { createStore } from "./zustand/createStore";
import { blocks } from "./constants";

const tables = resolveConfig(mudConfig).tables;

const world = createWorld();
const { storageAdapter: recsStorageAdapter } = recsStorage({ world, tables });

const useStore = createStore({ tables });
const zustandStorageAdapter = createStorageAdapter({ store: useStore });

const SqlJs = await initSqlJs();
const db = drizzle(new SqlJs.Database(), {});
const publicClient = createPublicClient({
  chain: foundry,
  transport: http(),
});
const sqliteStorageAdapter = await sqliteStorage({ database: db, publicClient });

describe("Storage Adapter", () => {
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
