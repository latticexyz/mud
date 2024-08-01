import { AbiType } from "@latticexyz/config";
import {
  ArrayAbiType,
  SchemaAbiTypeToPrimitiveType,
  arrayToStaticAbiType,
  schemaAbiTypeToDefaultValue,
} from "@latticexyz/schema-type/internal";

export function decodeDozerField<abiType extends AbiType>(
  abiType: abiType,
  data: string | boolean | string[],
): SchemaAbiTypeToPrimitiveType<abiType> {
  const defaultValueType = typeof schemaAbiTypeToDefaultValue[abiType];
  if (Array.isArray(data)) {
    return data.map((element) => decodeDozerField(arrayToStaticAbiType(abiType as ArrayAbiType), element)) as never;
  }
  if (defaultValueType === "number") {
    return Number(data) as never;
  }
  if (defaultValueType === "bigint") {
    return BigInt(data) as never;
  }
  return data as never;
}
