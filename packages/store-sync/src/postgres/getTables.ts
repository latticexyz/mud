import { PgDatabase } from "drizzle-orm/pg-core";
import { getTableName, inArray } from "drizzle-orm";
import { Table } from "../common";
import { buildInternalTables } from "./buildInternalTables";
import { buildTable } from "./buildTable";
import { debug } from "./debug";
import { isDefined } from "@latticexyz/common/utils";

export async function getTables(db: PgDatabase<any>, keys: string[] = []): Promise<Table[]> {
  const internalTables = buildInternalTables();

  const tables = await db
    .select()
    .from(internalTables.tables)
    .where(keys.length ? inArray(internalTables.tables.key, [...new Set(keys)]) : undefined);

  const validTables = await Promise.all(
    tables.map(async (table) => {
      const sqlTable = buildTable(table);
      try {
        await db.select({ key: sqlTable.__key }).from(sqlTable).limit(1);
        return table;
      } catch (error) {
        debug("Could not query table, skipping", getTableName(sqlTable), error);
      }
    })
  );

  return validTables.filter(isDefined);
}
