import { PgColumnBuilderBase, PgTableWithColumns, pgSchema } from "drizzle-orm/pg-core";
import { snakeCase } from "change-case";
import { asBigInt, asHex } from "../postgres/columnTypes";
import { transformSchemaName } from "../postgres/transformSchemaName";
import { buildColumn } from "./buildColumn";
import { PartialTable } from "./common";

export const metaColumns = {
  __keyBytes: asHex("__key_bytes").primaryKey(),
  __lastUpdatedBlockNumber: asBigInt("__last_updated_block_number", "numeric"),
} as const satisfies Record<string, PgColumnBuilderBase>;

type PgTableFromSchema<table extends PartialTable> = PgTableWithColumns<{
  dialect: "pg";
  name: string;
  schema: string;
  columns: {
    // TODO: figure out column types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [metaColumn in keyof typeof metaColumns | keyof table["keySchema"] | keyof table["valueSchema"]]: any;
  };
}>;

type BuildTableOptions<table extends PartialTable> = table;
type BuildTableResult<table extends PartialTable> = PgTableFromSchema<table>;

export function buildTable<table extends PartialTable>({
  address,
  namespace,
  name,
  keySchema,
  valueSchema,
}: BuildTableOptions<table>): BuildTableResult<table> {
  // We intentionally do not snake case the namespace due to potential conflicts
  // with namespaces of a similar name (e.g. `MyNamespace` vs. `my_namespace`).
  // TODO: consider snake case when we resolve https://github.com/latticexyz/mud/issues/1991
  const schemaName = transformSchemaName(address.toLowerCase());
  const tableName = namespace ? `${snakeCase(namespace)}__${snakeCase(name)}` : snakeCase(name);

  // Column names, however, are safe to snake case because they're scoped to tables, defined once per table, and there's a limited number of fields in total.

  const keyColumns = Object.fromEntries(
    Object.entries(keySchema).map(([name, type]) => [name, buildColumn(snakeCase(name), type).notNull()]),
  );
  const valueColumns = Object.fromEntries(
    Object.entries(valueSchema).map(([name, type]) => [name, buildColumn(snakeCase(name), type).notNull()]),
  );

  // TODO: make sure there are no meta columns that overlap with key/value columns

  const columns = {
    ...keyColumns,
    ...valueColumns,
    ...metaColumns,
  };

  const table = pgSchema(schemaName).table(tableName, columns);

  return table as never;
}
