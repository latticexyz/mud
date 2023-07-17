import { DefaultLogger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/sql-js";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import initSqlJs from "sql.js";

export async function getDatabase(): Promise<BaseSQLiteDatabase<"sync", void>> {
  const SqlJs = await initSqlJs();
  const database = drizzle(new SqlJs.Database(), {
    // logger: new DefaultLogger(),
  });
  return database;
}
