import { SQLJsDatabase, drizzle } from "drizzle-orm/sql-js";
import { createPublicClient, http } from "viem";
import { foundry } from "viem/chains";
import initSqlJs from "sql.js";
import mudConfig from "../../../e2e/packages/contracts/mud.config";
import { createWorld } from "@latticexyz/recs";
import {
  CreateStorageAdapterResult as CreateRecsStorageAdapterResult,
  createStorageAdapter as createRecsStorageAdapter,
} from "../src/recs";
import { sqliteStorage } from "../src/sqlite";
import { ZustandStore, createStorageAdapter as createZustandStorageAdapter, createStore } from "../src/zustand";
import { StorageAdapter } from "../src";

export const tables = mudConfig.tables;
export type tables = typeof tables;

export function createRecsStorage(): CreateRecsStorageAdapterResult<tables> {
  return createRecsStorageAdapter({ world: createWorld(), tables });
}

export function createZustandStorage(): {
  useStore: ZustandStore<tables>;
  storageAdapter: StorageAdapter;
} {
  const useStore = createStore({ tables });

  return { useStore, storageAdapter: createZustandStorageAdapter({ store: useStore }) };
}

export async function createSqliteStorage(): Promise<{
  database: SQLJsDatabase<Record<string, never>>;
  storageAdapter: StorageAdapter;
}> {
  const publicClient = createPublicClient({
    chain: foundry,
    transport: http(),
  });

  const SqlJs = await initSqlJs();
  const database = drizzle(new SqlJs.Database(), {});
  return { database, storageAdapter: await sqliteStorage({ database, publicClient }) };
}
