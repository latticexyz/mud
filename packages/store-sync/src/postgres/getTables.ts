import { PgDatabase } from "drizzle-orm/pg-core";
import { inArray } from "drizzle-orm";
import { Table } from "../common";
import { getTableName } from "./getTableName";
import { mudStoreTables } from "./internalTables";
import { tableIdToHex } from "@latticexyz/common";

export async function getTables(
  db: PgDatabase<any>,
  conditions: Pick<Table, "address" | "namespace" | "name">[] = []
): Promise<Table[]> {
  const ids = Array.from(
    new Set(conditions.map((condition) => getTableName(condition.address, condition.namespace, condition.name)))
  );
  const tables = await db
    .select()
    .from(mudStoreTables)
    .where(ids.length ? inArray(mudStoreTables.id, ids) : undefined);

  return tables.map((table) => ({
    id: getTableName(table.address, table.namespace, table.name),
    address: table.address,
    tableId: tableIdToHex(table.namespace, table.name),
    namespace: table.namespace,
    name: table.name,
    keySchema: table.keySchema,
    valueSchema: table.valueSchema,
    lastUpdatedBlockNumber: table.lastUpdatedBlockNumber,
  }));
}
