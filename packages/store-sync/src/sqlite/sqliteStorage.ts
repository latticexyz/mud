import { Hex, PublicClient, concatHex, getAddress, size } from "viem";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { and, eq, sql } from "drizzle-orm";
import { sqliteTableToSql } from "./sqliteTableToSql";
import { buildTable } from "./buildTable";
import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";
import { getTableName } from "./getTableName";
import { chainState, mudStoreTables } from "./internalTables";
import { getTables } from "./getTables";
import { schemaVersion } from "./schemaVersion";
import { StorageAdapter } from "../common";
import { isTableRegistrationLog } from "../isTableRegistrationLog";
import { logToTable } from "../logToTable";
import { hexToResource, spliceHex } from "@latticexyz/common";
import { decodeKey, decodeValueArgs } from "@latticexyz/protocol-parser";

// TODO: upgrade drizzle and use async sqlite interface for consistency

export async function sqliteStorage<TConfig extends StoreConfig = StoreConfig>({
  database,
  publicClient,
}: {
  database: BaseSQLiteDatabase<"sync", void>;
  publicClient: PublicClient;
  config?: TConfig;
}): Promise<StorageAdapter> {
  const chainId = publicClient.chain?.id ?? (await publicClient.getChainId());

  // TODO: should these run lazily before first `registerTables`?
  database.run(sql.raw(sqliteTableToSql(chainState)));
  database.run(sql.raw(sqliteTableToSql(mudStoreTables)));

  return async function sqliteStorageAdapter({ blockNumber, logs }) {
    // Find table registration logs and create new tables
    const newTables = logs.filter(isTableRegistrationLog).map(logToTable);
    await database.transaction(async (tx) => {
      for (const table of newTables) {
        debug(`creating table ${table.namespace}:${table.name} for world ${chainId}:${table.address}`);

        const sqliteTable = buildTable(table);

        tx.run(sql.raw(sqliteTableToSql(sqliteTable)));

        tx.insert(mudStoreTables)
          .values({
            schemaVersion,
            id: getTableName(table.address, table.namespace, table.name),
            ...table,
            lastUpdatedBlockNumber: blockNumber,
          })
          .onConflictDoNothing()
          .run();
      }
    });

    const tables = getTables(
      database,
      Array.from(
        new Set(
          logs.map((log) =>
            JSON.stringify({
              address: getAddress(log.address),
              ...hexToResource(log.args.tableId),
            })
          )
        )
      ).map((json) => JSON.parse(json))
    );

    await database.transaction(async (tx) => {
      for (const { address, namespace, name } of tables) {
        tx.update(mudStoreTables)
          .set({ lastUpdatedBlockNumber: blockNumber })
          .where(
            and(
              eq(mudStoreTables.address, address),
              eq(mudStoreTables.namespace, namespace),
              eq(mudStoreTables.name, name)
            )
          )
          .run();
      }

      for (const log of logs) {
        const table = tables.find(
          (table) => table.address === getAddress(log.address) && table.tableId === log.args.tableId
        );
        if (!table) {
          const tableId = hexToResource(log.args.tableId);
          debug(`table ${tableId.namespace}:${tableId.name} not found, skipping log`, log);
          continue;
        }

        const sqlTable = buildTable(table);
        const uniqueKey = concatHex(log.args.keyTuple as Hex[]);
        const key = decodeKey(table.keySchema, log.args.keyTuple);

        if (log.eventName === "Store_SetRecord") {
          const value = decodeValueArgs(table.valueSchema, log.args);
          debug("upserting record", {
            namespace: table.namespace,
            name: table.name,
            key,
            value,
          });
          tx.insert(sqlTable)
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
            .run();
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
          tx.insert(sqlTable)
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
            .run();
        } else if (log.eventName === "Store_SpliceDynamicData") {
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
          tx.insert(sqlTable)
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
            .run();
        } else if (log.eventName === "Store_DeleteRecord") {
          // TODO: should we upsert so we at least have a DB record of when a thing was created/deleted within the same block?
          debug("deleting record", {
            namespace: table.namespace,
            name: table.name,
            key,
          });
          tx.update(sqlTable)
            .set({
              __lastUpdatedBlockNumber: blockNumber,
              __isDeleted: true,
            })
            .where(eq(sqlTable.__key, uniqueKey))
            .run();
        }
      }

      tx.insert(chainState)
        .values({
          schemaVersion,
          chainId,
          lastUpdatedBlockNumber: blockNumber,
        })
        .onConflictDoUpdate({
          target: [chainState.schemaVersion, chainState.chainId],
          set: {
            lastUpdatedBlockNumber: blockNumber,
          },
        })
        .run();
    });
  };
}
