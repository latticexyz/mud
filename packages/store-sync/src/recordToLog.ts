import {
  SchemaToPrimitives,
  encodeKey,
  encodeValueArgs,
  getKeySchema,
  getSchemaTypes,
  getValueSchema,
  getKey,
  getValue,
  PartialTable,
} from "@latticexyz/protocol-parser/internal";
import { StorageAdapterLog } from "./common";
import { Table } from "@latticexyz/config";
import { Hex } from "viem";

type RecordToLogArgs<table extends PartialTable> = {
  address: Hex;
  table: table;
  record: SchemaToPrimitives<getSchemaTypes<table["schema"]>>;
};

export function recordToLog<table extends Table>({
  table,
  record,
  address,
}: RecordToLogArgs<table>): StorageAdapterLog & { eventName: "Store_SetRecord" } {
  const keySchema = getSchemaTypes(getKeySchema(table));
  const valueSchema = getSchemaTypes(getValueSchema(table));

  return {
    eventName: "Store_SetRecord",
    address: address,
    args: {
      tableId: table.tableId,
      keyTuple: encodeKey(keySchema, getKey(table, record)),
      ...encodeValueArgs(valueSchema, getValue(table, record)),
    },
  };
}
