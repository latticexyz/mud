import { schemaAbiTypeToDefaultValue } from "./schemaAbiTypeToDefaultValue";
import { SchemaAbiType } from "./schemaAbiTypes";
import { LiteralToBroad } from "./utils";

export type SchemaAbiTypeToPrimitiveType<T extends SchemaAbiType = SchemaAbiType> = LiteralToBroad<
  (typeof schemaAbiTypeToDefaultValue)[T]
>;
