import { SchemaAbiType, arrayToStaticAbiType, isArrayAbiType } from "@latticexyz/schema-type/internal";
import { AbiParameterToPrimitiveType } from "abitype";
import { Hex, encodePacked } from "viem";

export function encodeField<TSchemaAbiType extends SchemaAbiType>(
  fieldType: TSchemaAbiType,
  value: AbiParameterToPrimitiveType<{ type: TSchemaAbiType }>,
): Hex {
  if (isArrayAbiType(fieldType) && Array.isArray(value)) {
    const staticFieldType = arrayToStaticAbiType(fieldType);
    // TODO: we can remove conditional once this is fixed: https://github.com/wagmi-dev/viem/pull/1147
    return value.length === 0
      ? "0x"
      : encodePacked(
          value.map(() => staticFieldType),
          value,
        );
  }
  return encodePacked([fieldType], [value as never]);
}
