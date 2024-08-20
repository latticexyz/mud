import sqliteDB, { Database } from "better-sqlite3";
import fs from "fs";
import path from "path";

export function getDatabase(): Database | null {
  const dbPath = path.join(process.env.INIT_PWD as string, process.env.INDEXER_DB_PATH as string);

  console.log("dbPath", dbPath);

  if (!fs.existsSync(dbPath)) {
    return null;
  }

  const db = new sqliteDB(dbPath);
  if (!db) {
    return null;
  }

  return db;
}
