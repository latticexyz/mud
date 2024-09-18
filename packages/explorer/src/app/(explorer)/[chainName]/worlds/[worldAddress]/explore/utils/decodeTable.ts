import { Hex, decodeAbiParameters, parseAbiParameters } from "viem";
import { hexToResource } from "@latticexyz/common";
import { Schema, Table } from "@latticexyz/config";
import { hexToSchema } from "@latticexyz/protocol-parser/internal";

export type DeployedTable = Omit<Table, "label" | "namespaceLabel"> & {
  valueSchema: Schema;
  keySchema: Schema;
};

export const decodeTable = (row: Hex[]): DeployedTable => {
  const tableId = row[0];
  const encodedKeySchema = row[2];
  const encodedValueSchema = row[3];
  const abiEncodedKeyNames = row[4];
  const abiEncodedFieldNames = row[5];
  const { type, namespace, name } = hexToResource(tableId);

  const solidityKeySchema = hexToSchema(encodedKeySchema);
  const solidityValueSchema = hexToSchema(encodedValueSchema);
  const keyNames = decodeAbiParameters(parseAbiParameters("string[]"), abiEncodedKeyNames)[0];
  const fieldNames = decodeAbiParameters(parseAbiParameters("string[]"), abiEncodedFieldNames)[0];

  const valueAbiTypes = [...solidityValueSchema.staticFields, ...solidityValueSchema.dynamicFields];
  const keySchema = Object.fromEntries(
    solidityKeySchema.staticFields.map((abiType, i) => [keyNames[i], { type: abiType, internalType: abiType }]),
  ) satisfies Schema;
  const valueSchema = Object.fromEntries(
    valueAbiTypes.map((abiType, i) => [fieldNames[i], { type: abiType, internalType: abiType }]),
  ) satisfies Schema;

  return {
    tableId,
    name,
    namespace,
    type: type as DeployedTable["type"],
    schema: {
      ...keySchema,
      ...valueSchema,
    },
    valueSchema,
    keySchema,
    key: Object.keys(keySchema),
  };
};
