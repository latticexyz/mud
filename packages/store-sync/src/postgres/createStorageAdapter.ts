import { PublicClient, encodePacked, size } from "viem";
import { PgDatabase, QueryResultHKT } from "drizzle-orm/pg-core";
import { and, eq } from "drizzle-orm";
import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";
import { tables } from "./tables";
import { spliceHex } from "@latticexyz/common";
import { setupTables } from "./setupTables";
import { StorageAdapter, StorageAdapterBlock } from "../common";
import { version } from "./version";

// Currently assumes one DB per chain ID

export type PostgresStorageAdapter = {
  storageAdapter: StorageAdapter;
  tables: typeof tables;
  cleanUp: () => Promise<void>;
};

export async function createStorageAdapter<TConfig extends StoreConfig = StoreConfig>({
  database,
  publicClient,
}: {
  database: PgDatabase<QueryResultHKT>;
  publicClient: PublicClient;
  config?: TConfig;
}): Promise<PostgresStorageAdapter> {
  const cleanUp: (() => Promise<void>)[] = [];

  const chainId = publicClient.chain?.id ?? (await publicClient.getChainId());

  cleanUp.push(await setupTables(database, Object.values(tables)));

  async function postgresStorageAdapter({ blockNumber, logs }: StorageAdapterBlock): Promise<void> {
    await database.transaction(async (tx) => {
      for (const log of logs) {
        const keyBytes = encodePacked(["bytes32[]"], [log.args.keyTuple]);

        if (log.eventName === "Store_SetRecord") {
          debug("upserting record", {
            address: log.address,
            tableId: log.args.tableId,
            keyTuple: log.args.keyTuple,
          });

          await tx
            .insert(tables.recordsTable)
            .values({
              address: log.address,
              tableId: log.args.tableId,
              keyBytes,
              key0: log.args.keyTuple[0],
              key1: log.args.keyTuple[1],
              staticData: log.args.staticData,
              encodedLengths: log.args.encodedLengths,
              dynamicData: log.args.dynamicData,
              lastUpdatedBlockNumber: blockNumber,
              isDeleted: false,
            })
            .onConflictDoUpdate({
              target: [tables.recordsTable.address, tables.recordsTable.tableId, tables.recordsTable.keyBytes],
              set: {
                staticData: log.args.staticData,
                encodedLengths: log.args.encodedLengths,
                dynamicData: log.args.dynamicData,
                lastUpdatedBlockNumber: blockNumber,
                isDeleted: false,
              },
            })
            .execute();
        } else if (log.eventName === "Store_SpliceStaticData") {
          // TODO: replace this operation with SQL `overlay()` (https://www.postgresql.org/docs/9.3/functions-binarystring.html)

          const previousValue = await tx
            .select({ staticData: tables.recordsTable.staticData })
            .from(tables.recordsTable)
            .where(
              and(
                eq(tables.recordsTable.address, log.address),
                eq(tables.recordsTable.tableId, log.args.tableId),
                eq(tables.recordsTable.keyBytes, keyBytes)
              )
            )
            .limit(1)
            .execute()
            // Get the first record in a way that returns a possible `undefined`
            // TODO: move this to `.findFirst` after upgrading drizzle or `rows[0]` after enabling `noUncheckedIndexedAccess: true`
            .then((rows) => rows.find(() => true));

          const previousStaticData = previousValue?.staticData ?? "0x";
          const newStaticData = spliceHex(previousStaticData, log.args.start, size(log.args.data), log.args.data);

          debug("upserting record via splice static", {
            address: log.address,
            tableId: log.args.tableId,
            keyTuple: log.args.keyTuple,
          });

          await tx
            .insert(tables.recordsTable)
            .values({
              address: log.address,
              tableId: log.args.tableId,
              keyBytes,
              key0: log.args.keyTuple[0],
              key1: log.args.keyTuple[1],
              staticData: newStaticData,
              lastUpdatedBlockNumber: blockNumber,
              isDeleted: false,
            })
            .onConflictDoUpdate({
              target: [tables.recordsTable.address, tables.recordsTable.tableId, tables.recordsTable.keyBytes],
              set: {
                staticData: newStaticData,
                lastUpdatedBlockNumber: blockNumber,
                isDeleted: false,
              },
            })
            .execute();
        } else if (log.eventName === "Store_SpliceDynamicData") {
          // TODO: replace this operation with SQL `overlay()` (https://www.postgresql.org/docs/9.3/functions-binarystring.html)

          const previousValue = await tx
            .select({ dynamicData: tables.recordsTable.dynamicData })
            .from(tables.recordsTable)
            .where(
              and(
                eq(tables.recordsTable.address, log.address),
                eq(tables.recordsTable.tableId, log.args.tableId),
                eq(tables.recordsTable.keyBytes, keyBytes)
              )
            )
            .limit(1)
            .execute()
            // Get the first record in a way that returns a possible `undefined`
            // TODO: move this to `.findFirst` after upgrading drizzle or `rows[0]` after enabling `noUncheckedIndexedAccess: true`
            .then((rows) => rows.find(() => true));

          const previousDynamicData = previousValue?.dynamicData ?? "0x";
          const newDynamicData = spliceHex(previousDynamicData, log.args.start, log.args.deleteCount, log.args.data);

          debug("upserting record via splice dynamic", {
            address: log.address,
            tableId: log.args.tableId,
            keyTuple: log.args.keyTuple,
          });

          await tx
            .insert(tables.recordsTable)
            .values({
              address: log.address,
              tableId: log.args.tableId,
              keyBytes,
              key0: log.args.keyTuple[0],
              key1: log.args.keyTuple[1],
              encodedLengths: log.args.encodedLengths,
              dynamicData: newDynamicData,
              lastUpdatedBlockNumber: blockNumber,
              isDeleted: false,
            })
            .onConflictDoUpdate({
              target: [tables.recordsTable.address, tables.recordsTable.tableId, tables.recordsTable.keyBytes],
              set: {
                encodedLengths: log.args.encodedLengths,
                dynamicData: newDynamicData,
                lastUpdatedBlockNumber: blockNumber,
                isDeleted: false,
              },
            })
            .execute();
        } else if (log.eventName === "Store_DeleteRecord") {
          debug("deleting record", {
            address: log.address,
            tableId: log.args.tableId,
            keyTuple: log.args.keyTuple,
          });

          await tx
            .update(tables.recordsTable)
            .set({
              staticData: null,
              encodedLengths: null,
              dynamicData: null,
              lastUpdatedBlockNumber: blockNumber,
              isDeleted: true,
            })
            .where(
              and(
                eq(tables.recordsTable.address, log.address),
                eq(tables.recordsTable.tableId, log.args.tableId),
                eq(tables.recordsTable.keyBytes, keyBytes)
              )
            )
            .execute();
        }
      }

      await tx
        .insert(tables.configTable)
        .values({
          version,
          chainId,
          lastUpdatedBlockNumber: blockNumber,
        })
        .onConflictDoUpdate({
          target: [tables.configTable.chainId],
          set: {
            lastUpdatedBlockNumber: blockNumber,
          },
        })
        .execute();
    });
  }

  return {
    storageAdapter: postgresStorageAdapter,
    tables,
    cleanUp: async (): Promise<void> => {
      for (const fn of cleanUp) {
        await fn();
      }
    },
  };
}
