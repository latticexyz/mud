import { Hex, decodeAbiParameters, parseAbiParameters } from "viem";
import { hexToResource } from "@latticexyz/common";
import { Schema, Table } from "@latticexyz/config";
import { getSchemaPrimitives, hexToSchema } from "@latticexyz/protocol-parser/internal";

export type DeployedTable = Table & {
  valueSchema: Schema;
  keySchema: Schema;
};

export const decodeTable = ({
  tableId,
  keySchema: encodedKeySchema,
  valueSchema: encodedValueSchema,
  abiEncodedKeyNames,
  abiEncodedFieldNames,
}: getSchemaPrimitives<Schema>): DeployedTable => {
  const { type, namespace, name } = hexToResource(tableId as Hex);

  const solidityKeySchema = hexToSchema(encodedKeySchema as Hex);
  const solidityValueSchema = hexToSchema(encodedValueSchema as Hex);
  const keyNames = decodeAbiParameters(parseAbiParameters("string[]"), abiEncodedKeyNames as Hex)[0];
  const fieldNames = decodeAbiParameters(parseAbiParameters("string[]"), abiEncodedFieldNames as Hex)[0];

  const valueAbiTypes = [...solidityValueSchema.staticFields, ...solidityValueSchema.dynamicFields];
  const keySchema = Object.fromEntries(
    solidityKeySchema.staticFields.map((abiType, i) => [keyNames[i], { type: abiType, internalType: abiType }]),
  ) satisfies Schema;
  const valueSchema = Object.fromEntries(
    valueAbiTypes.map((abiType, i) => [fieldNames[i], { type: abiType, internalType: abiType }]),
  ) satisfies Schema;

  return {
    tableId: tableId as Hex,
    name,
    namespace,
    label: name,
    namespaceLabel: namespace,
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
