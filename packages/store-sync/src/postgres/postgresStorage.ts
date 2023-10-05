import { Hex, PublicClient, concatHex, size } from "viem";
import { PgDatabase, QueryResultHKT } from "drizzle-orm/pg-core";
import { eq, inArray } from "drizzle-orm";
import { buildTable } from "./buildTable";
import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";
import { buildInternalTables } from "./buildInternalTables";
import { getTables } from "./getTables";
import { schemaVersion } from "./schemaVersion";
import { hexToResource, spliceHex } from "@latticexyz/common";
import { setupTables } from "./setupTables";
import { getTableKey } from "./getTableKey";
import { StorageAdapter, StorageAdapterBlock } from "../common";
import { isTableRegistrationLog } from "../isTableRegistrationLog";
import { logToTable } from "../logToTable";
import { decodeKey, decodeValueArgs } from "@latticexyz/protocol-parser";

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
    const newSqlTables = newTables.map(buildTable);

    cleanUp.push(await setupTables(database, newSqlTables));

    await database.transaction(async (tx) => {
      for (const table of newTables) {
        await tx
          .insert(internalTables.tables)
          .values({
            schemaVersion,
            key: getTableKey(table),
            ...table,
            lastUpdatedBlockNumber: blockNumber,
          })
          .onConflictDoNothing()
          .execute();
      }
    });

    const tables = await getTables(
      database,
      logs.map((log) => getTableKey({ address: log.address, tableId: log.args.tableId }))
    );

    // This is currently parallelized per world (each world has its own database).
    // This may need to change if we decide to put multiple worlds into one DB (e.g. a namespace per world, but all under one DB).
    // If so, we'll probably want to wrap the entire block worth of operations in a transaction.

    await database.transaction(async (tx) => {
      const tablesWithOperations = tables.filter((table) =>
        logs.some((log) => getTableKey({ address: log.address, tableId: log.args.tableId }) === getTableKey(table))
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
          (table) => getTableKey(table) === getTableKey({ address: log.address, tableId: log.args.tableId })
        );
        if (!table) {
          const { namespace, name } = hexToResource(log.args.tableId);
          debug(`table ${namespace}:${name} not found, skipping log`, log);
          continue;
        }

        const sqlTable = buildTable(table);
        const uniqueKey = concatHex(log.args.keyTuple as Hex[]);
        const key = decodeKey(table.keySchema, log.args.keyTuple);

        debug(log.eventName, log);

        if (log.eventName === "Store_SetRecord") {
          const value = decodeValueArgs(table.valueSchema, log.args);
          debug("upserting record", {
            namespace: table.namespace,
            name: table.name,
            key,
            value,
          });
          await tx
            .insert(sqlTable)
            .values({
              __key: uniqueKey,
              __staticData: log.args.staticData,
              __encodedLengths: log.args.encodedLengths,
              __dynamicData: log.args.dynamicData,
              __lastUpdatedBlockNumber: blockNumber,
              __isDeleted: false,
              ...key,
              ...value,
            })
            .onConflictDoUpdate({
              target: sqlTable.__key,
              set: {
                __staticData: log.args.staticData,
                __encodedLengths: log.args.encodedLengths,
                __dynamicData: log.args.dynamicData,
                __lastUpdatedBlockNumber: blockNumber,
                __isDeleted: false,
                ...value,
              },
            })
            .execute();
        } else if (log.eventName === "Store_SpliceStaticData") {
          // TODO: verify that this returns what we expect (doesn't error/undefined on no record)
          const previousValue = (await tx.select().from(sqlTable).where(eq(sqlTable.__key, uniqueKey)).execute())[0];
          const previousStaticData = (previousValue?.__staticData as Hex) ?? "0x";
          const newStaticData = spliceHex(previousStaticData, log.args.start, size(log.args.data), log.args.data);
          const newValue = decodeValueArgs(table.valueSchema, {
            staticData: newStaticData,
            encodedLengths: (previousValue?.__encodedLengths as Hex) ?? "0x",
            dynamicData: (previousValue?.__dynamicData as Hex) ?? "0x",
          });
          debug("upserting record via splice static", {
            namespace: table.namespace,
            name: table.name,
            key,
            previousStaticData,
            newStaticData,
            previousValue,
            newValue,
          });
          await tx
            .insert(sqlTable)
            .values({
              __key: uniqueKey,
              __staticData: newStaticData,
              __lastUpdatedBlockNumber: blockNumber,
              __isDeleted: false,
              ...key,
              ...newValue,
            })
            .onConflictDoUpdate({
              target: sqlTable.__key,
              set: {
                __staticData: newStaticData,
                __lastUpdatedBlockNumber: blockNumber,
                __isDeleted: false,
                ...newValue,
              },
            })
            .execute();
        } else if (log.eventName === "Store_SpliceDynamicData") {
          // TODO: verify that this returns what we expect (doesn't error/undefined on no record)
          const previousValue = (await tx.select().from(sqlTable).where(eq(sqlTable.__key, uniqueKey)).execute())[0];
          const previousDynamicData = (previousValue?.__dynamicData as Hex) ?? "0x";
          const newDynamicData = spliceHex(previousDynamicData, log.args.start, log.args.deleteCount, log.args.data);
          const newValue = decodeValueArgs(table.valueSchema, {
            staticData: (previousValue?.__staticData as Hex) ?? "0x",
            // TODO: handle unchanged encoded lengths
            encodedLengths: log.args.encodedLengths,
            dynamicData: newDynamicData,
          });
          debug("upserting record via splice dynamic", {
            namespace: table.namespace,
            name: table.name,
            key,
            previousDynamicData,
            newDynamicData,
            previousValue,
            newValue,
          });
          await tx
            .insert(sqlTable)
            .values({
              __key: uniqueKey,
              // TODO: handle unchanged encoded lengths
              __encodedLengths: log.args.encodedLengths,
              __dynamicData: newDynamicData,
              __lastUpdatedBlockNumber: blockNumber,
              __isDeleted: false,
              ...key,
              ...newValue,
            })
            .onConflictDoUpdate({
              target: sqlTable.__key,
              set: {
                // TODO: handle unchanged encoded lengths
                __encodedLengths: log.args.encodedLengths,
                __dynamicData: newDynamicData,
                __lastUpdatedBlockNumber: blockNumber,
                __isDeleted: false,
                ...newValue,
              },
            })
            .execute();
        } else if (log.eventName === "Store_DeleteRecord") {
          // TODO: should we upsert so we at least have a DB record of when a thing was created/deleted within the same block?
          debug("deleting record", {
            namespace: table.namespace,
            name: table.name,
            key,
          });
          await tx
            .update(sqlTable)
            .set({
              __lastUpdatedBlockNumber: blockNumber,
              __isDeleted: true,
            })
            .where(eq(sqlTable.__key, uniqueKey))
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
