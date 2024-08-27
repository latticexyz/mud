import { Hex, encodeAbiParameters } from "viem";
import { getSchemaPrimitives } from "./getSchemaPrimitives";
import { getKeySchema } from "./getKeySchema";
import { Table } from "@latticexyz/config";

type PartialTable = Pick<Table, "schema" | "key">;

export type getKeyTuple<table extends PartialTable, key extends readonly unknown[] = table["key"]> = {
  [i in keyof key]: Hex;
};

export function getKeyTuple<const table extends PartialTable>(
  table: table,
  key: getSchemaPrimitives<getKeySchema<table>>,
): getKeyTuple<table> {
  return table.key.map((fieldName) =>
    encodeAbiParameters([table.schema[fieldName]], [key[fieldName as never]]),
  ) as never;
}
