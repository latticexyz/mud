import { PublicClient, encodePacked, getAddress, size } from "viem";
import { PgDatabase, QueryResultHKT } from "drizzle-orm/pg-core";
import { and, eq } from "drizzle-orm";
import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";
import { tables } from "./tables";
import { spliceHex } from "@latticexyz/common";
import { setupTables } from "./setupTables";
import { StorageAdapter, StorageAdapterBlock } from "../common";
import { version } from "./version";
import { uniqueBy } from "@latticexyz/common/utils";
import StoreAbi from "@latticexyz/store/out/IStore.sol/IStore.abi.json";
import { error } from "../debug";

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
              blockNumber,
              logIndex: log.logIndex ?? 0,
              isDeleted: false,
            })
            .onConflictDoUpdate({
              target: [tables.recordsTable.address, tables.recordsTable.tableId, tables.recordsTable.keyBytes],
              set: {
                staticData: log.args.staticData,
                encodedLengths: log.args.encodedLengths,
                dynamicData: log.args.dynamicData,
                blockNumber,
                logIndex: log.logIndex ?? 0,
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
              blockNumber,
              logIndex: log.logIndex ?? 0,
              isDeleted: false,
            })
            .onConflictDoUpdate({
              target: [tables.recordsTable.address, tables.recordsTable.tableId, tables.recordsTable.keyBytes],
              set: {
                staticData: newStaticData,
                blockNumber,
                logIndex: log.logIndex,
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
              blockNumber,
              logIndex: log.logIndex ?? 0,
              isDeleted: false,
            })
            .onConflictDoUpdate({
              target: [tables.recordsTable.address, tables.recordsTable.tableId, tables.recordsTable.keyBytes],
              set: {
                encodedLengths: log.args.encodedLengths,
                dynamicData: newDynamicData,
                blockNumber: blockNumber,
                logIndex: log.logIndex ?? 0,
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
              blockNumber,
              logIndex: log.logIndex ?? 0,
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
          blockNumber,
        })
        .onConflictDoUpdate({
          target: [tables.configTable.chainId],
          set: {
            blockNumber,
          },
        })
        .execute();
    });

    const updatedRecords = uniqueBy(
      logs.map((log) => ({
        address: getAddress(log.address),
        tableId: log.args.tableId,
        keyTuple: log.args.keyTuple,
        keyBytes: encodePacked(["bytes32[]"], [log.args.keyTuple]),
      })),
      (record) => `${record.address}:${record.tableId}:${record.keyBytes}`
    );

    await Promise.all(
      updatedRecords.map(async (record) => {
        const row = await database
          .select()
          .from(tables.recordsTable)
          .where(
            and(
              eq(tables.recordsTable.address, record.address),
              eq(tables.recordsTable.tableId, record.tableId),
              eq(tables.recordsTable.keyBytes, record.keyBytes)
            )
          )
          .limit(1)
          .execute()
          // Get the first record in a way that returns a possible `undefined`
          // TODO: move this to `.findFirst` after upgrading drizzle or `rows[0]` after enabling `noUncheckedIndexedAccess: true`
          .then((rows) => rows.find(() => true));

        const databaseRecord = [row?.staticData ?? "0x", row?.encodedLengths ?? "0x", row?.dynamicData ?? "0x"];
        const chainRecord = await publicClient.readContract({
          address: record.address,
          abi: StoreAbi,
          functionName: "getRecord",
          args: [record.tableId, record.keyTuple],
        });

        if (JSON.stringify(databaseRecord) !== JSON.stringify(chainRecord)) {
          error(
            "database record did not match chain state",
            JSON.stringify({
              address: record.address,
              tableId: record.tableId,
              keyTuple: record.keyTuple,
              databaseRecord,
              chainRecord,
            })
          );
        }
      })
    );
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
