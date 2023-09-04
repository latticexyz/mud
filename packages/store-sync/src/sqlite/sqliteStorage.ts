import { Hex, PublicClient, concatHex, getAddress, size, sliceHex } from "viem";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { and, eq, sql } from "drizzle-orm";
import { sqliteTableToSql } from "./sqliteTableToSql";
import { createSqliteTable } from "./createSqliteTable";
import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";
import { getTableName } from "./getTableName";
import { chainState, mudStoreTables } from "./internalTables";
import { getTables } from "./getTables";
import { schemaVersion } from "./schemaVersion";
import { StorageAdapter } from "../common";
import { isTableRegistrationLog } from "../isTableRegistrationLog";
import { logToTable } from "../logToTable";
import { hexToTableId, tableIdToHex } from "@latticexyz/common";
import { decodeKey, decodeValue } from "@latticexyz/protocol-parser";

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

  return async function storeLogs({ blockNumber, logs }) {
    // Find table registration logs and create new tables
    const newTables = logs.filter(isTableRegistrationLog).map(logToTable);
    await database.transaction(async (tx) => {
      for (const table of newTables) {
        debug(`creating table ${table.namespace}:${table.name} for world ${chainId}:${table.address}`);

        const sqliteTable = createSqliteTable({
          address: table.address,
          namespace: table.namespace,
          name: table.name,
          keySchema: table.keySchema,
          valueSchema: table.valueSchema,
        });

        tx.run(sql.raw(sqliteTableToSql(sqliteTable)));

        tx.insert(mudStoreTables)
          .values({
            schemaVersion,
            id: getTableName(table.address, table.namespace, table.name),
            address: table.address,
            tableId: tableIdToHex(table.namespace, table.name),
            namespace: table.namespace,
            name: table.name,
            keySchema: table.keySchema,
            valueSchema: table.valueSchema,
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
              ...hexToTableId(log.args.table),
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
          (table) => table.address === getAddress(log.address) && table.tableId === log.args.table
        );
        if (!table) {
          const tableId = hexToTableId(log.args.table);
          debug(`table ${tableId.namespace}:${tableId.name} not found, skipping log`, log);
          continue;
        }

        const sqliteTable = createSqliteTable(table);
        const uniqueKey = concatHex(log.args.key as Hex[]);
        const key = decodeKey(table.keySchema, log.args.key);

        if (log.eventName === "StoreSetRecord" || log.eventName === "StoreEphemeralRecord") {
          // TODO: figure out if we need to pad anything or set defaults
          const value = decodeValue(table.valueSchema, log.args.data);
          debug("SetRecord", key, value, log);
          tx.insert(sqliteTable)
            .values({
              __key: uniqueKey,
              __data: log.args.data,
              __lastUpdatedBlockNumber: blockNumber,
              __isDeleted: false,
              ...key,
              ...value,
            })
            .onConflictDoUpdate({
              target: sqliteTable.__key,
              set: {
                __data: log.args.data,
                __lastUpdatedBlockNumber: blockNumber,
                __isDeleted: false,
                ...value,
              },
            })
            .run();
        } else if (log.eventName === "StoreSpliceRecord") {
          // TODO: verify that this returns what we expect (doesn't error/undefined on no record)
          const previousData =
            tx.select().from(sqliteTable).where(eq(sqliteTable.__key, uniqueKey)).get().__data ?? "0x";

          // TODO: figure out if we need to pad anything or set defaults
          const end = log.args.start + log.args.deleteCount;
          const newData = concatHex([
            sliceHex(previousData, 0, log.args.start),
            log.args.data,
            end >= size(previousData) ? "0x" : sliceHex(previousData, end),
          ]);
          const newValue = decodeValue(table.valueSchema, newData);

          debug("SpliceRecord", { previousData, newData, newValue, log });
          tx.insert(sqliteTable)
            .values({
              __key: key,
              __data: newData,
              __lastUpdatedBlockNumber: blockNumber,
              __isDeleted: false,
              ...key,
              ...newValue,
            })
            .onConflictDoUpdate({
              target: sqliteTable.__key,
              set: {
                __data: newData,
                __lastUpdatedBlockNumber: blockNumber,
                __isDeleted: false,
                ...newValue,
              },
            })
            .run();
        } else if (log.eventName === "StoreDeleteRecord") {
          // TODO: should we upsert so we at least have a DB record of when a thing was created/deleted within the same block?
          debug("DeleteRecord", log);
          tx.update(sqliteTable)
            .set({
              __lastUpdatedBlockNumber: blockNumber,
              __isDeleted: true,
            })
            .where(eq(sqliteTable.__key, key))
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
