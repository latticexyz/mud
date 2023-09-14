import { hexToSchema, decodeValue } from "@latticexyz/protocol-parser";
import { concatHex, decodeAbiParameters } from "viem";
import { StorageAdapterLog, Table, schemasTable } from "./common";
import { hexToTableId } from "@latticexyz/common";

// TODO: add tableToLog

export function logToTable(log: StorageAdapterLog & { eventName: "StoreSetRecord" }): Table {
  const [tableId, ...otherKeys] = log.args.key;
  if (otherKeys.length) {
    console.warn("registerSchema event is expected to have only one key in key tuple, but got multiple", log);
  }

  const table = hexToTableId(tableId);

  const value = decodeValue(
    schemasTable.schema,
    concatHex([log.args.staticData, log.args.encodedLengths, log.args.dynamicData])
  );

  const keySchema = hexToSchema(value.keySchema);
  const valueSchema = hexToSchema(value.valueSchema);

  const keyNames = decodeAbiParameters([{ type: "string[]" }], value.abiEncodedKeyNames)[0];
  const fieldNames = decodeAbiParameters([{ type: "string[]" }], value.abiEncodedFieldNames)[0];

  const valueAbiTypes = [...valueSchema.staticFields, ...valueSchema.dynamicFields];

  return {
    address: log.address,
    tableId,
    namespace: table.namespace,
    name: table.name,
    keySchema: Object.fromEntries(keySchema.staticFields.map((abiType, i) => [keyNames[i], abiType])),
    valueSchema: Object.fromEntries(valueAbiTypes.map((abiType, i) => [fieldNames[i], abiType])),
  };
}
