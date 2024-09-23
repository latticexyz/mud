import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { asc, inArray } from "drizzle-orm";
import { getTableName } from "./getTableName";
import { mudStoreTables } from "./internalTables";
import { PartialTable } from "./common";

export function getTables(
  db: BaseSQLiteDatabase<"sync", void>,
  conditions: Pick<PartialTable, "address" | "namespace" | "name">[] = [],
): PartialTable[] {
  const ids = Array.from(
    new Set(conditions.map((condition) => getTableName(condition.address, condition.namespace, condition.name))),
  );
  const tables = db
    .select()
    .from(mudStoreTables)
    .where(ids.length ? inArray(mudStoreTables.id, ids) : undefined)
    .orderBy(
      asc(mudStoreTables.lastUpdatedBlockNumber),
      // TODO: add logIndex (https://github.com/latticexyz/mud/issues/1979)
    )
    .all();

  return tables;
}
