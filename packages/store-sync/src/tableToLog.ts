import {
  encodeKey,
  encodeValueArgs,
  keySchemaToHex,
  valueSchemaToFieldLayoutHex,
  valueSchemaToHex,
} from "@latticexyz/protocol-parser/internal";
import { encodeAbiParameters, parseAbiParameters } from "viem";
import { StorageAdapterLog, Table, storeTables } from "./common";
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
        fieldLayout: valueSchemaToFieldLayoutHex(table.valueSchema),
        keySchema: keySchemaToHex(table.keySchema),
        valueSchema: valueSchemaToHex(table.valueSchema),
        abiEncodedKeyNames: encodeAbiParameters(parseAbiParameters("string[]"), [Object.keys(table.keySchema)]),
        abiEncodedFieldNames: encodeAbiParameters(parseAbiParameters("string[]"), [Object.keys(table.valueSchema)]),
      }),
    },
  };
}
