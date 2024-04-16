// Note: this expects the config to not use shortcuts but the full definitions for table schemas
import { SchemaAbiType, SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type/internal";
import configV2 from "../../contracts/mud.config";
import { Hex } from "viem";
import { worldToV1 } from "@latticexyz/world/config/v2";

const config = worldToV1(configV2);

type SchemaToPrimitive<Schema> =
  Schema extends Record<string, SchemaAbiType>
    ? { [key in keyof Schema]: SchemaAbiTypeToPrimitiveType<Schema[key]> }
    : never;

type Key<Table extends keyof (typeof config)["tables"]> = SchemaToPrimitive<
  (typeof config)["tables"][Table]["keySchema"]
>;
type Value<Table extends keyof (typeof config)["tables"]> = SchemaToPrimitive<
  (typeof config)["tables"][Table]["valueSchema"]
>;

export type Datum<Table extends keyof (typeof config)["tables"] = keyof (typeof config)["tables"]> = {
  key: Key<Table>;
  value: Value<Table>;
};
export type Data = { [Table in keyof (typeof config)["tables"]]?: Array<Datum<Table>> };

export type EncodedData<T extends Data = Data> = {
  [Table in keyof T]: Array<{ key: Hex[]; staticData: Hex; encodedLengths: Hex; dynamicData: Hex; fieldLayout: Hex }>;
};
