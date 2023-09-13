import { isStaticAbiType, isDynamicAbiType } from "@latticexyz/schema-type";
import { Hex } from "viem";
import { SchemaToPrimitives, ValueSchema } from "./common";
import { encodeRecord } from "./encodeRecord";

export function encodeValue<TSchema extends ValueSchema>(
  valueSchema: TSchema,
  value: SchemaToPrimitives<TSchema>
): Hex {
  const staticFields = Object.values(valueSchema).filter(isStaticAbiType);
  const dynamicFields = Object.values(valueSchema).filter(isDynamicAbiType);

  // TODO: refactor and move all encodeRecord logic into this method so we can delete encodeRecord

  // This currently assumes fields/values are ordered by static, dynamic
  // TODO: make sure we preserve ordering based on schema definition
  return encodeRecord({ staticFields, dynamicFields }, Object.values(value));
}
