import { AnyPgColumnBuilder, PgTableWithColumns, pgSchema, pgTable } from "drizzle-orm/pg-core";
import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { buildColumn } from "./buildColumn";
import { Address } from "viem";
import { getTableName } from "./getTableName";

// TODO: convert camel case to snake case for DB storage?
export const metaColumns = {
  __key: buildColumn("__key", "bytes").notNull().primaryKey(),
  __lastUpdatedBlockNumber: buildColumn("__lastUpdatedBlockNumber", "uint256").notNull(),
  // TODO: last updated block hash?
  __isDeleted: buildColumn("__isDeleted", "bool").notNull(),
} as const satisfies Record<string, AnyPgColumnBuilder>;

type PgTableFromSchema<
  TKeySchema extends Record<string, StaticAbiType>,
  TValueSchema extends Record<string, SchemaAbiType>
> = PgTableWithColumns<{
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

type CreateTableOptions<
  TKeySchema extends Record<string, StaticAbiType>,
  TValueSchema extends Record<string, SchemaAbiType>
> = {
  schemaName?: string;
  address: Address;
  namespace: string;
  name: string;
  keySchema: TKeySchema;
  valueSchema: TValueSchema;
};

type CreateTableResult<
  TKeySchema extends Record<string, StaticAbiType>,
  TValueSchema extends Record<string, SchemaAbiType>
> = PgTableFromSchema<TKeySchema, TValueSchema>;

export function createTable<
  TKeySchema extends Record<string, StaticAbiType>,
  TValueSchema extends Record<string, SchemaAbiType>
>({
  schemaName,
  address,
  namespace,
  name,
  keySchema,
  valueSchema,
}: CreateTableOptions<TKeySchema, TValueSchema>): CreateTableResult<TKeySchema, TValueSchema> {
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

  const table = schemaName ? pgSchema(schemaName).table(tableName, columns) : pgTable(tableName, columns);

  return table as PgTableFromSchema<TKeySchema, TValueSchema>;
}
