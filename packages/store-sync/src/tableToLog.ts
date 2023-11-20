import {
  encodeKey,
  encodeValueArgs,
  keySchemaToHex,
  valueSchemaToFieldLayoutHex,
  valueSchemaToHex,
} from "@latticexyz/protocol-parser";
import { encodeAbiParameters, parseAbiParameters } from "viem";
import { StorageAdapterLog, Table, storeTables } from "./common";
import { flattenSchema } from "./flattenSchema";

export function tableToLog(table: Table): StorageAdapterLog & { eventName: "Store_SetRecord" } {
  return {
    eventName: "Store_SetRecord",
    address: table.address,
    args: {
      tableId: storeTables.Tables.tableId,
      keyTuple: encodeKey(flattenSchema(storeTables.Tables.keySchema), { tableId: table.tableId }),
      ...encodeValueArgs(flattenSchema(storeTables.Tables.valueSchema), {
        fieldLayout: valueSchemaToFieldLayoutHex(table.valueSchema),
        keySchema: keySchemaToHex(table.keySchema),
        valueSchema: valueSchemaToHex(table.valueSchema),
        abiEncodedKeyNames: encodeAbiParameters(parseAbiParameters("string[]"), [Object.keys(table.keySchema)]),
        abiEncodedFieldNames: encodeAbiParameters(parseAbiParameters("string[]"), [Object.keys(table.valueSchema)]),
      }),
    },
  };
}
