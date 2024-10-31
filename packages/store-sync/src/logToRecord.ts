import { Table } from "@latticexyz/config";
import {
  decodeKey,
  decodeValueArgs,
  getKeySchema,
  getSchemaPrimitives,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import { StorageAdapterLog } from "./common";

type PartialTable = Pick<Table, "schema" | "key">;

export type LogToRecordArgs<table extends PartialTable> = {
  table: table;
  log: Extract<StorageAdapterLog, { eventName: "Store_SetRecord" }>;
};

export function logToRecord<table extends PartialTable>({
  table,
  log,
}: LogToRecordArgs<table>): getSchemaPrimitives<table["schema"]> {
  const keySchema = getSchemaTypes(getKeySchema(table));
  const valueSchema = getSchemaTypes(getValueSchema(table));
  const key = decodeKey(keySchema, log.args.keyTuple);
  const value = decodeValueArgs(valueSchema, log.args);
  return { ...key, ...value };
}
