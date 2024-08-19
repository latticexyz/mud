import { isDynamicAbiType, isStaticAbiType } from "@latticexyz/schema-type/internal";
import { ValueSchema } from "./common";

export function getFieldIndex<valueSchema extends ValueSchema>(
  valueSchema: valueSchema,
  fieldName: keyof valueSchema,
): number {
  const fieldNames = [
    ...Object.entries(valueSchema)
      .filter(([, fieldType]) => isStaticAbiType(fieldType))
      .map(([fieldName]) => fieldName),
    ...Object.entries(valueSchema)
      .filter(([, fieldType]) => isDynamicAbiType(fieldType))
      .map(([fieldName]) => fieldName),
  ];

  return fieldNames.indexOf(fieldName.toString());
}
