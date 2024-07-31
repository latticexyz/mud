import { PartialTable } from "./common";
import { getValueSchema } from "./getValueSchema";
import { getSchemaPrimitives } from "./getSchemaPrimitives";

export function getValue<table extends PartialTable>(
  table: table,
  record: getSchemaPrimitives<table["schema"]>,
): getSchemaPrimitives<getValueSchema<table>> {
  return Object.fromEntries(
    Object.keys(table.schema)
      .filter((fieldName) => !table.key.includes(fieldName))
      .map((fieldName) => [fieldName, record[fieldName]]),
  ) as never;
}
