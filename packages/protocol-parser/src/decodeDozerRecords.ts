import { Table } from "@latticexyz/config";
import { getSchemaPrimitives, getValueSchema } from "@latticexyz/protocol-parser/internal";
import { decodeDozerField } from "./decodeDozerField";

export type DozerQueryResult = (string | boolean | string[])[][];

export type DecodeDozerRecordsArgs<table extends Table = Table> = {
  table: table;
  records: DozerQueryResult;
};

export type DecodeDozerRecordsResult<table extends Table = Table> = getSchemaPrimitives<getValueSchema<table>>[];

export function decodeDozerRecords<table extends Table>({
  table,
  records,
}: DecodeDozerRecordsArgs<table>): DecodeDozerRecordsResult<table> {
  return records.map((record) =>
    Object.fromEntries(
      Object.keys(table.schema).map((fieldName, index) => [
        fieldName,
        decodeDozerField(table.schema[fieldName].type, record[index]),
      ]),
    ),
  ) as never;
}
