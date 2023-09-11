import { AnyPgColumnBuilder, PgTableWithColumns, pgSchema } from "drizzle-orm/pg-core";
import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { buildColumn } from "./buildColumn";
import { Address, getAddress } from "viem";
import { transformSchemaName } from "./transformSchemaName";

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
  schema: string;
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

type BuildTableOptions<
  TKeySchema extends Record<string, StaticAbiType>,
  TValueSchema extends Record<string, SchemaAbiType>
> = {
  address: Address;
  namespace: string;
  name: string;
  keySchema: TKeySchema;
  valueSchema: TValueSchema;
};

type BuildTableResult<
  TKeySchema extends Record<string, StaticAbiType>,
  TValueSchema extends Record<string, SchemaAbiType>
> = PgTableFromSchema<TKeySchema, TValueSchema>;

export function buildTable<
  TKeySchema extends Record<string, StaticAbiType>,
  TValueSchema extends Record<string, SchemaAbiType>
>({
  address,
  namespace,
  name,
  keySchema,
  valueSchema,
}: BuildTableOptions<TKeySchema, TValueSchema>): BuildTableResult<TKeySchema, TValueSchema> {
  const schemaName = transformSchemaName(`${getAddress(address)}__${namespace}`);

  const keyColumns = Object.fromEntries(
    Object.entries(keySchema).map(([name, type]) => [name, buildColumn(name, type).notNull()])
  );

  const valueColumns = Object.fromEntries(
    Object.entries(valueSchema).map(([name, type]) => [name, buildColumn(name, type).notNull()])
  );

  // TODO: make sure there are no meta columns that overlap with key/value columns
  // TODO: index meta columns?

  const columns = {
    ...keyColumns,
    ...valueColumns,
    ...metaColumns,
  };

  const table = pgSchema(schemaName).table(name, columns);

  return table as PgTableFromSchema<TKeySchema, TValueSchema>;
}
