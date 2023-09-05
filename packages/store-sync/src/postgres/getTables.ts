import { PgDatabase } from "drizzle-orm/pg-core";
import { inArray } from "drizzle-orm";
import { Table } from "../common";
import { buildInternalTables } from "./buildInternalTables";
import { tableIdToHex } from "@latticexyz/common";

export async function getTables(db: PgDatabase<any>, keys: string[] = []): Promise<Table[]> {
  const internalTables = buildInternalTables();

  const tables = await db
    .select()
    .from(internalTables.tables)
    .where(keys.length ? inArray(internalTables.tables.key, [...new Set(keys)]) : undefined);

  return tables.map((table) => ({
    address: table.address,
    tableId: tableIdToHex(table.namespace, table.name),
    namespace: table.namespace,
    name: table.name,
    keySchema: table.keySchema,
    valueSchema: table.valueSchema,
    lastUpdatedBlockNumber: table.lastUpdatedBlockNumber,
  }));
}
