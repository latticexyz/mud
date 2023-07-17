import { DynamicAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { Address, Chain, PublicClient, Transport } from "viem";
import initSqlJs from "sql.js";
import { drizzle, SQLJsDatabase } from "drizzle-orm/sql-js";
import { SQLiteTransaction, blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { DefaultLogger, and, eq, inArray, or, sql } from "drizzle-orm";
import { sqliteTableToSql } from "./sqliteTableToSql";
import { createSqliteTable } from "./createSqliteTable";
import { ChainId, Table, TableName, TableNamespace, WorldId, getWorldId, schemaToDefaults } from "../common";
import { json } from "./columnTypes";
import { TableId } from "@latticexyz/common";
import { blockLogsToStorage } from "@latticexyz/store-sync";
import { StoreConfig } from "@latticexyz/store";
import { debug } from "./debug";

export const chainStateName = "__chainState";
export const chainState = sqliteTable(chainStateName, {
  chainId: integer("chainId").notNull().primaryKey(),
  lastUpdatedBlockNumber: blob("last_updated_block_number", { mode: "bigint" }),
  // TODO: last block hash?
  lastError: text("last_error"),
});

export const mudStoreTablesName = "__mudStoreTables";
export const mudStoreTables = sqliteTable(mudStoreTablesName, {
  tableId: text("table_id").notNull().primaryKey(),
  namespace: text("namespace").notNull(),
  name: text("name").notNull(),
  keyTupleSchema: json("key_schema").notNull(),
  valueSchema: json("value_schema").notNull(),
  lastUpdatedBlockNumber: blob("last_updated_block_number", { mode: "bigint" }),
  // TODO: last block hash?
  lastError: text("last_error"),
});

export let internalDatabase: SQLJsDatabase | null = null;
export const databases = new Map<WorldId, SQLJsDatabase>();

export function destroy(): void {
  databases.clear();
}

export async function getInternalDatabase(): Promise<SQLJsDatabase> {
  if (internalDatabase) {
    return internalDatabase;
  }

  const SqlJs = await initSqlJs();
  const db = drizzle(new SqlJs.Database(), {
    // logger: new DefaultLogger(),
  });

  db.run(sql.raw(sqliteTableToSql(chainStateName, chainState)));

  return (internalDatabase = db);
}

export async function getDatabase(chainId: ChainId, address: Address): Promise<SQLJsDatabase> {
  const worldId = getWorldId(chainId, address);
  if (databases.has(worldId)) {
    return databases.get(worldId)!;
  }

  // TODO: use sql.js in web, better-sqlite3 in node?
  // TODO: allow swapping for better-sqlite3 DB that writes to disk
  // TODO: type DB to include mudStoreTables
  const SqlJs = await initSqlJs();
  const db = drizzle(new SqlJs.Database(), {
    // logger: new DefaultLogger(),
  });

  db.run(sql.raw(sqliteTableToSql(mudStoreTablesName, mudStoreTables)));

  databases.set(worldId, db);
  return db;
}

export async function getTables(
  db: SQLJsDatabase,
  conditions: Pick<Table, "namespace" | "name">[] = []
): Promise<Table[]> {
  const tableIds = conditions.map((condition) => new TableId(condition.namespace, condition.name).toHex());
  const tables = db
    .select()
    .from(mudStoreTables)
    .where(tableIds.length ? inArray(mudStoreTables.tableId, tableIds) : undefined)
    .all();

  return tables.map((table) => ({
    tableId: new TableId(table.namespace, table.name).toHex(),
    namespace: table.namespace,
    name: table.name,
    keyTupleSchema: table.keyTupleSchema as Record<string, StaticAbiType>,
    valueSchema: table.valueSchema as Record<string, StaticAbiType | DynamicAbiType>,
    lastUpdatedBlockNumber: table.lastUpdatedBlockNumber,
  }));
}

export async function getTable(db: SQLJsDatabase, namespace: TableNamespace, name: TableName): Promise<Table | null> {
  return (await getTables(db, [{ namespace, name }]))[0] ?? null;
}

export async function createTable(
  dbOrTx: SQLJsDatabase | SQLiteTransaction<any, any, any, any>,
  table: Omit<Table, "tableId">
): Promise<Table> {
  return await dbOrTx.transaction(async (tx) => {
    const tableId = new TableId(table.namespace, table.name).toHex();
    const sqliteTable = createSqliteTable({
      namespace: table.namespace,
      name: table.name,
      keyTupleSchema: table.keyTupleSchema,
      valueSchema: table.valueSchema,
    });

    await tx.run(sql.raw(sqliteTableToSql(sqliteTable.tableName, sqliteTable.table)));

    await tx
      .insert(mudStoreTables)
      .values({
        tableId: new TableId(table.namespace, table.name).toHex(),
        namespace: table.namespace,
        name: table.name,
        keyTupleSchema: table.keyTupleSchema,
        valueSchema: table.valueSchema,
      })
      // sql.js doesn't like parallelism, so for now we just ignore duplicate tables
      // .onConflictDoNothing()
      .run();

    return {
      tableId,
      ...table,
    };
  });
}

export function blockLogsToSqlite<TConfig extends StoreConfig = StoreConfig>({
  publicClient,
}: {
  publicClient: PublicClient<Transport, Chain>;
  config?: TConfig;
}): ReturnType<typeof blockLogsToStorage<TConfig>> {
  return blockLogsToStorage({
    async registerTables({ blockNumber, tables }) {
      const addresses = Array.from(new Set(tables.map((table) => table.address)));

      await Promise.all(
        addresses.map(async (address) => {
          const db = await getDatabase(publicClient.chain.id, address);
          const storeTables = tables.filter((table) => table.address === address);

          await db.transaction(async (tx) => {
            for (const table of storeTables) {
              const existingTable = await getTable(tx, table.namespace, table.name);
              if (existingTable) {
                debug(
                  `table ${table.namespace}:${table.name} for world ${publicClient.chain.id}:${address} already exists in DB, skipping`
                );
                continue;
              }

              debug(`creating table ${table.namespace}:${table.name} for world ${publicClient.chain.id}:${address}`);
              await createTable(tx, {
                namespace: table.namespace,
                name: table.name,
                // TODO: align these names?
                keyTupleSchema: table.keyTuple,
                valueSchema: table.value,
                // TODO: pass log and/or block number into registerTable
                lastUpdatedBlockNumber: blockNumber,
              });
            }
          });
        })
      );
    },
    async getTables({ tables }) {
      const addresses = Array.from(new Set(tables.map((table) => table.address)));

      return (
        await Promise.all(
          addresses.map(async (address) => {
            const db = await getDatabase(publicClient.chain.id, address);

            const storeTables = await getTables(
              db,
              tables.filter((table) => table.address === address)
            );

            // TODO: query from chain if not found in DB

            return storeTables.map((table) => ({
              address,
              namespace: table.namespace,
              name: table.name,
              // TODO: align these names?
              keyTuple: table.keyTupleSchema,
              value: table.valueSchema,
            }));
          })
        )
      ).flat();
    },
    async storeOperations({ blockNumber, operations }) {
      // This is currently parallelized per world (each world has its own database).
      // This may need to change if we decide to put multiple worlds into one DB (e.g. a namespace per world, but all under one DB).
      // If so, we'll probably want to wrap the entire block worth of operations in a transaction.

      const addresses = Array.from(new Set(operations.map((operation) => operation.log.address)));

      await Promise.all(
        addresses.map(async (address) => {
          const db = await getDatabase(publicClient.chain.id, address);
          const storeOperations = operations.filter((operation) => operation.log.address === address);

          const tables = await Promise.all(
            Array.from(
              new Set(storeOperations.map((operation) => JSON.stringify([operation.namespace, operation.name])))
            )
              .map((json) => JSON.parse(json))
              .map(async ([namespace, name]) => ({
                namespace,
                name,
                table: await getTable(db, namespace, name),
              }))
          );

          await db.transaction(async (tx) => {
            for (const { namespace, name } of tables) {
              await tx
                .update(mudStoreTables)
                .set({ lastUpdatedBlockNumber: blockNumber })
                .where(and(eq(mudStoreTables.namespace, namespace), eq(mudStoreTables.name, name)))
                .run();
            }

            for (const operation of storeOperations) {
              const table = tables.find(
                (table) => table.namespace === operation.namespace && table.name === operation.name
              )?.table;
              if (!table) {
                debug(
                  `table ${operation.namespace}:${String(operation.name)} not found, skipping operation`,
                  operation
                );
                continue;
              }

              const isSingleton = Object.keys(table.keyTupleSchema).length === 0;

              const { table: sqliteTable } = createSqliteTable(table);

              if (operation.type === "SetRecord") {
                debug("SetRecord", operation);
                await tx
                  .insert(sqliteTable)
                  .values({
                    ...operation.keyTuple,
                    ...operation.record,
                    __lastUpdatedBlockNumber: blockNumber,
                    __isDeleted: false,
                    ...(isSingleton ? { __singleton: true } : {}),
                  })
                  .onConflictDoUpdate({
                    target: isSingleton
                      ? sqliteTable.__singleton
                      : Object.keys(operation.keyTuple).map((columnName) => sqliteTable[columnName]),
                    set: {
                      ...operation.record,
                      __lastUpdatedBlockNumber: blockNumber,
                      __isDeleted: false,
                    },
                  })
                  .run();
              } else if (operation.type === "SetField") {
                debug("SetField", operation);
                await tx
                  .insert(sqliteTable)
                  .values({
                    ...operation.keyTuple,
                    ...schemaToDefaults(table.valueSchema),
                    [operation.valueName]: operation.value,
                    __lastUpdatedBlockNumber: blockNumber,
                    __isDeleted: false,
                    ...(isSingleton ? { __singleton: true } : {}),
                  })
                  .onConflictDoUpdate({
                    target: isSingleton
                      ? sqliteTable.__singleton
                      : Object.keys(operation.keyTuple).map((columnName) => sqliteTable[columnName]),
                    set: {
                      [operation.valueName]: operation.value,
                      __lastUpdatedBlockNumber: blockNumber,
                      __isDeleted: false,
                    },
                  })
                  .run();
              } else if (operation.type === "DeleteRecord") {
                debug("DeleteRecord", operation);
                await tx
                  .update(sqliteTable)
                  .set({
                    __lastUpdatedBlockNumber: blockNumber,
                    __isDeleted: true,
                  })
                  .where(
                    isSingleton
                      ? undefined
                      : and(
                          ...Object.entries(operation.keyTuple).map(([columnName, value]) =>
                            eq(sqliteTable[columnName], value)
                          )
                        )
                  )
                  .run();
              }
            }
          });
        })
      );

      const internalDb = await getInternalDatabase();
      await internalDb
        .insert(chainState)
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
