import {
  encodeKey,
  encodeValueArgs,
  keySchemaToHex,
  valueSchemaToFieldLayoutHex,
  valueSchemaToHex,
} from "@latticexyz/protocol-parser/internal";
import { encodeAbiParameters, parseAbiParameters } from "viem";
import { StorageAdapterLog, storeTables, Table } from "./common";
import { getKeySchema, getSchemaTypes, getValueSchema } from "@latticexyz/protocol-parser";

/**
 * @internal
 */
export function tableToLog(table: Table): StorageAdapterLog & { eventName: "Store_SetRecord" } {
  return {
    eventName: "Store_SetRecord",
    address: table.address,
    args: {
      tableId: storeTables.store__Tables.tableId,
      keyTuple: encodeKey(getSchemaTypes(getKeySchema(storeTables.store__Tables)), { tableId: table.tableId }),
      ...encodeValueArgs(getSchemaTypes(getValueSchema(storeTables.store__Tables)), {
        fieldLayout: valueSchemaToFieldLayoutHex(getSchemaTypes(getValueSchema(table))),
        keySchema: keySchemaToHex(getSchemaTypes(getKeySchema(table))),
        valueSchema: valueSchemaToHex(getSchemaTypes(getValueSchema(table))),
        abiEncodedKeyNames: encodeAbiParameters(parseAbiParameters("string[]"), [Object.keys(getKeySchema(table))]),
        abiEncodedFieldNames: encodeAbiParameters(parseAbiParameters("string[]"), [Object.keys(getValueSchema(table))]),
      }),
    },
  };
}
