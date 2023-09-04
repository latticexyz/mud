import { Hex, PublicClient, concatHex, size, sliceHex } from "viem";
import { PgDatabase, QueryResultHKT } from "drizzle-orm/pg-core";
import { eq, inArray } from "drizzle-orm";
import { buildTable } from "./buildTable";
import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";
import { buildInternalTables } from "./buildInternalTables";
import { getTables } from "./getTables";
import { schemaVersion } from "./schemaVersion";
import { hexToTableId, tableIdToHex } from "@latticexyz/common";
import { setupTables } from "./setupTables";
import { getTableKey } from "./getTableKey";
import { StorageAdapter, StorageAdapterBlock } from "../common";
import { isTableRegistrationLog } from "../isTableRegistrationLog";
import { logToTable } from "../logToTable";
import { decodeKey, decodeValue } from "@latticexyz/protocol-parser";

// Currently assumes one DB per chain ID

export type PostgresStorageAdapter = {
  storageAdapter: StorageAdapter;
  internalTables: ReturnType<typeof buildInternalTables>;
  cleanUp: () => Promise<void>;
};

export async function postgresStorage<TConfig extends StoreConfig = StoreConfig>({
  database,
  publicClient,
}: {
  database: PgDatabase<QueryResultHKT>;
  publicClient: PublicClient;
  config?: TConfig;
}): Promise<PostgresStorageAdapter> {
  const cleanUp: (() => Promise<void>)[] = [];

  const chainId = publicClient.chain?.id ?? (await publicClient.getChainId());

  const internalTables = buildInternalTables();
  cleanUp.push(await setupTables(database, Object.values(internalTables)));

  async function postgresStorageAdapter({ blockNumber, logs }: StorageAdapterBlock): Promise<void> {
    const newTables = logs.filter(isTableRegistrationLog).map(logToTable);
    const newSqlTables = newTables.map((table) =>
      buildTable({
        address: table.address,
        namespace: table.namespace,
        name: table.name,
        keySchema: table.keySchema,
        valueSchema: table.valueSchema,
      })
    );

    cleanUp.push(await setupTables(database, newSqlTables));

    await database.transaction(async (tx) => {
      for (const table of newTables) {
        await tx
          .insert(internalTables.tables)
          .values({
            schemaVersion,
            key: getTableKey(table),
            address: table.address,
            tableId: tableIdToHex(table.namespace, table.name),
            namespace: table.namespace,
            name: table.name,
            keySchema: table.keySchema,
            valueSchema: table.valueSchema,
            lastUpdatedBlockNumber: blockNumber,
          })
          .onConflictDoNothing()
          .execute();
      }
    });

    const tables = await getTables(
      database,
      logs.map((log) => getTableKey({ address: log.address, tableId: log.args.table }))
    );

    // This is currently parallelized per world (each world has its own database).
    // This may need to change if we decide to put multiple worlds into one DB (e.g. a namespace per world, but all under one DB).
    // If so, we'll probably want to wrap the entire block worth of operations in a transaction.

    await database.transaction(async (tx) => {
      const tablesWithOperations = tables.filter((table) =>
        logs.some((log) => getTableKey({ address: log.address, tableId: log.args.table }) === getTableKey(table))
      );
      if (tablesWithOperations.length) {
        await tx
          .update(internalTables.tables)
          .set({ lastUpdatedBlockNumber: blockNumber })
          .where(inArray(internalTables.tables.key, [...new Set(tablesWithOperations.map(getTableKey))]))
          .execute();
      }

      for (const log of logs) {
        const table = tables.find(
          (table) => getTableKey(table) === getTableKey({ address: log.address, tableId: log.args.table })
        );
        if (!table) {
          const { namespace, name } = hexToTableId(log.args.table);
          debug(`table ${namespace}:${name} not found, skipping log`, log);
          continue;
        }

        const sqlTable = buildTable(table);
        const uniqueKey = concatHex(log.args.key as Hex[]);
        const key = decodeKey(table.keySchema, log.args.key);

        debug(log.eventName, log);

        if (log.eventName === "StoreSetRecord" || log.eventName === "StoreEphemeralRecord") {
          const value = decodeValue(table.valueSchema, log.args.data);
          debug("upserting record", { key, value, log });
          await tx
            .insert(sqlTable)
            .values({
              __key: uniqueKey,
              __data: log.args.data,
              __lastUpdatedBlockNumber: blockNumber,
              __isDeleted: false,
              ...key,
              ...value,
            })
            .onConflictDoUpdate({
              target: sqlTable.__key,
              set: {
                __data: log.args.data,
                __lastUpdatedBlockNumber: blockNumber,
                __isDeleted: false,
                ...value,
              },
            })
            .execute();
        } else if (log.eventName === "StoreSpliceRecord") {
          // TODO: verify that this returns what we expect (doesn't error/undefined on no record)
          const previousData =
            (await tx.select().from(sqlTable).where(eq(sqlTable.__key, uniqueKey)).execute())[0]?.__data ?? "0x";

          // TODO: figure out if we need to pad anything or set defaults
          const end = log.args.start + log.args.deleteCount;
          const newData = concatHex([
            sliceHex(previousData, 0, log.args.start),
            log.args.data,
            end >= size(previousData) ? "0x" : sliceHex(previousData, end),
          ]);
          const newValue = decodeValue(table.valueSchema, newData);

          debug("upserting record via splice", { key, previousData, newData, newValue, log });
          await tx
            .insert(sqlTable)
            .values({
              __key: key,
              __data: newData,
              __lastUpdatedBlockNumber: blockNumber,
              __isDeleted: false,
              ...key,
              ...newValue,
            })
            .onConflictDoUpdate({
              target: sqlTable.__key,
              set: {
                __data: newData,
                __lastUpdatedBlockNumber: blockNumber,
                __isDeleted: false,
                ...newValue,
              },
            })
            .execute();
        } else if (log.eventName === "StoreDeleteRecord") {
          // TODO: should we upsert so we at least have a DB record of when a thing was created/deleted within the same block?
          debug("deleting record", { key, log });
          await tx
            .update(sqlTable)
            .set({
              __lastUpdatedBlockNumber: blockNumber,
              __isDeleted: true,
            })
            .where(eq(sqlTable.__key, key))
            .execute();
        }
      }

      await tx
        .insert(internalTables.chain)
        .values({
          schemaVersion,
          chainId,
          lastUpdatedBlockNumber: blockNumber,
        })
        .onConflictDoUpdate({
          target: [internalTables.chain.schemaVersion, internalTables.chain.chainId],
          set: {
            lastUpdatedBlockNumber: blockNumber,
          },
        })
        .execute();
    });
  }

  return {
    storageAdapter: postgresStorageAdapter,
    internalTables,
    cleanUp: async (): Promise<void> => {
      for (const fn of cleanUp) {
        await fn();
      }
    },
  };
}
