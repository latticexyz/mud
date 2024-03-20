import { hexToSchema, decodeValue } from "@latticexyz/protocol-parser/internal";
import { concatHex, decodeAbiParameters, parseAbiParameters } from "viem";
import { StorageAdapterLog, Table, schemasTable } from "./common";
import { hexToResource } from "@latticexyz/common";

/**
 * @internal
 */

export function logToTable(log: StorageAdapterLog & { eventName: "Store_SetRecord" }): Table {
  const [tableId, ...otherKeys] = log.args.keyTuple;
  if (otherKeys.length) {
    console.warn("registerSchema event is expected to have only one key in key tuple, but got multiple", log);
  }

  const table = hexToResource(tableId);

  const value = decodeValue(
    schemasTable.valueSchema,
    concatHex([log.args.staticData, log.args.encodedLengths, log.args.dynamicData]),
  );

  const keySchema = hexToSchema(value.keySchema);
  const valueSchema = hexToSchema(value.valueSchema);

  const keyNames = decodeAbiParameters(parseAbiParameters("string[]"), value.abiEncodedKeyNames)[0];
  const fieldNames = decodeAbiParameters(parseAbiParameters("string[]"), value.abiEncodedFieldNames)[0];

  const valueAbiTypes = [...valueSchema.staticFields, ...valueSchema.dynamicFields];

  return {
    address: log.address,
    type: table.type as "table" | "offchainTable",
    tableId,
    namespace: table.namespace,
    name: table.name,
    key: keyNames,
    schema: {
      ...Object.fromEntries(
        keySchema.staticFields.map((abiType, i) => [keyNames[i], { type: abiType, internalType: abiType }]),
      ),
      ...Object.fromEntries(
        valueAbiTypes.map((abiType, i) => [fieldNames[i], { type: abiType, internalType: abiType }]),
      ),
    },
  };
}
