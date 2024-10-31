import { hexToSchema, decodeValue, getSchemaTypes } from "@latticexyz/protocol-parser/internal";
import { concatHex, decodeAbiParameters, parseAbiParameters } from "viem";
import { StorageAdapterLog, Table, schemasTable } from "./common";
import { hexToResource } from "@latticexyz/common";
import { Schema } from "@latticexyz/config";

/**
 * @internal
 */
export function logToTable(log: Extract<StorageAdapterLog, { eventName: "Store_SetRecord" }>): Table {
  const [tableId, ...otherKeys] = log.args.keyTuple;
  if (otherKeys.length) {
    console.warn("registerSchema event is expected to have only one key in key tuple, but got multiple", log);
  }

  const resource = hexToResource(tableId);

  const value = decodeValue(
    schemasTable.valueSchema,
    concatHex([log.args.staticData, log.args.encodedLengths, log.args.dynamicData]),
  );

  const solidityKeySchema = hexToSchema(value.keySchema);
  const solidityValueSchema = hexToSchema(value.valueSchema);
  const keyNames = decodeAbiParameters(parseAbiParameters("string[]"), value.abiEncodedKeyNames)[0];
  const fieldNames = decodeAbiParameters(parseAbiParameters("string[]"), value.abiEncodedFieldNames)[0];

  const valueAbiTypes = [...solidityValueSchema.staticFields, ...solidityValueSchema.dynamicFields];

  const keySchema = Object.fromEntries(
    solidityKeySchema.staticFields.map((abiType, i) => [keyNames[i], { type: abiType, internalType: abiType }]),
  ) satisfies Schema;

  const valueSchema = Object.fromEntries(
    valueAbiTypes.map((abiType, i) => [fieldNames[i], { type: abiType, internalType: abiType }]),
  ) satisfies Schema;

  return {
    address: log.address,
    type: resource.type as never,
    namespace: resource.namespace,
    name: resource.name,
    tableId,
    schema: { ...keySchema, ...valueSchema },
    key: Object.keys(keySchema),
    keySchema: getSchemaTypes(keySchema),
    valueSchema: getSchemaTypes(valueSchema),
  };
}
