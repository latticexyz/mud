import { SchemaAbiType } from "@latticexyz/schema-type";
import { AbiParameterToPrimitiveType } from "abitype";
import { Hex, encodePacked } from "viem";

export function encodeField<TSchemaAbiType extends SchemaAbiType>(
  fieldType: TSchemaAbiType,
  value: AbiParameterToPrimitiveType<{ type: TSchemaAbiType }>
): Hex {
  return encodePacked([fieldType], [value]);
}

export function encodeFieldData<TSchemaAbiType extends SchemaAbiType>(
  fieldType: TSchemaAbiType,
  value: AbiParameterToPrimitiveType<{ type: TSchemaAbiType }>
): string {
  return encodePacked([fieldType], [value]).replace(/^0x/, "");
}
