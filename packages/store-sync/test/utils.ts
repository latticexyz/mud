import { SQLJsDatabase, drizzle } from "drizzle-orm/sql-js";
import { createPublicClient, http } from "viem";
import { foundry } from "viem/chains";
import initSqlJs from "sql.js";
import mudConfig from "../../../e2e/packages/contracts/mud.config";
import { createWorld } from "@latticexyz/recs";
import { resolveConfig } from "@latticexyz/store/internal";
import { RecsStorageAdapter, recsStorage } from "../src/recs";
import { sqliteStorage } from "../src/sqlite";
import { ZustandStore, createStorageAdapter, createStore } from "../src/zustand";
import { StorageAdapter } from "../src";

export const tables = resolveConfig(mudConfig).tables;

export function createRecsStorage(): RecsStorageAdapter<typeof tables> {
  return recsStorage({ world: createWorld(), tables });
}

export function createZustandStorage(): {
  useStore: ZustandStore<typeof tables>;
  storageAdapter: StorageAdapter;
} {
  const useStore = createStore({ tables });

  return { useStore, storageAdapter: createStorageAdapter({ store: useStore }) };
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
