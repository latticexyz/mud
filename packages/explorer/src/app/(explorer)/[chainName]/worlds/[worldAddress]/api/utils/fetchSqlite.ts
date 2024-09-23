import { getDatabase } from "./getDatabase";

type Row = {
  [key: string]: string;
};

type SqliteTable = Row[] | undefined;

export async function fetchSqliteTable(tableId: string): Promise<SqliteTable> {
  const db = getDatabase();
  const query = `SELECT * FROM "${tableId}"`;
  return db?.prepare(query).all() as SqliteTable;
}
