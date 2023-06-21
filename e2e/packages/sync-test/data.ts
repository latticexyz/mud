// TODO: this should be using the extended config
// import config from "../contracts/mud.config";
// import { StoreConfig } from "@latticexyz/store"
// import { SchemaAbiType } from "@latticexyz/schema-type"
// import { SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type";

// type SchemaToPrimitive<Schema extends Record<string, SchemaAbiType>> = {
//   [key in keyof Schema]: SchemaAbiTypeToPrimitiveType<Schema[key]>
// }

// TODO: this currently complains because the schema type returned by the config is not tight enough (string is not assignable to SchemaAbiType)
// type DataRecord<Config extends StoreConfig, Table extends keyof Config["tables"]> = {
//   key: SchemaToPrimitive<Config["tables"][Table]["keySchema"]>
//   value: SchemaToPrimitive<Config["tables"][Table]["schema"]>
// }

import { mapObject } from "@latticexyz/utils";
import { encodePacked, encodeAbiParameters, toHex } from "viem";
import config from "../contracts/mud.config";

export type Data = { [key: string]: Array<{ key: Record<string, any>; value: Record<string, any> }> };
export type EncodedData = { [key: string]: Array<{ key: string[]; value: string }> };

export const data = {
  Number: [{ key: {}, value: { value: 42 } }],
} satisfies Data;

// TODO: add ts version of encoding functions based on schemas
// in order to add support for dynamic schema values in tests
export const encodedData = mapObject(data, (records, table) =>
  records.map((record) => ({
    key: Object.values(record.key).map((key) => encodeAbiParameters([{ type: "bytes32" }], [toHex(key as any)])),
    value: encodePacked(Object.values(config.tables[table].schema), Object.values(record.value)),
  }))
) as EncodedData;
