import { hexToSchema, decodeValue, ValueSchema } from "@latticexyz/protocol-parser";
import { Hex, concatHex, decodeAbiParameters, parseAbiParameters } from "viem";
import { StorageAdapterLog, Table, schemasTable } from "./common";
import { hexToResource } from "@latticexyz/common";

// TODO: add tableToLog

export function logToTable(log: StorageAdapterLog & { eventName: "Store_SetRecord" }): Table {
  const [tableId, ...otherKeys] = log.args.keyTuple;
  if (otherKeys.length) {
    console.warn("registerSchema event is expected to have only one key in key tuple, but got multiple", log);
  }

  const table = hexToResource(tableId);

  const value = decodeValue(
    // TODO: remove cast when we have strong types for user types
    schemasTable.valueSchema as ValueSchema,
    concatHex([log.args.staticData, log.args.encodedLengths, log.args.dynamicData])
  );

  // TODO: remove cast when we have strong types for user types
  const keySchema = hexToSchema(value.keySchema as Hex);

  // TODO: remove cast when we have strong types for user types
  const valueSchema = hexToSchema(value.valueSchema as Hex);

  // TODO: remove cast when we have strong types for user types
  const keyNames = decodeAbiParameters(parseAbiParameters("string[]"), value.abiEncodedKeyNames as Hex)[0];

  // TODO: remove cast when we have strong types for user types
  const fieldNames = decodeAbiParameters(parseAbiParameters("string[]"), value.abiEncodedFieldNames as Hex)[0];

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
