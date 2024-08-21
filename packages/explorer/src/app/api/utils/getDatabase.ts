import sqliteDB, { Database } from "better-sqlite3";
import fs from "fs";

export function getDatabase(): Database | null {
  const dbPath = process.env.INDEXER_DATABASE as string;
  if (!fs.existsSync(dbPath)) {
    return null;
  }

  const db = new sqliteDB(dbPath);
  if (!db) {
    return null;
  }

  return db;
}
