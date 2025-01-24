import {
  encodeKey,
  encodeValueArgs,
  keySchemaToHex,
  valueSchemaToFieldLayoutHex,
  valueSchemaToHex,
} from "@latticexyz/protocol-parser/internal";
import { encodeAbiParameters, parseAbiParameters } from "viem";
import { StorageAdapterLog, Table, schemasTable } from "./common";

/**
 * @internal
 */
export function tableToLog(table: Table): Extract<StorageAdapterLog, { eventName: "Store_SetRecord" }> {
  return {
    eventName: "Store_SetRecord",
    address: table.address,
    args: {
      tableId: schemasTable.tableId,
      keyTuple: encodeKey(schemasTable.keySchema, { tableId: table.tableId }),
      ...encodeValueArgs(schemasTable.valueSchema, {
        fieldLayout: valueSchemaToFieldLayoutHex(table.valueSchema),
        keySchema: keySchemaToHex(table.keySchema as never),
        valueSchema: valueSchemaToHex(table.valueSchema),
        abiEncodedKeyNames: encodeAbiParameters(parseAbiParameters("string[]"), [Object.keys(table.keySchema)]),
        abiEncodedFieldNames: encodeAbiParameters(parseAbiParameters("string[]"), [Object.keys(table.valueSchema)]),
      }),
    },
  };
}
