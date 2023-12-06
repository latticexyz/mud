import { Sql } from "postgres";

export async function databaseExists(sql: Sql, databaseName: string): Promise<boolean> {
  try {
    // Check if the database already exists
    const exists = await sql`SELECT 1 FROM pg_database WHERE datname = ${databaseName}`;
    return exists.count === 1;
  } catch (error) {
    console.warn(`Error checking for database existence`);
    return false;
  }
}
