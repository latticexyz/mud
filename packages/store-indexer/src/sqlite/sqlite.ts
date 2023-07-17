import { DynamicAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { Address, Chain, PublicClient, Transport } from "viem";
import { BaseSQLiteDatabase, blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { and, eq, inArray, sql } from "drizzle-orm";
import { sqliteTableToSql } from "./sqliteTableToSql";
import { createSqliteTable } from "./createSqliteTable";
import { Table, schemaToDefaults } from "../common";
import { json } from "./columnTypes";
import { TableId } from "@latticexyz/common";
import { blockLogsToStorage } from "@latticexyz/store-sync";
import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";
import { getTableName } from "./getTableName";

export const chainState = sqliteTable("__chainState", {
  chainId: integer("chainId").notNull().primaryKey(),
  lastUpdatedBlockNumber: blob("last_updated_block_number", { mode: "bigint" }),
  // TODO: last block hash?
  lastError: text("last_error"),
});

export const mudStoreTables = sqliteTable("__mudStoreTables", {
  id: text("id").notNull().primaryKey(),
  address: text("address").notNull(),
  tableId: text("table_id").notNull(),
  namespace: text("namespace").notNull(),
  name: text("name").notNull(),
  keySchema: json("key_schema").notNull(),
  valueSchema: json("value_schema").notNull(),
  lastUpdatedBlockNumber: blob("last_updated_block_number", { mode: "bigint" }),
  // TODO: last block hash?
  lastError: text("last_error"),
});

export function getTables(
  db: BaseSQLiteDatabase<"sync", void>,
  conditions: Pick<Table, "address" | "namespace" | "name">[] = []
): Table[] {
  const ids = Array.from(
    new Set(conditions.map((condition) => getTableName(condition.address, condition.namespace, condition.name)))
  );
  const tables = db
    .select()
    .from(mudStoreTables)
    .where(ids.length ? inArray(mudStoreTables.id, ids) : undefined)
    .all();

  return tables.map((table) => {
    const tableId = new TableId(table.namespace, table.name).toHex();
    return {
      id: getTableName(table.address, table.namespace, table.name),
      address: table.address as Address,
      tableId,
      namespace: table.namespace,
      name: table.name,
      keySchema: table.keySchema as Record<string, StaticAbiType>,
      valueSchema: table.valueSchema as Record<string, StaticAbiType | DynamicAbiType>,
      lastUpdatedBlockNumber: table.lastUpdatedBlockNumber,
    };
  });
}

export function blockLogsToSqlite<TConfig extends StoreConfig = StoreConfig>({
  database: db,
  publicClient,
}: {
  database: BaseSQLiteDatabase<"sync", void>;
  publicClient: PublicClient<Transport, Chain>;
  config?: TConfig;
}): ReturnType<typeof blockLogsToStorage<TConfig>> {
  // TODO: should these run lazily before first `registerTables`?
  db.run(sql.raw(sqliteTableToSql(chainState)));
  db.run(sql.raw(sqliteTableToSql(mudStoreTables)));

  return blockLogsToStorage({
    async registerTables({ blockNumber, tables }) {
      await db.transaction(async (tx) => {
        for (const table of tables) {
          debug(`creating table ${table.namespace}:${table.name} for world ${publicClient.chain.id}:${table.address}`);

          const sqliteTable = createSqliteTable({
            address: table.address,
            namespace: table.namespace,
            name: table.name,
            keySchema: table.keySchema,
            valueSchema: table.valueSchema,
          });

          tx.run(sql.raw(sqliteTableToSql(sqliteTable.table)));

          tx.insert(mudStoreTables)
            .values({
              id: getTableName(table.address, table.namespace, table.name),
              address: table.address,
              tableId: new TableId(table.namespace, table.name).toHex(),
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
    },
    async getTables({ tables }) {
      return getTables(db, tables);
    },
    async storeOperations({ blockNumber, operations }) {
      // This is currently parallelized per world (each world has its own database).
      // This may need to change if we decide to put multiple worlds into one DB (e.g. a namespace per world, but all under one DB).
      // If so, we'll probably want to wrap the entire block worth of operations in a transaction.

      const tables = getTables(
        db,
        Array.from(
          new Set(
            operations.map((operation) =>
              JSON.stringify({ address: operation.log.address, namespace: operation.namespace, name: operation.name })
            )
          )
        ).map((json) => JSON.parse(json))
      );

      await db.transaction(async (tx) => {
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

        for (const operation of operations) {
          const table = tables.find(
            (table) =>
              table.address === operation.log.address &&
              table.namespace === operation.namespace &&
              table.name === operation.name
          );
          if (!table) {
            debug(`table ${operation.namespace}:${String(operation.name)} not found, skipping operation`, operation);
            continue;
          }

          const isSingleton = Object.keys(table.keySchema).length === 0;

          const { table: sqliteTable } = createSqliteTable(table);

          if (operation.type === "SetRecord") {
            debug("SetRecord", operation);
            tx.insert(sqliteTable)
              .values({
                ...operation.key,
                ...operation.record,
                __lastUpdatedBlockNumber: blockNumber,
                __isDeleted: false,
                ...(isSingleton ? { __singleton: true } : {}),
              })
              .onConflictDoUpdate({
                target: isSingleton
                  ? sqliteTable.__singleton
                  : Object.keys(operation.key).map((columnName) => sqliteTable[columnName]),
                set: {
                  ...operation.record,
                  __lastUpdatedBlockNumber: blockNumber,
                  __isDeleted: false,
                },
              })
              .run();
          } else if (operation.type === "SetField") {
            debug("SetField", operation);
            tx.insert(sqliteTable)
              .values({
                ...operation.key,
                ...schemaToDefaults(table.valueSchema),
                [operation.valueName]: operation.value,
                __lastUpdatedBlockNumber: blockNumber,
                __isDeleted: false,
                ...(isSingleton ? { __singleton: true } : {}),
              })
              .onConflictDoUpdate({
                target: isSingleton
                  ? sqliteTable.__singleton
                  : Object.keys(operation.key).map((columnName) => sqliteTable[columnName]),
                set: {
                  [operation.valueName]: operation.value,
                  __lastUpdatedBlockNumber: blockNumber,
                  __isDeleted: false,
                },
              })
              .run();
          } else if (operation.type === "DeleteRecord") {
            debug("DeleteRecord", operation);
            tx.update(sqliteTable)
              .set({
                __lastUpdatedBlockNumber: blockNumber,
                __isDeleted: true,
              })
              .where(
                isSingleton
                  ? undefined
                  : and(
                      ...Object.entries(operation.key).map(([columnName, value]) => eq(sqliteTable[columnName], value))
                    )
              )
              .run();
          }
        }
      });

      db.insert(chainState)
        .values({
          chainId: publicClient.chain.id,
          lastUpdatedBlockNumber: blockNumber,
        })
        .onConflictDoUpdate({
          target: chainState.chainId,
          set: {
            lastUpdatedBlockNumber: blockNumber,
          },
        })
        .run();
    },
  });
}
