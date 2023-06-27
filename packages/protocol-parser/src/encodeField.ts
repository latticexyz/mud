import { SchemaAbiType, arrayAbiTypeToStaticAbiType, isArrayAbiType } from "@latticexyz/schema-type";
import { AbiParameterToPrimitiveType } from "abitype";
import { Hex, encodePacked } from "viem";

export function encodeField<TSchemaAbiType extends SchemaAbiType>(
  fieldType: TSchemaAbiType,
  value: AbiParameterToPrimitiveType<{ type: TSchemaAbiType }>
): Hex {
  if (isArrayAbiType(fieldType) && Array.isArray(value)) {
    const staticFieldType = arrayAbiTypeToStaticAbiType(fieldType);
    return encodePacked(
      value.map(() => staticFieldType),
      value
    );
  }
  return encodePacked([fieldType], [value]);
}

export function encodeFieldData<TSchemaAbiType extends SchemaAbiType>(
  fieldType: TSchemaAbiType,
  value: AbiParameterToPrimitiveType<{ type: TSchemaAbiType }>
): string {
  return encodeField(fieldType, value).replace(/^0x/, "");
}
