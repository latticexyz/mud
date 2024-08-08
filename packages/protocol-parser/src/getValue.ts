import { Table } from "@latticexyz/config";
import { getValueSchema } from "./getValueSchema";
import { getSchemaPrimitives } from "./getSchemaPrimitives";

type PartialTable = Pick<Table, "schema" | "key">;

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
