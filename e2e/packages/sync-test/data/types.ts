import { Hex } from "viem";
import { getKeySchema, getSchemaPrimitives, getValueSchema } from "@latticexyz/protocol-parser/internal";
import { Schema } from "@latticexyz/config";
import config from "../../contracts/mud.config";

type config = typeof config;
type tables = config["tables"];

type Key<tableLabel extends keyof tables> = getSchemaPrimitives<Schema & getKeySchema<tables[tableLabel]>>;
type Value<tableLabel extends keyof tables> = getSchemaPrimitives<getValueSchema<tables[tableLabel]>>;

export type Datum<tableLabel extends keyof tables = keyof tables> = {
  key: Key<tableLabel>;
  value: Value<tableLabel>;
};
export type Data = { [tableLabel in keyof tables]?: Array<Datum<tableLabel>> };

export type EncodedData<T extends Data = Data> = {
  [Table in keyof T]: Array<{ key: Hex[]; staticData: Hex; encodedLengths: Hex; dynamicData: Hex; fieldLayout: Hex }>;
};
