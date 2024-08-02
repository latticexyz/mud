import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const DEFAULT_DB_PATH = "indexer.db";

export const getDatabase = () => {
  let dbPath = process.env.INDEXER_DB_PATH_ABSOLUTE;
  if (!dbPath) {
    dbPath = path.join(
      process.env.PWD as string,
      process.env.INDEXER_DB_PATH || DEFAULT_DB_PATH,
    );
  }

  if (!fs.existsSync(dbPath)) {
    return null;
  }

  const db = new Database(dbPath);
  if (!db) {
    return null;
  }

  return db;
};
