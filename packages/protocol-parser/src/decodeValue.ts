import { isStaticAbiType, isDynamicAbiType } from "@latticexyz/schema-type";
import { Hex } from "viem";
import { SchemaToPrimitives, ValueSchema } from "./common";
import { decodeRecord } from "./decodeRecord";

export function decodeValue<TSchema extends ValueSchema>(valueSchema: TSchema, data: Hex): SchemaToPrimitives<TSchema> {
  const staticFields = Object.values(valueSchema).filter(isStaticAbiType);
  const dynamicFields = Object.values(valueSchema).filter(isDynamicAbiType);

  // TODO: refactor and move all decodeRecord logic into this method so we can delete decodeRecord
  const valueTuple = decodeRecord({ staticFields, dynamicFields }, data);

  return Object.fromEntries(
    Object.keys(valueSchema).map((name, i) => [name, valueTuple[i]])
  ) as SchemaToPrimitives<TSchema>;
}
