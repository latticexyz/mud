import { drizzle } from "drizzle-orm/sql-js";
import { createPublicClient, http } from "viem";
import { foundry } from "viem/chains";
import initSqlJs from "sql.js";
import mudConfig from "../../../e2e/packages/contracts/mud.config";
import { createWorld } from "@latticexyz/recs";
import { resolveConfig } from "@latticexyz/store";
import { recsStorage } from "../src/recs";
import { sqliteStorage } from "../src/sqlite";
import { createStorageAdapter, createStore } from "../src/zustand";

const publicClient = createPublicClient({
  chain: foundry,
  transport: http(),
});

export const tables = resolveConfig(mudConfig).tables;

export function createRecsStorage(): any {
  return recsStorage({ world: createWorld(), tables });
}
export const { components, storageAdapter: recsStorageAdapter } = createRecsStorage();

export const useStore = createStore({ tables });
export const zustandStorageAdapter = createStorageAdapter({ store: useStore });
export function createZustandStorageAdapter(): any {
  const useStore = createStore({ tables });
  return createStorageAdapter({ store: useStore });
}

const SqlJs = await initSqlJs();
export const db = drizzle(new SqlJs.Database(), {});
export const sqliteStorageAdapter = await sqliteStorage({ database: db, publicClient });
export async function createSqliteStorageAdapter(): Promise<any> {
  const SqlJs = await initSqlJs();
  const db = drizzle(new SqlJs.Database(), {});
  return await sqliteStorage({ database: db, publicClient });
}
