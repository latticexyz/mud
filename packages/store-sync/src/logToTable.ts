import { decodeRecord, abiTypesToSchema, hexToSchema } from "@latticexyz/protocol-parser";
import { ConfigToValuePrimitives } from "@latticexyz/store";
import { decodeAbiParameters, parseAbiParameters } from "viem";
import { StorageAdapterLog, Table, schemasTable } from "./common";
import { hexToTableId } from "@latticexyz/common";
import storeConfig from "@latticexyz/store/mud.config";

// TODO: add tableToLog

export function logToTable(log: StorageAdapterLog & { eventName: "StoreSetRecord" }): Table {
  // TODO: refactor encode/decode to use Record<string, SchemaAbiType> schemas
  // TODO: refactor to decode key with protocol-parser utils

  const [tableId, ...otherKeys] = log.args.key;
  if (otherKeys.length) {
    console.warn("registerSchema event is expected to have only one key in key tuple, but got multiple", log);
  }

  const table = hexToTableId(tableId);

  const valueTuple = decodeRecord(abiTypesToSchema(Object.values(schemasTable.schema)), log.args.data);
  const value = Object.fromEntries(
    Object.keys(schemasTable.schema).map((name, i) => [name, valueTuple[i]])
  ) as ConfigToValuePrimitives<typeof storeConfig, typeof schemasTable.name>;

  const keySchema = hexToSchema(value.keySchema);
  const valueSchema = hexToSchema(value.valueSchema);
  const keyNames = decodeAbiParameters(parseAbiParameters("string[]"), value.abiEncodedKeyNames)[0];
  const fieldNames = decodeAbiParameters(parseAbiParameters("string[]"), value.abiEncodedFieldNames)[0];

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
