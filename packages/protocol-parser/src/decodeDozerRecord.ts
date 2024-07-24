import { Table } from "@latticexyz/config";
import { getSchemaPrimitives, getValueSchema } from "@latticexyz/protocol-parser/internal";
import { decodeDozerField } from "./decodeDozerField";

export type DozerQueryResult = (string | boolean | string[])[][];

export type DecodeDozerRecordArgs<table extends Table = Table> = {
  table: table;
  records: DozerQueryResult;
};

export type DecodeDozerRecordResult<table extends Table = Table> = {
  records: getSchemaPrimitives<getValueSchema<table>>[];
};

export function decodeDozerRecord<table extends Table>({
  table,
  records,
}: DecodeDozerRecordArgs<table>): DecodeDozerRecordResult<table> {
  return {
    records: records.map((record) =>
      Object.fromEntries(
        Object.keys(table.schema).map((fieldName, index) => [
          fieldName,
          decodeDozerField(table.schema[fieldName].type, record[index]),
        ]),
      ),
    ),
  };
}
