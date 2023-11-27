import { PgDatabase } from "drizzle-orm/pg-core";
import { Hex } from "viem";
import { StorageAdapterLog, SyncFilter } from "@latticexyz/store-sync";
import { chainTable, recordsTable } from "@latticexyz/store-sync/postgres";
import { and, eq, or } from "drizzle-orm";
import { decodeDynamicField } from "@latticexyz/protocol-parser";
import { bigIntMax } from "@latticexyz/common/utils";

export async function getLogs(
  database: PgDatabase<any>,
  {
    chainId,
    address,
    filters = [],
  }: {
    readonly chainId: number;
    readonly address?: Hex;
    readonly filters?: readonly SyncFilter[];
  }
): Promise<{ blockNumber: bigint; logs: (StorageAdapterLog & { eventName: "Store_SetRecord" })[] }> {
  const conditions = filters.length
    ? filters.map((filter) =>
        and(
          address != null ? eq(recordsTable.address, address) : undefined,
          eq(recordsTable.tableId, filter.tableId),
          filter.key0 != null ? eq(recordsTable.key0, filter.key0) : undefined,
          filter.key1 != null ? eq(recordsTable.key1, filter.key1) : undefined
        )
      )
    : address != null
    ? [eq(recordsTable.address, address)]
    : [];

  const chainState = await database
    .select()
    .from(chainTable)
    .where(eq(chainTable.chainId, chainId))
    .execute()
    .then((rows) => rows.find(() => true));
  let blockNumber = chainState?.lastUpdatedBlockNumber ?? 0n;

  const records = await database
    .select()
    .from(recordsTable)
    .where(or(...conditions));
  blockNumber = bigIntMax(
    blockNumber,
    records.reduce((max, record) => bigIntMax(max, record.lastUpdatedBlockNumber ?? 0n), 0n)
  );

  const logs = records
    .filter((record) => !record.isDeleted)
    .map(
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

  return { blockNumber, logs };
}
