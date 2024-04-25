import { PgDatabase } from "drizzle-orm/pg-core";
import { and, eq, or } from "drizzle-orm";
import { Table, storeTables } from "../common";
import { tables as internalTables } from "../postgres/tables";
import { Hex } from "viem";
import { decodeDynamicField } from "@latticexyz/protocol-parser";
import { logToTable } from "../logToTable";

export async function getTables(
  db: PgDatabase<any>,
  filters: { address: Hex | null; tableId: Hex | null }[] = []
): Promise<Table[]> {
  const conditions = filters.map((filter) =>
    and(
      filter.address != null ? eq(internalTables.recordsTable.address, filter.address) : undefined,
      filter.tableId != null ? eq(internalTables.recordsTable.key0, filter.tableId) : undefined
    )
  );

  const records = await db
    .select()
    .from(internalTables.recordsTable)
    .where(and(eq(internalTables.recordsTable.tableId, storeTables.Tables.tableId), or(...conditions)));

  const logs = records.map(
    (record) =>
      ({
        address: record.address,
        eventName: "Store_SetRecord",
        args: {
          tableId: record.tableId,
          keyTuple: decodeDynamicField("bytes32[]", record.keyBytes),
          staticData: record.staticData ?? "0x",
          encodedLengths: record.encodedLengths ?? "0x",
          dynamicData: record.dynamicData ?? "0x",
        },
      } as const)
  );

  const tables = logs.map(logToTable);

  return tables;
}
