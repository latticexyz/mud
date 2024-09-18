import { Table } from "@latticexyz/config";
import {
  SchemaToPrimitives,
  decodeKey,
  decodeValueArgs,
  getKeySchema,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import { StorageAdapterLog } from "./common";

type PartialTable = Pick<Table, "schema" | "key">;

type LogToRecordArgs<table extends PartialTable> = {
  table: table;
  log: StorageAdapterLog & { eventName: "Store_SetRecord" };
};

export function logToRecord<table extends PartialTable>({
  table,
  log,
}: LogToRecordArgs<table>): SchemaToPrimitives<getSchemaTypes<table["schema"]>> {
  const keySchema = getSchemaTypes(getKeySchema(table));
  const valueSchema = getSchemaTypes(getValueSchema(table));
  const key = decodeKey(keySchema, log.args.keyTuple);
  const value = decodeValueArgs(valueSchema, log.args);
  return { ...key, ...value };
}
