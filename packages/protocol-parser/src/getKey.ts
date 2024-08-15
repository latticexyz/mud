import { getKeySchema } from "./getKeySchema";
import { getSchemaPrimitives } from "./getSchemaPrimitives";
import { PartialTable } from "./common";

export function getKey<table extends PartialTable>(
  table: table,
  record: getSchemaPrimitives<table["schema"]>,
): getSchemaPrimitives<getKeySchema<table>> {
  return Object.fromEntries(table.key.map((fieldName) => [fieldName, record[fieldName]])) as never;
}
