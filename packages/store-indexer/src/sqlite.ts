import { StaticPrimitiveType, DynamicPrimitiveType, DynamicAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { Address, getAddress } from "viem";
import initSqlJs from "sql.js";
import { drizzle, SQLJsDatabase } from "drizzle-orm/sql-js";
import { blob, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { DefaultLogger, and, eq, sql } from "drizzle-orm";
import { sqliteTableToSql } from "./sqliteTableToSql";
import { createSqliteTable } from "./createSqliteTable";

// This is just a fake database for now to get us started without all the SQL adapter stuff, so we can have a working TRPC -> Client pipeline. We'll swap this with a real database/backend later.

export type ChainId = number;
export type WorldId = `${ChainId}:${Address}`;

export type TableNamespace = string;
export type TableName = string;
export type TableId = `${TableNamespace}:${TableName}`;

export type TableRow = {
  keyTuple: Record<string, StaticPrimitiveType>;
  value: Record<string, StaticPrimitiveType | DynamicPrimitiveType>;
};

export type Table = {
  namespace: TableNamespace;
  name: TableName;
  keyTupleSchema: Record<string, StaticAbiType>;
  valueSchema: Record<string, StaticAbiType | DynamicAbiType>;
  lastBlockNumber: bigint | null;
};

export const mudStoreTablesName = "__mud_store_tables";
export const mudStoreTables = sqliteTable(mudStoreTablesName, {
  namespace: text("namespace").notNull().primaryKey(),
  name: text("name").notNull().primaryKey(),
  keyTupleSchema: blob("key_schema", { mode: "json" }).notNull(),
  valueSchema: blob("value_schema", { mode: "json" }).notNull(),
  lastBlockNumber: blob("last_block_number", { mode: "bigint" }),
  // TODO: last block hash?
  lastError: text("last_error"),
});

export const databases = new Map<WorldId, SQLJsDatabase>();

export function destroy(): void {
  databases.clear();
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
  const db = drizzle(new SqlJs.Database(), { logger: new DefaultLogger() });

  db.run(sql.raw(sqliteTableToSql(mudStoreTablesName, mudStoreTables)));

  databases.set(worldId, db);
  return db;
}

export async function getTables(chainId: ChainId, address: Address): Promise<Table[]> {
  const db = await getDatabase(chainId, address);
  const tables = db.select().from(mudStoreTables).all();
  return tables.map((table) => ({
    namespace: table.namespace,
    name: table.name,
    keyTupleSchema: table.keyTupleSchema as Record<string, StaticAbiType>,
    valueSchema: table.valueSchema as Record<string, StaticAbiType | DynamicAbiType>,
    lastBlockNumber: table.lastBlockNumber,
  }));
}

export async function getTable(db: SQLJsDatabase, namespace: TableNamespace, name: TableName): Promise<Table | null> {
  const tables = db
    .select()
    .from(mudStoreTables)
    .where(and(eq(mudStoreTables.namespace, namespace), eq(mudStoreTables.name, name)))
    .all();

  const table = tables[0];
  if (!table) {
    return null;
  }

  return {
    namespace: table.namespace,
    name: table.name,
    keyTupleSchema: table.keyTupleSchema as Record<string, StaticAbiType>,
    valueSchema: table.valueSchema as Record<string, StaticAbiType | DynamicAbiType>,
    lastBlockNumber: table.lastBlockNumber,
  };
}

export async function createTable(db: SQLJsDatabase, table: Table): Promise<Table> {
  const sqliteTable = createSqliteTable({
    namespace: table.namespace,
    name: table.name,
    keyTupleSchema: table.keyTupleSchema,
    valueSchema: table.valueSchema,
  });

  // TODO: check if table exists?

  db.run(sql.raw(sqliteTableToSql(sqliteTable.tableName, sqliteTable.table)));

  db.insert(mudStoreTables)
    .values({
      namespace: table.namespace,
      name: table.name,
      keyTupleSchema: JSON.stringify(table.keyTupleSchema),
      valueSchema: JSON.stringify(table.valueSchema),
    })
    .run();

  return table;
}

export const getWorldId = (chainId: ChainId, address: Address): WorldId => {
  return `${chainId}:${getAddress(address)}`;
};
