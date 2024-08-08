import { Table } from "@latticexyz/config";
import { getKeySchema } from "./getKeySchema";
import { getSchemaPrimitives } from "./getSchemaPrimitives";

type PartialTable = Pick<Table, "schema" | "key">;

export function getKey<table extends PartialTable>(
  table: table,
  record: getSchemaPrimitives<table["schema"]>,
): getSchemaPrimitives<getKeySchema<table>> {
  return Object.fromEntries(table.key.map((fieldName) => [fieldName, record[fieldName]])) as never;
}
