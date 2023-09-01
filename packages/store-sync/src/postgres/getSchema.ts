import { PgTable } from "drizzle-orm/pg-core";

// TODO: PR to drizzle to expose `getSchema` like `getTableName`
export function getSchema(table: PgTable<any>): string | undefined {
  return (table as any)[Symbol.for("drizzle:Schema")];
}
