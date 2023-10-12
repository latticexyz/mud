import { Hex } from "viem";
import { SchemaToPrimitives, KeySchema, UserTypes } from "./common";
import { decodeKeyTuple } from "./decodeKeyTuple";

export function decodeKey<TSchema extends KeySchema<TUserTypes>, TUserTypes extends UserTypes | undefined = undefined>(
  keySchema: TSchema,
  data: readonly Hex[]
): SchemaToPrimitives<TSchema, TUserTypes> {
  // TODO: refactor and move all decodeKeyTuple logic into this method so we can delete decodeKeyTuple
  // TODO: translate user types to internal types
  const keyValues = decodeKeyTuple({ staticFields: Object.values(keySchema), dynamicFields: [] }, data);

  return Object.fromEntries(Object.keys(keySchema).map((name, i) => [name, keyValues[i]])) as SchemaToPrimitives<
    TSchema,
    TUserTypes
  >;
}
