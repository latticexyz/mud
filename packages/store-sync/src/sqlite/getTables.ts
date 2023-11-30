import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { asc, inArray } from "drizzle-orm";
import { Table } from "../common";
import { getTableName } from "./getTableName";
import { mudStoreTables } from "./internalTables";

export function getTables(
  db: BaseSQLiteDatabase<"sync", void>,
  conditions: Pick<Table, "address" | "namespace" | "name">[] = []
): Table[] {
  const ids = Array.from(
    new Set(conditions.map((condition) => getTableName(condition.address, condition.namespace, condition.name)))
  );
  const tables = db
    .select()
    .from(mudStoreTables)
    .where(ids.length ? inArray(mudStoreTables.id, ids) : undefined)
    // TODO: add logIndex and use that to sort instead of address/tableId? (https://github.com/latticexyz/mud/issues/1979)
    .orderBy(asc(mudStoreTables.lastUpdatedBlockNumber), asc(mudStoreTables.address), asc(mudStoreTables.tableId))
    .all();

  return tables;
}
