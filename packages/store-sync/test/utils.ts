import { drizzle } from "drizzle-orm/sql-js";
import { createPublicClient, http } from "viem";
import { foundry } from "viem/chains";
import initSqlJs from "sql.js";
import { sqliteStorage } from "../src/sqlite";
import { resolveConfig } from "@latticexyz/store";
import mudConfig from "../../../e2e/packages/contracts/mud.config";
import { createStorageAdapter, createStore } from "../src/zustand";
import { createWorld } from "@latticexyz/recs";
import { recsStorage } from "../src/recs";

const publicClient = createPublicClient({
  chain: foundry,
  transport: http(),
});

export const tables = resolveConfig(mudConfig).tables;

export const { components, storageAdapter: recsStorageAdapter } = recsStorage({ world: createWorld(), tables });

export const useStore = createStore({ tables });
export const zustandStorageAdapter = createStorageAdapter({ store: useStore });

const SqlJs = await initSqlJs();
export const db = drizzle(new SqlJs.Database(), {});
export const sqliteStorageAdapter = await sqliteStorage({ database: db, publicClient });
