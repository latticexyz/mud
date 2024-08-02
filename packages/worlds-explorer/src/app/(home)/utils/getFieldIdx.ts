import {
  isStaticAbiType,
  isDynamicAbiType,
} from "@latticexyz/schema-type/internal";

export function getFieldIdx(valueSchema, fieldName) {
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
