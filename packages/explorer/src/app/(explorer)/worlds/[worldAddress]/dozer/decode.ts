"use client";

import { decodeAbiParameters, parseAbiParameters } from "viem";
import { hexToResource } from "@latticexyz/common";
import { Schema } from "@latticexyz/config";
import { hexToSchema } from "@latticexyz/protocol-parser/internal";

export const decode = (row) => {
  // const { tableId } = decodeKey(
  //   getSchemaTypes(getKeySchema(storeConfig.namespaces.store.tables.Tables)),
  //   "0x6f740000000000000000000000000000506c61796572416374696f6e4e6f7469",
  // );

  const tableId = row[0];
  const fieldLayout = row[1];
  const keySchema = row[2];
  const valueSchema = row[3];
  const abiEncodedKeyNames = row[4];
  const abiEncodedFieldNames = row[5];

  const { type, namespace, name } = hexToResource(tableId);

  const solidityKeySchema = hexToSchema(keySchema);
  const solidityValueSchema = hexToSchema(valueSchema);
  const keyNames = decodeAbiParameters(parseAbiParameters("string[]"), abiEncodedKeyNames)[0];
  const fieldNames = decodeAbiParameters(parseAbiParameters("string[]"), abiEncodedFieldNames)[0];

  const valueAbiTypes = [...solidityValueSchema.staticFields, ...solidityValueSchema.dynamicFields];

  const keySchema2 = Object.fromEntries(
    solidityKeySchema.staticFields.map((abiType, i) => [keyNames[i], { type: abiType, internalType: abiType }]),
  ) satisfies Schema;

  const valueSchema2 = Object.fromEntries(
    valueAbiTypes.map((abiType, i) => [fieldNames[i], { type: abiType, internalType: abiType }]),
  ) satisfies Schema;

  return {
    type: type as never,
    namespace,
    name,
    tableId,
    schema: { ...keySchema2, ...valueSchema2 },
    keySchema: keySchema2,
    key: Object.keys(keySchema),
  };
};
