import { SchemaTypeToAbiType } from "./SchemaTypeToAbiType";
import { SchemaType } from "./SchemaType";

export const AbiTypeToSchemaType = Object.fromEntries(
  Object.entries(SchemaTypeToAbiType).map(([schemaType, abiType]) => [abiType, parseInt(schemaType) as SchemaType])
) satisfies Record<string, SchemaType>;
