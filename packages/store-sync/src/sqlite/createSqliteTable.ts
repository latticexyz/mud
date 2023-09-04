import { AnySQLiteColumnBuilder, SQLiteTableWithColumns, sqliteTable } from "drizzle-orm/sqlite-core";
import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { buildSqliteColumn } from "./buildSqliteColumn";
import { Address } from "viem";
import { getTableName } from "./getTableName";

export const metaColumns = {
  __key: buildSqliteColumn("__key", "bytes").notNull().primaryKey(),
  __data: buildSqliteColumn("__data", "bytes").notNull().notNull(),
  __lastUpdatedBlockNumber: buildSqliteColumn("__lastUpdatedBlockNumber", "uint256").notNull(),
  // TODO: last updated block hash?
  __isDeleted: buildSqliteColumn("__isDeleted", "bool").notNull(),
} as const satisfies Record<string, AnySQLiteColumnBuilder>;

type SQLiteTableFromSchema<
  TKeySchema extends Record<string, StaticAbiType>,
  TValueSchema extends Record<string, SchemaAbiType>
> = SQLiteTableWithColumns<{
  name: string;
  schema: string | undefined;
  columns: {
    // TODO: figure out column types
    [metaColumn in keyof typeof metaColumns]: any;
  } & {
    // TODO: figure out column types
    [keyColumn in keyof TKeySchema]: any;
  } & {
    // TODO: figure out column types
    [valueColumn in keyof TValueSchema]: any;
  };
}>;

type CreateSqliteTableOptions<
  TKeySchema extends Record<string, StaticAbiType>,
  TValueSchema extends Record<string, SchemaAbiType>
> = {
  address: Address;
  namespace: string;
  name: string;
  keySchema: TKeySchema;
  valueSchema: TValueSchema;
};

type CreateSqliteTableResult<
  TKeySchema extends Record<string, StaticAbiType>,
  TValueSchema extends Record<string, SchemaAbiType>
> = SQLiteTableFromSchema<TKeySchema, TValueSchema>;

export function createSqliteTable<
  TKeySchema extends Record<string, StaticAbiType>,
  TValueSchema extends Record<string, SchemaAbiType>
>({
  address,
  namespace,
  name,
  keySchema,
  valueSchema,
}: CreateSqliteTableOptions<TKeySchema, TValueSchema>): CreateSqliteTableResult<TKeySchema, TValueSchema> {
  const tableName = getTableName(address, namespace, name);

  const keyColumns = Object.fromEntries(
    Object.entries(keySchema).map(([name, type]) => [name, buildSqliteColumn(name, type).notNull()])
  );

  const valueColumns = Object.fromEntries(
    Object.entries(valueSchema).map(([name, type]) => [name, buildSqliteColumn(name, type).notNull()])
  );

  // TODO: unique constraint on key columns?

  // TODO: make sure there are no meta columns that overlap with key/value columns
  // TODO: index meta columns?

  const columns = {
    ...keyColumns,
    ...valueColumns,
    ...metaColumns,
  };

  const table = sqliteTable(tableName, columns);

  return table as SQLiteTableFromSchema<TKeySchema, TValueSchema>;
}
