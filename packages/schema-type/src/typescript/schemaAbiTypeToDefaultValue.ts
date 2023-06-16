import { SchemaAbiType } from "./schemaAbiTypes";
import { DynamicAbiTypeToPrimitiveType, dynamicAbiTypeToDefaultValue } from "./dynamicAbiTypes";
import { StaticAbiTypeToPrimitiveType, staticAbiTypeToDefaultValue } from "./staticAbiTypes";

export const schemaAbiTypeToDefaultValue = {
  ...staticAbiTypeToDefaultValue,
  ...dynamicAbiTypeToDefaultValue,
} as const satisfies Record<SchemaAbiType, StaticAbiTypeToPrimitiveType | DynamicAbiTypeToPrimitiveType>;
