import { PgDatabase } from "drizzle-orm/pg-core";
import { inArray } from "drizzle-orm";
import { Table } from "../common";
import { getTableKey } from "./getTableKey";
import { createInternalTables } from "./createInternalTables";
import { tableIdToHex } from "@latticexyz/common";

export async function getTables(db: PgDatabase<any>, ids: string[] = []): Promise<Table[]> {
  const internalTables = createInternalTables();

  const tables = await db
    .select()
    .from(internalTables.tables)
    .where(ids.length ? inArray(internalTables.tables.id, [...new Set(ids)]) : undefined);

  return tables.map((table) => ({
    id: getTableKey(table),
    address: table.address,
    tableId: tableIdToHex(table.namespace, table.name),
    namespace: table.namespace,
    name: table.name,
    keySchema: table.keySchema,
    valueSchema: table.valueSchema,
    lastUpdatedBlockNumber: table.lastUpdatedBlockNumber,
  }));
}
