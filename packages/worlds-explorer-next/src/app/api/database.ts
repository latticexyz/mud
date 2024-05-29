import fs from "fs";
import Database from "better-sqlite3";

export const getDatabase = () => {
  if (!fs.existsSync(process.env.INDEXER_DB_PATH as string)) {
    return null;
  }

  return new Database(process.env.INDEXER_DB_PATH as string, { verbose: console.log });
};
