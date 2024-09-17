import { Hex, decodeAbiParameters, parseAbiParameters } from "viem";
import { hexToResource } from "@latticexyz/common";
import { Schema } from "@latticexyz/config";
import { hexToSchema } from "@latticexyz/protocol-parser/internal";
import { SchemaAbiType } from "@latticexyz/schema-type/internal";
import { TableType } from "../../../../../../queries/dozer/useTablesQuery";

type SchemaFieldType = {
  type: SchemaAbiType;
  internalType: SchemaAbiType;
};

type DecodedTable = {
  type: TableType;
  tableId: Hex;
  name: string;
  namespace: string;
  keySchema: Record<string, SchemaFieldType>;
  valueSchema: Record<string, SchemaFieldType>;
};

export const decodeTable = (row: Hex[]): DecodedTable => {
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
    type,
    valueSchema,
    keySchema,
  };
};
