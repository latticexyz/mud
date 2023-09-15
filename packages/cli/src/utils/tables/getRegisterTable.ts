import { encodeSchema, getStaticByteLength } from "@latticexyz/schema-type/deprecated";
import { StoreConfig } from "@latticexyz/store";
import { resolveAbiOrUserType } from "@latticexyz/store/codegen";
import { tableIdToHex } from "@latticexyz/common";
import { CallData } from "../utils";
import { Table } from "./types";
import { fieldLayoutToHex } from "@latticexyz/protocol-parser";

export function getRegisterTable(table: Table, storeConfig: StoreConfig): CallData {
  const { name, schema, keySchema } = table;
  if (!name) throw Error("Table missing name");

  const schemaTypes = Object.values(schema).map((abiOrUserType) => {
    const { schemaType } = resolveAbiOrUserType(abiOrUserType, storeConfig);
    return schemaType;
  });

  const schemaTypeLengths = schemaTypes.map((schemaType) => getStaticByteLength(schemaType));
  const fieldLayout = {
    staticFieldLengths: schemaTypeLengths.filter((schemaTypeLength) => schemaTypeLength > 0),
    numDynamicFields: schemaTypeLengths.filter((schemaTypeLength) => schemaTypeLength === 0).length,
  };

  const keyTypes = Object.values(keySchema).map((abiOrUserType) => {
    const { schemaType } = resolveAbiOrUserType(abiOrUserType, storeConfig);
    return schemaType;
  });

  return {
    func: "registerTable",
    args: [
      tableIdToHex(storeConfig.namespace, name),
      fieldLayoutToHex(fieldLayout),
      encodeSchema(keyTypes),
      encodeSchema(schemaTypes),
      Object.keys(keySchema),
      Object.keys(schema),
    ],
  };
}
