import { PgDatabase } from "drizzle-orm/pg-core";
import { Hex } from "viem";
import { StorageAdapterLog, SyncFilter } from "@latticexyz/store-sync";
import { tables } from "@latticexyz/store-sync/postgres";
import { and, asc, eq, or } from "drizzle-orm";
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
          address != null ? eq(tables.recordsTable.address, address) : undefined,
          eq(tables.recordsTable.tableId, filter.tableId),
          filter.key0 != null ? eq(tables.recordsTable.key0, filter.key0) : undefined,
          filter.key1 != null ? eq(tables.recordsTable.key1, filter.key1) : undefined
        )
      )
    : address != null
    ? [eq(tables.recordsTable.address, address)]
    : [];

  // Query for the block number that the indexer (i.e. chain) is at, in case the
  // indexer is further along in the chain than a given store/table's last updated
  // block number. We'll then take the highest block number between the indexer's
  // chain state and all the records in the query (in case the records updated
  // between these queries). Using just the highest block number from the queries
  // could potentially signal to the client an older-than-necessary block number,
  // for stores/tables that haven't seen recent activity.
  // TODO: move the block number query into the records query for atomicity so we don't have to merge them here
  const chainState = await database
    .select()
    .from(tables.configTable)
    .where(eq(tables.configTable.chainId, chainId))
    .limit(1)
    .execute()
    // Get the first record in a way that returns a possible `undefined`
    // TODO: move this to `.findFirst` after upgrading drizzle or `rows[0]` after enabling `noUncheckedIndexedAccess: true`
    .then((rows) => rows.find(() => true));
  const indexerBlockNumber = chainState?.lastUpdatedBlockNumber ?? 0n;

  const records = await database
    .select()
    .from(tables.recordsTable)
    .where(or(...conditions))
    .orderBy(
      asc(tables.recordsTable.lastUpdatedBlockNumber)
      // TODO: add logIndex (https://github.com/latticexyz/mud/issues/1979)
    );

  const blockNumber = records.reduce(
    (max, record) => bigIntMax(max, record.lastUpdatedBlockNumber ?? 0n),
    indexerBlockNumber
  );

  const logs = records
    // TODO: add this to the query, assuming we can optimize with an index
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
