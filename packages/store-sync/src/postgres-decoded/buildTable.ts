import { PgColumnBuilderBase, PgTableWithColumns, pgSchema } from "drizzle-orm/pg-core";
import { Address, getAddress } from "viem";
import { snakeCase } from "change-case";
import { KeySchema, ValueSchema } from "@latticexyz/protocol-parser";
import { asBigInt, asHex } from "../postgres/columnTypes";
import { transformSchemaName } from "../postgres/transformSchemaName";
import { buildColumn } from "./buildColumn";

export const metaColumns = {
  __keyBytes: asHex("__key_bytes").primaryKey(),
  __lastUpdatedBlockNumber: asBigInt("__last_updated_block_number", "numeric"),
} as const satisfies Record<string, PgColumnBuilderBase>;

type PgTableFromSchema<TKeySchema extends KeySchema, TValueSchema extends ValueSchema> = PgTableWithColumns<{
  dialect: "pg";
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

type BuildTableOptions<TKeySchema extends KeySchema, TValueSchema extends ValueSchema> = {
  address: Address;
  namespace: string;
  name: string;
  keySchema: TKeySchema;
  valueSchema: TValueSchema;
};

type BuildTableResult<TKeySchema extends KeySchema, TValueSchema extends ValueSchema> = PgTableFromSchema<
  TKeySchema,
  TValueSchema
>;

export function buildTable<TKeySchema extends KeySchema, TValueSchema extends ValueSchema>({
  address,
  namespace,
  name,
  keySchema,
  valueSchema,
}: BuildTableOptions<TKeySchema, TValueSchema>): BuildTableResult<TKeySchema, TValueSchema> {
  // We snake case the schema name and table name for ergonomics in querying
  // (no need to double-quote), but this is destructive and may lead to
  // overlapping namespaces (both `MyNamespace` and `my_namespace` snake case
  // to the same value).
  // TODO: consider not snake casing these
  const schemaName = transformSchemaName(`${address.toLowerCase()}__${snakeCase(namespace)}`);
  const tableName = snakeCase(name);

  // Column names, however, are safe to snake case because they're scoped to tables, defined once per table, and there's a limited number of fields in total.

  const keyColumns = Object.fromEntries(
    Object.entries(keySchema).map(([name, type]) => [name, buildColumn(snakeCase(name), type).notNull()])
  );
  const valueColumns = Object.fromEntries(
    Object.entries(valueSchema).map(([name, type]) => [name, buildColumn(snakeCase(name), type).notNull()])
  );

  // TODO: make sure there are no meta columns that overlap with key/value columns

  const columns = {
    ...keyColumns,
    ...valueColumns,
    ...metaColumns,
  };

  const table = pgSchema(schemaName).table(tableName, columns);

  return table as PgTableFromSchema<TKeySchema, TValueSchema>;
}
