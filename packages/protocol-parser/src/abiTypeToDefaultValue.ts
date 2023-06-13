import { SchemaAbiType } from "@latticexyz/schema-type";
import { DynamicAbiTypeToPrimitiveType, dynamicAbiTypeToDefaultValue } from "./dynamicAbiTypes";
import { StaticAbiTypeToPrimitiveType, staticAbiTypeToDefaultValue } from "./staticAbiTypes";

export const abiTypeToDefaultValue = {
  ...staticAbiTypeToDefaultValue,
  ...dynamicAbiTypeToDefaultValue,
} as const satisfies Record<SchemaAbiType, StaticAbiTypeToPrimitiveType | DynamicAbiTypeToPrimitiveType>;
