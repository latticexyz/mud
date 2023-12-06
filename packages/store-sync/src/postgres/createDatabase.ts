import { Sql } from "postgres";

export async function createDatabase(sql: Sql, databaseName: string): Promise<boolean> {
  try {
    await sql`CREATE DATABASE ${sql(databaseName)}`;
    return true;
  } catch (error) {
    console.warn("Error creating database", error);
    return false;
  }
}
