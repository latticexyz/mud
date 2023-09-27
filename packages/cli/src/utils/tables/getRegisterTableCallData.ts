import { encodeSchema, getStaticByteLength } from "@latticexyz/schema-type/deprecated";
import { StoreConfig } from "@latticexyz/store";
import { resolveAbiOrUserType } from "@latticexyz/store/codegen";
import { resourceIdToHex } from "@latticexyz/common";
import { Table } from "./types";
import { fieldLayoutToHex } from "@latticexyz/protocol-parser";
import { CallData } from "../utils/types";
import { loadAndExtractUserTypes } from "@latticexyz/common/codegen";
import { toHex } from "viem";

export function getRegisterTableCallData(
  table: Table,
  storeConfig: StoreConfig,
  outputBaseDirectory: string,
  remappings: [string, string][]
): CallData {
  const { name, valueSchema, keySchema } = table;
  if (!name) throw Error("Table missing name");

  const solidityUserTypes = loadAndExtractUserTypes(storeConfig.userTypes, outputBaseDirectory, remappings);

  const schemaTypes = Object.values(valueSchema).map((abiOrUserType) => {
    const { schemaType } = resolveAbiOrUserType(abiOrUserType, storeConfig, solidityUserTypes);
    return schemaType;
  });

  const schemaTypeLengths = schemaTypes.map((schemaType) => getStaticByteLength(schemaType));
  const fieldLayout = {
    staticFieldLengths: schemaTypeLengths.filter((schemaTypeLength) => schemaTypeLength > 0),
    numDynamicFields: schemaTypeLengths.filter((schemaTypeLength) => schemaTypeLength === 0).length,
  };

  const keyTypes = Object.values(keySchema).map((abiOrUserType) => {
    const { schemaType } = resolveAbiOrUserType(abiOrUserType, storeConfig, solidityUserTypes);
    return schemaType;
  });

  return {
    func: "registerTable",
    args: [
      // TODO: add support for table namespaces (https://github.com/latticexyz/mud/issues/994)
      resourceIdToHex({ type: table.offchainOnly ? "offchainTable" : "table", namespace: storeConfig.namespace, name }),
      fieldLayoutToHex(fieldLayout),
      toHex(encodeSchema(keyTypes), { size: 32 }),
      toHex(encodeSchema(schemaTypes), { size: 32 }),
      Object.keys(keySchema),
      Object.keys(valueSchema),
    ],
  };
}
