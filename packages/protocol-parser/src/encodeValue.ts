import { Hex, concatHex } from "viem";
import { SchemaToPrimitives, ValueSchema } from "./common";
import { encodeValueArgs } from "./encodeValueArgs";

export function encodeValue<TSchema extends ValueSchema>(
  valueSchema: TSchema,
  value: SchemaToPrimitives<TSchema>
): Hex {
  const { staticData, encodedLengths, dynamicData } = encodeValueArgs(valueSchema, value);
  return concatHex([staticData, encodedLengths, dynamicData]);
}
