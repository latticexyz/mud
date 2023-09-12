import { SQLiteColumnBuilderBase, SQLiteTableWithColumns, sqliteTable } from "drizzle-orm/sqlite-core";
import { buildColumn } from "./buildColumn";
import { Address } from "viem";
import { getTableName } from "./getTableName";
import { KeySchema, ValueSchema } from "@latticexyz/protocol-parser";

export const metaColumns = {
  __key: buildColumn("__key", "bytes").primaryKey(),
  __staticData: buildColumn("__staticData", "bytes"),
  __encodedLengths: buildColumn("__encodedLengths", "bytes"),
  __dynamicData: buildColumn("__dynamicData", "bytes"),
  __lastUpdatedBlockNumber: buildColumn("__lastUpdatedBlockNumber", "uint256").notNull(),
  // TODO: last updated block hash?
  __isDeleted: buildColumn("__isDeleted", "bool").notNull(),
} as const satisfies Record<string, SQLiteColumnBuilderBase>;

type SQLiteTableFromSchema<TKeySchema extends KeySchema, TValueSchema extends ValueSchema> = SQLiteTableWithColumns<{
  dialect: "sqlite";
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

type CreateSqliteTableOptions<TKeySchema extends KeySchema, TValueSchema extends ValueSchema> = {
  address: Address;
  namespace: string;
  name: string;
  keySchema: TKeySchema;
  valueSchema: TValueSchema;
};

type CreateSqliteTableResult<TKeySchema extends KeySchema, TValueSchema extends ValueSchema> = SQLiteTableFromSchema<
  TKeySchema,
  TValueSchema
>;

export function buildTable<TKeySchema extends KeySchema, TValueSchema extends ValueSchema>({
  address,
  namespace,
  name,
  keySchema,
  valueSchema,
}: CreateSqliteTableOptions<TKeySchema, TValueSchema>): CreateSqliteTableResult<TKeySchema, TValueSchema> {
  const tableName = getTableName(address, namespace, name);

  const keyColumns = Object.fromEntries(
    Object.entries(keySchema).map(([name, type]) => [name, buildColumn(name, type).notNull()])
  );

  const valueColumns = Object.fromEntries(
    Object.entries(valueSchema).map(([name, type]) => [name, buildColumn(name, type).notNull()])
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
