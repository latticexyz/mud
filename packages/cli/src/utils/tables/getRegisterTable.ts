import { encodeSchema } from "@latticexyz/schema-type/deprecated";
import { StoreConfig } from "@latticexyz/store";
import { resolveAbiOrUserType } from "@latticexyz/store/codegen";
import { tableIdToHex } from "@latticexyz/common";
import { CallData } from "../utils";
import { Table } from "./types";

export function getRegisterTable(table: Table, storeConfig: StoreConfig): CallData {
  const { name, schema, keySchema } = table;
  if (!name) throw Error("Table missing name");

  const schemaTypes = Object.values(schema).map((abiOrUserType) => {
    const { schemaType } = resolveAbiOrUserType(abiOrUserType, storeConfig);
    return schemaType;
  });

  const keyTypes = Object.values(keySchema).map((abiOrUserType) => {
    const { schemaType } = resolveAbiOrUserType(abiOrUserType, storeConfig);
    return schemaType;
  });

  return {
    func: "registerTable",
    args: [
      tableIdToHex(storeConfig.namespace, name),
      encodeSchema(keyTypes),
      encodeSchema(schemaTypes),
      Object.keys(keySchema),
      Object.keys(schema),
    ],
  };
}
