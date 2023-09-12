import { PgColumnBuilderBase, PgTableWithColumns, pgSchema } from "drizzle-orm/pg-core";
import { buildColumn } from "./buildColumn";
import { Address, getAddress } from "viem";
import { transformSchemaName } from "./transformSchemaName";
import { KeySchema, ValueSchema } from "@latticexyz/protocol-parser";

// TODO: convert camel case to snake case for DB storage?
export const metaColumns = {
  __key: buildColumn("__key", "bytes").primaryKey(),
  __staticData: buildColumn("__staticData", "bytes"),
  __encodedLengths: buildColumn("__encodedLengths", "bytes"),
  __dynamicData: buildColumn("__dynamicData", "bytes"),
  __lastUpdatedBlockNumber: buildColumn("__lastUpdatedBlockNumber", "uint256").notNull(),
  // TODO: last updated block hash?
  __isDeleted: buildColumn("__isDeleted", "bool").notNull(),
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
