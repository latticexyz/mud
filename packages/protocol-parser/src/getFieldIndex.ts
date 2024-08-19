import { isDynamicAbiType, isStaticAbiType } from "@latticexyz/schema-type/internal";

export function getFieldIndex(valueSchema: Record<string, string>, fieldName: string): number {
  const fieldNames = [
    ...Object.entries(valueSchema)
      .filter(([, fieldType]) => isStaticAbiType(fieldType))
      .map(([fieldName]) => fieldName),
    ...Object.entries(valueSchema)
      .filter(([, fieldType]) => isDynamicAbiType(fieldType))
      .map(([fieldName]) => fieldName),
  ];

  return fieldNames.indexOf(fieldName);
}
