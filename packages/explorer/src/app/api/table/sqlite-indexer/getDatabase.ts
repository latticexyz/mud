import sqliteDB, { Database } from "better-sqlite3";
import fs from "fs";

export function getDatabase(): Database | null {
  const dbPath = process.env.INDEXER_DATABASE as string;
  if (!fs.existsSync(dbPath)) {
    throw new Error(
      "Database cannot be found. Make sure --indexerDatabase flag or INDEXER_DATABASE environment variable are set, and the indexer is running.",
    );
  }

  const db = new sqliteDB(dbPath);
  if (!db) {
    throw new Error("Database path found but failed to initialize.");
  }

  return db;
}
