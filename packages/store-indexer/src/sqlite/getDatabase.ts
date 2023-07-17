import { DefaultLogger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/sql-js";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import initSqlJs from "sql.js";

let databasePromise: Promise<BaseSQLiteDatabase<"sync", void>> | undefined;

export async function getDatabase(): Promise<BaseSQLiteDatabase<"sync", void>> {
  if (databasePromise == null) {
    databasePromise = initSqlJs().then((SqlJs) =>
      drizzle(new SqlJs.Database(), {
        // logger: new DefaultLogger(),
      })
    );
  }
  return await databasePromise;
}
