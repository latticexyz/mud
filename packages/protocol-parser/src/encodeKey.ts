import { isStaticAbiType } from "@latticexyz/schema-type";
import { Hex } from "viem";
import { SchemaToPrimitives, KeySchema } from "./common";
import { encodeKeyTuple } from "./encodeKeyTuple";

export function encodeKey<TSchema extends KeySchema>(keySchema: TSchema, key: SchemaToPrimitives<TSchema>): Hex[] {
  const staticFields = Object.values(keySchema).filter(isStaticAbiType);
  // TODO: refactor and move all encodeKeyTuple logic into this method so we can delete encodeKeyTuple
  return encodeKeyTuple({ staticFields, dynamicFields: [] }, Object.values(key));
}
