import { Sql } from "postgres";

export async function dropDatabase(sql: Sql, databaseName: string): Promise<boolean> {
  try {
    await sql`DROP DATABASE ${sql(databaseName)}`;
    return true;
  } catch (error) {
    console.warn("Error dropping database", error);
    return false;
  }
}
