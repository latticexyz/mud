import { getDatabase } from "./getDatabase";

type Row = {
  [key: string]: string;
};

type SqliteTable = Row[] | undefined;

export async function fetchSqliteTable(query: string): Promise<SqliteTable> {
  const db = getDatabase();
  return db?.prepare(query).all() as SqliteTable;
}
