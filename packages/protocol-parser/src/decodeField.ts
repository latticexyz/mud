import { Hex } from "viem";
import { SchemaAbiType, SchemaAbiTypeToPrimitiveType, isDynamicAbiType } from "@latticexyz/schema-type";
import { decodeDynamicField } from "./decodeDynamicField";
import { decodeStaticField } from "./decodeStaticField";

export function decodeField<
  TAbiType extends SchemaAbiType,
  TPrimitiveType extends SchemaAbiTypeToPrimitiveType<TAbiType>
>(abiType: TAbiType, data: Hex): TPrimitiveType {
  return (
    isDynamicAbiType(abiType) ? decodeDynamicField(abiType, data) : decodeStaticField(abiType, data)
  ) as TPrimitiveType;
}
