import { SchemaTypeToAbiType } from "./SchemaTypeToAbiType.js";
import { SchemaType } from "./SchemaType.js";

export const AbiTypeToSchemaType = Object.fromEntries(
  Object.entries(SchemaTypeToAbiType).map(([schemaType, abiType]) => [abiType, parseInt(schemaType) as SchemaType])
) satisfies Record<string, SchemaType>;
