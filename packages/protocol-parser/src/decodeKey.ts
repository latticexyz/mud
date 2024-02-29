import { Hex } from "viem";
import { SchemaToPrimitives, KeySchema } from "./common";
import { decodeKeyTuple } from "./decodeKeyTuple";

export function decodeKey<TSchema extends KeySchema>(
  keySchema: TSchema,
  data: readonly Hex[]
): SchemaToPrimitives<TSchema> {
  // TODO: refactor and move all decodeKeyTuple logic into this method so we can delete decodeKeyTuple
  const keyValues = decodeKeyTuple({ staticFields: Object.values(keySchema), dynamicFields: [] }, data);

  return Object.fromEntries(
    Object.keys(keySchema).map((name, i) => [name, keyValues[i]])
  ) as SchemaToPrimitives<TSchema>;
}
