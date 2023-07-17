import { DefaultLogger } from "drizzle-orm";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

let databasePromise: Promise<BaseSQLiteDatabase<"sync", void>> | undefined;

export async function getDatabase(): Promise<BaseSQLiteDatabase<"sync", void>> {
  if (databasePromise == null) {
    databasePromise = Promise.resolve(
      drizzle(new Database("indexer.db"), {
        // logger: new DefaultLogger(),
      }) as any as BaseSQLiteDatabase<"sync", void>
    );
  }
  return await databasePromise;
}
